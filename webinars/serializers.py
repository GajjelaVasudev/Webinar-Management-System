from rest_framework import serializers
from .models import Event


class EventSerializer(serializers.ModelSerializer):
    """Basic event serializer for list views"""
    organizer_name = serializers.CharField(source='organizer.username', read_only=True)
    status = serializers.SerializerMethodField()
    is_free = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'date', 'time', 'duration',
            'price', 'is_free', 'thumbnail', 'organizer', 'organizer_name',
            'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['organizer', 'created_at', 'updated_at']
    
    def get_status(self, obj):
        return obj.get_status()


class EventDetailSerializer(serializers.ModelSerializer):
    """Detailed event serializer for detail views"""
    organizer_name = serializers.CharField(source='organizer.username', read_only=True)
    organizer_email = serializers.EmailField(source='organizer.email', read_only=True)
    status = serializers.SerializerMethodField()
    is_free = serializers.BooleanField(read_only=True)
    registration_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'date', 'time', 'duration',
            'price', 'is_free', 'thumbnail', 'live_stream_url', 'manual_status',
            'organizer', 'organizer_name', 'organizer_email',
            'status', 'registration_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['organizer', 'created_at', 'updated_at']
    
    def get_status(self, obj):
        return obj.get_status()
    
    def get_registration_count(self, obj):
        return obj.registrations.count()
