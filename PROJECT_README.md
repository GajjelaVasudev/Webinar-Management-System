# Webinar Management System

A modern, full-stack webinar management platform built with Django REST Framework and React, featuring JWT authentication, role-based access control, and comprehensive event management capabilities.

## 📋 Project Overview

This system enables organizations to host, manage, and record webinars with features including user registration, live event management, recording access, announcements, and real-time chat functionality. The application follows a clean, modular architecture with separated concerns across multiple Django apps.

## 🛠️ Tech Stack

### Backend
- **Framework:** Django 6.0
- **API:** Django REST Framework 3.14.0
- **Authentication:** JWT (djangorestframework-simplejwt)
- **CORS Handling:** django-cors-headers
- **Server:** Gunicorn (production)
- **Static Files:** WhiteNoise

### Frontend
- **Framework:** React 18.3.1
- **Language:** TypeScript 5.7.3
- **Build Tool:** Vite 5.4.11
- **Styling:** Tailwind CSS 3.4.17
- **HTTP Client:** Axios
- **Icons:** Lucide React
- **Date Handling:** date-fns

### Database
- **PostgreSQL** (via psycopg2-binary)

## 📁 Project Structure

```
PFSD-PROJECT/
├── webinar_system/          # Django project configuration
│   ├── settings.py          # Main settings file
│   ├── urls.py              # Root URL configuration
│   └── wsgi.py              # WSGI application
│
├── accounts/                # User authentication & profiles
│   ├── models.py            # UserProfile model
│   ├── views.py             # Auth views (login, register, etc.)
│   ├── serializers.py       # User serializers
│   ├── permissions.py       # Custom permissions (IsAdmin)
│   └── urls.py              # /api/accounts/* endpoints
│
├── webinars/                # Event/webinar management
│   ├── models.py            # Event model
│   ├── views.py             # CRUD operations for events
│   ├── serializers.py       # Event serializers
│   └── urls.py              # /api/webinars/* endpoints
│
├── registrations/           # User registrations for webinars
│   ├── models.py            # Registration model
│   ├── views.py             # Register/unregister logic
│   ├── serializers.py       # Registration serializers
│   └── urls.py              # /api/registrations/* endpoints
│
├── recordings/              # Webinar recording management
│   ├── models.py            # Recording model
│   ├── views.py             # Recording CRUD operations
│   ├── serializers.py       # Recording serializers
│   └── urls.py              # /api/recordings/* endpoints
│
├── communications/          # Announcements, notifications, chat
│   ├── models.py            # Announcement, Notification, Chat models
│   ├── views.py             # Communication endpoints
│   ├── serializers.py       # Communication serializers
│   └── urls.py              # /api/communications/* endpoints
│
├── frontend/                # React application
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/           # Page-level components
│   │   ├── services/        # API service layer
│   │   ├── types/           # TypeScript type definitions
│   │   └── App.tsx          # Main application component
│   ├── public/              # Static assets
│   └── package.json         # Frontend dependencies
│
├── docs/                    # Comprehensive documentation
│   ├── API_REFERENCE.md     # Complete API documentation
│   ├── ARCHITECTURE_DIAGRAMS.md
│   ├── TESTING_GUIDE.md
│   └── ... (additional documentation)
│
├── tests/                   # Organized test files
├── media/                   # User-uploaded files
├── manage.py                # Django management script
├── requirements.txt         # Python dependencies
├── render-build.sh          # Render deployment script
├── render.yaml              # Render configuration
└── Procfile                 # Process file for deployment
```

## 🚀 Local Setup Instructions

### Prerequisites
- Python 3.10 or higher
- Node.js 18 or higher
- npm or yarn

### Backend Setup

1. **Clone the repository:**
   ```bash
   cd PFSD-PROJECT
   ```

2. **Create and activate virtual environment:**
   ```powershell
   # Windows PowerShell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```

3. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run database migrations:**
   ```bash
   python manage.py migrate
   ```

5. **Create a superuser/admin:**
   ```bash
   python manage.py createsuperuser
   ```
   Follow the prompts to enter username, email, and password.

6. **Start the Django development server:**
   ```bash
   python manage.py runserver
   ```
   Backend will run on `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

### Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000/api/
- **Admin Panel:** http://localhost:8000/admin/

## 🌐 Deployment Instructions

### Backend Deployment (Render)

1. **Create a PostgreSQL database on Render:**
   - Go to Render Dashboard → New → PostgreSQL
   - Name: `webinar-db`
   - Region: Choose your preferred region
   - Save connection details (shown once!)

2. **Create Web Service on Render:**
   - New → Web Service
   - Connect your Git repository
   - Name: `webinar-backend`
   - Environment: Python
   - Region: Same as database
   - Build Command: `bash ./render-build.sh`
   - Start Command: `gunicorn webinar_system.wsgi:application --bind 0.0.0.0:$PORT`

3. **Configure Environment Variables** (see Environment Variables section below)

4. **Deploy:**
   - Render will automatically build and deploy
   - First deployment may take 10-15 minutes

### Frontend Deployment (Vercel/Netlify)

1. **Build the frontend:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Vercel:**
   - Connect your Git repository to Vercel
   - Set build command: `npm run build`
   - Set output directory: `dist`
   - Add environment variable: `VITE_API_BASE_URL` with your Render backend URL

3. **Or deploy to Netlify:**
   - Similar process to Vercel
   - Configure build settings in `netlify.toml` or dashboard

## 🔐 Environment Variables

### Backend (.env)

```env
# Django Core
SECRET_KEY=your-secret-key-here-change-this-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# PostgreSQL Database
DB_NAME=webinar_db
DB_USER=postgres
DB_PASSWORD=your-database-password
DB_HOST=localhost
DB_PORT=5432

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# JWT
JWT_ACCESS_TOKEN_LIFETIME=60
JWT_REFRESH_TOKEN_LIFETIME=10080
```

### Frontend (.env.local for development)

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### Production Environment Variables (Render)

Set these in Render Dashboard → Environment:

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `SECRET_KEY` | Django secret key (generate new one) | `django-insecure-xxxxx` |
| `DEBUG` | Debug mode (always False in prod) | `False` |
| `ALLOWED_HOSTS` | Allowed host domains | `your-app.onrender.com` |
| `DB_NAME` | Database name from Render | From PostgreSQL settings |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | From PostgreSQL settings |
| `DB_HOST` | Database host | From PostgreSQL settings |
| `DB_PORT` | Database port | `5432` |
| `CORS_ALLOWED_ORIGINS` | Frontend domain(s) | `https://your-frontend.vercel.app` |

