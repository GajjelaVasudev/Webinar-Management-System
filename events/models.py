from django.conf import settings
from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
	"""Extended user profile with role information"""
	ROLE_CHOICES = [
		('admin', 'Administrator'),
		('user', 'Regular User'),
	]
	
	user = models.OneToOneField(
		User,
		on_delete=models.CASCADE,
		related_name='profile',
	)
	role = models.CharField(
		max_length=10,
		choices=ROLE_CHOICES,
		default='user',
	)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	def __str__(self) -> str:
		return f"{self.user.username} - {self.get_role_display()}"


class Event(models.Model):
	title = models.CharField(max_length=200)
	description = models.TextField(blank=True)
	date = models.DateField()
	time = models.TimeField()
	duration = models.IntegerField(default=60, help_text="Duration in minutes")
	price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, help_text="Price in USD. Set to 0 for free.")
	thumbnail = models.ImageField(upload_to='webinar_thumbnails/', blank=True, null=True)
	live_stream_url = models.URLField(blank=True, null=True, help_text="URL for live stream embed (e.g., YouTube, Vimeo)")
	manual_status = models.CharField(
		max_length=20,
		choices=[('', 'Auto'), ('completed', 'Completed')],
		blank=True,
		default='',
		help_text="Override automatic status calculation"
	)
	organizer = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.CASCADE,
		related_name="organized_events",
	)

	def get_status(self):
		"""Calculate webinar status based on current time"""
		# Manual override takes precedence
		if self.manual_status:
			return self.manual_status
		
		from datetime import datetime, timezone
		from django.utils import timezone as django_timezone
		
		# Combine date and time
		start_dt = django_timezone.make_aware(datetime.combine(self.date, self.time))
		from datetime import timedelta
		end_dt = start_dt + timedelta(minutes=self.duration)
		now = django_timezone.now()
		
		if now < start_dt:
			return 'upcoming'
		elif start_dt <= now <= end_dt:
			return 'live'
		else:
			return 'completed'

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

class Announcement(models.Model):
	"""Admin announcements sent to users"""
	sender = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.CASCADE,
		related_name="sent_announcements",
	)
	title = models.CharField(max_length=255)
	content = models.TextField()
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		ordering = ['-created_at']

	def __str__(self) -> str:
		return f"{self.title} by {self.sender.username}"


class UserNotification(models.Model):
	"""Tracks which notifications a user has seen"""
	NOTIFICATION_TYPES = [
		('announcement', 'Announcement'),
		('upcoming_webinar', 'Upcoming Webinar'),
		('new_recording', 'New Recording'),
	]

	user = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.CASCADE,
		related_name="notifications",
	)
	notification_type = models.CharField(
		max_length=20,
		choices=NOTIFICATION_TYPES,
	)
	title = models.CharField(max_length=255)
	content = models.TextField()
	announcement = models.ForeignKey(
		Announcement,
		on_delete=models.CASCADE,
		null=True,
		blank=True,
		related_name="user_notifications",
	)
	event = models.ForeignKey(
		Event,
		on_delete=models.CASCADE,
		null=True,
		blank=True,
		related_name="notifications",
	)
	recording = models.ForeignKey(
		Recording,
		on_delete=models.CASCADE,
		null=True,
		blank=True,
		related_name="notifications",
	)
	is_read = models.BooleanField(default=False)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		ordering = ['-created_at']
		constraints = [
			models.UniqueConstraint(
				fields=["user", "announcement"],
				condition=models.Q(notification_type='announcement'),
				name="unique_announcement_per_user",
			)
		]

	def __str__(self) -> str:
		return f"{self.title} for {self.user.username}"


class WebinarChatMessage(models.Model):
	"""Chat messages for live webinar sessions"""
	event = models.ForeignKey(
		Event,
		on_delete=models.CASCADE,
		related_name="chat_messages",
	)
	user = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.CASCADE,
		related_name="webinar_messages",
	)
	message = models.TextField(max_length=1000)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		ordering = ['created_at']
		indexes = [
			models.Index(fields=['event', 'created_at']),
		]

	def __str__(self) -> str:
		return f"{self.user.username} in {self.event.title}: {self.message[:50]}"