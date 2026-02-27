from django.conf import settings
from django.db import models
import uuid


class LiveSession(models.Model):
    """Live session for webinars using Jitsi Meet"""
    webinar = models.OneToOneField(
        'webinars.Event',
        on_delete=models.CASCADE,
        related_name='live_session',
    )
    room_name = models.CharField(
        max_length=255,
        unique=True,
        help_text="Jitsi Meet room name"
    )
    start_time = models.DateTimeField(
        auto_now_add=True,
        help_text="When the live session was created"
    )
    end_time = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When the live session ended"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Whether the live session is currently active"
    )
    started_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='started_live_sessions',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When the live session was started"
    )

    class Meta:
        app_label = 'live_sessions'
        verbose_name = 'Live Session'
        verbose_name_plural = 'Live Sessions'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['webinar']),
            models.Index(fields=['is_active']),
        ]

    def __str__(self) -> str:
        return f"Live Session - {self.webinar.title}"

    def generate_room_name(self):
        """Generate a unique room name for Jitsi Meet"""
        # Format: webinar_<webinar_id>_<uuid_random_string>
        random_str = str(uuid.uuid4())[:8]
        return f"webinar_{self.webinar.id}_{random_str}"

    def save(self, *args, **kwargs):
        """Generate room_name if not exists"""
        if not self.room_name:
            self.room_name = self.generate_room_name()
        super().save(*args, **kwargs)


class LiveSessionParticipant(models.Model):
    """Tracks live session attendance"""
    session = models.ForeignKey(
        LiveSession,
        on_delete=models.CASCADE,
        related_name="participants",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
    )
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'live_sessions'
        verbose_name = 'Live Session Participant'
        verbose_name_plural = 'Live Session Participants'
        constraints = [
            models.UniqueConstraint(fields=['session', 'user'], name='unique_session_user')
        ]
        indexes = [
            models.Index(fields=['session', 'user']),
        ]

    def __str__(self) -> str:
        return f"{self.user} in {self.session}"
