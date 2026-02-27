from rest_framework import serializers
from .models import LiveSession


class LiveSessionSerializer(serializers.ModelSerializer):
    """Serializer for LiveSession model"""
    
    class Meta:
        model = LiveSession
        fields = [
            'id',
            'webinar',
            'room_name',
            'is_active',
            'created_at',
            'started_at',
            'start_time',
            'end_time',
        ]
        read_only_fields = ['id', 'room_name', 'created_at', 'started_at', 'start_time', 'end_time']


class LiveSessionStartSerializer(serializers.ModelSerializer):
    """Serializer for starting a live session"""
    
    class Meta:
        model = LiveSession
        fields = ['room_name', 'is_active']
        read_only_fields = ['room_name', 'is_active']


class LiveSessionStatusSerializer(serializers.ModelSerializer):
    """Serializer for checking live session status"""
    
    class Meta:
        model = LiveSession
        fields = ['room_name', 'is_active']
