# Complete Project Structure

## Full Project Layout

```
PFSD-PROJECT/
│
├── frontend/                              (🆕 NEW - React Frontend)
│   ├── node_modules/                     (Created after npm install)
│   │
│   ├── public/
│   │   └── index.html                    (HTML entry point)
│   │
│   ├── src/
│   │   ├── components/                   (Reusable UI components)
│   │   │   ├── Navbar.js                 (Navigation bar)
│   │   │   └── Navbar.module.css
│   │   │
│   │   ├── pages/                        (Full page components)
│   │   │   ├── Login.js                  (User login)
│   │   │   ├── Login.module.css
│   │   │   ├── Register.js               (User registration)
│   │   │   ├── Register.module.css
│   │   │   ├── Home.js                   (Webinars listing)
│   │   │   ├── Home.module.css
│   │   │   ├── WebinarDetail.js          (Single webinar view)
│   │   │   ├── WebinarDetail.module.css
│   │   │   ├── Dashboard.js              (User dashboard)
│   │   │   └── Dashboard.module.css
│   │   │
│   │   ├── services/                     (API communication)
│   │   │   ├── api.js                    (Axios instance + interceptors)
│   │   │   ├── auth.js                   (Auth API calls)
│   │   │   └── webinar.js                (Webinar API calls)
│   │   │
│   │   ├── context/                      (Global state)
│   │   │   └── AuthContext.js            (Auth state + useAuth hook)
│   │   │
│   │   ├── routes/                       (Route wrappers)
│   │   │   └── ProtectedRoute.js         (Protected route component)
│   │   │
│   │   ├── App.js                        (Main app component + routing)
│   │   ├── App.module.css
│   │   └── index.js                      (React entry point)
│   │
│   ├── package.json                      (Dependencies: react, axios, etc.)
│   ├── .env.example                      (Environment template)
│   ├── .gitignore                        (Git ignore rules)
│   └── README.md                         (Frontend documentation)
│
│
├── events/                                (Existing Django App)
│   ├── migrations/
│   │   ├── __init__.py
│   │   └── 0001_initial.py
│   │
│   ├── templates/
│   │   └── events/
│   │       ├── event_list.html           (Do NOT modify)
│   │       └── recordings.html           (Do NOT modify)
│   │
│   ├── __init__.py
│   ├── admin.py                          (Existing)
│   ├── apps.py                           (Existing)
│   ├── models.py                         (Verify/update models)
│   ├── tests.py                          (Existing)
│   ├── urls.py                           (May need updates)
│   ├── views.py                          (UPDATE - Add API views)
│   ├── serializers.py                    (🆕 CREATE - API serializers)
│   └── __pycache__/
│
│
├── webinar_system/                        (Django Project Settings)
│   ├── __init__.py
│   ├── asgi.py                           (Async support)
│   ├── settings.py                       (UPDATE - Add REST config)
│   ├── urls.py                           (UPDATE - Add API routes)
│   ├── wsgi.py                           (WSGI config)
│   └── __pycache__/
│
│
├── db.sqlite3                             (SQLite database)
├── manage.py                              (Django management script)
│
│
├── README.md                              (Original project README)
├── IMPLEMENTATION_SUMMARY.md              (🆕 What was implemented)
├── FRONTEND_SETUP.md                      (🆕 Quick start guide)
├── DJANGO_BACKEND_SETUP.md                (🆕 Backend configuration)
├── FRONTEND_ARCHITECTURE.md               (🆕 Architecture details)
└── COMPLETE_PROJECT_STRUCTURE.md          (This file)
```

## File Descriptions

### Frontend Files (frontend/)

#### Entry Points
- **public/index.html** - HTML container for React app
- **src/index.js** - React DOM render entry point
- **src/App.js** - Main app component with routing configuration

#### Components (src/components/)
- **Navbar.js** - Top navigation bar with auth-dependent menu
  - Shows Login/Register links when logged out
  - Shows user profile and Dashboard/Logout when logged in

#### Pages (src/pages/)
- **Login.js** - Login form with username/password
  - Calls `useAuth().login()`
  - Stores JWT tokens in localStorage
  - Redirects to home on success

- **Register.js** - Registration form with validation
  - Calls `useAuth().register()`
  - Password confirmation check
  - Redirects to login on success

- **Home.js** - Displays all available webinars
  - Fetches from `webinarService.getWebinars()`
  - Shows webinar cards with basic info
  - Links to webinar details page

