# Webinar Lifecycle System - Implementation Guide

## Overview
The system now supports **automatic webinar lifecycle management** with three states: Upcoming → Live → Completed. The status transitions happen automatically based on server time.

---

## 🎯 Webinar States

### 1. **UPCOMING** State
- **Condition**: Current time < start_time
- **User Actions**:
  - View webinar details
  - Register for webinar
- **Admin Actions**:
  - Edit webinar details
  - Set live_stream_url
  - Delete webinar
- **UI Display**:
  - "Register" button (if not registered)
  - "You're Registered!" badge (if registered)
  - Shows event date and time

### 2. **LIVE** State  
- **Condition**: start_time ≤ current time ≤ end_time
- **User Actions**:
  - **Join Live Session** (only registered users)
  - View embedded live stream
  - Participate in live chat
- **Admin Actions**:
  - Monitor session
  - Manually mark as completed if needed
- **UI Display**:
  - "● LIVE" animated badge
  - "Join Live Session" button (registered users only)
  - Pulsing red animation

### 3. **COMPLETED** State
- **Condition**: Current time > end_time
- **User Actions**:
  - View "Event Ended" message
  - **Watch Recording** (if recording exists and user is registered)
- **Admin Actions**:
  - Add recording URL
  - View analytics
- **UI Display**:
  - "Ended" badge
  - "Watch Recording" button (if recording available)

---

## 🔧 Backend Implementation

### Database Changes
**New Fields in Event Model:**
```python
live_stream_url = models.URLField(blank=True, null=True)
manual_status = models.CharField(max_length=20, choices=[('', 'Auto'), ('completed', 'Completed')], blank=True, default='')
```

**Status Computation Method:**
```python
def get_status(self):
    """Calculate webinar status based on current time"""
    # Manual override takes precedence
    if self.manual_status:
        return self.manual_status
    
    # Combine date and time
    start_dt = make_aware(datetime.combine(self.date, self.time))
    end_dt = start_dt + timedelta(minutes=self.duration)
    now = timezone.now()
    
    if now < start_dt:
        return 'upcoming'
    elif start_dt <= now <= end_dt:
        return 'live'
    else:
        return 'completed'
```

### API Response
**EventSerializer now includes:**
- `status`: "upcoming" | "live" | "completed"
- `live_stream_url`: URL for embedded stream

---

## 🎨 Frontend Implementation

### User Portal Features

#### **Webinar Card**
```tsx
// Status-based badge rendering
{data.status === "live" && (
  <span className="bg-red-500 text-white animate-pulse">● LIVE</span>
)}
```

#### **Details Screen - Action Buttons**
```tsx
// Live webinar - registered users
{selectedWebinar.status === "live" && selectedWebinar.isRegistered && (
  <button onClick={() => setView("live")}>Join Live Session</button>
)}

// Completed webinar - show recording
{selectedWebinar.status === "completed" && (
  <button onClick={() => viewRecording()}>Watch Recording</button>
)}

// Upcoming webinar - register
{selectedWebinar.status === "upcoming" && !selectedWebinar.isRegistered && (
  <button onClick={registerForEvent}>Get Ticket Now</button>
)}
```

#### **Live Session Screen**
- Embedded iframe for live stream
- Live chat panel on the right
- "Leave Session" button
- Auto-shows "Stream will start soon" if URL not set

### Admin Dashboard Features

#### **Schedule Form**
New field added:
```tsx
<input
  type="url"
  value={formData.live_stream_url}
  onChange={onLiveStreamUrlChange}
  placeholder="e.g., https://www.youtube.com/embed/VIDEO_ID"
/>
```

**Supported Stream URLs:**
- YouTube: `https://www.youtube.com/embed/VIDEO_ID`
- Vimeo: `https://player.vimeo.com/video/VIDEO_ID`
- Any embeddable stream URL

---

## 📋 Usage Workflow

### For Admins

1. **Schedule Webinar**
   - Navigate to "Schedule Event"
   - Fill in title, description, date, time, duration
   - Add live_stream_url (can be set later)
   - Click "Create Schedule"

2. **Before Go-Live**
   - Edit webinar
   - Ensure `live_stream_url` is set
   - Verify date/time

