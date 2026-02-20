# Frontend API Path Fix Summary

## Issue Resolved ✅

The frontend authentication and other API requests were returning 404 errors due to incorrect API path construction after the backend refactoring. The paths didn't match the new modular app structure.

## Root Cause

After refactoring the monolithic `events` app into 5 modular apps, the backend URL structure changed:

**Old Structure (Monolithic):**
- `/api/auth/login/`
- `/api/users/profile/me/`
- `/api/notifications/recent/`
- `/api/announcements/`

**New Structure (Modular):**
- `/api/accounts/auth/login/`
- `/api/accounts/users/me/`
- `/api/communications/notifications/recent/`
- `/api/communications/announcements/`

The frontend was still using the old paths, causing all requests to fail with 404 errors.

## Files Modified

### 1. [frontend/src/services/auth.ts](frontend/src/services/auth.ts)
**Fixed authentication and user endpoints:**

| Old Path | New Path | Purpose |
|----------|----------|---------|
| `/auth/login/` | `/accounts/auth/login/` | User login |
| `/auth/register/` | `/accounts/auth/register/` | User registration |
| `/users/profile/me/` | `/accounts/users/me/` | Get user profile |

### 2. [frontend/src/pages/UserWebinarPortal.tsx](frontend/src/pages/UserWebinarPortal.tsx)
**Fixed 15+ API endpoints:**

#### Authentication & User APIs
| Old Path | New Path | Purpose |
|----------|----------|---------|
| `/users/profile/me/` | `/accounts/users/me/` | Get current user |
| `http://localhost:8000/api/users/profile/me/` | Uses `apiClient` with `/accounts/users/me/` | Profile fetch/update |
| `http://localhost:8000/api/auth/change-password/` | Uses `apiClient` with `/accounts/auth/change-password/` | Change password |

#### Registration APIs
| Old Path | New Path | Purpose |
|----------|----------|---------|
| `/webinars/{id}/register/` | `/registrations/register/` with `{event: id}` body | Register for webinar |

#### Notification APIs
| Old Path | New Path | Purpose |
|----------|----------|---------|
| `/notifications/recent/` | `/communications/notifications/recent/` | Get recent notifications |
| `/notifications/unread_count/` | `/communications/notifications/unread_count/` | Get unread count |
| `/notifications/{id}/mark_as_read/` | `/communications/notifications/{id}/mark_read/` | Mark as read |
| `/notifications/mark_all_as_read/` | `/communications/notifications/mark_all_read/` | Mark all as read |

#### Chat APIs
| Old Path | New Path | Purpose |
|----------|----------|---------|
| `http://localhost:8000/api/chat/messages/?event_id={id}` | Uses `apiClient` with `/communications/chat/?event={id}` | Fetch chat messages |
| `http://localhost:8000/api/chat/messages/` | Uses `apiClient` with `/communications/chat/` | Send chat message |

**Also fixed:** Replaced hardcoded fetch URLs with `apiClient` for consistent authentication handling.

### 3. [frontend/src/pages/AdminDashboard.tsx](frontend/src/pages/AdminDashboard.tsx)
**Fixed admin panel API endpoints:**

#### Dashboard Data APIs
| Old Path | New Path | Purpose |
|----------|----------|---------|
| `/users/admin/` | `/accounts/users/` | List all users (admin) |
| `/stats/dashboard/` | Removed (not implemented) | Dashboard stats |

#### Announcement APIs
| Old Path | New Path | Purpose |
|----------|----------|---------|
| `/announcements/` | `/communications/announcements/` | List announcements |
| `/announcements/send_to_all/` | `/communications/announcements/` (POST) | Create announcement |
| `/announcements/{id}/` | `/communications/announcements/{id}/` | Delete announcement |

#### Notification APIs
| Old Path | New Path | Purpose |
|----------|----------|---------|
| `/notifications/recent/` | `/communications/notifications/recent/` | Get recent notifications |
| `/notifications/unread_count/` | `/communications/notifications/unread_count/` | Get unread count |
| `/notifications/{id}/mark_as_read/` | `/communications/notifications/{id}/mark_read/` | Mark notification read |
| `/notifications/mark_all_as_read/` | `/communications/notifications/mark_all_read/` | Mark all read |

## Backend URL Structure Reference

### Complete API Endpoint Map

**Base URL:** `http://localhost:8000/api/`

#### Accounts App (`/api/accounts/`)
```
POST   /accounts/auth/login/           - Login
POST   /accounts/auth/register/        - Register
POST   /accounts/auth/refresh/         - Refresh token
POST   /accounts/auth/change-password/ - Change password
GET    /accounts/users/                - List users (admin only)
GET    /accounts/users/me/             - Current user details
PATCH  /accounts/users/me/             - Update current user
GET    /accounts/profiles/             - List profiles
```

