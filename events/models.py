from django.conf import settings
from django.db import models


class Event(models.Model):
	title = models.CharField(max_length=200)
	description = models.TextField(blank=True)
	date = models.DateField()
	time = models.TimeField()
	organizer = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.CASCADE,
		related_name="organized_events",
	)

	def __str__(self) -> str:
		return self.title


class Registration(models.Model):
	user = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.CASCADE,
		related_name="event_registrations",
	)
	event = models.ForeignKey(
		Event,
		on_delete=models.CASCADE,
		related_name="registrations",
	)
	registered_on = models.DateTimeField(auto_now_add=True)

	class Meta:
		constraints = [
			models.UniqueConstraint(
				fields=["user", "event"],
				name="unique_registration_per_user_event",
			)
		]

	def __str__(self) -> str:
		return f"{self.user} -> {self.event}"


class Recording(models.Model):
	event = models.ForeignKey(
		Event,
		on_delete=models.CASCADE,
		related_name="recordings",
	)
	recording_link = models.URLField()

	def __str__(self) -> str:
		return f"Recording for {self.event}"
