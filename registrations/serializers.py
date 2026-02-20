from rest_framework import serializers
from .models import Registration
from webinars.serializers import EventSerializer


class RegistrationSerializer(serializers.ModelSerializer):
    """Serializer for event registrations"""
    event_details = EventSerializer(source='event', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = Registration
        fields = [
            'id', 'user', 'user_username', 'user_email',
            'event', 'event_details', 'registered_on', 'attended'
        ]
        read_only_fields = ['user', 'registered_on']


class RegistrationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating registrations"""
    
    class Meta:
        model = Registration
        fields = ['event']
    
    def validate_event(self, value):
        """Check if user is already registered"""
        user = self.context['request'].user
        if Registration.objects.filter(user=user, event=value).exists():
            raise serializers.ValidationError("You are already registered for this webinar.")
        return value