#### Webinars App (`/api/webinars/`)
```
GET    /webinars/                - List all webinars
POST   /webinars/                - Create webinar (admin)
GET    /webinars/{id}/           - Webinar details
PUT    /webinars/{id}/           - Update webinar (admin)
DELETE /webinars/{id}/           - Delete webinar (admin)
GET    /webinars/upcoming/       - Upcoming webinars
GET    /webinars/live/           - Live webinars
GET    /webinars/completed/      - Completed webinars
```

#### Registrations App (`/api/registrations/`)
```
GET    /registrations/                    - List registrations
POST   /registrations/register/           - Register for webinar
GET    /registrations/my_registrations/   - User's registrations
DELETE /registrations/{id}/unregister/    - Unregister
```

#### Recordings App (`/api/recordings/`)
```
GET    /recordings/         - List recordings
POST   /recordings/         - Upload recording (admin)
GET    /recordings/{id}/    - Recording details
DELETE /recordings/{id}/    - Delete recording (admin)
GET    /recordings/public/  - Public recordings only
```

#### Communications App (`/api/communications/`)
```
# Announcements
GET    /communications/announcements/         - List announcements
POST   /communications/announcements/         - Create (admin)
DELETE /communications/announcements/{id}/    - Delete (admin)

# Notifications
GET    /communications/notifications/              - List notifications
GET    /communications/notifications/recent/       - Recent (limit 10)
GET    /communications/notifications/unread/       - Unread only
GET    /communications/notifications/unread_count/ - Count unread
POST   /communications/notifications/{id}/mark_read/  - Mark as read
POST   /communications/notifications/mark_all_read/   - Mark all read

# Chat
GET    /communications/chat/            - List chat messages
POST   /communications/chat/            - Send message
GET    /communications/chat/?event={id} - Messages for event
```

## Key Improvements

### 1. Consistent Authentication
All hardcoded `fetch` calls with manual Bearer token headers were replaced with `apiClient`, which:
- ✅ Automatically adds authentication headers
- ✅ Handles token refresh
- ✅ Provides consistent error handling
- ✅ Logs all requests/responses

### 2. No Duplicate Prefixes
The base URL in `api.ts` is set to `http://localhost:8000/api`, so endpoint paths should NOT include `/api/`:
```typescript
// ❌ Wrong - creates /api/api/accounts/...
apiClient.get('/api/accounts/auth/login/')

// ✅ Correct - creates /api/accounts/...
apiClient.get('/accounts/auth/login/')
```

### 3. Modular App Prefixes
All endpoints now include the app name prefix:
- `accounts/` - User management
- `webinars/` - Event management
- `registrations/` - Registration handling
- `recordings/` - Recording management
- `communications/` - Notifications, announcements, chat

## Testing the Fix

### 1. Start Backend
```bash
python manage.py runserver
```
Backend will run on: `http://localhost:8000`

### 2. Start Frontend
```bash
cd frontend
npm run dev
```
Frontend will run on: `http://localhost:5173`

### 3. Test Authentication
1. Navigate to `http://localhost:5173`
2. Try to login (create superuser first if needed: `python manage.py createsuperuser`)
3. Should successfully authenticate without 404 errors

### 4. Verify API Calls
Open browser DevTools (F12) → Network tab:
- ✅ All requests should go to `/api/accounts/...`, `/api/webinars/...`, etc.
- ✅ Should return 200 OK (or 401 if not authenticated)
- ❌ No more 404 errors on authentication

## Environment Variables

The frontend API base URL can be configured via environment variable:

**Create `frontend/.env`:**
```env
VITE_API_BASE_URL=http://localhost:8000
```

The `/api` suffix is automatically added in `api.ts`.

## Summary of Changes

**Files Modified:** 3
- `frontend/src/services/auth.ts` - 4 endpoints fixed
- `frontend/src/pages/UserWebinarPortal.tsx` - 15+ endpoints fixed
- `frontend/src/pages/AdminDashboard.tsx` - 10+ endpoints fixed

**Total Endpoints Fixed:** 30+

**Key Changes:**
1. ✅ Added `/accounts/` prefix to auth and user endpoints
2. ✅ Added `/communications/` prefix to notification, announcement, and chat endpoints
3. ✅ Changed registration from webinar action to dedicated endpoint
4. ✅ Replaced hardcoded fetch URLs with apiClient
5. ✅ Fixed action names (`mark_as_read` → `mark_read`)
6. ✅ Fixed query parameter names (`event_id` → `event`)

---

**Status:** ✅ ALL API PATHS FIXED  
**Date:** February 19, 2026  
**Backend:** Running on http://localhost:8000  
**Frontend:** Ready to run on http://localhost:5173

The frontend now correctly aligns with the refactored backend URL structure! 🚀
