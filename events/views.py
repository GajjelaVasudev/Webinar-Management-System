from django.contrib.auth.decorators import login_required
from django.http import HttpRequest, HttpResponse
from django.shortcuts import get_object_or_404, redirect, render

from .models import Event, Recording, Registration


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
