from rest_framework import serializers
from .models import Announcement, UserNotification, WebinarChatMessage, Conversation, Message
from django.contrib.auth.models import User


class AnnouncementSerializer(serializers.ModelSerializer):
    """Serializer for announcements"""
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    
    class Meta:
        model = Announcement
        fields = ['id', 'sender', 'sender_username', 'title', 'content', 'created_at', 'updated_at']
        read_only_fields = ['sender', 'created_at', 'updated_at']


class UserNotificationSerializer(serializers.ModelSerializer):
    """Serializer for user notifications"""
    notification_type_display = serializers.CharField(source='get_notification_type_display', read_only=True)
    webinar_title = serializers.CharField(source='related_webinar.title', read_only=True)
    webinar_id = serializers.IntegerField(source='related_webinar.id', read_only=True)
    
    class Meta:
        model = UserNotification
        fields = [
            'id', 'user', 'notification_type', 'notification_type_display', 
            'title', 'content', 'announcement', 'event', 'recording', 
            'related_webinar', 'webinar_title', 'webinar_id',
            'is_read', 'created_at'
        ]
        read_only_fields = ['user', 'created_at']


class WebinarChatMessageSerializer(serializers.ModelSerializer):
    """Serializer for webinar chat messages"""
    user_username = serializers.CharField(source='user.username', read_only=True)
    user_role = serializers.CharField(source='user.profile.role', read_only=True)
    
    class Meta:
        model = WebinarChatMessage
        fields = ['id', 'event', 'user', 'user_username', 'user_role', 'message', 'created_at']
        read_only_fields = ['user', 'created_at']


class WebinarChatMessageCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating chat messages"""
    
    class Meta:
        model = WebinarChatMessage
        fields = ['event', 'message']
    
    def validate_message(self, value):
        """Validate message length and content"""
        if len(value.strip()) == 0:
            raise serializers.ValidationError("Message cannot be empty.")
        if len(value) > 1000:
            raise serializers.ValidationError("Message is too long (max 1000 characters).")
        return value


class MessageSerializer(serializers.ModelSerializer):
    """Serializer for inbox messages"""
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    sender_first_name = serializers.CharField(source='sender.first_name', read_only=True)
    sender_last_name = serializers.CharField(source='sender.last_name', read_only=True)
    
    class Meta:
        model = Message
        fields = [
            'id', 'conversation', 'sender', 'sender_username', 
            'sender_first_name', 'sender_last_name',
            'content', 'is_read', 'created_at'
        ]
        read_only_fields = ['sender', 'created_at']


class ParticipantSerializer(serializers.ModelSerializer):
    """Serializer for conversation participants"""
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']


class ConversationListSerializer(serializers.ModelSerializer):
    """Serializer for conversation list view"""
    participants = ParticipantSerializer(many=True, read_only=True)
    related_webinar_title = serializers.CharField(source='related_webinar.title', read_only=True)
    last_message_preview = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Conversation
        fields = [
            'id', 'participants', 'related_webinar', 'related_webinar_title',
            'last_message_preview', 'unread_count', 'last_message_at',
            'created_at', 'updated_at'
        ]
    
    def get_last_message_preview(self, obj):
        """Get preview of last message"""
        last_message = obj.messages.last()
        if last_message:
            return {
                'content': last_message.content[:100],
                'sender_username': last_message.sender.username,
                'created_at': last_message.created_at
            }
        return None
    
    def get_unread_count(self, obj):
        """Get unread count for the requesting user"""
        request = self.context.get('request')
        if request and request.user:
            return obj.get_unread_count(request.user)
        return 0


class ConversationDetailSerializer(serializers.ModelSerializer):
    """Serializer for conversation detail view"""
    participants = ParticipantSerializer(many=True, read_only=True)
    messages = MessageSerializer(many=True, read_only=True)
    related_webinar_title = serializers.CharField(source='related_webinar.title', read_only=True)
    
    class Meta:
        model = Conversation
        fields = [
            'id', 'participants', 'related_webinar', 'related_webinar_title',
            'messages', 'created_at', 'updated_at', 'last_message_at'
        ]


class SendMessageSerializer(serializers.Serializer):
    """Serializer for sending messages"""
    participant_ids = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=False,
        help_text="List of user IDs to message"
    )
    related_webinar_id = serializers.IntegerField(
        required=False,
        allow_null=True,
        help_text="Optional webinar context"
    )
    content = serializers.CharField(
        max_length=5000,
        help_text="Message content"
    )
    
    def validate_content(self, value):
        """Validate message content"""
        if len(value.strip()) == 0:
            raise serializers.ValidationError("Message cannot be empty.")
        return value
    
    def validate_participant_ids(self, value):
        """Validate participant IDs"""
        if len(value) == 0:
            raise serializers.ValidationError("At least one participant is required.")
        
        # Check if users exist
        existing_count = User.objects.filter(id__in=value).count()
        if existing_count != len(value):
            raise serializers.ValidationError("One or more participant IDs are invalid.")
        
        return value
