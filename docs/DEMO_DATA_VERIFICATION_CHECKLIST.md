# Demo Data Verification Checklist

Use this checklist to verify that the demo data is properly loaded and functioning in your dashboard.

---

## ✅ Pre-Launch Checks

- [ ] Run `python manage.py migrate` - Database schema created
- [ ] Run `python manage.py generate_demo_data` - Demo data generator executed
- [ ] Start backend: `python manage.py runserver`
- [ ] Start frontend: `npm run dev` (from frontend folder)
- [ ] Frontend accessible at `http://localhost:3000`
- [ ] Backend accessible at `http://localhost:8000`

---

## 🔐 Authentication Verification

### Login Test - Student Account
- [ ] Navigate to `/auth?mode=login`
- [ ] Enter credentials: `student` / `student123`
- [ ] Login successful (no 401 errors)
- [ ] Redirected to dashboard
- [ ] "Test Student" quick-login button works

### Login Test - Admin Account
- [ ] Enter credentials: `admin` / `admin123`
- [ ] Login successful
- [ ] Redirected to admin dashboard
- [ ] "Test Admin" quick-login button works

---

## 📊 Dashboard Statistics Verification

### Student Dashboard Main View
- [ ] **Total Webinars:** Shows 15 webinars/sessions
- [ ] **My Registrations:** Shows 7 registered webinars
- [ ] **Available Recordings:** Shows 5 recordings
- [ ] **Announcements:** Shows 4 announcements
- [ ] **Upcoming Webinars:** Shows at least 7 upcoming sessions

### Student Registered Webinars
- [ ] "My Webinars" tab shows exactly 7 webinars:
  - [ ] 3 from Python for Data Science series
  - [ ] 3 from Web Development with Django & React series
  - [ ] 1 from Cloud Computing on AWS series

### Dashboard Stats (If Available)
- [ ] Student has 7 total registrations
- [ ] All registrations have future dates (March 2026)
- [ ] Variety of price points visible ($49.99 - $99.99)

---

## 🎓 Webinar Content Verification

### Browse All Webinars
- [ ] Can see all 15 webinar sessions listed
- [ ] Sessions are grouped by series:
  - [ ] Python for Data Science: 3 sessions
  - [ ] Web Development with Django & React: 3 sessions
  - [ ] Cloud Computing on AWS: 3 sessions
  - [ ] Machine Learning: From Theory to Practice: 3 sessions
  - [ ] DevOps & CI/CD: 3 sessions

### Webinar Detail Page
- [ ] Title displays correctly
- [ ] Description is detailed and professional
- [ ] Date and time shown (all in March 2026)
- [ ] Duration visible (60-90 minutes range)
- [ ] Price displayed ($49.99-$99.99)
- [ ] Organizer shown as "admin"
- [ ] Registration button visible and clickable

### Webinar Filtering (if implemented)
- [ ] Can filter by price range
- [ ] Can search by title
- [ ] Can sort by date
- [ ] Can sort by popularity

---

## 📺 Recordings Verification

### Recordings List
- [ ] 5 recordings visible
- [ ] Each recording links to a webinar series
- [ ] Titles are descriptive ("Recording: [Webinar Title]")

### Recording Details
- [ ] Can click to view recording details
- [ ] Duration information displayed
- [ ] Upload date visible
- [ ] Organizer information shown
- [ ] Marked as "Public"
- [ ] YouTube embed link present (though placeholder)

### Student Access
- [ ] Student can view all public recordings
- [ ] Recording playback interface loads
- [ ] Can navigate between recordings

---

## 📢 Announcements & Notifications Verification

### Announcements Section
- [ ] 4 announcements visible:
  - [ ] "Welcome to our Platform!"
  - [ ] "New Courses Available"
  - [ ] "Upcoming Live Demo Sessions"
  - [ ] "Certificate of Completion Now Available"
- [ ] Each announcement has title, content, and sender (admin)
- [ ] Announcements are ordered by most recent

### Student Notifications
- [ ] Notification bell shows unread count or indicator
- [ ] Notification center shows 3 notifications:
  - [ ] Welcome announcement notification
  - [ ] Upcoming webinar reminder
  - [ ] New recording available notification
- [ ] Can mark notifications as read
- [ ] Notifications persist across page refresh

### Announcement Details
- [ ] Clicking announcement shows full content
- [ ] Professional formatting and structure
- [ ] Relevant information for platform users

---

## 💬 Chat/Messaging Verification (If Implemented)

### Chat Functionality
- [ ] Can navigate to a registered webinar
- [ ] Chat section visible if webinar has messages
- [ ] 5 sample messages visible in first webinar:
  - [ ] "Great explanation! Really helpful."
  - [ ] "Can you repeat that last part?"
  - [ ] "This is amazing content!"
  - [ ] "Will the recording be available?"
  - [ ] "Thank you for this comprehensive course."

### Chat Features
- [ ] Messages show sender name (student)
- [ ] Messages show timestamp
- [ ] Messages are properly formatted
- [ ] Chat appears chronologically ordered

---

## 👤 User Profile Verification

### Student Profile
- [ ] Username displays as "student"
- [ ] Email shows as "student@gmail.com"
- [ ] Role shows as "Regular User" or "user"
- [ ] Registration count shows 7
- [ ] Profile picture placeholder visible (if applicable)

