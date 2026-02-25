# Registration Flow Testing Checklist

## Pre-Test Setup

- [ ] Backend server running: `python manage.py runserver`
- [ ] Frontend dev server running: `cd frontend && npm run dev`
- [ ] Browser open at: http://localhost:5173
- [ ] Logged in with: `student` / `student123`

## Test 1: Registration Button Updates ✅

**Steps:**
1. Browse the webinar list
2. Find an event with button text "Get Ticket Now"
3. Click "Get Ticket Now" button
4. Wait for API call to complete (check browser console for success)

**Expected Results:**
- [ ] Button disappears or changes to "You're Registered"
- [ ] No error message displayed
- [ ] Browser console shows no errors
- [ ] Registration count increases (visible in card if shown)

**If Failed:**
- Check browser console (F12) for error details
- Check Django server logs for API errors
- Verify your JWT token is valid
- Try refreshing the page

---

## Test 2: Event Appears in "My Schedule" ✅

**Steps:**
1. After registering for Test 1, navigate to "My Schedule" or "My Webinars" tab
2. Look for the event you just registered for

**Expected Results:**
- [ ] Newly registered event appears in calendar view
- [ ] Event displays correct date and time
- [ ] Event appears only once (not duplicated)
- [ ] Time slot matches the event's actual start time

**If Failed:**
- Refresh the page (`Ctrl+R`)
- Check browser console for component errors
- Verify API is returning `is_registered: true`
- Check if `dateTimeToISO()` is working (check calendar positioning)

---

## Test 3: Multiple Registrations ✅

**Steps:**
1. Go back to webinar list
2. Register for 2-3 more events
3. Return to "My Schedule"

**Expected Results:**
- [ ] All registered events appear in calendar
- [ ] Events are positioned correctly by time
- [ ] No duplicate entries
- [ ] Calendar shows multiple events if at same time

**If Failed:**
- Check if calendar component handles multiple events
- Verify all events have valid `start_time` in ISO format
- Check if filter logic is working: `events.filter(ev => ev.isRegistered)`

---

## Test 4: Unregistered Events Not in Schedule ✅

**Steps:**
1. Stay in "My Schedule" view
2. Verify unregistered events are NOT shown

**Expected Results:**
- [ ] Only registered events appear in calendar
- [ ] "My Schedule" does NOT show "Get Ticket Now" events
- [ ] All webinars I registered for are visible

**If Failed:**
- Check filter: `events.filter(ev => ev.isRegistered)`
- Verify all events have `isRegistered` property from API
- Check `MyWebinarsScreen()` component logic

---

## Test 5: API Response Verification ✅

**Steps:**
1. Open browser Developer Tools (`F12`)
2. Go to Network tab
3. Reload page
4. Find request to `/api/webinars/`
5. Click to view response

**Expected to See in Response:**
```json
{
  "id": 1,
  "title": "Sample Webinar",
  "is_registered": true,    // ← Must be present
  "start_time": "2024-03-15T14:00:00+00:00",  // ← Must be ISO format
  "end_time": "2024-03-15T15:00:00+00:00",    // ← Must be ISO format
  ...
}
```

**Results:**
- [ ] `is_registered` field present in response
- [ ] `is_registered` is boolean (true/false)
- [ ] `start_time` is ISO 8601 format
- [ ] `end_time` is ISO 8601 format

**If Missing Fields:**
- Check Django serializers were updated
- Restart Django server: `Ctrl+C` then `python manage.py runserver`
- Clear browser cache
- Verify `webinars/serializers.py` has `is_registered` field

---

## Test 6: Button State After Refresh ✅

**Steps:**
1. Register for an event
2. Refresh the page (`Ctrl+R`)
3. Find the event you registered for

**Expected Results:**
- [ ] Button still shows "You're Registered" (not "Get Ticket Now")
- [ ] Registration persists after page reload
- [ ] Event still in "My Schedule" after reload

**If Failed:**
- Check database: is Registration record actually saved?
- Verify JWT token is persisting across refresh
- Check if `mapEvent()` is reading `ev.is_registered` correctly

---

## Test 7: Date/Time Formatting ✅

**Steps:**
1. Look at any event (registered or not)
2. Check the date and time display

**Expected Results:**
- [ ] Date shows as "DD Mon" (e.g., "15 Mar")
- [ ] Time shows as "HH:MM AM/PM" (e.g., "2:00 PM")
- [ ] No "Invalid Date" messages
- [ ] Times are accurate (matching event creation)

**If Showing "Invalid Date":**
- Check DateFormatter has error handling
- Verify `start_time` and `end_time` are ISO format in API
- Check `dateTimeToISO()` fallback is working
- See `frontend/src/pages/UserWebinarPortal.tsx` lines ~155-170

---

## Quick Status Check

Copy this into browser console while on the app:
```javascript
// Check if events have required fields
console.log('Sample event:', events[0]);
console.log('Has isRegistered:', events[0]?.isRegistered !== undefined);
console.log('Has start_time:', events[0]?.startTime !== undefined);
console.log('Registered count:', events.filter(e => e.isRegistered).length);
```

Should output:
```
Sample event: {id: 1, title: "...", isRegistered: true, startTime: "2024-...", ...}
Has isRegistered: true
Has start_time: true
Registered count: 3  ← or however many you registered for
```

---

## Success Criteria ✅

All tests pass if:
- [ ] Registration button updates immediately after clicking
- [ ] Registered events appear in "My Schedule" calendar
- [ ] Calendar shows correct dates/times for registered events
- [ ] Unregistered events don't appear in "My Schedule"
- [ ] API returns `is_registered` field for each event
- [ ] No "Invalid Date" error messages
- [ ] Registration persists after page reload

---

## Emergency Commands

If something goes wrong:

**Reset Backend:**
```bash
python manage.py migrate  # Reset to current migrations
python manage.py generate_demo_data  # Re-create demo data
python manage.py runserver  # Restart
```

**Clear Frontend Cache:**
- Ctrl+Shift+Delete → Clear browsing data → Clear cache
- Or: Ctrl+Shift+R (hard refresh)

**Check Django Logs:**
- Look in terminal running Django server
- Errors will appear there with full stack trace

**Check Frontend Logs:**
- F12 → Console tab
- Look for errors in red
- Check Network tab for API failures

---

## Support

If tests are failing:

1. **Check Django Server** - See any RED errors in terminal?
2. **Check Browser Console** - F12, any errors?
3. **Check Network Tab** - Is `/api/webinars/` call successful (200)?
4. **Verify Serializers** - Check `webinars/serializers.py` has `is_registered`
5. **Restart Both Servers** - Stop (Ctrl+C) both, start again fresh

---

Last Updated: 2024
Backend Fixes: webinars/serializers.py
Frontend Expected: Already handles new fields correctly
