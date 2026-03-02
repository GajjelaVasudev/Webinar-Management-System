"""
Email utilities for sending OTP and verification emails

This module handles:
- OTP generation and hashing
- Email sending with proper error handling
- Email verification flow
"""
import random
import string
import logging
import socket
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import User
from .models import EmailVerification

logger = logging.getLogger(__name__)

# Set SMTP timeout to prevent worker crashes (default is infinite)
socket.setdefaulttimeout(10)


def generate_otp(length: int = 6) -> str:
    """
    Generate a random 6-digit OTP
    
    Args:
        length: Length of OTP to generate (default 6)
    
    Returns:
        String containing digits
    """
    return ''.join(random.choices(string.digits, k=length))


def send_otp_email(user: User, otp: str) -> bool:
    """
    Send OTP to user's email address with proper error handling.
    
    Args:
        user: User object
        otp: Plain text OTP code
    
    Returns:
        Boolean indicating success/failure
        
    Raises:
        Exception: If SMTP sending fails (allows caller to handle)
    """
    try:
        subject = "Email Verification Code"
        
        html_message = f"""
        <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; background-color: #f5f5f5; }}
                    .container {{ max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; }}
                    .header {{ background-color: #4CAF50; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }}
                    .content {{ padding: 20px; text-align: center; }}
                    .otp {{ font-size: 36px; font-weight: bold; color: #4CAF50; letter-spacing: 5px; margin: 20px 0; }}
                    .footer {{ color: #666; font-size: 12px; margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px; }}
                    .warning {{ color: #ff9800; font-size: 12px; margin-top: 10px; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Email Verification</h1>
                    </div>
                    <div class="content">
                        <p>Hi {user.username},</p>
                        <p>Thank you for signing up! To complete your registration, please verify your email address using the code below:</p>
                        <div class="otp">{otp}</div>
                        <p>This code will expire in 10 minutes.</p>
                        <p class="warning">⚠️ Never share this code with anyone. Our support team will never ask for this code.</p>
                    </div>
                    <div class="footer">
                        <p>If you didn't request this email, please ignore it.</p>
                        <p>&copy; 2026 Webinar Management System. All rights reserved.</p>
                    </div>
                </div>
            </body>
        </html>
        """
        
        plain_message = f"""
        Hi {user.username},
        
        Thank you for signing up! To complete your registration, please use the verification code below:
        
        {otp}
        
        This code will expire in 10 minutes.
        
        Never share this code with anyone. Our support team will never ask for this code.
        
        If you didn't request this email, please ignore it.
        
        Best regards,
        Webinar Management System Team
        """
        
        logger.info(f"Attempting to send OTP email to {user.email} (user_id={user.id})")
        
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL or settings.EMAIL_HOST_USER,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False,  # Let exceptions propagate
        )
        
        logger.info(f"OTP email successfully sent to {user.email}")
        return True
        
    except Exception as e:
        # Log the full exception details for debugging
        logger.error(
            f"Failed to send OTP email to {user.email}",
            exc_info=True,
            extra={
                'user_id': user.id,
                'email': user.email,
                'error_type': type(e).__name__,
                'error_message': str(e)
            }
        )
        # Re-raise so caller can handle
        raise


def create_or_update_email_verification(user: User) -> tuple:
    """
    Create or update email verification record with new OTP.
    
    Args:
        user: User object
    
    Returns:
        Tuple of (EmailVerification object, plain OTP)
    """
    # Generate new OTP
    otp = generate_otp()
    
    # Hash OTP
    otp_hash = make_password(otp)
    
    logger.info(f"Generated new OTP for user {user.email} (user_id={user.id})")
    
    # Create or update verification record
    verification, created = EmailVerification.objects.get_or_create(user=user)
    verification.otp_hash = otp_hash
    verification.attempts = 0
    verification.resent_at = None
    verification.save()
    
    action = "created" if created else "updated"
    logger.info(f"Email verification record {action} for user {user.email} (user_id={user.id})")
    
    return verification, otp


