from django.conf import settings
from django.db import models


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
        app_label = 'communications'
        verbose_name = 'Announcement'
        verbose_name_plural = 'Announcements'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
        ]

    def __str__(self) -> str:
        return f"{self.title} by {self.sender.username}"


class UserNotification(models.Model):
    """Tracks notifications for users"""
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
        'webinars.Event',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="notifications",
    )
    recording = models.ForeignKey(
        'recordings.Recording',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="notifications",
    )
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'communications'
        verbose_name = 'User Notification'
        verbose_name_plural = 'User Notifications'
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(
                fields=["user", "announcement"],
                condition=models.Q(notification_type='announcement'),
                name="unique_announcement_per_user",
            )
        ]
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['user', 'is_read']),
        ]

    def __str__(self) -> str:
        return f"{self.title} for {self.user.username}"


class WebinarChatMessage(models.Model):
    """Chat messages for live webinar sessions"""
    event = models.ForeignKey(
        'webinars.Event',
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
        app_label = 'communications'
        verbose_name = 'Webinar Chat Message'
        verbose_name_plural = 'Webinar Chat Messages'
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['event', 'created_at']),
        ]

    def __str__(self) -> str:
        return f"{self.user.username} in {self.event.title}: {self.message[:50]}"
