from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Registration
from .serializers import RegistrationSerializer, RegistrationCreateSerializer
from accounts.permissions import IsAdmin


class RegistrationViewSet(viewsets.ModelViewSet):
    """ViewSet for managing registrations"""
    queryset = Registration.objects.select_related('user', 'event').all()
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Regular users can only see their own registrations
        if not self.request.user.profile.is_admin:
            queryset = queryset.filter(user=self.request.user)
        
        # Filter by event
        event_id = self.request.query_params.get('event')
        if event_id:
            queryset = queryset.filter(event_id=event_id)
        
        return queryset

    def get_serializer_class(self):
        if self.action == 'create':
            return RegistrationCreateSerializer
        return RegistrationSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def my_registrations(self, request):
        """Get current user's registrations"""
        registrations = self.get_queryset().filter(user=request.user)
        serializer = self.get_serializer(registrations, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def register(self, request):
        """Register for a webinar"""
        serializer = RegistrationCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        if serializer.is_valid():
            registration = serializer.save(user=request.user)
            return Response(
                RegistrationSerializer(registration).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['delete'])
    def unregister(self, request, pk=None):
        """Unregister from a webinar"""
        registration = self.get_object()
        
        # Only allow users to unregister themselves (unless admin)
        if registration.user != request.user and not request.user.profile.is_admin:
            return Response(
                {'error': 'You can only unregister yourself'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        registration.delete()
        return Response(
            {'message': 'Successfully unregistered'},
            status=status.HTTP_204_NO_CONTENT
        )
