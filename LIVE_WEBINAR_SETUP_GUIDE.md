# Live Webinar Quick Start - Setup & Verification

## Installation Steps

### Step 1: Apply Database Migration

```bash
# Navigate to project root
cd c:\Users\vgajj\Downloads\PFSD-PROJECT

# Activate virtual environment (if not already activated)
.\.venv\Scripts\Activate.ps1

# Run migrations
python manage.py migrate
```

**Expected Output:**
```
Operations to perform:
  Apply all migrations: ...
Running migrations:
  Applying live_sessions.0001_initial... OK
```

### Step 2: Verify Backend Installation

The following files have been created:
```
live_sessions/
├── __init__.py
├── apps.py
├── models.py              # LiveSession model
├── serializers.py         # API serializers
├── views.py              # API endpoints
├── urls.py               # URL routing
├── admin.py              # Django admin
└── migrations/
    ├── __init__.py
    └── 0001_initial.py   # Database migration
```

### Step 3: Verify Frontend Installation

The following files have been created:
```
frontend/src/
├── components/
│   └── JitsiMeetComponent.tsx    # Jitsi Meet embedding
├── services/
│   └── liveSessionService.ts     # API client
└── pages/
    └── UserWebinarPortal.tsx     # Updated with live session UI
```

### Step 4: Check Configuration

**Backend settings have been updated:**

1. **settings.py** - Added to INSTALLED_APPS:
   ```python
   'live_sessions',
   ```

2. **urls.py** - Added to API patterns:
   ```python
   path('live/', include('live_sessions.urls')),
   ```

---

## Quick Verification

### Backend Verification

#### 1. Check Database Tables Created

```bash
python manage.py shell
```

```python
from live_sessions.models import LiveSession
# Should return 0 objects (empty table)
print(LiveSession.objects.all())
```

#### 2. Test API Endpoints

You'll need:
- A webinar (Event) created
- Admin/host user
- Regular user registered for the webinar

**Test Start Live Session:**
```bash
curl -X POST http://localhost:8000/api/live/start/<webinar_id>/ \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json"
```

Expected response:
```json
{
  "room_name": "webinar_123_abc12345",
  "is_active": true
}
```

**Test Join Live Session:**
```bash
curl -X GET http://localhost:8000/api/live/join/<webinar_id>/ \
  -H "Authorization: Bearer <student_token>"
```

Expected response:
```json
{
  "room_name": "webinar_123_abc12345",
  "is_active": true
}
```

**Test Status (Public):**
```bash
curl -X GET http://localhost:8000/api/live/status/<webinar_id>/
```

### Frontend Verification

#### 1. Check Components Load

The components should load without errors in browser console:
- `JitsiMeetComponent` should be imported
- `liveSessionService` should be imported
- No TypeScript errors for live session related code

#### 2. Test UI in Different Scenarios

**Scenario: Host User on Live Webinar**
1. Create webinar with host user as organizer
2. Set webinar status to "live" (by adjusting date/time)
3. Log in as host user
4. Navigate to webinar details
5. **Should see:** "Go Live" button (with lightning icon)
6. Click button
7. **Should see:** Jitsi Meet loading, then room opens

**Scenario: Registered Student on Live Webinar**
1. Same webinar as above
2. Log in as student who is registered
3. Navigate to same webinar details
4. **Should see:** "Join Live Session" button (with play icon, animated)
5. Click button
6. **Should see:** Jitsi Meet loads with their display name

**Scenario: Non-Registered User on Live Webinar**
1. Same webinar
2. Log in as different user (not registered)
3. Navigate to webinar details
4. **Should see:** Info box "Live Now! Register to join"
5. **Should see:** "Register Now" button
6. Should NOT see "Join Live Session" button

**Scenario: Upcoming/Completed Webinar**
1. Create webinar (not yet live or already past)
2. Depending on status, should see appropriate buttons
3. Should NOT see "Go Live" or "Join Live" buttons

---

## Testing the Full Flow

### Complete Test Case

#### Prerequisites:
```bash
# 1. Create a webinar for tomorrow at current time
# Through Django admin or API
POST /api/webinars/
{
  "title": "Live Session Test",
  "description": "Testing live webinar functionality",
  "date": "2026-02-27",  # Tomorrow
  "time": "14:00",
  "duration": 60,
  "price": 0.00
}

# 2. Get webinar ID from response (e.g., id: 1)
# 3. Create/get two users:
#    - User A (admin/host)
#    - User B (regular user)

# 4. Register User B for the webinar
POST /api/registrations/register/
{
  "event": 1
}
```

