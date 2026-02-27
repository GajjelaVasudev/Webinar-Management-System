# Live Webinar Integration - Implementation Guide

## Overview

This document describes the Live Webinar functionality added to the PFSD project using **Jitsi Meet** for video conferencing.

## Backend Implementation

### New Django App: `live_sessions`

A new app has been created at `/live_sessions/` with the following structure:

#### Models (`models.py`)

**LiveSession Model:**
- `webinar` (OneToOneField to Event) - Links to the webinar
- `room_name` (CharField, unique) - Auto-generated Jitsi Meet room name
- `is_active` (BooleanField) - Whether the session is currently active
- `started_by` (ForeignKey to User) - Who started the session
- `created_at` (DateTimeField) - When the session was created
- `started_at` (DateTimeField) - When the session was activated

**Room Name Format:** `webinar_<webinar_id>_<random_uuid_string>`

#### API Endpoints

All endpoints are registered under `/api/live/`:

##### 1. Start Live Session (Host Only)
```
POST /api/live/start/<webinar_id>/
```
- **Permission:** Only webinar organizer
- **Response:** Returns `{ room_name, is_active }`
- **Status Codes:**
  - 200 OK - Session created/started successfully
  - 403 Forbidden - User is not the webinar host
  - 404 Not Found - Webinar doesn't exist

##### 2. Join Live Session (Registered Students)
```
GET /api/live/join/<webinar_id>/
```
- **Permission:** Authenticated + Registered for the webinar
- **Response:** Returns `{ room_name, is_active }`
- **Status Codes:**
  - 200 OK - Successfully joined
  - 403 Forbidden - Not registered or session not active
  - 404 Not Found - Webinar or session doesn't exist

##### 3. Check Live Status (Public)
```
GET /api/live/status/<webinar_id>/
```
- **Permission:** Public (no authentication required)
- **Response:** Returns `{ is_active, room_name }` or `{ is_active: false, room_name: null }`
- **Status Codes:**
  - 200 OK - Status retrieved

#### Serializers (`serializers.py`)

- `LiveSessionSerializer` - Full session data
- `LiveSessionStartSerializer` - For start/join responses
- `LiveSessionStatusSerializer` - For status checks

#### Views (`views.py`)

`LiveSessionViewSet` - Handles all live session operations with proper permission checks and error handling.

### Configuration Changes

**settings.py:**
- Added `'live_sessions'` to `INSTALLED_APPS`

**urls.py:**
- Added `path('live/', include('live_sessions.urls'))` to API patterns

### Database Migration

Run the following to apply changes:
```bash
python manage.py migrate
```

The migration file `0001_initial.py` creates the LiveSession table with proper indexes.

---

## Frontend Implementation

### New Service: `liveSessionService.ts`

Located at `/frontend/src/services/liveSessionService.ts`

```typescript
// Start a live session (host only)
liveSessionService.startLiveSession(webinarId)

// Join a live session (registered students)
liveSessionService.joinLiveSession(webinarId)

// Check if session is active
liveSessionService.checkLiveStatus(webinarId)
```

### New Component: `JitsiMeetComponent.tsx`

Located at `/frontend/src/components/JitsiMeetComponent.tsx`

**Props:**
- `roomName` (string) - The Jitsi Meet room name
- `displayName?` (string) - User's display name in the meeting
- `onClose` (function) - Callback when user closes the meeting

**Features:**
- Loads Jitsi Meet external API dynamically
- Full toolbar with all meeting controls
- Mobile-responsive
- No join screen, direct entry
- Audio/video enabled by default

**Usage:**
```tsx
<JitsiMeetComponent
  roomName="webinar_123_abc123"
  displayName={userName}
  onClose={() => setView('my-webinars')}
/>
```

### Updated Component: `UserWebinarPortal.tsx`

#### New State Variables
- `liveRoomName` (string | null) - Current Jitsi room name
- `isLoadingLiveSession` (boolean) - Loading state for API calls
- `liveSessionError` (string | null) - Error messages
- `currentUserId` (number | null) - Current logged-in user's ID

#### New Handler Functions