- **WebinarDetail.js** - Full webinar information
  - Fetches single webinar via `webinarService.getWebinar(id)`
  - Registration button for authenticated users
  - Shows speaker info and detailed content

- **Dashboard.js** - User profile and statistics
  - Shows username and welcome message
  - Displays registered webinars
  - Shows available recordings
  - Protected route (requires authentication)

#### Services (src/services/)
- **api.js** - Axios instance configuration
  - Base URL: `http://localhost:8000/api`
  - Request interceptor: Adds JWT token to headers
  - Response interceptor: Handles 401 errors

- **auth.js** - Authentication service functions
  - `login(username, password)` - Post to /auth/login/
  - `register(username, email, password)` - Post to /auth/register/
  - `logout()` - Clear localStorage
  - `getUser()` - Retrieve stored user data
  - `getToken()` - Get JWT token from localStorage

- **webinar.js** - Webinar API service
  - `getWebinars()` - GET /webinars/
  - `getWebinar(id)` - GET /webinars/{id}/
  - `registerWebinar(id)` - POST /webinars/{id}/register/
  - `getRecordings()` - GET /recordings/

#### State Management (src/context/)
- **AuthContext.js** - Global authentication state
  - Provides `AuthProvider` wrapper component
  - Exports `useAuth()` custom hook
  - Manages: user, isAuthenticated, loading
  - Functions: login(), register(), logout()

#### Routes (src/routes/)
- **ProtectedRoute.js** - Route wrapper for auth-required pages
  - Checks `isAuthenticated`
  - Redirects to login if not authenticated
  - Shows loading while checking auth state

#### Configuration
- **package.json** - NPM dependencies and scripts
  - Dependencies: react, react-router-dom, axios
  - Scripts: start, build, test
  
- **.env.example** - Environment variable template
  - `REACT_APP_API_URL` - Backend API base URL

- **.gitignore** - Files to ignore in git
  - node_modules, build, .env.local

#### Documentation
- **README.md** - Frontend documentation
  - Setup instructions
  - Features overview
  - API configuration
  - Troubleshooting

### Django Files (events/ and webinar_system/)

#### Files to CREATE
- **events/serializers.py** - DRF Serializers
  - UserSerializer
  - EventSerializer
  - EventDetailSerializer
  - RegisterSerializer

#### Files to UPDATE
- **events/views.py** - Add REST API views
  - CustomTokenObtainPairView - Login endpoint
  - RegisterView - Registration endpoint
  - EventViewSet - Webinar CRUD + register action
  - RecordingViewSet - Recording read-only endpoint

- **webinar_system/settings.py** - Configure Django
  - Add installed apps (rest_framework, corsheaders, etc.)
  - Configure REST_FRAMEWORK settings
  - Configure SIMPLE_JWT settings
  - Add CORS_ALLOWED_ORIGINS

- **webinar_system/urls.py** - Add API routes
  - /api/auth/login/ - Token endpoint
  - /api/auth/register/ - Registration endpoint
  - /api/webinars/ - Webinar list/create
  - /api/webinars/<id>/ - Webinar detail/update/delete
  - /api/webinars/<id>/register/ - Register action
  - /api/recordings/ - Recording list

- **events/models.py** - Verify models exist
  - User (Django built-in)
  - Event/Webinar model
  - Registration model
  - Recording model (optional)

#### Files NOT to modify
- Django templates in events/templates/
- Existing admin.py, apps.py, tests.py

### Documentation Files

- **IMPLEMENTATION_SUMMARY.md** - Overview of what was created
- **FRONTEND_SETUP.md** - Quick start guide
- **DJANGO_BACKEND_SETUP.md** - Backend API setup instructions
- **FRONTEND_ARCHITECTURE.md** - Detailed architecture explanation

## API Endpoints Map

```
Django Backend (Port 8000)
│
├── POST   /api/auth/login/              → Login + get tokens
├── POST   /api/auth/register/           → Create new user
├── POST   /api/auth/refresh/            → Refresh JWT token
│
├── GET    /api/webinars/                → List all webinars
├── POST   /api/webinars/                → Create webinar (admin)
├── GET    /api/webinars/<id>/           → Get webinar details
├── PUT    /api/webinars/<id>/           → Update webinar (admin)
├── DELETE /api/webinars/<id>/           → Delete webinar (admin)
├── POST   /api/webinars/<id>/register/  → Register for webinar
│
├── GET    /api/recordings/              → List recordings
└── GET    /api/recordings/<id>/         → Get recording details

React Frontend (Port 3000)
│
├── /                    → Home (webinar listing)
├── /login               → Login page
├── /register            → Registration page
├── /webinar/<id>        → Webinar details
├── /dashboard           → User dashboard (protected)
└── /recordings          → Recordings page (protected)
```

