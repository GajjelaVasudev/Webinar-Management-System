from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import UserProfile, Recording, Registration, UserNotification
from datetime import datetime, timedelta
from django.utils import timezone


@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
	"""
	Automatically create UserProfile for new users.
	Set role to 'admin' for superusers and staff.
	"""
	profile, profile_created = UserProfile.objects.get_or_create(user=instance)
	
	# Update role for superusers/staff
	if instance.is_superuser or instance.is_staff:
		if profile.role != 'admin':
			profile.role = 'admin'
			profile.save()
	elif not profile_created and profile.role == 'admin' and not instance.is_superuser and not instance.is_staff:
		# Downgrade admin role if user is no longer superuser/staff
		profile.role = 'user'
		profile.save()


@receiver(post_save, sender=Recording)
def create_recording_notifications(sender, instance, created, **kwargs):
	"""Create notifications for users registered for the event when a new recording is added"""
	if created:  # Only for new recordings
		event = instance.event
		registered_users = User.objects.filter(event_registrations__event=event).distinct()
		
		notifications = [
			UserNotification(
				user=user,
				notification_type='new_recording',
				title=f'New Recording Available: {event.title}',
				content=f'A new recording is now available for {event.title}',
				event=event,
				recording=instance,
			)
			for user in registered_users
		]
		if notifications:
			UserNotification.objects.bulk_create(notifications)


@receiver(post_save, sender=Registration)
def create_upcoming_webinar_notification(sender, instance, created, **kwargs):
	"""Create notification for upcoming webinar when user registers"""
	if created:  # Only for new registrations
		event = instance.event
		now = timezone.now()
		event_datetime = datetime.combine(event.date, event.time)
		
		# Make event_datetime timezone-aware
		if timezone.is_naive(event_datetime):
			event_datetime = timezone.make_aware(event_datetime)
		
		# Only create notification if event is in the future
		if event_datetime > now:
			UserNotification.objects.create(
				user=instance.user,
				notification_type='upcoming_webinar',
				title=f'Registered for: {event.title}',
				content=f'You have successfully registered for {event.title} on {event.date} at {event.time}',
				event=event,
			)