#### Test Flow:

**Step 1: Simulate Webinar Going Live**
```python
# In Django shell or admin, update webinar time to now
from webinars.models import Event
from django.utils import timezone
e = Event.objects.get(id=1)
# Change date/time to make status "live"
```

**Step 2: Host Starts Live Session**
- Login as User A (host)
- Go to webinar details
- Should see "Go Live" button
- Click "Go Live"
- Jitsi Meet should open with room name

**Step 3: Student Joins**
- Login as User B (in new incognito window)
- Go to same webinar details
- Should see "Join Live Session" button
- Click button
- Should see same Jitsi Meet room name (both in same meeting!)
- Voice/video should work

**Step 4: Verify Other Features**
- [ ] Chat works between host and student
- [ ] Both can see each other's video/audio
- [ ] Leave button works
- [ ] Returns to webinar details after leaving

---

## Troubleshooting

### Issue: "No such table: live_sessions_livesession"

**Solution:** Run migrations
```bash
python manage.py migrate
```

### Issue: "404 Not Found" on API endpoints

**Solution:** Verify URLs are registered
```python
# In webinar_system/urls.py, should have:
path('live/', include('live_sessions.urls')),
```

### Issue: Jitsi Meet won't load in browser

**Solution:**
1. Check browser console for errors
2. Verify `https://meet.jit.si` is accessible
3. Check CORS settings in Django
4. Verify JavaScript is enabled
5. Try different browser

### Issue: "403 Forbidden" when starting live session

**Solution:**
1. Make sure logged-in user is the webinar organizer
2. Verify JWT token is valid
3. Check `Authorization` header is present
4. Verify user is not banned/disabled

### Issue: "403 Forbidden" when joining as student

**Solution:**
1. Verify user is registered for the webinar
2. Verify live session is active (host started it)
3. Verify JWT token is valid
4. Check registration record exists in database

### Issue: UI buttons not showing

**Solution:**
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R)
3. Check browser console for errors
4. Verify webinar status is "live"
5. Verify `currentUserId` is set (check in React DevTools)

---

## Performance Notes

- Jitsi Meet is served from CDN (`https://meet.jit.si`)
- Room names are unique per webinar per session
- No video/audio stored on your server by default
- Chat messages stored in database (existing system)
- Scale: Jitsi Meet can handle many users simultaneously

---

## Security Notes

- Room names are not exposed in APIs (guest users can't list rooms)
- Only JWT-authenticated users can start/join
- Room names use random UUIDs (not guessable)
- Existing registration system enforced
- Check webinar status to prevent joining at wrong time

---

## Admin Dashboard

View live sessions in Django admin:
```
http://localhost:8000/admin/live_sessions/livesession/
```

Shows:
- Webinar title
- Room name
- Whether session is active
- Who started the session
- Creation time
- Session start time

---

## Next Steps After Verification

1. ✅ Migrations applied
2. ✅ Components created and integrated
3. ✅ API endpoints working
4. ✅ UI showing correctly
5. Next: Deploy to production
6. Next: User training/documentation
7. Next: Monitor for errors
8. Next: Gather feedback

---

## Rollback Instructions (If Needed)

If you need to remove the live sessions feature:

```bash
# 1. Delete migration
rm live_sessions/migrations/0001_initial.py

# 2. Reverse migration
python manage.py migrate live_sessions zero

# 3. Delete app
rm -r live_sessions/

# 4. Remove from settings
# Edit webinar_system/settings.py, remove 'live_sessions' from INSTALLED_APPS

# 5. Remove from urls
# Edit webinar_system/urls.py, remove 'live' path

# 6. Remove frontend files
rm frontend/src/components/JitsiMeetComponent.tsx
rm frontend/src/services/liveSessionService.ts

# 7. Revert UserWebinarPortal.tsx changes (use git if available)
git checkout frontend/src/pages/UserWebinarPortal.tsx
```

---

## Support

For detailed documentation, see: `LIVE_WEBINAR_IMPLEMENTATION.md`

For issues, check:
1. Backend logs: Check server console for errors
2. Frontend logs: Browser DevTools → Console tab
3. Network requests: Browser DevTools → Network tab
4. Database: Django admin or `python manage.py shell`
