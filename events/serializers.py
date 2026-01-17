from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Event, Recording, Registration, UserProfile, Announcement, UserNotification, WebinarChatMessage


class EmailOrUsernameTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Allow login with either username or email while keeping JWT flow."""

    def validate(self, attrs):
        username_or_email = attrs.get(self.username_field)
        if username_or_email and "@" in username_or_email:
            try:
                user_obj = User.objects.get(email__iexact=username_or_email)
                # Replace incoming username with real username for token generation
                attrs[self.username_field] = user_obj.username
            except User.DoesNotExist:
                pass  # Let base class raise standard credentials error
        return super().validate(attrs)


class UserProfileSerializer(serializers.ModelSerializer):
	user_info = serializers.SerializerMethodField()
	total_registrations = serializers.SerializerMethodField()
	completed_webinars = serializers.SerializerMethodField()
	joined_date = serializers.SerializerMethodField()

	class Meta:
		model = UserProfile
		fields = ['id', 'role', 'user_info', 'total_registrations', 'completed_webinars', 'joined_date']

	def get_user_info(self, obj):
		return {
			'id': obj.user.id,
			'username': obj.user.username,
			'email': obj.user.email,
			'first_name': obj.user.first_name,
			'last_name': obj.user.last_name,
		}

	def get_total_registrations(self, obj):
		"""Count total webinars user is registered for"""
		return obj.user.event_registrations.count()

	def get_completed_webinars(self, obj):
		"""Count completed webinars user registered for"""
		from django.utils import timezone
		now = timezone.now()
		from datetime import timedelta
		return obj.user.event_registrations.filter(
			event__date__lt=now.date()
		).count()

	def get_joined_date(self, obj):
		"""Return when user account was created"""
		return obj.created_at.isoformat()


class UserSerializer(serializers.ModelSerializer):
	role = serializers.SerializerMethodField()

	class Meta:
		model = User
		fields = ['id', 'username', 'email', 'role']

	def get_role(self, obj):
		try:
			return obj.profile.role
		except UserProfile.DoesNotExist:
			return 'user'


class EventSerializer(serializers.ModelSerializer):
    organizer_name = serializers.CharField(source='organizer.username', read_only=True)
    attendees_count = serializers.SerializerMethodField()
    start_time = serializers.SerializerMethodField()
    end_time = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()
    is_registered = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = ['id', 'title', 'description', 'date', 'time', 'duration', 'price', 'start_time', 
                  'end_time', 'thumbnail', 'thumbnail_url', 'organizer', 'organizer_name', 'attendees_count', 
                  'is_registered', 'status', 'live_stream_url']
        read_only_fields = ['id', 'organizer', 'organizer_name', 'attendees_count', 'start_time', 'end_time', 'thumbnail_url', 'is_registered', 'status']

    def get_start_time(self, obj):
        """Combine date and time into ISO format datetime"""
        from datetime import datetime
        dt = datetime.combine(obj.date, obj.time)
        return dt.isoformat()

    def get_end_time(self, obj):
        """End time calculated from duration"""
        from datetime import datetime, timedelta
        dt = datetime.combine(obj.date, obj.time)
        end_dt = dt + timedelta(minutes=obj.duration)
        return end_dt.isoformat()

    def get_attendees_count(self, obj):
        return obj.registrations.count()

    def get_is_registered(self, obj):
        """Check if current user is registered for this event"""
        request = self.context.get('request')
        if not request or not request.user or not request.user.is_authenticated:
            return False
        return obj.registrations.filter(user=request.user).exists()

    def get_status(self, obj):
        """Get computed status of the webinar"""
        return obj.get_status()

    def get_thumbnail_url(self, obj):
        """Return absolute URL for thumbnail or None if not set"""
        if obj.thumbnail:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.thumbnail.url)
            return obj.thumbnail.url
        return None


class RegistrationSerializer(serializers.ModelSerializer):
    """Registration with embedded user and event titles for admin views."""
    user = UserSerializer(read_only=True)
    event_title = serializers.CharField(source='event.title', read_only=True)

    class Meta:
        model = Registration
        fields = ['id', 'event', 'event_title', 'user', 'registered_on']


class EventDetailSerializer(serializers.ModelSerializer):
    organizer = UserSerializer(read_only=True)
    attendees = serializers.SerializerMethodField()
    recordings = serializers.SerializerMethodField()
    start_time = serializers.SerializerMethodField()
    end_time = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()
    is_registered = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = ['id', 'title', 'description', 'date', 'time', 'duration', 'price', 'start_time', 
                  'end_time', 'thumbnail', 'thumbnail_url', 'organizer', 'attendees', 'recordings', 
                  'is_registered', 'status', 'live_stream_url']
        read_only_fields = ['id', 'organizer', 'attendees', 'recordings', 'start_time', 'end_time', 'thumbnail_url', 'is_registered', 'status']

    def get_start_time(self, obj):
        """Combine date and time into ISO format datetime"""
        from datetime import datetime
        dt = datetime.combine(obj.date, obj.time)
        return dt.isoformat()

    def get_end_time(self, obj):
        """End time calculated from duration"""
        from datetime import datetime, timedelta
        dt = datetime.combine(obj.date, obj.time)
        end_dt = dt + timedelta(minutes=obj.duration)
        return end_dt.isoformat()

    def get_attendees(self, obj):
        registrations = obj.registrations.all()
        return [{'id': reg.user.id, 'username': reg.user.username} for reg in registrations]

    def get_recordings(self, obj):
        recordings = obj.recordings.all()
        serializer = RecordingSerializer(recordings, many=True, context=self.context)
        return serializer.data

    def get_thumbnail_url(self, obj):
        """Return absolute URL for thumbnail or None if not set"""
        if obj.thumbnail:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.thumbnail.url)
            return obj.thumbnail.url
        return None

    def get_is_registered(self, obj):
        """Check if current user is registered for this event"""
        request = self.context.get('request')
        if not request or not request.user or not request.user.is_authenticated:
            return False
        return obj.registrations.filter(user=request.user).exists()

    def get_status(self, obj):
        """Get computed status of the webinar"""
        return obj.get_status()


class RecordingSerializer(serializers.ModelSerializer):
    event_title = serializers.CharField(source='event.title', read_only=True)

    class Meta:
        model = Recording
        fields = ['id', 'event', 'event_title', 'recording_link']
        read_only_fields = ['id', 'event_title']

class AnnouncementSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source='sender.username', read_only=True)

    class Meta:
        model = Announcement
        fields = ['id', 'sender', 'sender_username', 'title', 'content', 'created_at', 'updated_at']
        read_only_fields = ['id', 'sender', 'sender_username', 'created_at', 'updated_at']


class UserNotificationSerializer(serializers.ModelSerializer):
    sender_username = serializers.SerializerMethodField()
    event_title = serializers.CharField(source='event.title', read_only=True, allow_null=True)
    event_date = serializers.SerializerMethodField()

    class Meta:
        model = UserNotification
        fields = ['id', 'notification_type', 'title', 'content', 'sender_username', 'event_title', 
                  'event_date', 'is_read', 'created_at']
        read_only_fields = ['id', 'notification_type', 'title', 'content', 'sender_username', 
                           'event_title', 'event_date', 'created_at']

    def get_sender_username(self, obj):
        if obj.announcement and obj.announcement.sender:
            return obj.announcement.sender.username
        return None

    def get_event_date(self, obj):
        if obj.event:
            from datetime import datetime
            dt = datetime.combine(obj.event.date, obj.event.time)
            return dt.isoformat()
        return None


class WebinarChatMessageSerializer(serializers.ModelSerializer):
	username = serializers.CharField(source='user.username', read_only=True)
	first_name = serializers.CharField(source='user.first_name', read_only=True)
	last_name = serializers.CharField(source='user.last_name', read_only=True)

	class Meta:
		model = WebinarChatMessage
		fields = ['id', 'event', 'user', 'username', 'first_name', 'last_name', 'message', 'created_at']
		read_only_fields = ['id', 'user', 'username', 'first_name', 'last_name', 'created_at']