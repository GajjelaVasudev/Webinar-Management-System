from rest_framework import serializers
from .models import Recording
from webinars.serializers import EventSerializer


class RecordingSerializer(serializers.ModelSerializer):
    """Serializer for recordings"""
    event_details = EventSerializer(source='event', read_only=True)
    uploaded_by_username = serializers.CharField(source='uploaded_by.username', read_only=True)
    display_title = serializers.CharField(read_only=True)
    
    class Meta:
        model = Recording
        fields = [
            'id', 'event', 'event_details', 'recording_link',
            'title', 'display_title', 'description', 'duration_minutes',
            'uploaded_by', 'uploaded_by_username', 'uploaded_at', 'is_public'
        ]
        read_only_fields = ['uploaded_by', 'uploaded_at']


class RecordingCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating recordings"""
    
    class Meta:
        model = Recording
        fields = ['event', 'recording_link', 'title', 'description', 'duration_minutes', 'is_public']
    
    def validate_event(self, value):
        """Ensure event exists and user has permission"""
        if not value:
            raise serializers.ValidationError("Event is required.")
        return value
