# Django Project Refactoring - Migration Guide

## 🎯 Overview

This project has been refactored to follow **clean Django architecture** and **best practices**. The monolithic `events` app has been split into focused, modular apps following the **Single Responsibility Principle**.

---

## 📁 New Project Structure

```
PFSD-PROJECT/
├── webinar_system/          # Main project configuration
│   ├── __init__.py
│   ├── settings.py          # ✅ Updated with new apps
│   ├── urls.py              # ✅ Clean API routing
│   ├── wsgi.py
│   └── asgi.py
│
├── accounts/                 # 🆕 User authentication & profiles
│   ├── models.py            # UserProfile
│   ├── views.py             # Auth views, registration, login
│   ├── serializers.py       # User serializers
│   ├── permissions.py       # IsAdmin permission
│   ├── urls.py              # /api/accounts/
│   └── admin.py
│
├── webinars/                # 🆕 Webinar/Event management
│   ├── models.py            # Event model
│   ├── views.py             # Event CRUD, status management
│   ├── serializers.py       # Event serializers
│   ├── urls.py              # /api/webinars/
│   └── admin.py
│
├── registrations/           # 🆕 User registrations
│   ├── models.py            # Registration model
│   ├── views.py             # Register/unregister endpoints
│   ├── serializers.py       # Registration serializers
│   ├── urls.py              # /api/registrations/
│   └── admin.py
│
├── recordings/              # 🆕 Webinar recordings
│   ├── models.py            # Recording model
│   ├── views.py             # Recording management
│   ├── serializers.py       # Recording serializers
│   ├── urls.py              # /api/recordings/
│   └── admin.py
│
├── communications/          # 🆕 Announcements, notifications, chat
│   ├── models.py            # Announcement, UserNotification, WebinarChatMessage
│   ├── views.py             # Communication endpoints
│   ├── serializers.py       # Communication serializers
│   ├── urls.py              # /api/communications/
│   └── admin.py
│
├── docs/                    # 📚 All documentation (moved from root)
├── tests/                   # 🧪 All test files (moved from root)
├── frontend/                # ⚛️ React frontend (unchanged)
├── media/                   # 📁 Media uploads
├── manage.py
├── requirements.txt
└── db.sqlite3
```

---

## 🔄 Migration Strategy

### ⚠️ IMPORTANT: Database Migration Required

The old `events` app models need to be migrated to the new app structure. Here's the step-by-step process:

### Step 1: Backup Your Database

```powershell
# Backup your current database
Copy-Item db.sqlite3 db.sqlite3.backup
```

### Step 2: Create Migrations for New Apps

```powershell
python manage.py makemigrations accounts
python manage.py makemigrations webinars
python manage.py makemigrations registrations
python manage.py makemigrations recordings
python manage.py makemigrations communications
```

### Step 3: Migration Options

You have **two options** for migration:

#### Option A: Fresh Start (Recommended for Development)

