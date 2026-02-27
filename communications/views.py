from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Prefetch
from django.utils import timezone

from .models import Announcement, UserNotification, WebinarChatMessage, Conversation, Message
from .serializers import (
    AnnouncementSerializer,
    UserNotificationSerializer,
    WebinarChatMessageSerializer,
    WebinarChatMessageCreateSerializer,
    ConversationListSerializer,
    ConversationDetailSerializer,
    MessageSerializer,
    SendMessageSerializer,
)
from accounts.permissions import IsAdmin
from .services import create_notification


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
        # Signal will handle notification creation automatically
        serializer.save(sender=self.request.user)

    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get recent announcements"""
        recent = self.get_queryset()[:10]
        serializer = self.get_serializer(recent, many=True)
        return Response(serializer.data)


class UserNotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for user notifications"""
    queryset = UserNotification.objects.select_related(
        'user', 'announcement', 'event', 'recording', 'related_webinar'
    ).all()
    serializer_class = UserNotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Users only see their own notifications
        queryset = super().get_queryset().filter(user=self.request.user)
        unread_param = self.request.query_params.get('unread')
        if unread_param in ['true', '1', 'yes']:
            queryset = queryset.filter(is_read=False)
        return queryset

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark a notification as read"""
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'status': 'Notification marked as read'})

    @action(detail=True, methods=['post'], url_path='mark-read')
    def mark_read_hyphen(self, request, pk=None):
        """Mark a notification as read (hyphenated path)"""
        return self.mark_read(request, pk=pk)

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Mark all notifications as read"""
        self.get_queryset().update(is_read=True)
        return Response({'status': 'All notifications marked as read'})

    @action(detail=False, methods=['post'], url_path='mark-all-read')
    def mark_all_read_hyphen(self, request):
        """Mark all notifications as read (hyphenated path)"""
        return self.mark_all_read(request)

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

    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get recent notifications (latest 10)"""
        recent = self.get_queryset().order_by('-created_at')[:10]
        serializer = self.get_serializer(recent, many=True)
        return Response(serializer.data)


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


class InboxViewSet(viewsets.ViewSet):
    """ViewSet for inbox/messaging functionality"""
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'], url_path='conversations')
    def list_conversations(self, request):
        """Get all conversations for the current user"""
        conversations = Conversation.objects.filter(
            participants=request.user
        ).prefetch_related(
            'participants',
            'related_webinar',
            Prefetch('messages', queryset=Message.objects.order_by('created_at'))
        ).distinct().order_by('-last_message_at')
        
        serializer = ConversationListSerializer(
            conversations, 
            many=True, 
            context={'request': request}
        )
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='messages/(?P<conversation_id>[^/.]+)')
    def get_messages(self, request, conversation_id=None):
        """Get messages for a specific conversation"""
        try:
            conversation = Conversation.objects.prefetch_related(
                'messages__sender',
                'participants'
            ).get(id=conversation_id)
            
            # Verify user is a participant
            if not conversation.participants.filter(id=request.user.id).exists():
                return Response(
                    {'error': 'You are not a participant in this conversation'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Get messages with pagination
            page_size = int(request.query_params.get('page_size', 50))
            page = int(request.query_params.get('page', 1))
            
            messages = conversation.messages.all()
            total = messages.count()
            start = (page - 1) * page_size
            end = start + page_size
            
            paginated_messages = messages[start:end]
            serializer = MessageSerializer(paginated_messages, many=True)
            
            return Response({
                'messages': serializer.data,
                'total': total,
                'page': page,
                'page_size': page_size,
                'has_more': end < total
            })
            
        except Conversation.DoesNotExist:
            return Response(
                {'error': 'Conversation not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['post'], url_path='send')
    def send_message(self, request):
        """Send a message (creates conversation if needed)"""
        serializer = SendMessageSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        participant_ids = serializer.validated_data['participant_ids']
        content = serializer.validated_data['content']
        related_webinar_id = serializer.validated_data.get('related_webinar_id')
        
        # Add current user to participants
        all_participant_ids = set(participant_ids + [request.user.id])
        
        # Find existing conversation with same participants and webinar
        conversation = None
        potential_conversations = Conversation.objects.filter(
            related_webinar_id=related_webinar_id
        ).prefetch_related('participants')
        
        for conv in potential_conversations:
            conv_participant_ids = set(conv.participants.values_list('id', flat=True))
            if conv_participant_ids == all_participant_ids:
                conversation = conv
                break
        
        # Create new conversation if not found
        if not conversation:
            conversation = Conversation.objects.create(
                related_webinar_id=related_webinar_id
            )
            conversation.participants.set(all_participant_ids)
        
        # Create message
        message = Message.objects.create(
            conversation=conversation,
            sender=request.user,
            content=content,
            is_read=False
        )
        
        # Update conversation last_message_at
        conversation.last_message_at = message.created_at
        conversation.save()
        
        # Notify other participants
        other_participants = conversation.participants.exclude(id=request.user.id)
        for participant in other_participants:
            create_notification(
                user=participant,
                title="New Message",
                message=f"{request.user.username} sent you a message",
                notification_type="new_message",
                related_webinar=conversation.related_webinar
            )
        
        # Return created message
        serializer = MessageSerializer(message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], url_path='mark-read/(?P<conversation_id>[^/.]+)')
    def mark_read(self, request, conversation_id=None):
        """Mark all messages in a conversation as read"""
        try:
            conversation = Conversation.objects.get(id=conversation_id)
            
            # Verify user is a participant
            if not conversation.participants.filter(id=request.user.id).exists():
                return Response(
                    {'error': 'You are not a participant in this conversation'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Mark all messages from other users as read
            unread_count = conversation.messages.exclude(
                sender=request.user
            ).filter(is_read=False).update(is_read=True)
            
            return Response({
                'status': 'Messages marked as read',
                'count': unread_count
            })
            
        except Conversation.DoesNotExist:
            return Response(
                {'error': 'Conversation not found'},
                status=status.HTTP_404_NOT_FOUND
            )