**startLiveSession():**
- Calls backend to start session
- Only available to webinar organizer
- Sets liveRoomName and navigates to live view

**joinLiveSession():**
- Calls backend to join session
- Only available to registered students
- Verifies session is active before allowing join
- Sets liveRoomName and navigates to live view

#### Updated Details Screen

**For Webinar Hosts (organizer_id === currentUserId):**
- Shows **"Go Live"** button with lightning icon
- Button is enabled when webinar status is "live"
- Shows loading state during API call
- Displays error message if start fails

**For Registered Students (not host):**
- Shows **"Join Live Session"** button with play icon
- Button is enabled when webinar status is "live"
- Shows loading state during API call
- Displays error message if join fails

**For Non-Registered Users:**
- Shows info box: "Live Now! Register to join the live session"
- Provides **"Register Now"** button

**For Completed/Upcoming Webinars:**
- Shows appropriate status messages
- Existing behavior maintained

#### Updated Live Session Screen

**Video Embedding:**
- Uses `JitsiMeetComponent` instead of static iframe
- Shows loading spinner while connecting
- Maintains existing chat sidebar
- Clean close button functionality

**Chat Features:**
- Still available alongside Jitsi Meet
- Live message updates
- User avatars and timestamps

---

## User Flow

### For Hosts

1. Navigate to webinar details
2. Click **"Go Live"** button (visible only during "live" status)
3. Backend creates/activates LiveSession
4. Jitsi Meet room loads with their display name
5. Chat panel available on left side (desktop)
6. Click "Leave Session" to exit

### For Students

1. Navigate to registered webinar details
2. See **"Join Live Session"** button during "live" status
3. Click button to request join
4. Backend validates registration
5. If approved and session active, Jitsi Meet loads
6. Chat panel available on left side (desktop)
7. Click "Leave Session" to exit

### For Non-Registered Users

1. Navigate to webinar details during "live" status
2. See info box "Live Now! Register to join the live session"
3. Click "Register Now" to register
4. Once registered, can join live session

---

## Technical Architecture

### API Flow

```
User Action (Go Live/Join)
        ↓
Frontend Handler (handleStartLiveSession/handleJoinLiveSession)
        ↓
API Call to Backend (/api/live/start/ or /api/live/join/)
        ↓
Backend Permission Check
        ↓
Get or Create LiveSession
        ↓
Return room_name & is_active
        ↓
Frontend Sets liveRoomName State
        ↓
View Changes to "live"
        ↓
LiveSessionScreen Renders JitsiMeetComponent
        ↓
Jitsi Meet Loads via External API
```

### Room Name Generation

```python
def generate_room_name(self):
    random_str = str(uuid.uuid4())[:8]
    return f"webinar_{self.webinar.id}_{random_str}"
```

### Jitsi Meet Integration

- **URL:** `https://meet.jit.si/` + room_name
- **External API:** Loaded dynamically via script tag
- **Configuration:**
  - Direct entry (no prejoin screen)
  - Full toolbar enabled
  - Audio/video enabled by default
  - Mobile-friendly UI
  - Recording/livestreaming support available

---

## Error Handling

### Backend Errors

| Status | Error | Cause | Solution |
|--------|-------|-------|----------|
| 403 | "Only the webinar organizer can start a live session" | Non-host tried to start | Must be the organizer |
| 403 | "You must be registered for this webinar to join" | Non-registered user | Register for webinar first |
| 403 | "Live session is not active" | Trying to join inactive session | Wait for host to start |
| 404 | "Webinar not found" | Invalid webinar ID | Check webinar exists |
| 404 | "Live session not found" | No session created | Host must start session first |

### Frontend Handling

All errors are caught and displayed to users with:
- Clear error message
- Contextual guidance
- Retry capability

---

## Security & Permissions

### Authentication

- All POST requests require JWT authentication
- GET endpoints vary:
  - `/start/` - Authenticated + Is Organizer
  - `/join/` - Authenticated + Is Registered
  - `/status/` - Public (anyone can check)

### Registration Validation