```powershell
# Delete old database
Remove-Item db.sqlite3

# Create new database with clean migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

#### Option B: Data Migration (For Production/Existing Data)

This is more complex and requires writing custom migration scripts. See `DATA_MIGRATION.md` in the docs folder for detailed instructions.

### Step 4: Update Frontend API Endpoints

The API endpoints have changed. Update your frontend code:

**Old endpoints:**
- `/events/` → `/api/webinars/`
- `/register/` → `/api/accounts/auth/register/`
- `/login/` → `/api/accounts/auth/login/`
- `/recordings/` → `/api/recordings/`

**New endpoint structure:**
```
/api/accounts/auth/login/           # Login
/api/accounts/auth/register/        # Register
/api/accounts/auth/refresh/         # Refresh token
/api/accounts/users/me/             # Current user info
/api/webinars/                      # List/create webinars
/api/webinars/{id}/                 # Webinar detail
/api/registrations/                 # User registrations
/api/recordings/                    # Recordings
/api/communications/announcements/  # Announcements
/api/communications/notifications/  # User notifications
/api/communications/chat/           # Webinar chat
```

---

## 🎨 Architecture Improvements

### 1. **Separation of Concerns**
- Each app has a single, well-defined responsibility
- Models are organized by domain
- Clear boundaries between features

### 2. **Modular Design**
- Apps can be developed, tested, and maintained independently
- Easy to add new features without affecting existing code
- Better code reusability

### 3. **Scalability**
- Apps can be split into separate microservices if needed
- Database sharding by app is possible
- Team members can work on different apps without conflicts

### 4. **Maintainability**
- Smaller, focused codebases per app
- Easier to understand and debug
- Better test organization

### 5. **Django Best Practices**
- Follows standard Django project structure
- Uses proper app organization
- Clean URL routing with `/api/` prefix

---

## 📝 Key Changes Summary

### Models Migration
| Old Location | New Location | Model |
|--------------|--------------|-------|
| `events/models.py` | `accounts/models.py` | UserProfile |
| `events/models.py` | `webinars/models.py` | Event |
| `events/models.py` | `registrations/models.py` | Registration |
| `events/models.py` | `recordings/models.py` | Recording |
| `events/models.py` | `communications/models.py` | Announcement, UserNotification, WebinarChatMessage |

### Views Migration
| Old Location | New Location | Views |
|--------------|--------------|-------|
| `events/views.py` | `accounts/views.py` | CustomTokenObtainPairView, RegisterView, UserProfileViewSet, ChangePasswordView |
| `events/views.py` | `webinars/views.py` | EventViewSet |
| `events/views.py` | `registrations/views.py` | RegistrationViewSet |
| `events/views.py` | `recordings/views.py` | RecordingViewSet |
| `events/views.py` | `communications/views.py` | AnnouncementViewSet, UserNotificationViewSet, WebinarChatMessageViewSet |

### URL Routing
- **Old**: Mixed routes at root and `/events/`
- **New**: Clean `/api/` prefix with app-specific namespaces

---

## ✅ Verification Checklist

After migration, verify the following:

- [ ] All new apps are in `INSTALLED_APPS`
- [ ] Migrations are applied successfully
- [ ] Admin interface shows all new apps
- [ ] API endpoints respond correctly
- [ ] Frontend connects to new endpoints
- [ ] User authentication works
- [ ] User can register and login
- [ ] Webinars can be created/listed
- [ ] Registration/unregistration works
- [ ] Recordings are accessible
- [ ] Notifications work
- [ ] Chat messages work

---

## 🧪 Testing the New Structure

```powershell
# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start development server
python manage.py runserver

# In another terminal, start frontend
cd frontend
npm run dev
```

---

## 🔧 Updating Frontend

The frontend needs to update API calls. Example changes needed:

**Before:**
```typescript
const response = await fetch('/events/');
```

**After:**
```typescript
const response = await fetch('/api/webinars/');
```

Update all API calls in:
- `frontend/src/services/`
- `frontend/src/components/`
- `frontend/src/pages/`

---

## 📚 Additional Resources

- `docs/API_REFERENCE.md` - Complete API documentation
- `docs/ARCHITECTURE_DIAGRAMS.md` - Architecture diagrams
- `docs/FRONTEND_SETUP.md` - Frontend configuration
- `docs/DEPLOYMENT_STEP1_COMPLETE.md` - Deployment guide

---

## 🆘 Troubleshooting

### Issue: Import errors
**Solution**: Update imports to reference new app names
```python
# Old
from events.models import Event

# New
from webinars.models import Event
```

### Issue: Migration conflicts
**Solution**: Delete migrations and start fresh (development only)
```powershell
Remove-Item accounts/migrations/0*.py
Remove-Item webinars/migrations/0*.py
# ... repeat for all apps
python manage.py makemigrations
python manage.py migrate
```

### Issue: Frontend 404 errors
**Solution**: Update all API endpoint URLs to include `/api/` prefix

---

## 🎉 Benefits Achieved

✅ **Clean Architecture** - Modular, maintainable codebase  
✅ **Django Best Practices** - Standard project structure  
✅ **Scalability** - Easy to extend and scale  
✅ **Team Collaboration** - Multiple developers can work independently  
✅ **Code Organization** - Clear separation of concerns  
✅ **Professional Structure** - Industry-standard layout  

---

## 📞 Support

If you encounter issues during migration:
1. Check this guide thoroughly
2. Verify all checklist items
3. Check Django logs: `python manage.py runserver --verbosity 3`
4. Review migration files for conflicts

---

**Last Updated:** February 19, 2026  
**Django Version:** 6.0  
**Python Version:** 3.11+
