# Quick Start: Frontend + Backend

## ✅ All Issues Resolved

Both backend dependencies and frontend API paths have been fixed!

## Start the Application

### Terminal 1: Backend
```bash
python manage.py runserver
```
- **URL:** http://localhost:8000
- **API:** http://localhost:8000/api/
- **Admin:** http://localhost:8000/admin/

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
```
- **URL:** http://localhost:5173

## What Was Fixed

### 1. Backend Dependencies ✅
- Installed all required Python packages
- Fixed router conflicts (DefaultRouter → SimpleRouter)
- Made psycopg2-binary optional (SQLite default)

### 2. Database Migrations ✅
- Cleaned up conflicting migrations
- Created fresh database schema
- All apps migrated successfully

### 3. Frontend API Paths ✅
- Updated 30+ API endpoints
- Aligned with refactored backend structure
- Fixed authentication, notifications, chat, etc.

## API Endpoint Reference

### Authentication
```typescript
POST /api/accounts/auth/login/          // Login
POST /api/accounts/auth/register/       // Register
POST /api/accounts/auth/change-password// Change password
```

### Users
```typescript
GET  /api/accounts/users/me/  // Current user
PATCH /api/accounts/users/me/ // Update profile
```

### Webinars
```typescript
GET  /api/webinars/           // List all
GET  /api/webinars/upcoming/  // Upcoming
GET  /api/webinars/live/      // Live now
```

### Registrations
```typescript
POST /api/registrations/register/        // Register for event
GET  /api/registrations/my_registrations/ // My registrations
```

### Communications
```typescript
GET  /api/communications/notifications/recent/       // Recent
GET  /api/communications/notifications/unread_count/ // Count
POST /api/communications/notifications/{id}/mark_read/ // Mark read
GET  /api/communications/chat/?event={id}            // Chat messages
POST /api/communications/chat/                       // Send message
```

## Test the Setup

### 1. Create Superuser
```bash
python manage.py createsuperuser
```
Follow the prompts to set username/email/password.

### 2. Test Login
1. Open http://localhost:5173
2. Click "Login"
3. Enter superuser credentials
4. Should successfully login without 404 errors

### 3. Check API Calls
Open Browser DevTools (F12) → Network tab:
- All requests should show `/api/accounts/...`, `/api/webinars/...`, etc.
- No more 404 errors on authentication endpoints

## Common Issues

### Backend not starting?
```bash
python manage.py check
```
Should return: "System check identified no issues (0 silenced)"

### Frontend build errors?
```bash
cd frontend
npm install
```
Then try `npm run dev` again.

### CORS errors?
The backend is configured to allow `http://localhost:5173`. Check `webinar_system/settings.py` → `CORS_ALLOWED_ORIGINS`.

## Documentation

- **Complete Fix Details:** [FRONTEND_API_FIX_SUMMARY.md](FRONTEND_API_FIX_SUMMARY.md)
- **Migration Details:** [MIGRATION_CLEANUP_SUMMARY.md](MIGRATION_CLEANUP_SUMMARY.md)
- **Dependency Fix:** [DEPENDENCY_RESOLUTION.md](DEPENDENCY_RESOLUTION.md)
- **Project Overview:** [FINAL_SUMMARY.md](FINAL_SUMMARY.md)

---

**Status:** ✅ READY TO USE  
**Backend:** Running  
**Frontend:** Fixed and ready  
**Date:** February 19, 2026

🚀 **Your full-stack application is now operational!**
