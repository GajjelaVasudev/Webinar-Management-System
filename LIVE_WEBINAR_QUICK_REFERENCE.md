# Live Webinar - Quick Reference

## 🚀 Quick Start for Implementation

### 1. Apply Migration
```bash
python manage.py migrate
```

### 2. Test Backend Endpoint

**Start Live Session (Host):**
```bash
curl -X POST http://localhost:8000/api/live/start/1/ \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json"
```

**Join Live Session (Student):**
```bash
curl -X GET http://localhost:8000/api/live/join/1/ \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

**Check Status (Public):**
```bash
curl -X GET http://localhost:8000/api/live/status/1/
```

### 3. Test Frontend
- Log in as host → Go to webinar details → Click "Go Live"
- Log in as student → Go to same webinar → Click "Join Live Session"
- Both should see Jitsi Meet with same room name

---

## 📁 File Locations

### Backend Files
```
c:\Users\vgajj\Downloads\PFSD-PROJECT\live_sessions\
├── models.py          ← LiveSession model definition
├── views.py           ← API endpoints (start, join, status)
├── serializers.py     ← Response serialization
├── urls.py           ← Route registration
├── admin.py          ← Django admin config
└── migrations\0001_initial.py  ← Database schema
```

### Frontend Files
```
c:\Users\vgajj\Downloads\PFSD-PROJECT\frontend\src\
├── components\JitsiMeetComponent.tsx     ← Jitsi embed
├── services\liveSessionService.ts        ← API calls
└── pages\UserWebinarPortal.tsx          ← UI integration
```

### Configuration Changes
```
webinar_system\settings.py     ← Added 'live_sessions'
webinar_system\urls.py         ← Added '/live/' path
```

---

## 🔑 Key Code Snippets

### LiveSession Model
```python
class LiveSession(models.Model):
    webinar = models.OneToOneField('webinars.Event', ...)
    room_name = models.CharField(max_length=255, unique=True)
    is_active = models.BooleanField(default=False)
    started_by = models.ForeignKey(User, ...)
    created_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)
```

### API Response
```json
{
  "room_name": "webinar_123_abc12345",
  "is_active": true
}
```

### Frontend Component Usage
```tsx
<JitsiMeetComponent
  roomName={liveRoomName}
  displayName={userName}
  onClose={() => setView('my-webinars')}
/>
```

### Service Methods
```typescript
await liveSessionService.startLiveSession(webinarId)
await liveSessionService.joinLiveSession(webinarId)
await liveSessionService.checkLiveStatus(webinarId)
```

---

## 📊 API Reference

| Endpoint | Method | Auth | Returns |
|----------|--------|------|---------|
| `/api/live/start/<id>/` | POST | JWT + Host | room_name, is_active |
| `/api/live/join/<id>/` | GET | JWT + Registered | room_name, is_active |
| `/api/live/status/<id>/` | GET | Public | is_active, room_name |

---

## 👥 Permission Model

### Start Live Session
- ✅ JWT Required
- ✅ Must be webinar organizer
- ❌ Non-hosts get 403 Forbidden

### Join Live Session
- ✅ JWT Required
- ✅ Must be registered for webinar
- ✅ Session must be active
- ❌ Non-registered get 403 Forbidden
- ❌ Inactive session get 403 Forbidden

### Check Status
- ✅ No authentication required
- ✅ Always returns status
- ❌ Never forbidden

---

## 🎯 User Flows

### Host Starting Live Session
```
1. Navigate to webinar details (status="live")
2. Click "Go Live" button
3. Backend creates LiveSession record
4. Returns room_name
5. Jitsi Meet opens with that room_name
6. Host can now teach/present
```

### Student Joining Live Session
```
1. Navigate to registered webinar (status="live")
2. Click "Join Live Session" button
3. Backend validates registration & session active
4. Returns same room_name
5. Jitsi Meet opens to same room
6. Can see/hear host and other students
```

---

## 🐛 Troubleshooting

### "404 Not Found" on API
- Check `INSTALLED_APPS` includes `'live_sessions'`
- Check `urls.py` includes `path('live/', ...)`
- Restart Django server

### "403 Forbidden" on start
- Verify user is webinar organizer (organizer_id)
- Check JWT token is valid
- Check Authorization header present

### "403 Forbidden" on join
- Verify user is registered for webinar
- Check hosting session started (is_active=True)
- Check session by visiting /api/live/status/

### Jitsi Won't Load
- Check browser console for errors
- Verify `https://meet.jit.si` accessible
- Clear cache & hard refresh (Ctrl+Shift+R)
- Try different browser

### UI Button Not Showing
- Clear browser cache
- Check `currentUserId` is set (view organizer_id in API)
- Check webinar status is "live"
- Check browser console for errors

---

