from django.contrib.admin.sites import site
from django.contrib.auth import get_user_model
from django.test import Client, TestCase
from django.urls import reverse

from .models import Event, Recording, Registration


class EventsAccessTests(TestCase):
	def setUp(self) -> None:
		self.client = Client()

		User = get_user_model()
		self.organizer = User.objects.create_user(
			username="organizer",
			password="testpass123",
		)
		self.user = User.objects.create_user(
			username="student",
			password="testpass123",
		)

		self.event = Event.objects.create(
			title="Intro to Django",
			description="Basic webinar",
			date="2026-01-02",
			time="10:00:00",
			organizer=self.organizer,
		)
		self.recording = Recording.objects.create(
			event=self.event,
			recording_link="https://example.com/recording",
		)

	def test_event_list_is_public(self) -> None:
		response = self.client.get(reverse("event-list"))
		self.assertEqual(response.status_code, 200)
		self.assertContains(response, self.event.title)

	def test_register_requires_login_redirects_to_admin_login(self) -> None:
		response = self.client.post(reverse("event-register", args=[self.event.id]))
		self.assertEqual(response.status_code, 302)
		self.assertIn("/admin/login/", response["Location"])

	def test_recordings_requires_login_redirects_to_admin_login(self) -> None:
		response = self.client.get(reverse("event-recordings", args=[self.event.id]))
		self.assertEqual(response.status_code, 302)
		self.assertIn("/admin/login/", response["Location"])

	def test_user_can_register_only_once_per_event(self) -> None:
		self.client.force_login(self.user)

		url = reverse("event-register", args=[self.event.id])
		response1 = self.client.post(url)
		self.assertEqual(response1.status_code, 302)

		response2 = self.client.post(url)
		self.assertEqual(response2.status_code, 302)

		self.assertEqual(
			Registration.objects.filter(user=self.user, event=self.event).count(),
			1,
		)

	def test_registration_redirects_back_to_event_list(self) -> None:
		self.client.force_login(self.user)

		response = self.client.post(reverse("event-register", args=[self.event.id]))
		self.assertEqual(response.status_code, 302)
		self.assertEqual(response["Location"], reverse("event-list"))


class AdminSmokeTests(TestCase):
	def setUp(self) -> None:
		self.client = Client()
		User = get_user_model()
		self.admin = User.objects.create_superuser(
			username="admin",
			password="adminpass123",
			email="admin@example.com",
		)

	def test_models_registered_in_admin(self) -> None:
		self.assertIn(Event, site._registry)
		self.assertIn(Registration, site._registry)
		self.assertIn(Recording, site._registry)

	def test_admin_can_open_add_pages(self) -> None:
		self.client.force_login(self.admin)

		event_add = reverse("admin:events_event_add")
		recording_add = reverse("admin:events_recording_add")

		response1 = self.client.get(event_add)
		self.assertEqual(response1.status_code, 200)

		response2 = self.client.get(recording_add)
		self.assertEqual(response2.status_code, 200)

	def test_admin_can_create_event_and_recording(self) -> None:
		self.client.force_login(self.admin)

		event_add = reverse("admin:events_event_add")
		response = self.client.post(
			event_add,
			data={
				"title": "Admin Created Event",
				"description": "Created from admin form in a test",
				"date": "2026-01-02",
				"time": "11:30:00",
				"organizer": str(self.admin.id),
			},
		)
		self.assertEqual(response.status_code, 302)

		created_event = Event.objects.get(title="Admin Created Event")

		recording_add = reverse("admin:events_recording_add")
		response2 = self.client.post(
			recording_add,
			data={
				"event": str(created_event.id),
				"recording_link": "https://example.com/admin-recording",
			},
		)
		self.assertEqual(response2.status_code, 302)
		self.assertTrue(
			Recording.objects.filter(
				event=created_event,
				recording_link="https://example.com/admin-recording",
			).exists()
		)

# Create your tests here.
