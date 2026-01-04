# Quick Start Guide: React + Django Webinar System

## Overview

This guide helps you get both the React frontend and Django backend running together.

## Project Structure

```
PFSD-PROJECT/
├── frontend/                    (React app - separate)
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── README.md
├── events/                      (Django app)
│   ├── models.py
│   ├── views.py               (Update with API views)
│   ├── urls.py                (Update with API routes)
│   └── serializers.py         (Create - see Django setup)
├── webinar_system/            (Django project settings)
├── manage.py
└── DJANGO_BACKEND_SETUP.md    (Backend configuration guide)
```

## Step 1: Django Backend Setup

### 1.1 Install Backend Dependencies

```bash
cd PFSD-PROJECT
pip install djangorestframework djangorestframework-simplejwt django-cors-headers
```

### 1.2 Update Django Settings

Follow instructions in `DJANGO_BACKEND_SETUP.md`:
- Add installed apps
- Configure REST framework
- Set up CORS
- Configure JWT

### 1.3 Create API Views and Serializers

Create `events/serializers.py` and update `events/views.py` with the code from `DJANGO_BACKEND_SETUP.md`.

### 1.4 Update URL Configuration

Update `webinar_system/urls.py` with API routes (see `DJANGO_BACKEND_SETUP.md`).

### 1.5 Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 1.6 Create a Test User

```bash
python manage.py createsuperuser
# Follow prompts to create admin user
```

### 1.7 Start Django Server

```bash
python manage.py runserver
# Django will run on http://localhost:8000
```

## Step 2: React Frontend Setup

### 2.1 Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 2.2 Configure Environment

```bash
# Create .env.local from example
cp .env.example .env.local

# Edit .env.local (default values should work)
# REACT_APP_API_URL=http://localhost:8000
```

### 2.3 Start Development Server

```bash
npm start
# React will open automatically at http://localhost:3000
```

## Step 3: Test the Application

### 3.1 Register a New Account

1. Go to http://localhost:3000/register
2. Create an account with username, email, and password
3. Click "Register"
4. You'll be redirected to login page

### 3.2 Login

1. Go to http://localhost:3000/login
2. Enter your credentials
3. You'll be logged in and redirected to home page

### 3.3 Create Test Webinars

Using Django admin or create them via API:

```bash
curl -X POST http://localhost:8000/api/webinars/ \
  -H "Content-Type: application/json" \
  -d '{
    "title": "React Basics",
    "description": "Learn React fundamentals",
    "speaker": "John Doe",
    "start_time": "2026-01-15T10:00:00Z",
    "end_time": "2026-01-15T12:00:00Z"
  }'
```

Or use Django admin:
1. Go to http://localhost:8000/admin
2. Login with superuser credentials
3. Add webinars to the Event model

### 3.4 Test Functionality

- **Home Page**: View all webinars
- **Webinar Details**: Click on a webinar to see full details
- **Register**: Click "Register Now" to register for a webinar
- **Dashboard**: View your registered webinars and recordings
- **Logout**: Log out and verify you're redirected to login

## Troubleshooting

### React Can't Connect to Django

**Error**: Network error or CORS error

**Solution**:
- Verify Django is running on `http://localhost:8000`
- Check `REACT_APP_API_URL` in `.env.local`
- Verify `CORS_ALLOWED_ORIGINS` includes `http://localhost:3000`

```python
# In Django settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
```

### Login Not Working

**Error**: 401 Unauthorized or "Invalid credentials"

**Solution**:
- Verify user exists in Django admin
- Check JWT is configured in Django settings
- Verify `SIMPLE_JWT` settings are correct

### Webinars Not Showing

**Error**: 404 or empty list

**Solution**:
- Create webinars via Django admin or API
- Check webinar dates (future dates work best)
- Verify API endpoint: GET `http://localhost:8000/api/webinars/`

### Port Already in Use

**For React (port 3000)**:
```bash
# On Windows PowerShell
$env:PORT=3001; npm start

# Or kill the process
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**For Django (port 8000)**:
```bash
python manage.py runserver 8001
# Update REACT_APP_API_URL in .env.local
```

## File Checklist

### Frontend Files Created ✓
- [x] `frontend/package.json`
- [x] `frontend/public/index.html`
- [x] `frontend/src/App.js`
- [x] `frontend/src/index.js`
- [x] `frontend/src/services/api.js`
- [x] `frontend/src/services/auth.js`
- [x] `frontend/src/services/webinar.js`
- [x] `frontend/src/context/AuthContext.js`
- [x] `frontend/src/routes/ProtectedRoute.js`
- [x] `frontend/src/components/Navbar.js`
- [x] `frontend/src/pages/Login.js`
- [x] `frontend/src/pages/Register.js`
- [x] `frontend/src/pages/Home.js`
- [x] `frontend/src/pages/WebinarDetail.js`
- [x] `frontend/src/pages/Dashboard.js`
- [x] `frontend/README.md`

### Backend Files to Create/Update
- [ ] `events/serializers.py` (Create)
- [ ] `events/views.py` (Update with API views)
- [ ] `events/urls.py` (Update - may not need changes)
- [ ] `webinar_system/settings.py` (Update)
- [ ] `webinar_system/urls.py` (Update with API routes)
- [ ] `events/models.py` (Verify/Update)

## Next Steps

1. **Add More Features**:
   - Search and filter webinars
   - User profile page
   - Webinar ratings/reviews
   - Email notifications

2. **Security Improvements**:
   - Implement password reset
   - Add 2FA
   - Rate limiting on API

3. **Deployment**:
   - Build React: `npm run build`
   - Deploy to Vercel/Netlify (frontend)
   - Deploy Django to Heroku/AWS (backend)
   - Configure production CORS and JWT settings

## Resources

- [React Documentation](https://react.dev)
- [Django REST Framework](https://www.django-rest-framework.org)
- [Django Simple JWT](https://django-rest-framework-simplejwt.readthedocs.io)
- [React Router](https://reactrouter.com)
- [Axios Documentation](https://axios-http.com)

## Getting Help

- Check frontend `README.md` for React-specific issues
- Check `DJANGO_BACKEND_SETUP.md` for backend configuration
- Review browser console for React errors
- Review Django terminal for backend errors