## 📡 API Endpoints

All API endpoints use the `/api/` prefix:

### Authentication
- `POST /api/accounts/auth/register/` - Register new user
- `POST /api/accounts/auth/login/` - User login (returns JWT tokens)
- `POST /api/accounts/auth/token/refresh/` - Refresh access token
- `GET /api/accounts/profile/` - Get current user profile
- `PUT /api/accounts/profile/` - Update user profile

### Webinars
- `GET /api/webinars/` - List all webinars
- `POST /api/webinars/` - Create webinar (admin only)
- `GET /api/webinars/{id}/` - Get webinar details
- `PUT /api/webinars/{id}/` - Update webinar (admin only)
- `DELETE /api/webinars/{id}/` - Delete webinar (admin only)

### Registrations
- `POST /api/registrations/register/` - Register for webinar
- `POST /api/registrations/unregister/` - Unregister from webinar
- `GET /api/registrations/my-registrations/` - Get user's registrations
- `GET /api/registrations/` - List all registrations (admin only)

### Recordings
- `GET /api/recordings/` - List recordings
- `POST /api/recordings/` - Upload recording (admin only)
- `GET /api/recordings/{id}/` - Get recording details
- `DELETE /api/recordings/{id}/` - Delete recording (admin only)

### Communications
- `GET /api/communications/announcements/` - List announcements
- `POST /api/communications/announcements/` - Create announcement (admin only)
- `GET /api/communications/notifications/` - Get user notifications
- `POST /api/communications/chat/` - Send chat message

For complete API documentation, see [docs/API_REFERENCE.md](docs/API_REFERENCE.md)

## 👤 Creating Superuser/Admin

### Method 1: Command Line (Recommended)

```bash
python manage.py createsuperuser
```

You'll be prompted for:
- Username
- Email address
- Password (enter twice)

### Method 2: Django Shell

```bash
python manage.py shell
```

Then run:
```python
from django.contrib.auth.models import User
User.objects.create_superuser('admin', 'admin@example.com', 'securepassword')
```

### Method 3: PowerShell Script

Run the provided script:
```powershell
.\setup-admin.ps1
```

### Admin Panel Access

After creating a superuser, access the admin panel at:
- **Local:** http://localhost:8000/admin/
- **Production:** https://your-app.onrender.com/admin/

## 🔑 API Authentication

The system uses JWT (JSON Web Tokens) for authentication:

1. **Register or Login** to receive tokens:
   ```json
   {
     "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
     "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
   }
   ```

2. **Include access token** in subsequent requests:
   ```
   Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
   ```

3. **Token Expiration:**
   - Access Token: 1 hour
   - Refresh Token: 7 days

4. **Refresh expired tokens:**
   ```bash
   POST /api/accounts/auth/token/refresh/
   {
     "refresh": "your-refresh-token"
   }
   ```

## 🧪 Running Tests

```bash
# Run all tests
python manage.py test

# Run tests for specific app
python manage.py test accounts
python manage.py test webinars

# Run with verbose output
python manage.py test --verbosity=2
```

## 🎯 Key Features

### For Users
- Browse upcoming webinars
- Register/unregister for events
- Access recordings of past webinars
- Receive notifications and announcements
- Participate in live chat during webinars

### For Admins
- Create and manage webinars
- Upload and manage recordings
- Send announcements to all users
- View all registrations and analytics
- User management through admin panel

## ⚙️ Important Notes

### CORS Configuration
- In development, frontend (localhost:5173) can access backend (localhost:8000)
- In production, update `CORS_ALLOWED_ORIGINS` in settings with your frontend domain

### Database
- **PostgreSQL** is used for both development and production
- Ensure PostgreSQL service is running before starting the Django server
- Database credentials are configured in `.env` file

### Static Files
- Static files are served by WhiteNoise in production
- Run `python manage.py collectstatic` before deployment (automated in render-build.sh)

### Media Files
- User-uploaded files (avatars, recordings) are stored in `media/` directory
- For production, consider using cloud storage (AWS S3, Cloudinary, etc.)

### Security
- **Change SECRET_KEY** in production (never use default)
- Set **DEBUG=False** in production
- Use **strong passwords** for superuser accounts
- Keep dependencies updated regularly

### API Base URL
- **Local Development:** `http://localhost:8000/api`
- **Production:** Update `VITE_API_BASE_URL` in frontend environment variables

## 📞 Support & Documentation

For additional documentation, see the `docs/` directory:
- [API Reference](docs/API_REFERENCE.md) - Complete API documentation
- [Testing Guide](docs/TESTING_GUIDE.md) - How to test the application
- [Architecture Diagrams](docs/ARCHITECTURE_DIAGRAMS.md) - System architecture

## 📄 License

This project is developed as part of PFSD (Programming for Software Development) coursework.

---

**Last Updated:** February 2026  
**Version:** 1.0.0