### Student Settings
- [ ] Can view and edit profile information
- [ ] Can change password
- [ ] Can view security settings
- [ ] Logout button functional

### Admin Profile (if accessible)
- [ ] Username displays as "admin"
- [ ] Role shows as "Administrator"
- [ ] Additional admin-specific options visible

---

## 📱 Registration Feature Verification

### Register for Webinar (if student not already registered)
- [ ] Can click "Register" button on unregistered webinar
- [ ] Confirmation message appears
- [ ] Registration updates dashboard counts
- [ ] Webinar appears in "My Webinars"

### View Registration Details
- [ ] Can see registration date/time
- [ ] Can see webinar details from registration
- [ ] Can unregister if desirable
- [ ] Unregister removes from "My Webinars"

---

## 🛠️ Admin Dashboard Verification (If Accessible)

### Admin Panel Access
- [ ] Admin can access admin dashboard
- [ ] Admin view shows different options than student

### Content Management
- [ ] Can view all 15 webinars in admin
- [ ] Can create new webinar
- [ ] Can edit existing webinar
- [ ] Can delete webinar (with confirmation)
- [ ] Can manage announcements

### User Management
- [ ] Can view all user accounts (admin, student)
- [ ] Can view user registrations
- [ ] Can manage user permissions

### Analytics (if available)
- [ ] Can see registration statistics
- [ ] Can see webinar attendance data
- [ ] Can generate reports

---

## 🔗 API Verification (For Developers)

### Webinar Endpoints
- [ ] GET `/api/webinars/` returns 15 webinars ✓
- [ ] GET `/api/webinars/{id}/` returns single webinar details ✓
- [ ] Status: 200 OK response code ✓

### Registration Endpoints
- [ ] GET `/api/registrations/` returns user's 7 registrations ✓
- [ ] POST `/api/registrations/` allows new registration ✓
- [ ] DELETE `/api/registrations/{id}/` allows unregister ✓

### Recording Endpoints
- [ ] GET `/api/recordings/` returns 5 recordings ✓
- [ ] GET `/api/recordings/{id}/` returns recording details ✓

### Announcement Endpoints
- [ ] GET `/api/announcements/` returns 4 announcements ✓
- [ ] GET `/api/notifications/` returns user's 3 notifications ✓

---

## 🎨 UI/UX Verification

### Visual Consistency
- [ ] All pages load without errors
- [ ] No 404 or 500 errors on navigation
- [ ] Responsive design works on different screen sizes
- [ ] Images/icons display correctly (where applicable)
- [ ] Color scheme consistent throughout

### Loading States
- [ ] Dashboard loads with proper loading indicators
- [ ] No blank pages during initial load
- [ ] Error messages clear and helpful (if any)

### Navigation
- [ ] All menu items work correctly
- [ ] Back buttons function properly
- [ ] Links are not broken
- [ ] Navigation is intuitive

---

## 🔒 Security Verification

### Authentication
- [ ] Incorrect credentials rejected
- [ ] Session persists on page refresh
- [ ] Logout clears session properly
- [ ] Can't access admin features as student

### Data Privacy
- [ ] Student can only see their registrations
- [ ] Student can't see other users' data
- [ ] Private data not exposed in API responses

---

## ⚡ Performance Verification

### Load Times
- [ ] Dashboard loads in < 2 seconds
- [ ] Webinar list loads quickly even with 15 items
- [ ] Navigation between pages is responsive
- [ ] No noticeable lag when clicking buttons

### Database Queries
- [ ] Page loads with reasonable number of queries
- [ ] No N+1 query problems visible
- [ ] Pagination works if implemented

---

## 🐛 Bug Check

- [ ] No console errors (F12 → Console tab)
- [ ] No network errors (F12 → Network tab)
- [ ] All forms submit successfully
- [ ] No duplicate data displayed
- [ ] No missing/truncated content

---

## 📋 Final Verification

### Summary Check
- [ ] ✅ 15 webinars loaded
- [ ] ✅ 7 student registrations visible
- [ ] ✅ 5 recordings accessible
- [ ] ✅ 4 announcements displayed
- [ ] ✅ 3 student notifications active
- [ ] ✅ 5 chat messages visible
- [ ] ✅ Both user accounts functional
- [ ] ✅ All navigation working
- [ ] ✅ No critical errors

### Ready for Review?
- [ ] All checks above marked ✅
- [ ] Dashboard looks professional
- [ ] Data is meaningful and realistic
- [ ] Features demonstrate core functionality
- [ ] **Status: READY FOR DEMO** ✅

---

## 📝 Notes for Demo

Use these talking points during your review:

1. **Rich Data Set**: 15 webinars across 5 professional series with realistic details
2. **User Engagement**: Student shows meaningful engagement (7 registrations, notifications, chat)
3. **Scalability**: Demo data proves system can handle multiple courses and sessions
4. **Professional Content**: All titles, descriptions, and pricing are realistic
5. **Complete Features**: Demonstrates registrations, recordings, announcements, and chat
6. **Future-Proof**: All dates are in March 2026, eliminating confusion about past/present

---

## 🚀 If All Checks Pass

**Congratulations!** Your demo data is fully functional and ready for:
- ✅ Stakeholder review
- ✅ Feature demonstration
- ✅ User testing
- ✅ Performance evaluation
- ✅ UI/UX feedback

---

**Checklist Version:** 1.0  
**Last Updated:** February 25, 2026  
**Status:** Ready to Use
