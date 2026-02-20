from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Announcement, UserNotification, WebinarChatMessage
from .serializers import (
    AnnouncementSerializer,
    UserNotificationSerializer,
    WebinarChatMessageSerializer,
    WebinarChatMessageCreateSerializer,
)
from accounts.permissions import IsAdmin


class AnnouncementViewSet(viewsets.ModelViewSet):
    """ViewSet for managing announcements"""
    queryset = Announcement.objects.select_related('sender').all()
    serializer_class = AnnouncementSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsAdmin()]

    def perform_create(self, serializer):
        announcement = serializer.save(sender=self.request.user)
        # Create notifications for all users
        self._create_notifications_for_announcement(announcement)

    def _create_notifications_for_announcement(self, announcement):
        """Create notifications for all users about the announcement"""
        from django.contrib.auth.models import User
        users = User.objects.all()
        notifications = [
            UserNotification(
                user=user,
                notification_type='announcement',
                title=announcement.title,
                content=announcement.content,
                announcement=announcement,
            )
            for user in users if user != announcement.sender
        ]
        UserNotification.objects.bulk_create(notifications, ignore_conflicts=True)

    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get recent announcements"""
        recent = self.get_queryset()[:10]
        serializer = self.get_serializer(recent, many=True)
        return Response(serializer.data)


class UserNotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for user notifications"""
    queryset = UserNotification.objects.select_related('user', 'announcement', 'event', 'recording').all()
    serializer_class = UserNotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Users only see their own notifications
        return super().get_queryset().filter(user=self.request.user)

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark a notification as read"""
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'status': 'Notification marked as read'})

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Mark all notifications as read"""
        self.get_queryset().update(is_read=True)
        return Response({'status': 'All notifications marked as read'})

    @action(detail=False, methods=['get'])
    def unread(self, request):
        """Get unread notifications"""
        unread = self.get_queryset().filter(is_read=False)
        serializer = self.get_serializer(unread, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Get count of unread notifications"""
        count = self.get_queryset().filter(is_read=False).count()
        return Response({'count': count})


class WebinarChatMessageViewSet(viewsets.ModelViewSet):
    """ViewSet for webinar chat messages"""
    queryset = WebinarChatMessage.objects.select_related('user', 'event').all()
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by event
        event_id = self.request.query_params.get('event')
        if event_id:
            queryset = queryset.filter(event_id=event_id)
        
        return queryset

    def get_serializer_class(self):
        if self.action == 'create':
            return WebinarChatMessageCreateSerializer
        return WebinarChatMessageSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def event_chat(self, request):
        """Get chat messages for a specific event"""
        event_id = request.query_params.get('event_id')
        if not event_id:
            return Response(
                {'error': 'event_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        messages = self.get_queryset().filter(event_id=event_id).order_by('created_at')
        serializer = self.get_serializer(messages, many=True)
        return Response(serializer.data)
