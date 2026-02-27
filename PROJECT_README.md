# Webinar Management System - Full Stack Project

A comprehensive full-stack webinar management platform built with Django REST Framework and React, implementing industry-standard practices in authentication, authorization, API design, and responsive frontend development.

## 📋 Project Overview

This project demonstrates a complete full-stack web application for managing webinars, with features including JWT-based authentication, role-based access control, event registration, recording management, and real-time notifications. The application follows clean architecture principles with a modular backend structure and a modern React frontend integrated with a RESTful API.

**Key Architectural Principles:**
- Separation of concerns (frontend/backend)
- RESTful API design with clear URL patterns
- Role-based access control (admin/student)
- PostgreSQL for data persistence
- JWT for stateless authentication
- Responsive TypeScript-based UI

## 🛠️ Technology Stack

### Backend (Django)
- **Framework:** Django 6.0
- **API Framework:** Django REST Framework 3.14.0
- **Authentication:** JWT (djangorestframework-simplejwt)
- **Database Client:** psycopg2-binary (PostgreSQL)
- **CORS Support:** django-cors-headers
- **Production Server:** Gunicorn
- **Static Files:** WhiteNoise

### Frontend (React)
- **Framework:** React 18.3.1
- **Language:** TypeScript 5.7.3
- **Build Tool:** Vite 5.4.11
- **Styling:** Tailwind CSS 3.4.17
- **HTTP Client:** Axios
- **Component Icons:** Lucide React
- **Date/Time Handling:** date-fns

### Database & Deployment
- **Database:** PostgreSQL
- **Backend Hosting:** Render
- **Frontend Hosting:** Vercel

---

## 1. Project Structure & Configuration

### Directory Organization

```
PFSD-PROJECT/
├── webinar_system/              # Django project settings (Python package)
│   ├── settings.py              # Configuration, database, installed apps
│   ├── urls.py                  # Root URL dispatcher
│   ├── wsgi.py                  # WSGI application entry point
│   └── asgi.py                  # ASGI configuration
│
├── accounts/                    # User authentication & profiles (Django app)
│   ├── models.py                # User model with role-based choices
│   ├── views.py                 # Authentication views (login, register, profile)
│   ├── serializers.py           # UserSerializer for API responses
│   ├── permissions.py           # Custom permissions (IsAdmin, IsStudent)
│   ├── urls.py                  # Auth endpoints (/api/accounts/*)
│   └── migrations/              # Database schema changes
│
├── webinars/                    # Webinar event management (Django app)
│   ├── models.py                # Event, Session models with relationships
│   ├── views.py                 # CRUD operations for events/sessions
│   ├── serializers.py           # EventSerializer with computed fields
│   ├── urls.py                  # Event endpoints (/api/webinars/*)
│   └── migrations/              # Database migrations
│
├── registrations/               # User registrations for webinars (Django app)
│   ├── models.py                # Registration model (user-event relationship)
│   ├── views.py                 # Register/unregister logic
│   ├── serializers.py           # RegistrationSerializer
│   ├── urls.py                  # Registration endpoints (/api/registrations/*)
│   └── migrations/              # Database migrations
│
├── recordings/                  # Webinar recordings (Django app)
│   ├── models.py                # Recording model (linked to events)
│   ├── views.py                 # Upload, retrieve, delete recordings
│   ├── serializers.py           # RecordingSerializer
│   ├── urls.py                  # Recording endpoints (/api/recordings/*)
│   └── migrations/              # Database migrations
│
├── communications/              # Announcements, notifications, chat (Django app)
│   ├── models.py                # Announcement, Notification, Chat models
│   ├── views.py                 # Communication endpoints
│   ├── serializers.py           # Communication serializers
│   ├── urls.py                  # Communication endpoints (/api/communications/*)
│   └── migrations/              # Database migrations
│
├── frontend/                    # React TypeScript application
│   ├── src/
│   │   ├── components/          # Reusable React components (Card, Modal, etc.)
│   │   ├── pages/               # Page-level components (Dashboard, WebinarDetail)
│   │   ├── services/            # API service layer (Axios instances)
│   │   ├── types/               # TypeScript interfaces and types
│   │   ├── App.tsx              # Main app component with routing
│   │   └── main.tsx             # React DOM entry point
│   ├── public/                  # Static assets (images, icons)
│   ├── vite.config.ts           # Vite build configuration
│   ├── tsconfig.json            # TypeScript configuration
│   ├── tailwind.config.ts       # Tailwind CSS configuration
│   └── package.json             # Frontend dependencies
│
├── docs/                        # Comprehensive documentation
│   ├── API_REFERENCE.md         # Complete API endpoint documentation
│   ├── ARCHITECTURE_DIAGRAMS.md # System architecture diagrams
│   └── TESTING_GUIDE.md         # Testing strategy and commands
│
├── tests/                       # Test files for Django apps
├── media/                       # User-uploaded files directory
├── manage.py                    # Django CLI tool
├── requirements.txt             # Python dependencies
├── render-build.sh              # Production build script for Render
├── Procfile                     # Process declarations for deployment
├── render.yaml                  # Render platform deployment configuration
└── .env                         # Environment variables (not in git)
```

