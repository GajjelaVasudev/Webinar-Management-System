# 🎓 Webinar Management System

A professional, scalable Django REST Framework + React application for managing webinars, registrations, recordings, and communications.

## 🏗️ Architecture

This project follows **clean Django architecture** with modular, domain-driven design:

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│                  Vite + TypeScript                       │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/REST API
┌────────────────────▼────────────────────────────────────┐
│                   Django Backend                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │          webinar_system (Project Config)         │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐    │
│  │ accounts │  │ webinars │  │ registrations    │    │
│  │ • Auth   │  │ • Events │  │ • Sign-ups       │    │
│  │ • Users  │  │ • Status │  │ • Attendance     │    │
│  └──────────┘  └──────────┘  └──────────────────┘    │
│  ┌──────────┐  ┌─────────────────────────────────┐    │
│  │recordings│  │    communications                │    │
│  │ • Videos │  │    • Announcements               │    │
│  │ • Links  │  │    • Notifications               │    │
│  └──────────┘  │    • Live Chat                   │    │
│                 └─────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│              Database (PostgreSQL/SQLite)                │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
PFSD-PROJECT/
├── 🔧 webinar_system/       # Django project configuration
├── 👤 accounts/             # User management & authentication
├── 🎥 webinars/             # Webinar/event management
├── 📝 registrations/        # User registrations for events
├── 🎬 recordings/           # Webinar recordings
├── 💬 communications/       # Announcements, notifications, chat
├── ⚛️  frontend/            # React application
├── 📚 docs/                 # Documentation
├── 🧪 tests/                # Test files
└── 📁 media/                # User uploads
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL (or SQLite for development)

### Backend Setup

```powershell
# Create virtual environment
python -m venv .venv
.venv\Scripts\Activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

Backend will run at: `http://localhost:8000`

### Frontend Setup

```powershell
cd frontend
npm install
npm run dev
```

Frontend will run at: `http://localhost:5173`

---

## 📡 API Endpoints

### Authentication (`/api/accounts/`)
- `POST /api/accounts/auth/login/` - Login (JWT)
- `POST /api/accounts/auth/register/` - Register new user
- `POST /api/accounts/auth/refresh/` - Refresh access token
- `POST /api/accounts/auth/change-password/` - Change password
- `GET /api/accounts/users/me/` - Get current user info

### Webinars (`/api/webinars/`)
- `GET /api/webinars/` - List all webinars
- `POST /api/webinars/` - Create webinar (admin)
- `GET /api/webinars/{id}/` - Get webinar details
- `PUT /api/webinars/{id}/` - Update webinar (admin)
- `DELETE /api/webinars/{id}/` - Delete webinar (admin)
- `GET /api/webinars/upcoming/` - Get upcoming webinars
- `GET /api/webinars/live/` - Get live webinars
- `GET /api/webinars/completed/` - Get completed webinars

### Registrations (`/api/registrations/`)
- `GET /api/registrations/` - List user's registrations
- `POST /api/registrations/register/` - Register for webinar
- `DELETE /api/registrations/{id}/unregister/` - Unregister from webinar
- `GET /api/registrations/my_registrations/` - Get my registrations

### Recordings (`/api/recordings/`)
- `GET /api/recordings/` - List recordings
- `POST /api/recordings/` - Upload recording (admin)
- `GET /api/recordings/{id}/` - Get recording details
- `GET /api/recordings/public/` - Get public recordings
- `GET /api/recordings/event_recordings/` - Get recordings for registered events

### Communications (`/api/communications/`)
- `GET /api/communications/announcements/` - List announcements
- `POST /api/communications/announcements/` - Create announcement (admin)
- `GET /api/communications/notifications/` - User notifications
- `POST /api/communications/notifications/{id}/mark_read/` - Mark as read
- `GET /api/communications/notifications/unread_count/` - Unread count
- `GET /api/communications/chat/?event_id={id}` - Get chat messages
- `POST /api/communications/chat/` - Send chat message

---

## 🎯 Features

### For Users
✅ User registration and authentication  
✅ Browse and search webinars  
✅ Register for upcoming webinars  
✅ Join live webinars  
✅ Access recorded sessions  
✅ Receive notifications and announcements  
✅ Participate in live chat during webinars  
✅ Manage profile and settings  