## Data Flow

```
User Action                Frontend Component          Service Layer           Django API
───────────────────────────────────────────────────────────────────────────────────────

Register                   Register.js                 auth.js                 POST /auth/register/
                           ↓                           ↓
                           useAuth().register()        authService.register()
                           ↓                           ↓
                           navigate('/login')          apiClient.post()

Login                      Login.js                    auth.js                 POST /auth/login/
                           ↓                           ↓
                           useAuth().login()           authService.login()
                           ↓                           ↓
                           localStorage.setItem()      apiClient.post()
                           ↓
                           navigate('/')

View Webinars              Home.js                     webinar.js              GET /webinars/
                           ↓                           ↓
                           useEffect()                 webinarService.getWebinars()
                           ↓                           ↓
                           setState()                  apiClient.get()

View Details               WebinarDetail.js            webinar.js              GET /webinars/<id>/
                           ↓                           ↓
                           useParams()                 webinarService.getWebinar(id)
                           ↓                           ↓
                           useEffect()                 apiClient.get()

Register Webinar           WebinarDetail.js            webinar.js              POST /webinars/<id>/register/
                           ↓                           ↓
                           handleRegister()            webinarService.registerWebinar(id)
                           ↓                           ↓
                           setRegistered()             apiClient.post()

View Dashboard             Dashboard.js                webinar.js              GET /webinars/ + /recordings/
                           ↓                           ↓
                           ProtectedRoute              webinarService.*()
                           ↓                           ↓
                           useEffect()                 apiClient.get()

Logout                     Navbar.js                   auth.js                 localStorage.clear()
                           ↓                           ↓
                           handleLogout()              authService.logout()
                           ↓                           ↓
                           navigate('/login')          localStorage.removeItem()
```

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend UI** | React 18 | Component-based UI |
| **Routing** | React Router v6 | Client-side routing |
| **HTTP** | Axios | API requests with interceptors |
| **Styling** | CSS Modules | Scoped styling |
| **State** | Context API | Global authentication state |
| **Backend** | Django + DRF | REST API server |
| **Auth** | Django Simple JWT | JWT token authentication |
| **CORS** | django-cors-headers | Cross-origin requests |
| **Database** | SQLite | Default (or PostgreSQL) |

## Environment Setup

### Frontend (.env.local)
```
REACT_APP_API_URL=http://localhost:8000
```

### Django (settings.py)
```python
INSTALLED_APPS += ['rest_framework', 'corsheaders', 'rest_framework_simplejwt']

CORS_ALLOWED_ORIGINS = ["http://localhost:3000"]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}
```

## Key Concepts Implemented

1. **Separation of Concerns**
   - Frontend (React) - UI and user interactions
   - Backend (Django) - Data and business logic
   - API Layer - Communication between frontend and backend

2. **Protected Routes**
   - ProtectedRoute component wraps pages requiring authentication
   - Checks AuthContext state
   - Redirects to login if not authenticated

3. **JWT Authentication**
   - Tokens stored in browser localStorage
   - Tokens included in all API requests via interceptors
   - Automatic logout on token expiration (401 response)

4. **Service Layer**
   - Centralized API calls (api.js, auth.js, webinar.js)
   - Reusable functions for components
   - Consistent error handling

5. **Global State**
   - AuthContext provides auth state to entire app
   - useAuth hook for easy access
   - Automatic persistence via localStorage

## What's Left to Do

1. **Create Django Serializers** (events/serializers.py)
2. **Add API Views** (update events/views.py)
3. **Update Django Settings** (webinar_system/settings.py)
4. **Update Django URLs** (webinar_system/urls.py)
5. **Create Test Data** (webinars in database)
6. **Run Both Servers**
   - Django: `python manage.py runserver`
   - React: `npm start` (in frontend/)

## Quick Commands

```bash
# Frontend setup
cd frontend
npm install
npm start              # Starts on http://localhost:3000

# Backend setup
cd ..
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver  # Starts on http://localhost:8000
```

That's it! You have a complete React frontend ready to integrate with your Django backend.