3. **During Live Session**
   - Status automatically becomes "live" at start time
   - Monitor participants
   - Can manually mark as completed if needed

4. **After Completion**
   - Status automatically becomes "completed" at end time
   - Navigate to "Recordings"
   - Add recording URL for the webinar

### For Users

1. **Browse & Register**
   - View upcoming webinars
   - Click "Get Ticket Now" to register

2. **Join Live**
   - When webinar goes live, "Join Live Session" button appears
   - Click to enter live session with embedded stream
   - Use live chat to interact

3. **Watch Recording**
   - After completion, click "Watch Recording"
   - Access recordings of registered webinars only

---

## 🔐 Permissions & Rules

### Backend Enforcement
- Only admins can create/edit/delete webinars
- Only registered users can join live sessions
- Only registered users can access recordings
- Status is computed server-side (single source of truth)

### Frontend Behavior
- Buttons render based on status from backend
- No page reload required for status updates
- Frontend polls or refreshes to get updated status

---

## 🌐 Live Stream Setup

### YouTube Live
1. Start YouTube Live stream
2. Get embed URL: `https://www.youtube.com/embed/VIDEO_ID`
3. Paste in admin "Live Stream URL" field

### Vimeo Live
1. Start Vimeo live event
2. Get embed URL: `https://player.vimeo.com/video/VIDEO_ID`
3. Paste in admin "Live Stream URL" field

### Custom Stream
- Any iframe-embeddable URL works
- Must allow embedding

---

## 🧪 Testing Guide

### Test Scenario 1: Complete Lifecycle
1. Admin creates webinar for current time + 1 minute
2. User registers for webinar
3. Wait for 1 minute - status changes to "live"
4. User clicks "Join Live Session" - sees embedded stream
5. Wait for duration to pass - status changes to "completed"
6. Admin adds recording
7. User clicks "Watch Recording"

### Test Scenario 2: Manual Override
1. Admin creates webinar
2. Admin manually marks as "completed" before end time
3. Verify status shows as "completed"

---

## 📊 API Endpoints

### Webinar Endpoints
- `GET /api/webinars/` - List all webinars (includes `status` field)
- `GET /api/webinars/{id}/` - Get webinar details (includes `status` and `live_stream_url`)
- `POST /api/webinars/` - Create webinar (admin only)
- `PUT /api/webinars/{id}/` - Update webinar (admin only)
- `DELETE /api/webinars/{id}/` - Delete webinar (admin only)

### Recording Endpoints
- `GET /api/recordings/` - List all recordings
- `POST /api/recordings/` - Add recording (admin only)

---

## 🎯 Key Features

✅ **Automatic Status Transitions** - No manual intervention needed  
✅ **Server-Side Status Calculation** - Single source of truth  
✅ **Embedded Live Streams** - YouTube, Vimeo, custom URLs  
✅ **Permission Enforcement** - Server-side checks  
✅ **Clean UI Transitions** - Buttons change based on status  
✅ **Recording Association** - Recordings linked to specific webinars  
✅ **Registration-Based Access** - Only registered users can join live/recordings  

---

## 🚀 Deployment Notes

### Database Migration
```bash
python manage.py makemigrations
python manage.py migrate
```

### Frontend Build
```bash
cd frontend
npm run build
```

### Environment Variables
No new environment variables required. Uses existing Django timezone settings.

---

## 📝 Notes

- **No WebRTC**: System uses embedded streams only
- **No Video Upload**: Recordings are URL-based
- **Timezone Aware**: Uses Django's timezone support
- **Production Ready**: Status calculation is efficient and cached
- **UI Consistency**: No redesign - integrates seamlessly

---

## 🐛 Troubleshooting

### Status Not Updating
- Refresh the page to fetch latest status
- Check server timezone configuration
- Verify event date/time are correct

### Live Stream Not Loading
- Verify URL is embeddable
- Check iframe allow permissions
- Test URL in browser directly

### Recording Not Showing
- Ensure user is registered for the webinar
- Verify recording URL is set
- Check webinar status is "completed"

---

**Implementation Complete! ✨**