### Django Settings Configuration

**webinar_system/settings.py** configures:
- **INSTALLED_APPS:** Django apps including custom apps (accounts, webinars, registrations, recordings, communications) and third-party packages (rest_framework, corsheaders)
- **DATABASES:** PostgreSQL connection with environment variable support
- **AUTHENTICATION_CLASSES:** JWT authentication via SimpleJWT
- **REST_FRAMEWORK:** Pagination, default permissions, exception handling
- **CORS_ALLOWED_ORIGINS:** Frontend origin for development/production
- **ALLOWED_HOSTS:** Domains allowed to serve the application

### Environment Configuration

The project uses environment variables for sensitive configuration (see Environment Variables section):
- Database credentials
- Django secret key
- CORS origins
- JWT token lifetimes
- Debug mode toggle

---

## 2. Models & Database (ORM)

### Database Design & Relationships

The application uses **PostgreSQL** with Django ORM for data persistence. All models implement primary key relationships and constraints.

#### User Model (accounts/models.py)
```python
# Extends Django's AbstractUser
- id (Primary Key)
- username (Unique)
- email (Unique)
- password (Hashed)
- first_name, last_name
- role (CharField: 'admin' or 'student')
- is_active, is_staff (Boolean)
- created_at, updated_at (Timestamps)
```

**Purpose:** Manages user authentication with role-based distinctions for access control.

#### Event Model (webinars/models.py)
```python
- id (Primary Key)
- title (CharField)
- description (TextField)
- date (DateField)
- time (TimeField)
- duration (IntegerField: minutes)
- organizer (ForeignKey → User)
- price (DecimalField)
- thumbnail (ImageField)
- live_stream_url (URLField)
- status (CharField: 'scheduled', 'live', 'completed')
- created_at, updated_at (DateTimeField)
```

**Purpose:** Stores webinar/event details. The `organizer` field links to a User with role='admin'.

#### Session Model (webinars/models.py)
```python
- id (Primary Key)
- event (ForeignKey → Event)
- start_time (DateTimeField)
- end_time (DateTimeField)
- speaker (CharField)
- topic (CharField)
```

**Purpose:** Represents individual sessions within a multi-session webinar.

#### Registration Model (registrations/models.py)
```python
- id (Primary Key)
- user (ForeignKey → User)
- event (ForeignKey → Event)
- registered_at (DateTimeField: auto_now_add=True)
- Meta.unique_together = [('user', 'event')]  # Prevent duplicate registrations
```

**Purpose:** Tracks which users are registered for which events. The unique constraint prevents duplicates.

#### Recording Model (recordings/models.py)
```python
- id (Primary Key)
- event (ForeignKey → Event)
- video_url (URLField or FileField)
- title (CharField)
- duration (IntegerField: seconds)
- uploaded_at (DateTimeField)
```

**Purpose:** Stores recording metadata linked to specific events.

#### Announcement Model (communications/models.py)
```python
- id (Primary Key)
- title (CharField)
- content (TextField)
- posted_by (ForeignKey → User)
- created_at (DateTimeField)
```

**Purpose:** Admin announcements visible to all users.

