# Webinar System - React Frontend

A modern React frontend for the Django Webinar Management System.

## Features

- **Authentication**: Login/Register with JWT token handling
- **Webinar Listing**: Browse all available webinars
- **Webinar Details**: View detailed information and register for webinars
- **User Dashboard**: Track registered webinars and available recordings
- **Protected Routes**: Secured pages for authenticated users
- **Responsive Design**: Works on desktop and mobile devices

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Navbar.js
│   │   └── Navbar.module.css
│   ├── pages/
│   │   ├── Login.js
│   │   ├── Login.module.css
│   │   ├── Register.js
│   │   ├── Register.module.css
│   │   ├── Home.js
│   │   ├── Home.module.css
│   │   ├── WebinarDetail.js
│   │   ├── WebinarDetail.module.css
│   │   ├── Dashboard.js
│   │   └── Dashboard.module.css
│   ├── services/
│   │   ├── api.js          (Axios instance with JWT interceptors)
│   │   ├── auth.js         (Authentication service)
│   │   └── webinar.js      (Webinar API calls)
│   ├── context/
│   │   └── AuthContext.js  (Global auth state management)
│   ├── routes/
│   │   └── ProtectedRoute.js
│   ├── App.js
│   ├── App.module.css
│   └── index.js
├── package.json
├── .env.example
└── .gitignore
```

## Prerequisites

- Node.js 14+ and npm
- Django backend running on `http://localhost:8000`

## Setup Instructions

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

Create a `.env.local` file in the frontend directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` and set the API URL (defaults to `http://localhost:8000`):

```
REACT_APP_API_URL=http://localhost:8000
```

### 3. Start the Development Server

```bash
npm start
```

The app will open at `http://localhost:3000`

## Django Backend Setup

The frontend expects the Django backend to provide the following API endpoints:

### Authentication Endpoints

- `POST /api/auth/login/` - Login user
  - Request: `{ "username": "...", "password": "..." }`
  - Response: `{ "access": "token", "refresh": "token", "user": {...} }`

- `POST /api/auth/register/` - Register new user
  - Request: `{ "username": "...", "email": "...", "password": "..." }`

### Webinar Endpoints

- `GET /api/webinars/` - List all webinars
- `GET /api/webinars/<id>/` - Get webinar details
- `POST /api/webinars/<id>/register/` - Register for a webinar (requires auth)

### Recording Endpoints

- `GET /api/recordings/` - List all recordings
- `GET /api/recordings/<id>/` - Get recording details

### CORS Configuration

Add to Django `settings.py`:

```python
INSTALLED_APPS = [
    # ...
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    # ...
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

CORS_ALLOW_CREDENTIALS = True
```

## Authentication Flow

1. **Login/Register**: User submits credentials
2. **Token Storage**: JWT tokens stored in `localStorage`
3. **API Requests**: All requests include `Authorization: Bearer <token>` header
4. **Token Refresh**: On 401 response, user is redirected to login
5. **Protected Routes**: Dashboard requires authentication via `ProtectedRoute` component

## API Service Layer

### `services/api.js`
- Creates Axios instance with base URL
- Automatically adds JWT token to request headers
- Handles 401 errors by redirecting to login

### `services/auth.js`
- `login(username, password)` - Login user and store tokens
- `register(username, email, password)` - Register new user
- `logout()` - Clear tokens from localStorage
- `isAuthenticated()` - Check if user is logged in
- `getUser()` - Get stored user data

### `services/webinar.js`
- `getWebinars()` - Fetch all webinars
- `getWebinar(id)` - Fetch single webinar
- `registerWebinar(id)` - Register for webinar
- `getRecordings()` - Fetch all recordings

## State Management

Uses React Context API for global authentication state:

```javascript
const { user, isAuthenticated, login, logout } = useAuth();
```

## Building for Production

```bash
npm run build
```

This creates an optimized build in the `build/` directory.

## Troubleshooting

### CORS Errors
- Ensure Django has CORS enabled
- Check `CORS_ALLOWED_ORIGINS` includes your frontend URL

### 401 Unauthorized Errors
- Verify JWT tokens are being sent in headers
- Check Django `SIMPLE_JWT` settings

### API Not Found
- Verify Django API endpoints exist
- Check `REACT_APP_API_URL` environment variable

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App (irreversible)

## Technology Stack

- **React 18** - UI framework
- **React Router v6** - Routing
- **Axios** - HTTP client
- **CSS Modules** - Styling
- **Context API** - State management

## Future Enhancements

- Real-time notifications for upcoming webinars
- Search and filter functionality
- User profile management
- Webinar ratings and reviews
- Recording playback with progress tracking
