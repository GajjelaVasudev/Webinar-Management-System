"""
Signals for the communications app.
Automatically create notifications when announcements are posted.
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import Announcement
from .services import notify_new_announcement


@receiver(post_save, sender=Announcement)
def create_announcement_notifications(sender, instance, created, **kwargs):
    """
    Create notifications for all users when a new announcement is created.
    Uses the central notification service for consistency.
    """
    if created:
        # Get all users except the sender
        target_users = User.objects.exclude(id=instance.sender.id)
        notify_new_announcement(instance, target_users)
