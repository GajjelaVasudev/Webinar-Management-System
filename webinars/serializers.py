from rest_framework import serializers
from .models import Event
from datetime import datetime, timedelta
from django.utils import timezone


class EventSerializer(serializers.ModelSerializer):
    """Basic event serializer for list views"""
    organizer_name = serializers.CharField(source='organizer.username', read_only=True)
    status = serializers.SerializerMethodField()
    is_free = serializers.BooleanField(read_only=True)
    is_registered = serializers.SerializerMethodField()
    start_time = serializers.SerializerMethodField()
    end_time = serializers.SerializerMethodField()
    
    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'date', 'time', 'duration',
            'price', 'is_free', 'thumbnail', 'organizer', 'organizer_name',
            'status', 'is_registered', 'start_time', 'end_time', 'created_at', 'updated_at'
        ]
        read_only_fields = ['organizer', 'created_at', 'updated_at']
    
    def get_status(self, obj):
        return obj.get_status()
    
    def get_is_registered(self, obj):
        """Check if current user is registered for this event"""
        request = self.context.get('request')
        if not request or not request.user or not request.user.is_authenticated:
            return False
        return obj.registrations.filter(user=request.user).exists()
    
    def get_start_time(self, obj):
        """Convert date + time to ISO 8601 format"""
        try:
            dt = datetime.combine(obj.date, obj.time)
            aware_dt = timezone.make_aware(dt)
            return aware_dt.isoformat()
        except (ValueError, TypeError):
            return None
    
    def get_end_time(self, obj):
        """Calculate end time based on duration"""
        try:
            dt = datetime.combine(obj.date, obj.time)
            aware_dt = timezone.make_aware(dt)
            duration_minutes = obj.duration or 60
            end_dt = aware_dt + timedelta(minutes=duration_minutes)
            return end_dt.isoformat()
        except (ValueError, TypeError):
            return None


class EventDetailSerializer(serializers.ModelSerializer):
    """Detailed event serializer for detail views"""
    organizer_name = serializers.CharField(source='organizer.username', read_only=True)
    organizer_email = serializers.EmailField(source='organizer.email', read_only=True)
    status = serializers.SerializerMethodField()
    is_free = serializers.BooleanField(read_only=True)
    is_registered = serializers.SerializerMethodField()
    registration_count = serializers.SerializerMethodField()
    start_time = serializers.SerializerMethodField()
    end_time = serializers.SerializerMethodField()
    
    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'date', 'time', 'duration',
            'price', 'is_free', 'thumbnail', 'live_stream_url', 'manual_status',
            'organizer', 'organizer_name', 'organizer_email',
            'status', 'is_registered', 'registration_count', 'start_time', 'end_time', 'created_at', 'updated_at'
        ]
        read_only_fields = ['organizer', 'created_at', 'updated_at']
    
    def get_status(self, obj):
        return obj.get_status()
    
    def get_is_registered(self, obj):
        """Check if current user is registered for this event"""
        request = self.context.get('request')
        if not request or not request.user or not request.user.is_authenticated:
            return False
        return obj.registrations.filter(user=request.user).exists()
    
    def get_registration_count(self, obj):
        return obj.registrations.count()
    
    def get_start_time(self, obj):
        """Convert date + time to ISO 8601 format"""
        try:
            dt = datetime.combine(obj.date, obj.time)
            aware_dt = timezone.make_aware(dt)
            return aware_dt.isoformat()
        except (ValueError, TypeError):
            return None
    
    def get_end_time(self, obj):
        """Calculate end time based on duration"""
        try:
            dt = datetime.combine(obj.date, obj.time)
            aware_dt = timezone.make_aware(dt)
            duration_minutes = obj.duration or 60
            end_dt = aware_dt + timedelta(minutes=duration_minutes)
            return end_dt.isoformat()
        except (ValueError, TypeError):
            return None
