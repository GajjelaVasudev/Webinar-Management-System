from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Event, Recording, Registration


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


class EventSerializer(serializers.ModelSerializer):
    organizer_name = serializers.CharField(source='organizer.username', read_only=True)
    attendees_count = serializers.SerializerMethodField()
    start_time = serializers.SerializerMethodField()
    end_time = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = ['id', 'title', 'description', 'date', 'time', 'start_time', 
                  'end_time', 'organizer', 'organizer_name', 'attendees_count']
        read_only_fields = ['id', 'organizer', 'organizer_name', 'attendees_count', 'start_time', 'end_time']

    def get_start_time(self, obj):
        """Combine date and time into ISO format datetime"""
        from datetime import datetime
        dt = datetime.combine(obj.date, obj.time)
        return dt.isoformat()

    def get_end_time(self, obj):
        """End time is 1 hour after start"""
        from datetime import datetime, timedelta
        dt = datetime.combine(obj.date, obj.time)
        end_dt = dt + timedelta(hours=1)
        return end_dt.isoformat()

    def get_attendees_count(self, obj):
        return obj.registrations.count()


class EventDetailSerializer(serializers.ModelSerializer):
    organizer = UserSerializer(read_only=True)
    attendees = serializers.SerializerMethodField()
    recordings = serializers.SerializerMethodField()
    start_time = serializers.SerializerMethodField()
    end_time = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = ['id', 'title', 'description', 'date', 'time', 'start_time', 
                  'end_time', 'organizer', 'attendees', 'recordings']
        read_only_fields = ['id', 'organizer', 'attendees', 'recordings', 'start_time', 'end_time']

    def get_start_time(self, obj):
        """Combine date and time into ISO format datetime"""
        from datetime import datetime
        dt = datetime.combine(obj.date, obj.time)
        return dt.isoformat()

    def get_end_time(self, obj):
        """End time is 1 hour after start"""
        from datetime import datetime, timedelta
        dt = datetime.combine(obj.date, obj.time)
        end_dt = dt + timedelta(hours=1)
        return end_dt.isoformat()

    def get_attendees(self, obj):
        registrations = obj.registrations.all()
        return [{'id': reg.user.id, 'username': reg.user.username} for reg in registrations]

    def get_recordings(self, obj):
        recordings = obj.recordings.all()
        return [{'id': rec.id, 'recording_link': rec.recording_link} for rec in recordings]


class RecordingSerializer(serializers.ModelSerializer):
    event_title = serializers.CharField(source='event.title', read_only=True)

    class Meta:
        model = Recording
        fields = ['id', 'event', 'event_title', 'recording_link']
        read_only_fields = ['id', 'event_title']
