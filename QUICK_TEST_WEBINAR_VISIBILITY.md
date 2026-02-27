# Quick Test Guide - Webinar Visibility Fix

## What Was Fixed

Your webinars weren't visible in the admin dashboard because:
1. Backend returned ALL webinars (no organizer filtering)
2. No debug info to verify data flow
3. Missing "Go Live" button in admin dashboard

## Quick Verification (5 minutes)

### Step 1: Open Browser Console
```
Press F12 → Click "Console" tab
```

### Step 2: Login as Admin
- Go to http://localhost:3000/auth
- Login with: `admin / admin123`

### Step 3: Go to Admin Dashboard
- Click Admin in the navigation
- OR go to http://localhost:3000/admin

### Step 4: Check Console for Webinar Data
You should see:
```
=== AdminDashboard fetchDashboardData ===
Current user: {id: 1, username: 'admin', email: 'admin@example.com'}
Current user ID: 1
Is authenticated: true
Webinars API Response: [{...}, {...}]
Total webinars fetched: X
Webinar 0: {id: 1, title: 'Your Webinar Title', organizer: 1, ...}
```

### Step 5: Check Dashboard
- Look at "All Webinars" section
- Scroll right to see all webinars
- You should see webinars you created

### Step 6: Test "Go Live"
- Click "Go Live" button on any webinar card
- Should see:
  - Button changes to "Starting..."
  - Green success notification: "Live session started: [Title]"
  - Console log: `Starting live session for webinar [ID]: [Title]`

## What to Do If It Doesn't Work

### No Webinars Showing?

1. **Check Django Admin First**
   - Go to http://localhost:8000/admin
   - Click "Webinars"
   - Make sure webinars exist AND are assigned to your user as "Organizer"

2. **Check Console Logs**
   - Look for: `Total webinars fetched: 0`
   - This means backend returned empty
   - Check Network tab (F12 → Network) → find `/api/webinars/` request
   - Click it → "Preview" tab → see what response contains

3. **Check Backend Logs**
   - Look at Django console/terminal
   - Should show:
   ```
   DEBUG: EventViewSet.get_queryset() called
   DEBUG: User: admin
   DEBUG: User authenticated: True
   DEBUG: Filtering to user [ID]'s webinars only
   DEBUG: Returning X webinars
   ```

### "Go Live" Button Not Working?

1. **Check Console for Errors**
   - F12 → Console tab
   - Look for red error messages
   - Should see: `Starting live session for webinar [ID]: [Title]`

2. **Verify Toast Notification Appears**
   - Top right of dashboard
   - Should see green notification with webinar title

3. **Check State Updates**
   - In console, check if these logs appear:
     - `Starting live session for webinar...`
     - `Live room name: webinar-[ID]-[title-slug]`

## Files That Were Changed

✅ **Backend:**
- `webinars/views.py` - Added debug logging + `my_only` parameter filtering

✅ **Frontend:**
- `frontend/src/pages/AdminDashboard.tsx` - Added:
  - Console logging
  - `my_only=true` API parameter
  - Live session state
  - "Go Live" button handler
  - "Go Live" button in webinar cards

## Testing Checklist

- [ ] Admin can login without errors
- [ ] Console shows webinar data when dashboard loads
- [ ] Webinars appear in "All Webinars" section
- [ ] "Go Live" button is visible on each webinar
- [ ] "Go Live" button is clickable
- [ ] Clicking "Go Live" shows success notification
- [ ] Console shows "Starting live session..." log
- [ ] Webinars are correctly filtered by organizer

## API Endpoint Changes

**Before:**
```
GET /api/webinars/
```

**After (used by admin dashboard):**
```
GET /api/webinars/?my_only=true
```

Backend now filters webinars to show only those created by the logged-in user.

## Console Output Reference

### Success Case:
```javascript
=== AdminDashboard fetchDashboardData ===
Current user: {id: 1, username: "admin", email: "admin@example.com"}
Current user ID: 1
Is authenticated: true
Webinars API Response: Array(3)
  0: {id: 1, title: "Advanced React Patterns", date: "2026-03-15", ...}
  1: {id: 2, title: "Python Best Practices", date: "2026-03-20", ...}
  2: {id: 3, title: "Web Design Workshop", date: "2026-03-25", ...}
Parsed webinars data: Array(3) [ {...}, {...}, {...} ]
Total webinars fetched: 3
First webinar: {id: 1, title: "Advanced React Patterns", ...}
Webinar 0: {id: 1, title: "Advanced React Patterns", organizer: 1, organizer_name: "admin"}
Webinar 1: {id: 2, title: "Python Best Practices", organizer: 1, organizer_name: "admin"}
Webinar 2: {id: 3, title: "Web Design Workshop", organizer: 1, organizer_name: "admin"}
```

### After Clicking "Go Live":
```javascript
Starting live session for webinar 1: Advanced React Patterns
Live room name: webinar-1-advanced-react-patterns
```

## Backend Console Output Reference

When you load the dashboard, Django logs should show:
```
DEBUG: EventViewSet.get_queryset() called
DEBUG: User: admin
DEBUG: User authenticated: True
DEBUG: User role: admin
DEBUG: Filtering to user 1's webinars only
DEBUG: Returning 3 webinars
```

## Support

If webinars still aren't showing:
1. Copy full console output (Ctrl+A in console → Ctrl+C)
2. Copy from "Network" tab what `/api/webinars/` returns
3. Check if webinar exists in Django admin with your user as organizer
4. Check Django backend logs for the DEBUG messages above