### For Admins
✅ Create and manage webinars  
✅ Upload and manage recordings  
✅ Send announcements to all users  
✅ View registration statistics  
✅ Manage user roles and permissions  
✅ Monitor webinar chat  
✅ Mark webinars as completed  

---

## 🛠️ Technology Stack

### Backend
- **Django 6.0** - Web framework
- **Django REST Framework** - API framework
- **Simple JWT** - JWT authentication
- **PostgreSQL** - Production database
- **SQLite** - Development database
- **Whitenoise** - Static file serving
- **Python Decouple** - Environment configuration

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP client

---

## 🔐 Authentication

The system uses **JWT (JSON Web Tokens)** for authentication:

1. User logs in with username/email and password
2. Backend returns access token (1 hour expiry) and refresh token (7 days)
3. Frontend stores tokens in localStorage
4. Access token is sent with each API request
5. When access token expires, use refresh token to get new access token

### Token Usage

```typescript
// Login
const response = await axios.post('/api/accounts/auth/login/', {
  username: 'user@example.com',
  password: 'password123'
});
const { access, refresh, user } = response.data;

// Use token in requests
axios.get('/api/webinars/', {
  headers: { 'Authorization': `Bearer ${access}` }
});
```

---

## 👥 User Roles

### Regular User
- Can register for webinars
- Can view recordings
- Can participate in chat
- Can view announcements

### Admin
- All user permissions +
- Can create/edit/delete webinars
- Can upload recordings
- Can send announcements
- Can view all registrations
- Can manage users

---

## 🗄️ Database Schema

### Core Models

**UserProfile** (accounts)
- user: OneToOne → User
- role: CharField (admin/user)
- created_at, updated_at

**Event** (webinars)
- title, description
- date, time, duration
- price, thumbnail
- live_stream_url
- organizer: FK → User

**Registration** (registrations)
- user: FK → User
- event: FK → Event
- registered_on, attended

**Recording** (recordings)
- event: FK → Event
- recording_link, title
- uploaded_by: FK → User
- is_public

**Announcement** (communications)
- sender: FK → User
- title, content
- created_at, updated_at

**UserNotification** (communications)
- user: FK → User
- notification_type
- content, is_read
- announcement, event, recording

**WebinarChatMessage** (communications)
- event: FK → Event
- user: FK → User
- message, created_at

---

## 📋 Development Guidelines

### Code Style
- Follow **PEP 8** for Python code
- Use **ESLint** and **Prettier** for TypeScript/React
- Write descriptive commit messages
- Add docstrings to all functions/classes

### Testing
```powershell
# Run Django tests
python manage.py test

# Run frontend tests
cd frontend
npm test
```

### Creating New Apps
```powershell
# Create new Django app
python manage.py startapp app_name

# Add to INSTALLED_APPS in settings.py
# Create models, views, serializers, urls
# Register in main urls.py
```

---

## 🚀 Deployment

### Production Checklist
- [ ] Set `DEBUG = False` in settings
- [ ] Configure PostgreSQL database
- [ ] Set up environment variables (`.env`)
- [ ] Configure ALLOWED_HOSTS
- [ ] Set up static file serving (Whitenoise)
- [ ] Configure CORS properly
- [ ] Run collectstatic
- [ ] Run migrations
- [ ] Create superuser
- [ ] Set up SSL/HTTPS
- [ ] Configure gunicorn/uwsgi
- [ ] Set up frontend build process

See `docs/DEPLOYMENT_STEP1_COMPLETE.md` for detailed instructions.

---

## 📚 Documentation

- `REFACTORING_GUIDE.md` - Migration from old structure
- `docs/API_REFERENCE.md` - Complete API documentation
- `docs/ARCHITECTURE_DIAGRAMS.md` - System architecture
- `docs/FRONTEND_SETUP.md` - Frontend configuration
- `docs/TESTING_GUIDE.md` - Testing guidelines

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 🆘 Support & Issues

For bugs, feature requests, or questions:
1. Check existing documentation
2. Search existing issues
3. Create new issue with detailed description

---

## 🎉 Acknowledgments

Built with ❤️ using Django and React.

**Version:** 2.0.0  
**Last Updated:** February 19, 2026
