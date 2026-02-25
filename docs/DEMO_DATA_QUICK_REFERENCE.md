# Demo Data Quick Reference

## 🚀 Running the Demo Data Generator

### Command
```bash
python manage.py generate_demo_data
```

### What It Creates
- **5 webinar series** with realistic professional titles
- **15 total sessions** (3 per series, with future dates)
- **5 recordings** with YouTube embed links
- **4 announcements** for platform communication
- **3 notifications** assigned to student user
- **7 registrations** for student across multiple webinars
- **5 chat messages** in active webinar sessions

### Data Organization

#### Webinars by Category
| Series | Sessions | Price | Focus |
|--------|----------|-------|-------|
| Python Data Science | 3 | $49.99 | Data Analysis |
| Django & React | 3 | $79.99 | Full-Stack Dev |
| AWS Cloud | 3 | $59.99 | Cloud Infra |
| Machine Learning | 3 | $99.99 | ML & AI |
| DevOps & CI/CD | 3 | $69.99 | Deployment |

#### Student Registration Pattern
- **Registered to 7 sessions** across 3 series (Python, Django, AWS)
- Provides realistic user journey for dashboard demo
- Shows registrations, notifications, and engagement

---

## 🧪 Testing the Data

### With Frontend & Backend Running

```bash
# Terminal 1: Start Django backend
cd c:\Users\vgajj\Downloads\PFSD-PROJECT
.venv\Scripts\python.exe manage.py runserver

# Terminal 2: Start React frontend  
cd c:\Users\vgajj\Downloads\PFSD-PROJECT\frontend
npm run dev
```

### Login Credentials

**Student User:**
- Username: `student`
- Password: `student123`
- Access: View all webinars, see registrations, manage profile

**Admin User:**
- Username: `admin`
- Password: `admin123`
- Access: Admin dashboard, create/edit content, manage users

### Expected Dashboard Views

#### Student Dashboard
- **Total Webinars:** 15 sessions across 5 series
- **My Webinars:** 7 registered sessions
- **Announcements:** 4 platform announcements visible
- **Notifications:** 3 unread notifications (welcome, upcoming, recording)
- **Recordings:** 5 available for viewing

#### Admin Dashboard
- **Webinar Management:** All 15 sessions creatable/editable
- **User Management:** Can view student and admin users
- **Announcements:** All 4 announcements visible, can create more
- **Analytics:** Registration counts by webinar

---

## 📊 Database Records Created

### By Model

| Model | Count | Notes |
|-------|-------|-------|
| **webinars.Event** | 15 | Across 5 series |
| **registrations.Registration** | 7 | Student registrations |
| **recordings.Recording** | 5 | 1 per series |
| **communications.Announcement** | 4 | Platform messages |
| **communications.UserNotification** | 3 | Student notifications |
| **communications.WebinarChatMessage** | 5 | In first webinar |

### Key Features Demonstrated
- ✅ Multi-series course structure
- ✅ Future date scheduling
- ✅ Varied pricing ($49-$99)
- ✅ Session durations (60-90 min)
- ✅ User-course relationships
- ✅ Communication channels
- ✅ Recording availability
- ✅ Real-world chat dynamics

---

## 🔄 Re-running the Command

The command is **idempotent for existing users** but will create **duplicate data** if run multiple times:

### To regenerate all data:
```bash
# 1. Delete current database
rm db.sqlite3

# 2. Run migrations
python manage.py migrate

# 3. Run demo data generator
python manage.py generate_demo_data
```

### To keep existing users and only add webinars:
```bash
# Just run the command again - it will create new webinars
python manage.py generate_demo_data
```

---

## 🔍 Verifying Demo Data

### Via Django Admin (localhost:8000/admin)
1. Login with `admin` / `admin123`
2. Visit each section:
   - **Webinars**: 15 Event objects
   - **Registrations**: 7 Registration objects
   - **Recordings**: 5 Recording objects
   - **Announcements**: 4 Announcement objects

### Via Django Shell
```bash
python manage.py shell
```

```python
# Count webinars
from webinars.models import Event
Event.objects.count()  # Should be 15

# Count student registrations
from registrations.models import Registration
from django.contrib.auth.models import User
student = User.objects.get(username='student')
student.event_registrations.count()  # Should be 7

# Check announcements
from communications.models import Announcement
Announcement.objects.count()  # Should be 4
```

---

## 🗑️ Cleanup Instructions

### Remove All Demo Data (Keep DB Structure)
```bash
# Delete all custom data but keep schema
python manage.py flush --no-input
python manage.py generate_demo_data  # To recreate if needed
```

### Complete Reset (Recommended for Production)
```bash
# Remove database file
rm db.sqlite3

# Remove migrations state
# (but keep migration files)

# Recreate database
python manage.py migrate

# Create fresh users
python manage.py createsuperuser
```

---

## 🎯 Use Cases for Demo Data

1. **Frontend Testing**: Navigate UI with realistic content
2. **Dashboard Review**: See meaningful statistics and counts
3. **Registration Flow**: Test webinar registration with student
4. **Notification System**: View announcements and notifications
5. **Admin Features**: Test content management with admin user
6. **Performance Testing**: Large dataset (15 webinars) for load testing
7. **Chat/Messaging**: Test communication features with sample messages

---

## 📁 Generated Files

- **Command File**: `webinars/management/commands/generate_demo_data.py`
- **This Guide**: `docs/DEMO_DATA_SUMMARY.md`
- **Database**: `db.sqlite3` (created after first migration)

---

## ⚠️ Important Notes

- Demo data uses **future dates only** (March 2026) to avoid confusion with past webinars
- **No images** uploaded (thumbnail field empty) - add via admin if needed
- **YouTube links are placeholders** - won't actually embed live content
- **Chat messages are sample only** - real messages would be time-stamped per interaction
- **All data is isolated** - can be deleted/regenerated without affecting code

---

## 🆘 Troubleshooting

### "No database found" error
→ Run `python manage.py migrate` first

### "Module not found" errors
→ Run `pip install -r requirements.txt`

### Duplicate data after re-running command
→ Use `rm db.sqlite3` then `python manage.py migrate` to start fresh

### Data not showing in frontend
→ Verify API endpoints return 200 status
→ Check browser console for CORS/auth errors
→ Ensure frontend is connecting to correct backend URL

---

**Last Updated:** February 25, 2026  
**Status:** Ready for Review ✅
