from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny

from .models import Recording
from .serializers import RecordingSerializer, RecordingCreateSerializer
from accounts.permissions import IsAdmin


class RecordingViewSet(viewsets.ModelViewSet):
    """ViewSet for managing recordings"""
    queryset = Recording.objects.select_related('event', 'uploaded_by').all()
    serializer_class = RecordingSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Non-authenticated users only see public recordings
        if not self.request.user.is_authenticated:
            queryset = queryset.filter(is_public=True)
        
        # Filter by event
        event_id = self.request.query_params.get('event')
        if event_id:
            queryset = queryset.filter(event_id=event_id)
        
        return queryset

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdmin()]
        return super().get_permissions()

    def get_serializer_class(self):
        if self.action == 'create':
            return RecordingCreateSerializer
        return RecordingSerializer

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)

    @action(detail=False, methods=['get'])
    def public(self, request):
        """Get all public recordings"""
        public_recordings = self.get_queryset().filter(is_public=True)
        serializer = self.get_serializer(public_recordings, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def event_recordings(self, request):
        """Get recordings for events user is registered for"""
        user_events = request.user.event_registrations.values_list('event_id', flat=True)
        recordings = self.get_queryset().filter(event_id__in=user_events)
        serializer = self.get_serializer(recordings, many=True)
        return Response(serializer.data)
