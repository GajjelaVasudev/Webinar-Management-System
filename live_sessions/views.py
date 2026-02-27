from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils import timezone
from django.db.models import Count, Avg, F, ExpressionWrapper, DurationField, Q
from django.contrib.auth.models import User

from webinars.models import Event
from registrations.models import Registration
from accounts.permissions import IsAdmin
from communications.services import notify_live_session_started, notify_live_session_ended
from .models import LiveSession, LiveSessionParticipant
from .serializers import (
    LiveSessionSerializer,
    LiveSessionStartSerializer,
    LiveSessionStatusSerializer,
)


class LiveSessionViewSet(viewsets.ModelViewSet):
    """ViewSet for managing live sessions"""
    queryset = LiveSession.objects.select_related('webinar', 'started_by').all()
    serializer_class = LiveSessionSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return super().get_permissions()

    def get_serializer_class(self):
        if self.action == 'start':
            return LiveSessionStartSerializer
        elif self.action == 'status':
            return LiveSessionStatusSerializer
        return LiveSessionSerializer

    @action(detail=False, methods=['post'], url_path='start/(?P<webinar_id>[0-9]+)')
    def start(self, request, webinar_id=None):
        """
        Start a live session for a webinar.
        Only the webinar organizer (admin/host) can start a session.
        """
        try:
            webinar = Event.objects.get(id=webinar_id)
        except Event.DoesNotExist:
            return Response(
                {'error': 'Webinar not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if user is the webinar organizer
        if webinar.organizer != request.user:
            return Response(
                {'error': 'Only the webinar organizer can start a live session'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Return existing active session if present
        active_session = LiveSession.objects.filter(
            webinar=webinar,
            is_active=True
        ).first()
        if active_session:
            serializer = LiveSessionStartSerializer(active_session)
            return Response(serializer.data, status=status.HTTP_200_OK)

        # Get or create live session
        live_session, created = LiveSession.objects.get_or_create(
            webinar=webinar,
            defaults={'started_by': request.user}
        )

        # Activate the session
        if not live_session.is_active:
            live_session.is_active = True
            live_session.started_at = timezone.now()
            live_session.started_by = request.user
            live_session.end_time = None
            live_session.save()
            
            # Notify all registered users that the live session has started
            registered_users = User.objects.filter(
                event_registrations__event=webinar
            ).distinct()
            notify_live_session_started(webinar, registered_users)

        serializer = LiveSessionStartSerializer(live_session)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='join/(?P<webinar_id>[0-9]+)')
    def join(self, request, webinar_id=None):
        """
        Join a live session for a webinar.
        Only authenticated and registered students can join.
        """
        try:
            webinar = Event.objects.get(id=webinar_id)
        except Event.DoesNotExist:
            return Response(
                {'error': 'Webinar not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Get live session
        try:
            live_session = LiveSession.objects.get(webinar=webinar)
        except LiveSession.DoesNotExist:
            return Response(
                {'error': 'Live session not found for this webinar'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if session is active
        if not live_session.is_active:
            return Response(
                {'error': 'Live session is not active'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Check if user is registered for this webinar
        is_registered = Registration.objects.filter(
            user=request.user,
            event=webinar
        ).exists()

        if not is_registered and webinar.organizer != request.user:
            return Response(
                {'error': 'You must be registered for this webinar to join the live session'},
                status=status.HTTP_403_FORBIDDEN
            )

        LiveSessionParticipant.objects.get_or_create(
            session=live_session,
            user=request.user
        )
        participant_count = live_session.participants.count()

        return Response(
            {
                'room_name': live_session.room_name,
                'is_active': live_session.is_active,
                'participant_count': participant_count,
            },
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['post'], url_path='end/(?P<webinar_id>[0-9]+)')
    def end(self, request, webinar_id=None):
        """
        End a live session for a webinar.
        Only the webinar organizer (admin/host) can end a session.
        """
        try:
            webinar = Event.objects.get(id=webinar_id)
        except Event.DoesNotExist:
            return Response(
                {'error': 'Webinar not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if user is the webinar organizer
        if webinar.organizer != request.user:
            return Response(
                {'error': 'Only the webinar organizer can end the live session'},
                status=status.HTTP_403_FORBIDDEN
            )

        live_session = LiveSession.objects.filter(
            webinar=webinar,
            is_active=True
        ).first()

        if not live_session:
            return Response(
                {'error': 'No active live session found for this webinar'},
                status=status.HTTP_404_NOT_FOUND
            )

        live_session.is_active = False
        live_session.end_time = timezone.now()
        live_session.save()
        
        # Notify all participants that the live session has ended
        participant_users = User.objects.filter(
            livesessionparticipant__session=live_session
        ).distinct()
        notify_live_session_ended(webinar, participant_users)

        return Response(
            {
                'message': 'Live session ended successfully',
                'end_time': live_session.end_time,
            },
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['get'], url_path='status/(?P<webinar_id>[0-9]+)')
    def status(self, request, webinar_id=None):
        """
        Check if a live session is active for a webinar.
        Public endpoint - no authentication required.
        """
        try:
            webinar = Event.objects.get(id=webinar_id)
        except Event.DoesNotExist:
            return Response(
                {'error': 'Webinar not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            live_session = LiveSession.objects.get(webinar=webinar)
            serializer = LiveSessionStatusSerializer(live_session)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except LiveSession.DoesNotExist:
            return Response(
                {'is_active': False, 'room_name': None},
                status=status.HTTP_200_OK
            )

    @action(detail=False, methods=['get'], url_path='analytics', permission_classes=[IsAdmin])
    def analytics(self, request):
        """
        Get analytics for all live sessions.
        Only accessible to admin/organizer users.
        Returns comprehensive statistics about live sessions.
        """
        # Total webinars that have had live sessions
        total_webinars = LiveSession.objects.values('webinar').distinct().count()
        
        # Total live sessions
        total_live_sessions = LiveSession.objects.count()
        
        # Total unique participants across all sessions
        total_participants = LiveSessionParticipant.objects.values('user').distinct().count()
        
        # Active and completed sessions
        active_sessions = LiveSession.objects.filter(is_active=True).count()
        completed_sessions = LiveSession.objects.filter(
            is_active=False,
            end_time__isnull=False
        ).count()
        
        # Average session duration (in minutes)
        # Only calculate for sessions that have ended
        sessions_with_duration = LiveSession.objects.filter(
            end_time__isnull=False
        ).annotate(
            duration=ExpressionWrapper(
                F('end_time') - F('start_time'),
                output_field=DurationField()
            )
        )
        
        avg_duration = sessions_with_duration.aggregate(
            avg_duration=Avg('duration')
        )['avg_duration']
        
        # Convert average duration to minutes
        average_session_duration_minutes = None
        if avg_duration:
            average_session_duration_minutes = round(avg_duration.total_seconds() / 60, 2)
        
        # Sessions per webinar with participant counts
        # Use efficient query with select_related and annotate
        sessions_per_webinar = LiveSession.objects.select_related('webinar').annotate(
            participant_count=Count('participants', distinct=True)
        ).values(
            'webinar__id',
            'webinar__title',
            'participant_count'
        ).order_by('-participant_count')
        
        # Format sessions_per_webinar data
        sessions_per_webinar_list = [
            {
                'webinar_id': session['webinar__id'],
                'title': session['webinar__title'],
                'participant_count': session['participant_count']
            }
            for session in sessions_per_webinar
        ]
        
        return Response(
            {
                'total_webinars': total_webinars,
                'total_live_sessions': total_live_sessions,
                'total_participants': total_participants,
                'average_session_duration_minutes': average_session_duration_minutes,
                'sessions_per_webinar': sessions_per_webinar_list,
                'active_sessions': active_sessions,
                'completed_sessions': completed_sessions,
            },
            status=status.HTTP_200_OK
        )
