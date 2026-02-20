from django.conf import settings
from django.db import models


class Registration(models.Model):
    """User registration for webinars"""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="event_registrations",
    )
    event = models.ForeignKey(
        'webinars.Event',
        on_delete=models.CASCADE,
        related_name="registrations",
    )
    registered_on = models.DateTimeField(auto_now_add=True)
    attended = models.BooleanField(default=False)

    class Meta:
        app_label = 'registrations'
        verbose_name = 'Registration'
        verbose_name_plural = 'Registrations'
        ordering = ['-registered_on']
        constraints = [
            models.UniqueConstraint(
                fields=["user", "event"],
                name="unique_registration_per_user_event",
            )
        ]
        indexes = [
            models.Index(fields=['user', 'event']),
            models.Index(fields=['registered_on']),
        ]

    def __str__(self) -> str:
        return f"{self.user.username} -> {self.event.title}"
