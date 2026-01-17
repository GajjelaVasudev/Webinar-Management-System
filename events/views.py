from django.contrib.auth.decorators import login_required
from django.http import HttpRequest, HttpResponse
from django.shortcuts import get_object_or_404, redirect, render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth.models import User

from .models import Event, Recording, Registration, UserProfile, Announcement, UserNotification, WebinarChatMessage
from .serializers import (
	EventSerializer,
	EventDetailSerializer,
	RecordingSerializer,
	UserSerializer,
	UserProfileSerializer,
	RegistrationSerializer,
	EmailOrUsernameTokenObtainPairSerializer,
	AnnouncementSerializer,
	UserNotificationSerializer,
	WebinarChatMessageSerializer,
)


class IsAdmin(IsAuthenticated):
	"""Permission class to check if user is admin"""
	def has_permission(self, request, view):
		if not super().has_permission(request, view):
			return False
		try:
			return request.user.profile.role == 'admin'
		except UserProfile.DoesNotExist:
			return False


def event_list(request: HttpRequest) -> HttpResponse:
	events = Event.objects.order_by("date", "time")
	return render(request, "events/event_list.html", {"events": events})


@login_required
def register_event(request: HttpRequest, event_id: int) -> HttpResponse:
	if request.method != "POST":
		return HttpResponse(
			"Send a POST request to register.",
			status=405,
			content_type="text/plain",
		)

	event = get_object_or_404(Event, id=event_id)
	Registration.objects.get_or_create(user=request.user, event=event)
	return redirect("event-list")


@login_required
def event_recordings(request: HttpRequest, event_id: int) -> HttpResponse:
	event = get_object_or_404(Event, id=event_id)
	recordings = Recording.objects.filter(event=event).order_by("id")
	return render(
		request,
		"events/recordings.html",
		{"event": event, "recordings": recordings},
	)


# API Views for React Frontend

class CustomTokenObtainPairView(TokenObtainPairView):
	"""Custom JWT token view that returns user data"""
	permission_classes = [AllowAny]
	serializer_class = EmailOrUsernameTokenObtainPairSerializer

	def post(self, request, *args, **kwargs):
		response = super().post(request, *args, **kwargs)
		if response.status_code == 200:
			login_identifier = request.data.get('username')
			user = None
			# Accept either username or email for lookup
			if login_identifier:
				user = User.objects.filter(username=login_identifier).first()
				if user is None and "@" in login_identifier:
					user = User.objects.filter(email__iexact=login_identifier).first()
			if not user:
				return response
			
			# Ensure UserProfile exists and update role for superusers
			profile, created = UserProfile.objects.get_or_create(user=user)
			if user.is_superuser or user.is_staff:
				if profile.role != 'admin':
					profile.role = 'admin'
					profile.save()
			
			response.data['user'] = UserSerializer(user).data
		return response


class RegisterView(APIView):
	"""User registration endpoint"""
	permission_classes = [AllowAny]
	
	def post(self, request):
		"""Register a new user"""
		username = request.data.get('username')
		email = request.data.get('email')
		password = request.data.get('password')
		
		if not username or not email or not password:
			return Response(
				{'error': 'username, email, and password are required'},
				status=status.HTTP_400_BAD_REQUEST
			)
		
		if User.objects.filter(username=username).exists():
			return Response(
				{'error': 'Username already exists'},
				status=status.HTTP_400_BAD_REQUEST
			)
		
		if User.objects.filter(email=email).exists():
			return Response(
				{'error': 'Email already exists'},
				status=status.HTTP_400_BAD_REQUEST
			)
		
		user = User.objects.create_user(
			username=username,
			email=email,
			password=password
		)
		
		# Create UserProfile for the new user
		UserProfile.objects.get_or_create(user=user)
		
		return Response(
			{
				'id': user.id,
				'username': user.username,
				'email': user.email,
				'message': 'User registered successfully'
			},
			status=status.HTTP_201_CREATED
		)



class UserProfileViewSet(viewsets.ReadOnlyModelViewSet):
	"""API ViewSet for retrieving user profile with role"""
	permission_classes = [IsAuthenticated]
	
	@action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
	def me(self, request):
		"""Get current user's profile with role information"""
		user = request.user
		try:
			profile = user.profile
		except UserProfile.DoesNotExist:
			# Create profile if it doesn't exist
			profile = UserProfile.objects.create(user=user)
		
		serializer = UserProfileSerializer(profile)
		return Response({
			'id': user.id,
			'username': user.username,
			'email': user.email,
			'role': profile.role,
		})