- Uses existing `Registration` model
- Checks `Registration.objects.filter(user=request.user, event=webinar)`
- Hosts can join their own webinars without registration

### Room Name Security

- Random UUID ensures room names are unpredictable
- Cannot brute-force room access
- Jitsi Meet provides additional security layers

---

## Testing Checklist

### Backend Tests

```bash
# 1. Create a webinar
POST /api/webinars/
# Create 2 users: admin (host) and student (registered)

# 2. Register student for webinar
POST /api/registrations/register/
# As student user with event ID

# 3. Test start live session (as host)
POST /api/live/start/<webinar_id>/
# Expected: 200 OK, returns room_name

# 4. Test join live session (as student)
GET /api/live/join/<webinar_id>/
# Expected: 200 OK, returns room_name

# 5. Test join without registration (as different user)
GET /api/live/join/<webinar_id>/
# Expected: 403 Forbidden

# 6. Test status endpoint
GET /api/live/status/<webinar_id>/
# Expected: 200 OK, is_active: true
```

### Frontend Tests

1. **Host User:**
   - [ ] View webinar details
   - [ ] "Go Live" button visible during "live" status
   - [ ] Click button -> Jitsi Meet loads
   - [ ] Display name shown correctly
   - [ ] Can use video/audio controls
   - [ ] Chat works
   - [ ] Leave button works

2. **Registered Student:**
   - [ ] View webinar details
   - [ ] "Join Live Session" button visible during "live" status
   - [ ] Click button -> Jitsi Meet loads
   - [ ] Cannot join if session not active
   - [ ] Error message if not registered

3. **Non-Registered User:**
   - [ ] View webinar details
   - [ ] See "Register to join" message
   - [ ] Cannot see "Join Live Session" button
   - [ ] Can click "Register Now"

---

## Files Modified/Created

### Created Files
- `live_sessions/__init__.py`
- `live_sessions/apps.py`
- `live_sessions/models.py`
- `live_sessions/serializers.py`
- `live_sessions/views.py`
- `live_sessions/urls.py`
- `live_sessions/admin.py`
- `live_sessions/migrations/__init__.py`
- `live_sessions/migrations/0001_initial.py`
- `frontend/src/components/JitsiMeetComponent.tsx`
- `frontend/src/services/liveSessionService.ts`

### Modified Files
- `webinar_system/settings.py` - Added 'live_sessions' to INSTALLED_APPS
- `webinar_system/urls.py` - Added live_sessions API path
- `frontend/src/pages/UserWebinarPortal.tsx` - Added live session UI and handlers

---

## Production Checklist

- [ ] Run migrations: `python manage.py migrate`
- [ ] Test all endpoints with JWT authentication
- [ ] Verify CORS settings allow Jitsi Meet domain
- [ ] Test on mobile devices
- [ ] Review error messages with UX team
- [ ] Load test Jitsi meetings with multiple users
- [ ] Verify chat functionality
- [ ] Test recording features (if enabled)
- [ ] Set up monitoring for API errors
- [ ] Document for users (when/how to use live sessions)

---

## Future Enhancements

- [ ] Room password protection
- [ ] Max participant limits per room
- [ ] Recording storage integration
- [ ] Live stream to YouTube/other platforms
- [ ] Participant attendance tracking
- [ ] Break-out rooms support
- [ ] Advanced permission controls
- [ ] Analytics on session usage

---

## Support & Troubleshooting

### Jitsi Meet Won't Load
- Check browser console for errors
- Verify `https://meet.jit.si` is accessible
- Clear browser cache
- Try incognito/private mode

### Room Name Not Returned
- Check backend logs for API errors
- Verify user authentication
- Confirm user has proper permissions
- Check network requests in browser devtools

### Chat Not Working
- Verify WebSocket connection
- Check notifications API endpoint
- Confirm user is authenticated
- Check for CORS issues

### Permission Denied Errors
- Verify JWT token in Authorization header
- Check user role/registration status
- Confirm webinar exists
- Check session is active

---

## Contact & Help

For issues or questions, refer to:
- Backend logs for API errors
- Browser console for frontend errors
- Network tab for request/response debugging
- Django admin for database verification