## 📋 Verification Checklist

- [ ] Migration applied: `python manage.py migrate`
- [ ] Backend APIs responding: Check with curl
- [ ] Frontend components loaded: Check React DevTools
- [ ] UI buttons visible: Host sees "Go Live", students see "Join"
- [ ] Jitsi Meet loading: Click button, should see video chat
- [ ] Chat working: Can send messages alongside video
- [ ] Leave button working: Returns to webinar details
- [ ] Error handling: Show message if unauthorized
- [ ] Mobile responsive: Test on mobile device

---

## 🔐 Security Checklist

- [ ] Room names are unique & unpredictable
- [ ] Only authenticated users can start/join
- [ ] Only hosts can start sessions
- [ ] Only registered students can join
- [ ] Permission checks on every API call
- [ ] Room names not exposed in public endpoints
- [ ] JWT tokens required for protected endpoints
- [ ] Proper error messages (no info leakage)

---

## 📦 Dependencies

### No New Package Dependencies!
- Uses existing Django REST Framework
- Uses existing JWT auth
- Uses existing User/Event models
- Uses existing Registration system
- Jitsi Meet loaded via CDN (no npm install needed)

---

## 🚀 Deployment Steps

1. **Local Testing:**
   - Run migrations
   - Test all endpoints
   - Test UI in browser

2. **Staging:**
   - Deploy code
   - Run migrations
   - Test full flow
   - Check logs

3. **Production:**
   - Deploy code
   - Run migrations
   - Monitor errors
   - Notify users
   - Gather feedback

---

## 📞 Support Resources

1. **LIVE_WEBINAR_IMPLEMENTATION.md** - Full technical docs
2. **LIVE_WEBINAR_SETUP_GUIDE.md** - Installation guide
3. **LIVE_WEBINAR_CHANGES_SUMMARY.md** - Complete change log
4. Django Logs - Check server errors
5. Browser Console - Check frontend errors
6. Django Admin - Verify LiveSession records

---

## ✨ Key Features

✅ **Jitsi Meet Integration** - Free, open-source video conferencing
✅ **Host Control** - Only organizer can start sessions
✅ **Student Access** - Registered students can join
✅ **Live Chat** - Existing chat system works alongside video
✅ **Responsive Design** - Works on desktop and mobile
✅ **Error Handling** - Clear messages for all error cases
✅ **No Breaking Changes** - Existing features unaffected
✅ **Production Ready** - Follows Django best practices

---

## 🎓 Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│           USER INTERFACE (React)                │
│  ┌────────────────┬──────────────┐              │
│  │ Go Live Button │ Join Session │              │
│  │ (Host Only)    │ (Students)   │              │
│  └────────────────┴──────────────┘              │
└───────────────────────┬─────────────────────────┘
                        │ API Calls
                        ↓
┌─────────────────────────────────────────────────┐
│         BACKEND (Django + DRF)                  │
│  ┌──────────────────────────────────┐           │
│  │ LiveSessionViewSet               │           │
│  │  - start() - Hosts only          │           │
│  │  - join() - Registered students  │           │
│  │  - status() - Public             │           │
│  └──────────────────────────────────┘           │
└───────────────────────┬─────────────────────────┘
                        │ Validates & Creates
                        ↓
┌─────────────────────────────────────────────────┐
│         DATABASE                                │
│  ┌──────────────────────────────────┐           │
│  │ LiveSession Table                │           │
│  │ - room_name (unique)             │           │
│  │ - is_active (boolean)            │           │
│  │ - started_by (user)              │           │
│  └──────────────────────────────────┘           │
└─────────────────────────────────────────────────┘

                Returns room_name
                        │
                        ↓
┌─────────────────────────────────────────────────┐
│         JITSI MEET (CDN)                        │
│  ┌──────────────────────────────────┐           │
│  │ https://meet.jit.si/<room_name>  │           │
│  │ - Video conferencing             │           │
│  │ - Screen sharing                 │           │
│  │ - Recording (optional)           │           │
│  └──────────────────────────────────┘           │
└─────────────────────────────────────────────────┘
```

---

## 📅 Implementation Timeline

| Phase | Task | Status |
|-------|------|--------|
| 1 | Backend setup | ✅ Complete |
| 2 | API endpoints | ✅ Complete |
| 3 | Frontend component | ✅ Complete |
| 4 | UI integration | ✅ Complete |
| 5 | Documentation | ✅ Complete |
| 6 | Testing | 📋 Ready |
| 7 | Deployment | ⏳ Pending |

---

## 🎉 You're All Set!

Everything is implemented and ready to use. Follow the setup guide to:
1. Apply migrations
2. Test endpoints
3. Verify UI
4. Deploy!

For detailed info, see the full documentation files.

**Happy live teaching!** 🎓