class EventViewSet(viewsets.ModelViewSet):
	"""API ViewSet for Event CRUD operations"""
	queryset = Event.objects.all().order_by('-date', '-time')
	permission_classes = [AllowAny]

	def get_serializer_class(self):
		if self.action == 'retrieve':
			return EventDetailSerializer
		return EventSerializer

	def get_permissions(self):
		if self.action in ['create', 'update', 'partial_update', 'destroy']:
			return [IsAdmin()]
		return [AllowAny()]

	def perform_create(self, serializer):
		"""Set organizer to current user when creating event"""
		serializer.save(organizer=self.request.user)

	@action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
	def register(self, request, pk=None):
		"""Register user for an event"""
		event = self.get_object()
		registration, created = Registration.objects.get_or_create(
			user=request.user,
			event=event
		)
		if created:
			return Response(
				{
					'detail': 'Successfully registered for event',
					'email': request.user.email,
					'id': registration.id,
					'event_id': event.id
				},
				status=status.HTTP_201_CREATED
			)
		return Response(
			{
				'detail': 'Already registered for this event',
				'email': request.user.email,
				'id': registration.id,
				'event_id': event.id
			},
			status=status.HTTP_200_OK
		)

	@action(detail=True, methods=['delete'], permission_classes=[IsAuthenticated])
	def unregister(self, request, pk=None):
		"""Unregister user from an event"""
		event = self.get_object()
		registration = Registration.objects.filter(
			user=request.user,
			event=event
		)
		if registration.exists():
			registration.delete()
			return Response(
				{'detail': 'Successfully unregistered from event'},
				status=status.HTTP_204_NO_CONTENT
			)
		return Response(
			{'detail': 'Not registered for this event'},
			status=status.HTTP_404_NOT_FOUND
		)


class RecordingViewSet(viewsets.ModelViewSet):
	"""API ViewSet for recordings; list/retrieve open, writes admin-only."""
	serializer_class = RecordingSerializer

	def get_permissions(self):
		if self.action in ['create', 'update', 'partial_update', 'destroy']:
			return [IsAdmin()]
		return [AllowAny()]

	def get_queryset(self):
		"""Support filtering recordings by event"""
		qs = Recording.objects.select_related('event').all().order_by('-id')
		event_id = self.request.query_params.get('event')
		if event_id:
			qs = qs.filter(event_id=event_id)
		return qs

	def perform_create(self, serializer):
		"""Ensure recording is created with a specific event"""
		serializer.save()


class RegistrationViewSet(viewsets.ReadOnlyModelViewSet):
	"""Admin-only view for registrations across events."""
	serializer_class = RegistrationSerializer
	permission_classes = [IsAdmin]

	def get_queryset(self):
		event_id = self.request.query_params.get('event')
		qs = Registration.objects.select_related('user', 'event').all().order_by('-registered_on')
		if event_id:
			qs = qs.filter(event_id=event_id)
		return qs


class DashboardStatsView(APIView):
	"""Aggregate stats for admin dashboard."""
	permission_classes = [IsAdmin]

	def get(self, request):
		total_webinars = Event.objects.count()
		total_registrations = Registration.objects.count()
		from django.utils import timezone
		now = timezone.now()
		upcoming_webinars = Event.objects.filter(date__gte=now.date()).count()
		completed_webinars = total_webinars - upcoming_webinars
		return Response({
			"total_webinars": total_webinars,
			"total_registrations": total_registrations,
			"upcoming_webinars": upcoming_webinars,
			"completed_webinars": completed_webinars,
		})


class AdminUserViewSet(viewsets.ReadOnlyModelViewSet):
	"""Admin-only viewset to list users with roles."""
	queryset = User.objects.all().select_related('profile')
	serializer_class = UserSerializer
	permission_classes = [IsAdmin]


