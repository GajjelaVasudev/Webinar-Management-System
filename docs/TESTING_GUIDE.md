# 🧪 MANUAL TESTING GUIDE - Registration System

## Quick Start Testing

### Prerequisites
- Django backend running on `http://localhost:8000`
- Frontend running on `http://localhost:5173`
- Database has at least one event

### Test Account
Use any existing account or create a new one:
- Username: `testuser`
- Password: `testpass123`

---

## Test Scenario 1: Complete Registration Flow

### Step 1: Login
1. Go to `http://localhost:5173`
2. Click "Login" button
3. Enter your credentials
4. Click "Sign In"
5. **Expected**: Redirected to webinar listing page

### Step 2: View Events
1. On the webinar listing page
2. Scroll through the events
3. **Expected**: 
   - See list of webinars
   - Each shows title, date, time, price
   - See "Get Ticket Now" button for each event

### Step 3: Register for Event
1. Click "Get Ticket Now" button on any event
2. **Expected**: 
   - Modal/popup appears
   - Shows "Successfully registered!"
   - Displays your email address
   - Close button or success screen

### Step 4: Verify Registration Button Changed
1. Close the confirmation modal
2. Look at the event you just registered for
3. **Expected**: 
   - Button now says "You're Registered!" (or similar)
   - Event card shows you're registered (badge/highlight)
   - Attendee count increased by 1

### Step 5: Check My Schedule
1. Click "My Schedule" or similar navigation tab
2. **Expected**: 
   - See the event you just registered for
   - It appears in a separate "Registered Events" section
   - Shows same event details (title, date, time, duration)

### Step 6: Refresh and Verify Persistence
1. Refresh the page (Ctrl+F5 or Cmd+Shift+R)
2. **Expected**: 
   - Still logged in
   - Event still shows as registered
   - "My Schedule" still shows the registered event
   - Status persists because registration is saved in database

---

## Test Scenario 2: Register for Multiple Events

### Steps
1. Register for 3 different events using "Get Ticket Now"
2. Go to "My Schedule" tab
3. **Expected**: 
   - All 3 events appear in My Schedule
   - Can scroll through them
   - Each shows different details

---

## Test Scenario 3: Register Then Unregister (if available)

### Steps
1. Register for an event
2. Click "You're Registered!" button (or unregister option)
3. **Expected**: 
   - Event removed from My Schedule
   - Button changes back to "Get Ticket Now"
   - Attendee count decreases by 1

---

## Test Scenario 4: Browse as Unregistered, Then Register

### Steps
1. Look at event details in list
2. Don't click register - just scroll past
3. Later, come back and click "Get Ticket Now"
4. **Expected**: Same behavior as Scenario 1

---

## Test Scenario 5: Event Details Page

### Steps
1. Click on a registered event title (not the register button)
2. Go to event detail page
3. **Expected**: 
   - Shows full event description
   - Shows organizer name
   - Shows attendees list (if admin view)
   - If you're registered: shows "You're Registered" indicator
   - May show recordings (if event has them)

---

## Test Scenario 6: Multiple Users

### Steps
1. Register for event as User A
2. Logout (Ctrl+A or click logout)
3. Login as User B
4. View same event
5. **Expected**: 
   - For User A: Event shows as "You're Registered!"
   - For User B: Event shows as "Get Ticket Now" (not registered)
   - My Schedule for A shows event, B's doesn't

---

## Test Scenario 7: Price Information

### Steps
1. Look at event listing
2. Each event should show a price
3. Click "Get Ticket Now" on any event
4. **Expected**: 
   - Confirmation shows price information (if confirmation shows it)
   - User sees they're registering for a paid event
   - Registration still succeeds

---

## Troubleshooting

### Issue: Can't Login
- Check that you have an existing user account in database
- Or use the register option if available
- Check backend is running on `http://localhost:8000`

### Issue: Events List Empty
- Make sure events exist in database
- Run: `python manage.py shell` then create some events
- Or use admin panel at `http://localhost:8000/admin`

### Issue: Registration Button Doesn't Work
- Check browser console for errors (F12 → Console tab)
- Check Django server logs for error messages
- Verify JWT token was received during login

### Issue: My Schedule Empty After Registration
- Refresh the page to see latest data
- Check if event is in main list with different status
- Check browser console for API errors

### Issue: See Frontend Build Errors
- Run `npm run build` in frontend folder
- Check TypeScript errors
- Clear node_modules and reinstall: `npm install`

---

## What Success Looks Like ✅

### Checklist
- [ ] Can login successfully
- [ ] See webinar list with prices
- [ ] Click "Get Ticket Now" and get confirmation
- [ ] Confirmation shows email address
- [ ] Event shows as "You're Registered!" 
- [ ] Event appears in "My Schedule" section
- [ ] Refreshing page keeps registration
- [ ] Can register for multiple events
- [ ] Different users see different registration status

If all checkboxes pass → **Registration system is working perfectly!** 🎉

---

## Browser Developer Tools (F12)

### Network Tab
Watch what happens when you:
1. Click "Get Ticket Now"
2. You should see POST request to `/api/webinars/{id}/register/`
3. Response should have status 201 and contain email
4. Then GET request to `/api/webinars/` should show `is_registered: true`

### Console Tab
Should see NO red errors. Only info/warning messages are OK.

### Application/Storage Tab
Check LocalStorage for JWT token:
- After login, look for `token` or `access_token`
- Should contain JWT starting with `eyJ...`

---

## Expected API Responses

### Login Response
```json
{
  "access": "eyJ...",
  "refresh": "eyJ..."
}
```

### Register Response  
```json
{
  "detail": "Successfully registered for event",
  "email": "user@example.com",
  "event_id": 18,
  "id": 8
}
```

### Events List Response
```json
{
  "results": [
    {
      "id": 18,
      "title": "Event Name",
      "price": "99.99",
      "is_registered": true,  ← This is the key field!
      ...
    }
  ]
}
```

---

## When Everything Works 🎉

Users can:
1. ✅ Login to portal
2. ✅ Browse available webinars
3. ✅ See prices for each event
4. ✅ Click "Get Ticket Now"
5. ✅ Get success confirmation with email
6. ✅ See event marked as registered
7. ✅ Find event in "My Schedule"
8. ✅ Access event details and recordings
9. ✅ Registration persists across sessions
10. ✅ Multiple users can register independently

**The user portal is complete and functional!**