#### Notification Model (communications/models.py)
```python
- id (Primary Key)
- user (ForeignKey → User)
- message (TextField)
- read (BooleanField: default=False)
- created_at (DateTimeField)
```

**Purpose:** User-specific notifications.

### Database Migrations

Django migrations automatically create and update the PostgreSQL schema:
```bash
python manage.py makemigrations [app_name]  # Create migrations
python manage.py migrate                     # Apply to database
```

All migrations are version-controlled in `[app]/migrations/` directories.

---

## 3. Views, URLs & API Design

### REST API Architecture

The API follows RESTful principles with a unified `/api/` prefix for all endpoints. Each Django app manages its own endpoints.

#### URL Structure
```
/api/
├── accounts/
│   ├── auth/register/      [POST]   - User registration
│   ├── auth/login/         [POST]   - JWT token retrieval
│   ├── auth/token/refresh/ [POST]   - Refresh expired token
│   ├── profile/            [GET]    - Current user profile
│   └── profile/            [PUT]    - Update profile
│
├── webinars/
│   ├──                     [GET]    - List all webinars
│   ├──                     [POST]   - Create webinar (admin only)
│   ├── {id}/               [GET]    - Webinar details
│   ├── {id}/               [PUT]    - Update webinar (admin only)
│   └── {id}/               [DELETE] - Delete webinar (admin only)
│
├── registrations/
│   ├── register/           [POST]   - Register for webinar
│   ├── unregister/         [POST]   - Unregister from webinar
│   ├── my-registrations/   [GET]    - User's registrations
│   └──                     [GET]    - All registrations (admin only)
│
├── recordings/
│   ├──                     [GET]    - List recordings
│   ├──                     [POST]   - Upload recording (admin only)
│   ├── {id}/               [GET]    - Recording details
│   └── {id}/               [DELETE] - Delete recording (admin only)
│
└── communications/
    ├── announcements/      [GET]    - List announcements
    ├── announcements/      [POST]   - Create announcement (admin only)
    ├── notifications/      [GET]    - User notifications
    └── chat/               [POST]   - Send chat message
```

### View Implementation

Each Django app's **views.py** implements ViewSets with appropriate:
- **Serializers:** Data validation and transformation (DRF SerializerMethodField for computed fields)
- **Permissions:** Custom permission classes (IsAdminUser, IsStudent)
- **Filtering/Search:** Query parameter support
- **Pagination:** Automatic result pagination

Example (webinars/views.py):
```python
class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        # Only admins can create
        if self.request.user.role != 'admin':
            raise PermissionDenied()
        serializer.save(organizer=self.request.user)
```

### Authentication Flow

The system uses **JWT (JSON Web Tokens)** via djangorestframework-simplejwt:

1. **Registration/Login** (POST /api/accounts/auth/login/):
   ```json
   Response: {
     "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
     "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
   }
   ```

2. **Protected Requests:**
   ```
   Authorization: Bearer {access_token}
   ```

3. **Token Refresh** (POST /api/accounts/auth/token/refresh/):
   - Access token: 60 minutes
   - Refresh token: 10,080 minutes (7 days)

### Serialization & Validation

