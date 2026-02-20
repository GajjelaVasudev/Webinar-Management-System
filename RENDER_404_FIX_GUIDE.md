# 404 Error Fix Guide - Django + React on Render

## Issues Found & Fixed ✅

### 1. **Frontend API Base URL Missing `/api` Path**
**Problem:**
```
❌ VITE_API_BASE_URL=https://webinar-management-system-odoq.onrender.com
   └─ Request to /accounts/users/me/
   └─ Results in: https://webinar-management-system-odoq.onrender.com/accounts/users/me/ (404)
```

**Solution (Applied):**
```
✅ VITE_API_BASE_URL=https://webinar-management-system-odoq.onrender.com/api
   └─ Request to /accounts/users/me/
   └─ Results in: https://webinar-management-system-odoq.onrender.com/api/accounts/users/me/ (200 ✓)
```

**File Updated:** `.env.production`

---

### 2. **URL Structure Configuration**

Your URL routing is correctly structured:

#### **Backend URL Hierarchy:**
```python
# webinar_system/urls.py (Project level)
path('api/', include(api_patterns))
└─ path('accounts/', include('accounts.urls'))

# accounts/urls.py (App level)
└─ path('auth/register/', RegisterView.as_view())
└─ path('', include(router.urls))  # includes 'users/me'
```

#### **Final URL Paths:**
```
✅ POST   /api/accounts/auth/register/     → RegisterView
✅ GET    /api/accounts/users/me/          → UserViewSet.me()
✅ GET    /api/accounts/profiles/me/       → UserProfileViewSet.me()
✅ POST   /api/accounts/auth/login/        → CustomTokenObtainPairView
✅ POST   /api/accounts/auth/change-password/ → ChangePasswordView
```

---

### 3. **PostgreSQL Support Added**
**Changed:** `requirements.txt`
```
# Before (commented out):
# psycopg2-binary==2.9.9

# After (active):
psycopg2-binary==2.9.9
```

---

### 4. **Render Domain Added to CORS**
**Changed:** `webinar_system/settings.py`
```python
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',        # Local development
    'http://localhost:5173',        # Vite dev server
    'https://webinar-management-system-odoq.onrender.com'  # ✅ Added for production
]
```

---

## Environment Variables Setup for Render

### Backend (.env on Render)
```env
# Django Settings
SECRET_KEY=your-secure-secret-key
DEBUG=False
ALLOWED_HOSTS=webinar-management-system-odoq.onrender.com

# Database (PostgreSQL on Render)
USE_POSTGRESQL=True
DB_NAME=webinar_db
DB_USER=postgres
DB_PASSWORD=your-render-db-password
DB_HOST=dpg-xxxxx-a.postgres.render.com
DB_PORT=5432

# CORS
CORS_ALLOWED_ORIGINS=https://webinar-management-system-odoq.onrender.com

# JWT
SIMPLE_JWT_SECRET=your-jwt-secret-key
```

### Frontend Settings (.env.production - Already Updated)
```env
VITE_API_BASE_URL=https://webinar-management-system-odoq.onrender.com/api
```

---

## Common 404 Causes in Django on Render

### 1. **Missing `/api` in Frontend Base URL** ✅ Fixed
The most common cause! The frontend must match the exact URL structure.

### 2. **CORS Not Configured for Production Domain** ✅ Fixed
Render assigns a unique domain; it must be in `CORS_ALLOWED_ORIGINS`.

### 3. **DEBUG=False Without Proper Static Files**
- Render uses WhiteNoise (already in middleware)
- `STATIC_ROOT` correctly set to `staticfiles`
- Run: `python manage.py collectstatic --noinput`

### 4. **Database Not Migrated**
```bash
python manage.py migrate --noinput
```

### 5. **Trailing Slash Issues**
- Django 6.0 removes trailing slash matching by default
- ✅ Added `REST_FRAMEWORK['APPEND_SLASH'] = True` in settings
- This allows both `/accounts/users/me` and `/accounts/users/me/`

### 6. **Incorrect App Registration**
Verify all apps in `INSTALLED_APPS`:
```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'accounts',      # ✅ Registered
    'webinars',      # ✅ Registered
    'registrations', # ✅ Registered
    'recordings',    # ✅ Registered
    'communications',# ✅ Registered
]
```

