from django.conf import settings
from django.db import models


class Recording(models.Model):
    """Recorded webinar sessions"""
    event = models.ForeignKey(
        'webinars.Event',
        on_delete=models.CASCADE,
        related_name="recordings",
    )
    recording_link = models.URLField(help_text="Link to the recording (YouTube, Vimeo, etc.)")
    title = models.CharField(max_length=200, blank=True, help_text="Optional custom title")
    description = models.TextField(blank=True)
    duration_minutes = models.IntegerField(null=True, blank=True, help_text="Recording duration in minutes")
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="uploaded_recordings",
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)
    is_public = models.BooleanField(default=True, help_text="Make recording publicly available")

    class Meta:
        app_label = 'recordings'
        verbose_name = 'Recording'
        verbose_name_plural = 'Recordings'
        ordering = ['-uploaded_at']
        indexes = [
            models.Index(fields=['event']),
            models.Index(fields=['is_public', 'uploaded_at']),
        ]

    def __str__(self) -> str:
        if self.title:
            return f"{self.title} (Event: {self.event.title})"
        return f"Recording for {self.event.title}"

    @property
    def display_title(self):
        """Get the display title (custom or event title)"""
        return self.title if self.title else f"Recording: {self.event.title}"