**Serializers** (in each app's serializers.py) provide:
- Field validation (required fields, format checks)
- Computed fields (e.g., `is_registered` computed from Registration model)
- Nested field support (e.g., event details within registration)
- Method field customization

Example (webinars/serializers.py):
```python
class EventSerializer(serializers.ModelSerializer):
    is_registered = serializers.SerializerMethodField()
    
    def get_is_registered(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return obj.registrations.filter(user=request.user).exists()
```

---

## 4. UI & Frontend Integration

### React Architecture

The frontend is a **Single Page Application (SPA)** built with React + TypeScript, integrated with the backend API via Axios.

#### Component Structure (src/)
```
components/
├── WebinarCard.tsx         # Reusable webinar display component
├── CalendarView.tsx        # Week view calendar for schedule
├── AuthForm.tsx            # Login/registration form
├── ProtectedRoute.tsx      # Route guard for authenticated users
└── ... (other components)

pages/
├── LoginPage.tsx           # Authentication page
├── DashboardPage.tsx       # Main user dashboard
├── WebinarDetailPage.tsx   # Individual webinar details
├── MySchedulePage.tsx      # User's registered events
└── AdminPanel.tsx          # Admin management interface

services/
├── apiClient.ts            # Configured Axios instance with JWT handling
├── authService.ts          # Login, register, token refresh
├── webinarService.ts       # Webinar CRUD operations
└── registrationService.ts  # Registration endpoints

types/
├── User.ts                 # User interface
├── Webinar.ts              # Event interface
├── Registration.ts         # Registration interface
└── ... (other types)
```

#### API Integration

The frontend uses **Axios** for HTTP requests with automatic JWT token handling:

```typescript
// services/apiClient.ts
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Auto-add JWT token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh expired tokens
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Attempt to refresh token
      const refresh = localStorage.getItem('refresh_token');
      // ... token refresh logic
    }
  }
);
```

### Protected Routes & Authentication

React Router protects sensitive routes by checking authentication status:

```typescript
<Route 
  path="/dashboard" 
  element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} 
/>
```

The **ProtectedRoute** component:
- Checks for valid JWT token in localStorage
- Redirects unauthenticated users to login
- Shows loading state while verifying token

### Responsive Design

The frontend uses **Tailwind CSS** for responsive UI:
- Mobile-first approach
- Breakpoints: sm, md, lg, xl
- Flexible grid layouts
- Touch-friendly buttons and inputs
- No external UI frameworks (custom components)

#### Key Pages:
1. **Login/Register:** Simple form, centered layout
2. **Dashboard:** Card grid of available webinars
3. **Webinar Details:** Event info, registration button, sessions
4. **My Schedule:** Week calendar view of registered events
5. **Admin Panel:** Create events, upload recordings, manage users

---

## 5. Project Demonstration Flow

### Demo Scenario: Complete User Journey

#### Step 1: Admin Login & Setup
1. Navigate to http://localhost:5173
2. Login with credentials:
   - Username: `admin`
   - Password: `admin123`
3. Verifies JWT token received and stored in localStorage
4. Redirected to Admin Dashboard

#### Step 2: Create a Webinar
1. Click "Create New Webinar" button
2. Form inputs:
   - Title: "Introduction to Full Stack Development"
   - Description: "Learn web development with Django and React"
   - Date: Select future date
   - Time: Select time (e.g., 2:00 PM)
   - Duration: 90 minutes
   - Price: Optional (can be free)
3. Click "Create"
4. POST request: `POST /api/webinars/`
5. Backend validates data and creates Event
6. Event appears in dashboard list

#### Step 3: Add Sessions to Webinar
1. Click on created webinar
2. Click "Add Session"
3. Input session details:
   - Speaker: "John Smith"
   - Topic: "Backend Development"
   - Start/End time within event timeframe
4. Submit
5. Backend creates Session linked to Event
6. Sessions appear in event details

#### Step 4: Student Registration
1. Logout (clear JWT token)
2. Login with student credentials:
   - Username: `student`
   - Password: `student123`
3. Browse webinar list on dashboard
4. Click "Get Ticket Now" on the webinar created in Step 2
5. Frontend sends: `POST /api/registrations/register/` with event_id
6. Backend creates Registration linking User to Event
7. Button changes to "You're Registered" ✅
8. Event added to "My Schedule" calendar view

#### Step 5: View Personal Schedule
1. Click "My Schedule" tab
2. Calendar displays only registered webinars
3. Each event shows:
   - Title and date/time (formatted from ISO timestamps)
   - Speaker and topic (if sessions added)
   - Duration indicator
4. Frontend filtered events using: `events.filter(e => e.is_registered === true)`

#### Step 6: Access Recording (Post-Event)
1. Admin uploads recording:
   - Click event → "Upload Recording"
   - Select video file
   - POST: `/api/recordings/`
2. Student views recording:
   - Event now shows "Watch Recording" link
   - Click to view or download
   - GET: `/api/recordings/{id}/`

#### Step 7: Receive Announcements
1. Admin creates announcement:
   - POST `/api/communications/announcements/`
2. Student sees notification alert
3. Can view announcement in "Announcements" section

### Key Data Flow Example: Event Registration

```
User clicks "Get Ticket Now"
    ↓
Frontend: POST /api/registrations/register/ {event_id: 1}
    ↓
Backend validates JWT token & user authentication
    ↓
Backend creates Registration(user=current_user, event=event_1)
    ↓
Backend returns 201 Created with registration data
    ↓
Frontend receives success, refetches /api/webinars/
    ↓
GET /api/webinars/ now includes is_registered=true for event_1
    ↓
Frontend updates state: event.isRegistered = true
    ↓
Component re-renders: button changes to "You're Registered"
    ↓
MySchedulePage filters events by isRegistered=true
    ↓
Event appears in calendar view
```

---

## 6. Deployment

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

---

## Development & Testing

### Local Setup Instructions

#### Prerequisites
- **Python:** 3.10 or higher
- **Node.js:** 18 or higher
- **PostgreSQL:** 12 or higher (running locally or via Docker)
- **npm or yarn:** Package managers

#### Backend Setup

1. **Navigate to project directory:**
   ```bash
   cd PFSD-PROJECT
   ```

2. **Create virtual environment:**
   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment (.env file):**
   ```env
   SECRET_KEY=your-secret-key-here
   DEBUG=True
   DB_NAME=webinar_db
   DB_USER=postgres
   DB_PASSWORD=yourpassword
   DB_HOST=localhost
   DB_PORT=5432
   ```

5. **Run migrations:**
   ```bash
   python manage.py migrate
   ```

6. **Generate demo data:**
   ```bash
   python manage.py generate_demo_data
   ```

7. **Start development server:**
   ```bash
   python manage.py runserver
   ```
   Backend available at: **http://localhost:8000**

#### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file (.env.local):**
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```
   Frontend available at: **http://localhost:5173**

#### Access Points
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000/api/
- **Django Admin:** http://localhost:8000/admin/

---

### Backend Deployment: Render

Render provides a managed PostgreSQL database and Python hosting.

#### Step 1: Create PostgreSQL Database
1. Login to [Render Dashboard](https://render.com)
2. Click **"New +"** → **"PostgreSQL"**
3. Configuration:
   - Name: `webinar-db`
   - Database: `webinar_db`
   - User: `postgres`
   - Region: (select your region)
4. Save credentials (shown once)

#### Step 2: Deploy Backend Service
1. Click **"New +"** → **"Web Service"**
2. Connect to GitHub repository
3. Settings:
   - **Name:** `webinar-backend`
   - **Environment:** `Docker` or `Python 3.11`
   - **Region:** Same as database
   - **Build Command:** `bash ./render-build.sh`
   - **Start Command:** `gunicorn webinar_system.wsgi:application --bind 0.0.0.0:$PORT`
4. Add environment variables (see Environment Variables section)
5. Deploy

#### Step 3: Set Environment Variables on Render
```
SECRET_KEY=generate-new-key-in-production
DEBUG=False
ALLOWED_HOSTS=your-app.onrender.com
DB_NAME=webinar_db
DB_USER=postgres
DB_PASSWORD=(from PostgreSQL database)
DB_HOST=(from PostgreSQL database)
DB_PORT=5432
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

#### Status
- Render automatically builds and deploys on git push
- First deployment takes 10-15 minutes
- Logs accessible in Render dashboard

---

### Frontend Deployment: Vercel

Vercel provides optimized hosting for React/Vite applications.

#### Option A: Deploy to Vercel
1. Push code to GitHub
2. Connect GitHub to [Vercel](https://vercel.com)
3. Select repository
4. Settings:
   - **Framework:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Environment Variables:
   ```
   VITE_API_BASE_URL=https://your-app.onrender.com/api
   ```
6. Deploy

#### Option B: Deploy to Netlify
1. Connect GitHub repository
2. Build settings:
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`
3. Deploy hooks configured
4. Environment variables set in Netlify dashboard

#### Continuous Deployment
- Both Vercel and Netlify automatically deploy on git push to main branch
- Preview deployments created for pull requests

---

## Configuration Reference

### Environment Variables

#### Backend (.env)
```bash
# Django
SECRET_KEY=your-secret-key-here
DEBUG=True  # Set to False in production
ALLOWED_HOSTS=localhost,127.0.0.1

# PostgreSQL
DB_NAME=webinar_db
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_HOST=localhost
DB_PORT=5432

# CORS (Frontend Origin)
CORS_ALLOWED_ORIGINS=http://localhost:5173

# JWT Tokens
JWT_ACCESS_TOKEN_LIFETIME=60  # minutes
JWT_REFRESH_TOKEN_LIFETIME=10080  # minutes (7 days)
```

#### Frontend (.env.local - Development)
```bash
VITE_API_BASE_URL=http://localhost:8000/api
```

#### Production Environment (Render)
| Variable | Value | Notes |
|----------|-------|-------|
| `SECRET_KEY` | Generated key | Never commit to git |
| `DEBUG` | `False` | Always False in production |
| `ALLOWED_HOSTS` | `your-app.onrender.com` | Your Render domain |
| `DB_*` | From PostgreSQL | Provided by Render |
| `CORS_ALLOWED_ORIGINS` | `https://your-frontend.vercel.app` | Frontend domain |

---

## API Documentation & Testing

### Complete API Reference

For full API documentation including request/response schemas, see [docs/API_REFERENCE.md](docs/API_REFERENCE.md)


### Testing API Endpoints

#### Using cURL (Command Line)

```bash
# 1. Register new user
curl -X POST http://localhost:8000/api/accounts/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"username":"newuser","email":"user@example.com","password":"pass123"}'

# 2. Login
curl -X POST http://localhost:8000/api/accounts/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"student","password":"student123"}'

# Response: {"access":"TOKEN","refresh":"REFRESH_TOKEN"}

# 3. List webinars (with authentication)
curl -X GET http://localhost:8000/api/webinars/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# 4. Register for webinar
curl -X POST http://localhost:8000/api/registrations/register/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"event":1}'
```

#### Running Automated Tests

```bash
# Run all tests
python manage.py test

# Run specific app tests
python manage.py test accounts
python manage.py test webinars

# Run with verbose output
python manage.py test --verbosity=2
```

---

## Authentication & Security

### JWT Token Flow

The system uses JSON Web Tokens (JWT) for stateless authentication:

1. **Login** → Receive access and refresh tokens
2. **API Requests** → Include access token in Authorization header
3. **Token Expiration** → Use refresh token to get new access token

Token Lifetimes:
- **Access Token:** 60 minutes
- **Refresh Token:** 7 days

### Role-Based Access Control

- **Admin Role:** Can create/update/delete webinars, upload recordings, manage users
- **Student Role:** Can browse webinars, register for events, view recordings
- **Permission Classes:** Custom Django permission classes enforce role restrictions

---

## Important Notes

### CORS Configuration
- **Development:** Frontend (localhost:5173) connects to Backend (localhost:8000)
- **Production:** Update CORS_ALLOWED_ORIGINS with your frontend domain

### Security Best Practices
- Change SECRET_KEY in production (never use default)
- Set DEBUG=False in production environments
- Use strong passwords for admin accounts
- Keep all dependencies updated regularly
- Rotate JWT secrets periodically

### Database & Files
- **PostgreSQL:** Used for all persistent data (both dev and production)
- **Static Files:** Collected and served by WhiteNoise
- **Media Files:** User uploads stored as files (consider cloud storage in prod)

---

## Summary

This project is a complete **full-stack web application** demonstrating:

✅ **Backend Architecture:** Modular Django apps with clean separation of concerns
✅ **Database Design:** PostgreSQL with proper ORM relationships via Django
✅ **REST API:** RESTful endpoints with JWT authentication and role-based access control
✅ **Frontend Architecture:** React + TypeScript with responsive Tailwind CSS design
✅ **API Integration:** Axios with automatic JWT token handling
✅ **Authentication Flow:** Secure JWT-based stateless authentication
✅ **Deployment:** Production-ready configuration for Render and Vercel

The application implements industry-standard practices suitable for academic evaluation and real-world deployment.

---

**Version:** 1.0.0  
**Last Updated:** February 2026  
**Technologies:** Django 6.0 | React 18 | PostgreSQL | JWT Authentication  
**License:** PFSD Course Project

