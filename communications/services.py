"""
Central notification service for the platform.
Provides reusable functions to create notifications from anywhere in the project.
"""
from typing import List, Optional
from django.contrib.auth.models import User
from django.db.models import QuerySet
from .models import UserNotification, Announcement


def create_notification(
    user: User,
    title: str,
    message: str,
    notification_type: str,
    related_webinar=None,
    announcement: Optional[Announcement] = None,
    event=None,
    recording=None,
) -> UserNotification:
    """
    Create a single notification for a user.
    
    Args:
        user: The user to notify
        title: Notification title
        message: Notification message/content
        notification_type: Type from UserNotification.NOTIFICATION_TYPES
        related_webinar: Optional webinar reference (generic)
        announcement: Optional announcement reference
        event: Optional event reference (for backwards compatibility)
        recording: Optional recording reference
    
    Returns:
        Created UserNotification instance
    """
    return UserNotification.objects.create(
        user=user,
        title=title,
        content=message,
        notification_type=notification_type,
        related_webinar=related_webinar,
        announcement=announcement,
        event=event,
        recording=recording,
    )


def create_bulk_notifications(
    users: QuerySet[User] | List[User],
    title: str,
    message: str,
    notification_type: str,
    related_webinar=None,
    announcement: Optional[Announcement] = None,
    event=None,
    recording=None,
) -> int:
    """
    Create notifications for multiple users efficiently using bulk_create.
    
    Args:
        users: QuerySet or list of users to notify
        title: Notification title
        message: Notification message/content
        notification_type: Type from UserNotification.NOTIFICATION_TYPES
        related_webinar: Optional webinar reference (generic)
        announcement: Optional announcement reference
        event: Optional event reference
        recording: Optional recording reference
    
    Returns:
        Number of notifications created
    """
    notifications = [
        UserNotification(
            user=user,
            title=title,
            content=message,
            notification_type=notification_type,
            related_webinar=related_webinar,
            announcement=announcement,
            event=event,
            recording=recording,
        )
        for user in users
    ]
    
    created = UserNotification.objects.bulk_create(notifications, ignore_conflicts=True)
    return len(created)


def notify_live_session_started(webinar, registered_users: QuerySet[User]) -> int:
    """
    Notify all registered users when a live session starts.
    
    Args:
        webinar: The webinar/event instance
        registered_users: QuerySet of users registered for the webinar
    
    Returns:
        Number of notifications created
    """
    return create_bulk_notifications(
        users=registered_users,
        title=f"Live Session Started: {webinar.title}",
        message=f"The live session for '{webinar.title}' has just started. Join now!",
        notification_type='live_started',
        related_webinar=webinar,
        event=webinar,  # For backwards compatibility
    )


def notify_live_session_ended(webinar, participant_users: QuerySet[User]) -> int:
    """
    Notify all participants when a live session ends.
    
    Args:
        webinar: The webinar/event instance
        participant_users: QuerySet of users who participated
    
    Returns:
        Number of notifications created
    """
    return create_bulk_notifications(
        users=participant_users,
        title=f"Live Session Ended: {webinar.title}",
        message=f"The live session for '{webinar.title}' has ended. Recording will be available soon.",
        notification_type='live_ended',
        related_webinar=webinar,
        event=webinar,
    )


def notify_registration_approved(user: User, webinar) -> UserNotification:
    """
    Notify a user when their registration is approved.
    
    Args:
        user: The user whose registration was approved
        webinar: The webinar they registered for
    
    Returns:
        Created UserNotification instance
    """
    return create_notification(
        user=user,
        title="Registration Approved",
        message=f"Your registration for '{webinar.title}' has been approved!",
        notification_type='registration_approved',
        related_webinar=webinar,
        event=webinar,
    )


def notify_new_announcement(announcement: Announcement, target_users: QuerySet[User]) -> int:
    """
    Notify users about a new announcement.
    
    Args:
        announcement: The announcement instance
        target_users: QuerySet of users to notify
    
    Returns:
        Number of notifications created
    """
    return create_bulk_notifications(
        users=target_users,
        title=announcement.title,
        message=announcement.content,
        notification_type='announcement',
        announcement=announcement,
    )


def notify_system_message(users: QuerySet[User] | List[User], title: str, message: str) -> int:
    """
    Send a generic system notification to users.
    
    Args:
        users: QuerySet or list of users to notify
        title: Notification title
        message: Notification message
    
    Returns:
        Number of notifications created
    """
    return create_bulk_notifications(
        users=users,
        title=title,
        message=message,
        notification_type='system',
    )


def notify_new_recording(recording, registered_users: QuerySet[User]) -> int:
    """
    Notify users when a new recording is available.
    
    Args:
        recording: The recording instance
        registered_users: QuerySet of users registered for the webinar
    
    Returns:
        Number of notifications created
    """
    return create_bulk_notifications(
        users=registered_users,
        title="New Recording Available",
        message=f"A new recording is now available: {recording.title}",
        notification_type='new_recording',
        recording=recording,
    )
