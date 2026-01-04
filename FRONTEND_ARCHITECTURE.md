# Frontend Architecture & API Integration Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     React Frontend (Port 3000)              │
├─────────────────────────────────────────────────────────────┤
│                         Router (Routes)                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ /login        → Login Page                           │  │
│  │ /register     → Register Page                        │  │
│  │ /            → Home (Webinars List)                  │  │
│  │ /webinar/:id → Webinar Detail                        │  │
│  │ /dashboard   → User Dashboard (Protected)            │  │
│  │ /recordings  → Recordings (Protected)                │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Context API (AuthContext)                    │  │
│  │  - user state                                         │  │
│  │  - isAuthenticated                                    │  │
│  │  - login/register/logout functions                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         API Service Layer                            │  │
│  │  ┌─────────────────────────────────────────────┐    │  │
│  │  │ api.js (Axios Instance)                    │    │  │
│  │  │ - Base URL configuration                   │    │  │
│  │  │ - JWT token injection (interceptor)        │    │  │
│  │  │ - 401 error handling                       │    │  │
│  │  └─────────────────────────────────────────────┘    │  │
│  │  ┌─────────────────────────────────────────────┐    │  │
│  │  │ auth.js (Auth Service)                     │    │  │
│  │  │ - login(), register(), logout()            │    │  │
│  │  │ - Token management (localStorage)          │    │  │
│  │  └─────────────────────────────────────────────┘    │  │
│  │  ┌─────────────────────────────────────────────┐    │  │
│  │  │ webinar.js (Webinar Service)               │    │  │
│  │  │ - getWebinars(), getWebinar()              │    │  │
│  │  │ - registerWebinar()                        │    │  │
│  │  │ - getRecordings()                          │    │  │
│  │  └─────────────────────────────────────────────┘    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            ↓ (HTTP/REST)
┌─────────────────────────────────────────────────────────────┐
│               Django Backend (Port 8000)                    │
├─────────────────────────────────────────────────────────────┤
│                  REST API Endpoints                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ POST   /api/auth/login/      → Token + User         │  │
│  │ POST   /api/auth/register/   → User Created         │  │
│  │ POST   /api/auth/refresh/    → New Token            │  │
│  │ GET    /api/webinars/        → List Webinars        │  │
│  │ GET    /api/webinars/<id>/   → Webinar Details      │  │
│  │ POST   /api/webinars/<id>/register/ → Register User │  │
│  │ GET    /api/recordings/      → List Recordings      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Views (ViewSets/APIViews)                    │  │
│  │  - EventViewSet (Webinar CRUD + register action)    │  │
│  │  - CustomTokenObtainPairView (Login)                 │  │
│  │  - RegisterView (Registration)                       │  │
│  │  - RecordingViewSet (Read-only)                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Serializers                                  │  │
│  │  - UserSerializer                                    │  │
│  │  - EventSerializer                                   │  │
│  │  - EventDetailSerializer                             │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Models                                       │  │
│  │  - User (Django built-in)                            │  │
│  │  - Event (Webinar)                                   │  │
│  │  - Registration (User-Event relationship)            │  │
│  │  - Recording                                         │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Database (SQLite/PostgreSQL)                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow Examples

### 1. Login Flow

```
User enters credentials
        ↓
Login Page (Login.js)
        ↓
useAuth().login(username, password)
        ↓
authService.login()
        ↓
apiClient.post('/auth/login/', {...})  [axios]
        ↓
Django: POST /api/auth/login/
        ↓
CustomTokenObtainPairView
        ↓
Validates credentials
        ↓
Returns: { access: token, refresh: token, user: {...} }
        ↓
Frontend: Stores tokens in localStorage
        ↓
Updates AuthContext (user, isAuthenticated)
        ↓
Redirects to Home
```

### 2. Viewing Webinars

```
Home Page loads (Home.js)
        ↓
useEffect hook triggers
        ↓
webinarService.getWebinars()
        ↓
apiClient.get('/webinars/')
        ↓
Request interceptor adds: Authorization: Bearer {token}
        ↓
Django: GET /api/webinars/
        ↓
EventViewSet.list()
        ↓
Returns: [{id, title, description, ...}, ...]
        ↓
Frontend: Display webinars in grid
```

### 3. Registering for Webinar

```
Webinar Detail page (WebinarDetail.js)
        ↓
User clicks "Register Now"
        ↓
Check isAuthenticated (redirect to login if not)
        ↓
webinarService.registerWebinar(webinarId)
        ↓
apiClient.post(`/webinars/${id}/register/`)
        ↓
Request interceptor adds JWT token
        ↓
Django: POST /api/webinars/{id}/register/
        ↓
EventViewSet.register() action
        ↓
Check if user already registered (400 if duplicate)
        ↓
Create Registration record
        ↓
Returns: { detail: 'Successfully registered' }
        ↓
Frontend: Show success message
```

## API Response Examples

### Login Response
```json
{
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "user": {
        "id": 1,
        "username": "john_doe",
        "email": "john@example.com",
        "first_name": "John",
        "last_name": "Doe"
    }
}
```

