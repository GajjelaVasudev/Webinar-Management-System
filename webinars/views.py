from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils import timezone

from .models import Event
from .serializers import EventSerializer, EventDetailSerializer
from accounts.permissions import IsAdmin


class EventViewSet(viewsets.ModelViewSet):
    """ViewSet for managing events/webinars"""
    queryset = Event.objects.select_related('organizer').all()
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # DEBUG: Log the request user and their properties
        print(f"DEBUG: EventViewSet.get_queryset() called")
        print(f"DEBUG: User: {self.request.user}")
        print(f"DEBUG: User authenticated: {self.request.user.is_authenticated}")
        print(f"DEBUG: User role: {getattr(self.request.user, 'role', 'N/A')}")
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            if status_filter == 'upcoming':
                now = timezone.now()
                queryset = queryset.filter(date__gte=now.date())
            elif status_filter == 'completed':
                queryset = queryset.filter(manual_status='completed')
        
        # Filter by organizer
        organizer_id = self.request.query_params.get('organizer')
        if organizer_id:
            queryset = queryset.filter(organizer_id=organizer_id)
        
        # If request has 'my_only' param and user is authenticated, show only their webinars
        my_only = self.request.query_params.get('my_only')
        if my_only and self.request.user.is_authenticated:
            print(f"DEBUG: Filtering to user {self.request.user.id}'s webinars only")
            queryset = queryset.filter(organizer=self.request.user)
        
        print(f"DEBUG: Returning {queryset.count()} webinars")
        return queryset

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return EventDetailSerializer
        return EventSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdmin()]
        return super().get_permissions()

    def perform_create(self, serializer):
        serializer.save(organizer=self.request.user)

    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get all upcoming webinars"""
        now = timezone.now()
        upcoming_events = self.get_queryset().filter(date__gte=now.date()).order_by('date', 'time')
        serializer = self.get_serializer(upcoming_events, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def live(self, request):
        """Get all live webinars"""
        live_events = [event for event in self.get_queryset() if event.get_status() == 'live']
        serializer = self.get_serializer(live_events, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def completed(self, request):
        """Get all completed webinars"""
        completed_events = [event for event in self.get_queryset() if event.get_status() == 'completed']
        serializer = self.get_serializer(completed_events, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def mark_completed(self, request, pk=None):
        """Manually mark a webinar as completed"""
        event = self.get_object()
        event.manual_status = 'completed'
        event.save()
        return Response({'status': 'Webinar marked as completed'}, status=status.HTTP_200_OK)
