# 🔔 Notification System - Quick Reference

## ⚡ Quick Start

### Create a Single Notification
```python
from communications.services import create_notification

create_notification(
    user=user,
    title="Your Title",
    message="Your message",
    notification_type='system',
    related_webinar=webinar  # Optional
)
```

### Create Bulk Notifications (Efficient)
```python
from communications.services import create_bulk_notifications

create_bulk_notifications(
    users=User.objects.filter(profile__role='student'),
    title="Important Update",
    message="Check out the new features!",
    notification_type='system'
)
```

---

## 📋 Notification Types

| Type | Code | When to Use |
|------|------|-------------|
| Live Started | `live_started` | When live session begins |
| Live Ended | `live_ended` | When live session ends |
| Announcement | `announcement` | Admin announcements |
| Registration Approved | `registration_approved` | Registration status updates |
| System | `system` | General system messages |
| New Recording | `new_recording` | New recordings available |
| Upcoming Webinar | `upcoming_webinar` | Webinar reminders |

---

## 🎯 Common Use Cases

### 1. Notify Users About Event
```python
from communications.services import create_bulk_notifications

users = event.registrations.filter(status='approved').values_list('user', flat=True)
create_bulk_notifications(
    users=User.objects.filter(id__in=users),
    title=f"Starting Soon: {event.title}",
    message="Your event starts in 10 minutes!",
    notification_type='upcoming_webinar',
    related_webinar=event
)
```

### 2. System Maintenance Alert
```python
from communications.services import notify_system_message
from django.contrib.auth.models import User

notify_system_message(
    users=User.objects.filter(is_active=True),
    title="Scheduled Maintenance",
    message="Platform will be down for 30 minutes at 2 AM UTC."
)
```

### 3. Post-Save Signal Notification
```python
from django.db.models.signals import post_save
from django.dispatch import receiver
from communications.services import create_notification

@receiver(post_save, sender=YourModel)
def notify_on_creation(sender, instance, created, **kwargs):
    if created:
        create_notification(
            user=instance.user,
            title="Item Created",
            message=f"Your {instance.name} is ready!",
            notification_type='system'
        )
```

---

## 🔌 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/communications/notifications/` | GET | List notifications |
| `?unread=true` | GET | Filter unread |
| `?page_size=10` | GET | Pagination |
| `/<id>/mark-read/` | POST | Mark as read |
| `/mark-all-read/` | POST | Mark all read |
| `/unread-count/` | GET | Get count |

### Example API Calls (Frontend)
```javascript
// Fetch latest notifications
const { data } = await apiClient.get('/api/communications/notifications/', {
  params: { page_size: 5 }
});

// Mark as read
await apiClient.post(`/api/communications/notifications/${id}/mark-read/`);

// Mark all as read
await apiClient.post('/api/communications/notifications/mark-all-read/');

// Get unread count
const { data } = await apiClient.get('/api/communications/notifications/unread-count/');
console.log(data.count);
```

---

## 🎨 Frontend (Already Implemented)

- ✅ Bell icon with unread badge in navbar
- ✅ Dropdown showing latest 5 notifications
- ✅ Auto-refresh every 30 seconds
- ✅ Click to mark as read
- ✅ Navigate to related webinar
- ✅ Visual indicators for unread

**Location:** 
- User Portal: `frontend/src/pages/UserWebinarPortal.tsx`
- Admin Dashboard: `frontend/src/pages/AdminDashboard.tsx`

---

## 🔐 Security

- ✅ JWT authentication required
- ✅ Users see only their notifications
- ✅ Automatic filtering by `request.user`
- ✅ No cross-user data access

---

## ⚡ Best Practices

### DO ✅
- Use `create_bulk_notifications()` for multiple users
- Provide meaningful titles and messages
- Link notifications to related objects
- Use specific notification types

### DON'T ❌
- Loop through users calling `create_notification()` (use bulk instead)
- Use generic titles like "Notification"
- Forget to handle exceptions
- Create notifications for inactive users

---

## 📊 Model Structure

```python
UserNotification:
    - user (FK)                    # Who receives it
    - title (CharField)            # Notification title
    - content (TextField)          # Message body
    - notification_type            # Type from choices
    - related_webinar (FK)         # Optional webinar link
    - is_read (Boolean)            # Read status
    - created_at (DateTime)        # Timestamp
```

---

## 🔄 Automatic Integrations

### Already Working:
1. **Live Sessions** - Auto-notify on start/end
2. **Announcements** - Auto-notify all users via signal
3. **Admin Panel** - Manage notifications in Django admin

---

## 🧪 Test the System

```bash
python test_notification_system.py
```

This verifies:
- Model structure ✅
- Service functions ✅
- API endpoints ✅
- Admin registration ✅
- Signal connections ✅

---

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Notifications not showing | Check JWT token, verify authentication |
| Count not updating | Wait 30s for auto-refresh or reload page |
| Signal not firing | Check app in INSTALLED_APPS, verify signal import |
| API error 401 | Token expired, re-login |
| API error 403 | User not authorized |

---

## 📦 All Service Functions

```python
from communications.services import (
    create_notification,              # Single notification
    create_bulk_notifications,        # Bulk (efficient)
    notify_live_session_started,      # Live started
    notify_live_session_ended,        # Live ended
    notify_registration_approved,     # Registration approved
    notify_new_announcement,          # New announcement
    notify_system_message,            # Generic system msg
    notify_new_recording,             # New recording
)
```

---

## ✅ Summary

**Everything is already implemented!** Just import and use:

```python
from communications.services import create_notification

# That's it! Start creating notifications.
```

**Full documentation:** See `NOTIFICATION_SYSTEM_GUIDE.md`

---

🎉 **System Status: PRODUCTION READY**