### Webinars List Response
```json
[
    {
        "id": 1,
        "title": "React Fundamentals",
        "description": "Learn React basics",
        "speaker": "John Doe",
        "start_time": "2026-01-15T10:00:00Z",
        "end_time": "2026-01-15T12:00:00Z",
        "created_at": "2026-01-05T10:00:00Z"
    },
    {
        "id": 2,
        "title": "Advanced React Patterns",
        "description": "Master React design patterns",
        "speaker": "Jane Smith",
        "start_time": "2026-01-22T14:00:00Z",
        "end_time": "2026-01-22T16:00:00Z",
        "created_at": "2026-01-05T10:00:00Z"
    }
]
```

### Webinar Detail Response
```json
{
    "id": 1,
    "title": "React Fundamentals",
    "description": "Learn React basics",
    "speaker": "John Doe",
    "content": "Detailed content about React...",
    "start_time": "2026-01-15T10:00:00Z",
    "end_time": "2026-01-15T12:00:00Z",
    "attendees_count": 45,
    "created_at": "2026-01-05T10:00:00Z"
}
```

## Authentication Flow

### JWT Token Lifecycle

1. **Obtain Token** (Login)
   ```
   POST /api/auth/login/
   → Returns: access_token (1 hour), refresh_token (7 days)
   ```

2. **Store Tokens** (localStorage)
   ```javascript
   localStorage.setItem('access_token', token);
   localStorage.setItem('refresh_token', token);
   ```

3. **Use Token** (Every API Request)
   ```javascript
   // Axios interceptor automatically adds:
   Authorization: Bearer {access_token}
   ```

4. **Token Expires** (1 hour)
   ```
   API returns 401 Unauthorized
   → apiClient interceptor catches error
   → Clears tokens and redirects to /login
   ```

5. **Optional: Refresh Token**
   ```
   POST /api/auth/refresh/
   → Requires: refresh_token
   → Returns: New access_token
   ```

## State Management

### AuthContext Structure

```javascript
{
    user: {
        id: number,
        username: string,
        email: string,
        first_name: string,
        last_name: string
    },
    isAuthenticated: boolean,
    loading: boolean,
    login: (username: string, password: string) => Promise,
    register: (username: string, email: string, password: string) => Promise,
    logout: () => void
}
```

### How to Use AuthContext

```javascript
import { useAuth } from '../context/AuthContext';

function MyComponent() {
    const { user, isAuthenticated, login, logout } = useAuth();
    
    // Access authentication state
    if (isAuthenticated) {
        return <div>Welcome, {user.username}!</div>;
    }
    
    // Call authentication functions
    await login(username, password);
    logout();
}
```

## API Service Architecture

### Axios Interceptors

```javascript
// Request Interceptor
→ Add Authorization header with JWT token
→ Include token in all API calls

// Response Interceptor
→ If status 401 (Unauthorized):
  - Clear tokens from localStorage
  - Redirect to /login
→ Otherwise, return response normally
```

### Service Layer Pattern

```
Component
    ↓
useAuth() / useState / Custom Hook
    ↓
Service Function (auth.js, webinar.js)
    ↓
apiClient (Axios instance)
    ↓
Interceptors (Add token, handle errors)
    ↓
HTTP Request
    ↓
Django Backend
```

## Error Handling

### Frontend Error Handling

```javascript
try {
    await login(username, password);
    navigate('/');
} catch (error) {
    // error.response?.status = 401 (Invalid credentials)
    // error.response?.status = 400 (Bad request)
    // error.response?.data?.detail = Error message from backend
    setError(error.response?.data?.detail || 'An error occurred');
}
```

### Backend Error Responses

```json
// 400 Bad Request
{
    "error": "Username already exists"
}

// 401 Unauthorized
{
    "detail": "Invalid credentials"
}

// 404 Not Found
{
    "detail": "Not found"
}
```

## Component Structure

### Page Components
- **Login** - Form with username/password
- **Register** - Form with username/email/password
- **Home** - Grid of webinars
- **WebinarDetail** - Full webinar info + register button
- **Dashboard** - User stats + registered webinars + recordings

### UI Components
- **Navbar** - Navigation + logout button

### Route Components
- **ProtectedRoute** - Wrapper for authenticated pages

## Key Features

1. **JWT Authentication**
   - Tokens stored in localStorage
   - Automatically included in all requests
   - Auto-logout on token expiration

2. **Protected Routes**
   - Dashboard only accessible to authenticated users
   - ProtectedRoute wrapper component
   - Automatic redirect to login if not authenticated

3. **Error Handling**
   - Try-catch blocks in all async operations
   - User-friendly error messages
   - Axios interceptor for global error handling

4. **Responsive Design**
   - CSS Modules for scoped styling
   - Mobile-first approach
   - Flexbox and Grid layouts

5. **Clean Architecture**
   - Separation of concerns
   - Reusable service functions
   - Context API for global state
   - Clear folder structure