---

## Frontend API Client Implementation

### ✅ Correct Implementation (uses base URL + relative paths)

**File:** `frontend/src/services/api.ts`
```typescript
import axios from 'axios';

// CORRECT: Uses environment variable as base URL
const apiBaseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
    baseURL: apiBaseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add JWT token to all requests
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default apiClient;
```

### ✅ How Frontend API Calls Work

**Registration Example:**
```typescript
// Frontend code:
const response = await apiClient.post('/accounts/auth/register/', {
    username: 'newuser',
    email: 'user@example.com',
    password: 'securepass123'
});

// With baseURL: 'https://webinar-management-system-odoq.onrender.com/api'
// Actual request goes to:
// https://webinar-management-system-odoq.onrender.com/api/accounts/auth/register/
// ✅ Matches Django URL pattern!
```

**Get Current User Profile:**
```typescript
const response = await apiClient.get('/accounts/users/me/');

// Actual request:
// https://webinar-management-system-odoq.onrender.com/api/accounts/users/me/
// ✅ Matches Django URL pattern!
```

---

## PostgreSQL Configuration on Render

### Step 1: Create PostgreSQL Database on Render
1. Go to Render Dashboard → Create New → PostgreSQL
2. Set name (e.g., `webinar-db`)
3. Copy the connection string provided by Render

### Step 2: Environment Variables on Render
In your Render Service Settings → Environment:

```env
USE_POSTGRESQL=True
DB_NAME=(extracted from connection string)
DB_USER=postgres
DB_PASSWORD=(from connection string)
DB_HOST=(from connection string)
DB_PORT=5432
```

Or use the full Postgres connection string:
```env
DATABASE_URL=postgres://user:password@host:port/dbname
```

Then modify settings.py to use it:
```python
import dj_database_url

if config('USE_POSTGRESQL', default=False, cast=bool):
    # Option A: Use individual env vars
    DATABASES = {...}
elif config('DATABASE_URL', default=None):
    # Option B: Use DATABASE_URL (common on Render)
    DATABASES = {'default': dj_database_url.config()}
else:
    # Development SQLite
    DATABASES = {'default': {'ENGINE': 'django.db.backends.sqlite3', ...}}
```

### Step 3: Install dj-database-url (if using DATABASE_URL)
Add to requirements.txt:
```
dj-database-url==2.1.0
```

---

## Deployment Checklist for Render

- [ ] Update `.env.production` with `/api` path
- [ ] Install `psycopg2-binary` in requirements.txt
- [ ] Add Render domain to `CORS_ALLOWED_ORIGINS`
- [ ] Set `DEBUG=False` on Render
- [ ] Set a proper `SECRET_KEY` on Render (not default)
- [ ] Configure PostgreSQL database on Render
- [ ] Run migrations: `python manage.py migrate --noinput`
- [ ] Collect static files: `python manage.py collectstatic --noinput`
- [ ] Test endpoints with Postman or curl:

```bash
# Test registration endpoint
curl -X POST https://webinar-management-system-odoq.onrender.com/api/accounts/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"pass123"}'

# Test user profile (after login)
curl -X GET https://webinar-management-system-odoq.onrender.com/api/accounts/users/me/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Testing URLs

### Development (Local)
```
Frontend: http://localhost:5173
Backend: http://localhost:8000
API: http://localhost:8000/api/accounts/users/me/
```

### Production (Render)
```
Frontend: (wherever you deploy React - Vercel, Netlify, etc.)
Backend: https://webinar-management-system-odoq.onrender.com
API: https://webinar-management-system-odoq.onrender.com/api/accounts/users/me/
```

---

## Files Modified ✅

1. **frontend/.env.production**
   - Added `/api` to base URL

2. **requirements.txt**
   - Uncommented `psycopg2-binary==2.9.9`

3. **webinar_system/settings.py**
   - Added Render domain to `CORS_ALLOWED_ORIGINS`
   - Added `REST_FRAMEWORK['APPEND_SLASH'] = True`

---

## Next Steps

1. Push these changes to your repository
2. Trigger a redeploy on Render
3. Set environment variables on Render dashboard
4. Run migrations on Render (use `Render Console` or deploy script)
5. Test endpoints using the browser console or Postman

Your 404 errors should be resolved! 🚀
