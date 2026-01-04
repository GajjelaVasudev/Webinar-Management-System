from django.contrib.auth.decorators import login_required
from django.http import HttpRequest, HttpResponse
from django.shortcuts import get_object_or_404, redirect, render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth.models import User

from .models import Event, Recording, Registration
from .serializers import EventSerializer, EventDetailSerializer, RecordingSerializer, UserSerializer


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

	def post(self, request, *args, **kwargs):
		response = super().post(request, *args, **kwargs)
		if response.status_code == 200:
			user = User.objects.get(username=request.data.get('username'))
			response.data['user'] = UserSerializer(user).data
		return response


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
			return [IsAuthenticated()]
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
				{'detail': 'Successfully registered for event'},
				status=status.HTTP_201_CREATED
			)
		return Response(
			{'detail': 'Already registered for this event'},
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


class RecordingViewSet(viewsets.ReadOnlyModelViewSet):
	"""API ViewSet for viewing Recordings"""
	queryset = Recording.objects.all()
	serializer_class = RecordingSerializer
	permission_classes = [AllowAny]

