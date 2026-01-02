from django.urls import path

from . import views

urlpatterns = [
    path("", views.event_list, name="event-list"),
    path("<int:event_id>/register/", views.register_event, name="event-register"),
    path("<int:event_id>/recordings/", views.event_recordings, name="event-recordings"),
]
