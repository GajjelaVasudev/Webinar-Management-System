from django.conf import settings
from django.db import models
from datetime import datetime, timedelta
from django.utils import timezone


class Event(models.Model):
    """Core webinar/event model"""
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    date = models.DateField()
    time = models.TimeField()
    duration = models.IntegerField(
        default=60,
        help_text="Duration in minutes"
    )
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00,
        help_text="Price in USD. Set to 0 for free."
    )
    thumbnail = models.ImageField(
        upload_to='webinar_thumbnails/',
        blank=True,
        null=True
    )
    live_stream_url = models.URLField(
        blank=True,
        null=True,
        help_text="URL for live stream embed (e.g., YouTube, Vimeo)"
    )
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
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = 'webinars'
        verbose_name = 'Webinar'
        verbose_name_plural = 'Webinars'
        ordering = ['-date', '-time']
        indexes = [
            models.Index(fields=['date', 'time']),
            models.Index(fields=['organizer']),
        ]

    def __str__(self) -> str:
        return self.title

    def get_status(self):
        """Calculate webinar status based on current time"""
        # Manual override takes precedence
        if self.manual_status:
            return self.manual_status
        
        # Combine date and time
        start_dt = timezone.make_aware(datetime.combine(self.date, self.time))
        end_dt = start_dt + timedelta(minutes=self.duration)
        now = timezone.now()
        
        if now < start_dt:
            return 'upcoming'
        elif start_dt <= now <= end_dt:
            return 'live'
        else:
            return 'completed'

    @property
    def is_free(self) -> bool:
        """Check if webinar is free"""
        return self.price == 0

    @property
    def start_datetime(self):
        """Get the webinar start datetime"""
        return timezone.make_aware(datetime.combine(self.date, self.time))
