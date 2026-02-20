from rest_framework import serializers
from .models import Announcement, UserNotification, WebinarChatMessage


class AnnouncementSerializer(serializers.ModelSerializer):
    """Serializer for announcements"""
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    
    class Meta:
        model = Announcement
        fields = ['id', 'sender', 'sender_username', 'title', 'content', 'created_at', 'updated_at']
        read_only_fields = ['sender', 'created_at', 'updated_at']


class UserNotificationSerializer(serializers.ModelSerializer):
    """Serializer for user notifications"""
    
    class Meta:
        model = UserNotification
        fields = [
            'id', 'user', 'notification_type', 'title', 'content',
            'announcement', 'event', 'recording', 'is_read', 'created_at'
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
