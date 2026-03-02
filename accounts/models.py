from django.conf import settings
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.files.base import ContentFile
from django.contrib.auth.hashers import make_password, check_password
from django.utils import timezone
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont
import random
import os


class UserProfile(models.Model):
    """Extended user profile with role information"""
    ROLE_CHOICES = [
        ('admin', 'Administrator'),
        ('student', 'Student'),
    ]
    
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile',
    )
    role = models.CharField(
        max_length=10,
        choices=ROLE_CHOICES,
        default='student',
    )
    profile_picture = models.ImageField(
        upload_to='profile_pictures/',
        null=True,
        blank=True,
        help_text='User profile picture'
    )
    is_email_verified = models.BooleanField(
        default=False,
        help_text='Whether user has verified their email address'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = 'accounts'
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'
        ordering = ['-created_at']

    def __str__(self) -> str:
        return f"{self.user.username} - {self.get_role_display()}"

    @property
    def is_admin(self) -> bool:
        """Check if user has admin role"""
        return self.role == 'admin'
    
    def generate_avatar(self):
        """Generate a default avatar with first letter of username"""
        # Avatar parameters
        size = 200
        background_colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
            '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52A3A3'
        ]
        
        # Pick a random soft color
        bg_color = random.choice(background_colors)
        
        # Create image
        img = Image.new('RGB', (size, size), bg_color)
        draw = ImageDraw.Draw(img)
        
        # Get first letter
        first_letter = self.user.username[0].upper()
        
        # Try to use a nice font
        try:
            font = ImageFont.truetype(
                "/Windows/Fonts/arial.ttf" if os.name == 'nt' else "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
                120
            )
        except (IOError, OSError):
            # Fallback to default font
            font = ImageFont.load_default()
        
        # Calculate text position
        bbox = draw.textbbox((0, 0), first_letter, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        x = (size - text_width) // 2
        y = (size - text_height) // 2 - 10
        
        # Draw text
        draw.text((x, y), first_letter, fill='white', font=font)
        
        # Save to BytesIO
        img_io = BytesIO()
        img.save(img_io, format='PNG')
        img_io.seek(0)
        
        # Save to model
        filename = f'avatar_{self.user.username}.png'
        self.profile_picture.save(filename, ContentFile(img_io.getvalue()), save=False)


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Automatically create UserProfile when User is created"""
    if created:
        # Set role to 'admin' if user is superuser or staff
        role = 'admin' if (instance.is_superuser or instance.is_staff) else 'student'
        profile = UserProfile.objects.create(user=instance, role=role)
        
        # Generate avatar
        profile.generate_avatar()
        profile.save()


class EmailVerification(models.Model):
    """Model to store OTP and verification status for email verification"""
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='email_verification',
    )
    otp_hash = models.CharField(
        max_length=128,
        help_text='Hashed OTP for email verification'
    )
    created_at = models.DateTimeField(
        auto_now=True,
        help_text='Timestamp when OTP was created'
    )
    attempts = models.IntegerField(
        default=0,
        help_text='Number of failed OTP verification attempts'
    )
    resent_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text='Timestamp when OTP was last resent'
    )

    class Meta:
        app_label = 'accounts'
        verbose_name = 'Email Verification'
        verbose_name_plural = 'Email Verifications'

    def __str__(self) -> str:
        return f"Email Verification - {self.user.email}"

    def is_expired(self, timeout_minutes: int = 10) -> bool:
        """Check if OTP is expired (default 10 minutes)"""
        expiration_time = self.created_at + timezone.timedelta(minutes=timeout_minutes)
        return timezone.now() > expiration_time

    def verify_otp(self, otp: str) -> bool:
        """Verify OTP and check if it's correct and not expired"""
        # Check expiration
        if self.is_expired():
            return False
        
        # Check attempts
        if self.attempts >= 5:
            return False
        
        # Check OTP
        return check_password(otp, self.otp_hash)

    def increment_attempts(self) -> None:
        """Increment failed attempt counter"""
        self.attempts += 1
        self.save()

    def reset_attempts(self) -> None:
        """Reset attempt counter"""
        self.attempts = 0
        self.save()

    def can_resend(self, resend_cooldown_seconds: int = 60) -> bool:
        """Check if user can resend OTP (must wait minimum cooldown time)"""
        if self.resent_at is None:
            # Never resent, allow immediately
            return True
        
        time_since_resend = timezone.now() - self.resent_at
        return time_since_resend.total_seconds() >= resend_cooldown_seconds


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """Save the UserProfile when User is saved"""
    if hasattr(instance, 'profile'):
        instance.profile.save()