class AnnouncementViewSet(viewsets.ModelViewSet):
	"""Announcements from admin to all users."""
	serializer_class = AnnouncementSerializer
	permission_classes = [IsAuthenticated]

	def get_queryset(self):
		"""All announcements can be read by authenticated users"""
		return Announcement.objects.all()

	def perform_create(self, serializer):
		"""Only admins can create announcements"""
		if not self._is_admin():
			raise PermissionError("Only admins can create announcements")
		serializer.save(sender=self.request.user)

	def perform_update(self, serializer):
		"""Only admins and original sender can update"""
		if not self._is_admin():
			raise PermissionError("Only admins can update announcements")
		serializer.save()

	def perform_destroy(self, instance):
		"""Only admins can delete"""
		if not self._is_admin():
			raise PermissionError("Only admins can delete announcements")
		instance.delete()

	def _is_admin(self):
		try:
			return self.request.user.profile.role == 'admin'
		except UserProfile.DoesNotExist:
			return False

	@action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
	def send_to_all(self, request):
		"""Send announcement to all users"""
		if not self._is_admin():
			return Response(
				{'error': 'Only admins can send announcements'},
				status=status.HTTP_403_FORBIDDEN
			)

		serializer = self.get_serializer(data=request.data)
		if serializer.is_valid():
			announcement = serializer.save(sender=request.user)
			
			# Create notifications for all users
			all_users = User.objects.exclude(id=request.user.id)
			notifications = [
				UserNotification(
					user=user,
					notification_type='announcement',
					title=announcement.title,
					content=announcement.content,
					announcement=announcement,
				)
				for user in all_users
			]
			UserNotification.objects.bulk_create(notifications, ignore_conflicts=True)
			
			return Response(serializer.data, status=status.HTTP_201_CREATED)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserNotificationViewSet(viewsets.ReadOnlyModelViewSet):
	"""User notifications"""
	serializer_class = UserNotificationSerializer
	permission_classes = [IsAuthenticated]

	def get_queryset(self):
		"""Only get notifications for the current user"""
		return self.request.user.notifications.all()

	@action(detail=False, methods=['get'])
	def unread_count(self, request):
		"""Get count of unread notifications"""
		unread_count = request.user.notifications.filter(is_read=False).count()
		return Response({'unread_count': unread_count})

	@action(detail=True, methods=['post'])
	def mark_as_read(self, request, pk=None):
		"""Mark a notification as read"""
		notification = self.get_object()
		notification.is_read = True
		notification.save()
		return Response({'status': 'notification marked as read'})

	@action(detail=False, methods=['post'])
	def mark_all_as_read(self, request):
		"""Mark all notifications as read"""
		request.user.notifications.filter(is_read=False).update(is_read=True)
		return Response({'status': 'all notifications marked as read'})

	@action(detail=False, methods=['get'])
	def recent(self, request):
		"""Get recent unread notifications (limit 10)"""
		notifications = request.user.notifications.filter(is_read=False)[:10]
		serializer = self.get_serializer(notifications, many=True)
		return Response(serializer.data)


class WebinarChatMessageViewSet(viewsets.ModelViewSet):
	"""Chat messages for webinar sessions"""
	serializer_class = WebinarChatMessageSerializer
	permission_classes = [IsAuthenticated]

	def get_queryset(self):
		"""Get chat messages for a specific event"""
		event_id = self.request.query_params.get('event_id')
		if not event_id:
			return WebinarChatMessage.objects.none()
		
		# Only return messages for events the user is registered for or is the organizer of
		event = get_object_or_404(Event, id=event_id)
		is_registered = event.registrations.filter(user=self.request.user).exists()
		is_organizer = event.organizer == self.request.user
		is_admin = self.request.user.profile.role == 'admin' if hasattr(self.request.user, 'profile') else False
		
		if not (is_registered or is_organizer or is_admin):
			return WebinarChatMessage.objects.none()
		
		return WebinarChatMessage.objects.filter(event=event).order_by('created_at')

	def create(self, request, *args, **kwargs):
		"""Create a new chat message"""
		event_id = request.data.get('event')
		event = get_object_or_404(Event, id=event_id)
		
		# Check if user is registered for this event
		is_registered = event.registrations.filter(user=request.user).exists()
		is_organizer = event.organizer == request.user
		is_admin = request.user.profile.role == 'admin' if hasattr(request.user, 'profile') else False
		
		if not (is_registered or is_organizer or is_admin):
			return Response(
				{'detail': 'You are not registered for this webinar.'},
				status=status.HTTP_403_FORBIDDEN
			)
		
		# Create the message with the authenticated user
		serializer = self.get_serializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		serializer.save(user=request.user)
		return Response(serializer.data, status=status.HTTP_201_CREATED)

	@action(detail=False, methods=['get'])
	def by_event(self, request):
		"""Get all chat messages for an event"""
		event_id = request.query_params.get('event_id')
		if not event_id:
			return Response({'detail': 'event_id required'}, status=status.HTTP_400_BAD_REQUEST)
		
		messages = self.get_queryset()
		serializer = self.get_serializer(messages, many=True)
		return Response(serializer.data)


class ChangePasswordView(APIView):
	"""Change user password"""
	permission_classes = [IsAuthenticated]

	def post(self, request):
		user = request.user
		current_password = request.data.get('current_password')
		new_password = request.data.get('new_password')

		if not current_password or not new_password:
			return Response(
				{'detail': 'current_password and new_password are required'},
				status=status.HTTP_400_BAD_REQUEST
			)

		if not user.check_password(current_password):
			return Response(
				{'detail': 'Current password is incorrect'},
				status=status.HTTP_401_UNAUTHORIZED
			)

		user.set_password(new_password)
		user.save()
		return Response({'detail': 'Password changed successfully'}, status=status.HTTP_200_OK)
