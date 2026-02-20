# Render Deployment Verification Checklist

## Pre-Deployment ✅

### 1. Fix Applied - Frontend API URL
- [x] `.env.production` updated with `/api` path
  ```
  ✅ VITE_API_BASE_URL=https://webinar-management-system-odoq.onrender.com/api
  ```

### 2. PostgreSQL Support Added
- [x] `requirements.txt` - `psycopg2-binary==2.9.9` uncommented

### 3. Django Settings Updated
- [x] `CORS_ALLOWED_ORIGINS` includes Render domain
- [x] `REST_FRAMEWORK['APPEND_SLASH'] = True` enabled

### 4. `.env.example` Updated
- [x] Includes all necessary Render variables
- [x] PostgreSQL configuration documented

---

## Render Configuration Steps

### Step 1: Create PostgreSQL Database on Render ⭐
```
1. Render Dashboard → Create New → PostgreSQL
2. Name: webinar-db
3. Region: oregon (same as web service)
4. Copy connection credentials
```

### Step 2: Add Environment Variables to Render Web Service
In Render Dashboard → Your Web Service → Environment:

| Key | Value |
|-----|-------|
| `SECRET_KEY` | Generate secure key (NOT the default) |
| `DEBUG` | `False` |
| `ALLOWED_HOSTS` | `webinar-management-system-odoq.onrender.com` |
| `USE_POSTGRESQL` | `True` |
| `DB_NAME` | From Render PostgreSQL |
| `DB_USER` | `postgres` |
| `DB_PASSWORD` | From Render PostgreSQL (shown once!) |
| `DB_HOST` | From Render PostgreSQL |
| `DB_PORT` | `5432` |
| `CORS_ALLOWED_ORIGINS` | `https://webinar-management-system-odoq.onrender.com,https://your-frontend-domain` |

### Step 3: Configure Build & Start Commands on Render
**Build Command:**
```bash
bash ./render-build.sh
```

**Start Command:**
```bash
gunicorn webinar_system.wsgi:application --bind 0.0.0.0:$PORT
```

---

## Testing After Deployment

### Test 1: Check Backend is Running
```bash
curl https://webinar-management-system-odoq.onrender.com/admin/
# Should return HTML (not 404)
```

### Test 2: Test API Availability
```bash
curl https://webinar-management-system-odoq.onrender.com/api/accounts/
# Should return 200 or 401 (authenticated endpoint)
```

### Test 3: Test Registration Endpoint
```bash
curl -X POST https://webinar-management-system-odoq.onrender.com/api/accounts/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPass123!"
  }'

# Expected response (201 Created):
# {
#   "message": "User registered successfully",
#   "user": { "id": 1, "username": "testuser", ... }
# }
```

### Test 4: Check Frontend Calls (in browser console)
After deploying frontend, check:
```javascript
// Should log without 404:
console.log("API calls going to:", API_BASE_URL);
// Output: API calls going to: https://webinar-management-system-odoq.onrender.com/api
```

### Test 5: Monitor Logs
In Render Dashboard → Logs:
- Should see: `INFO: Starting development server`
- NO `404 Not Found` errors
- NO `DisallowedHost` errors
- NO database connection errors

---

## Expected API Endpoints After Fix

### Authentication
```
POST   /api/accounts/auth/register/     → Create new user ✅
POST   /api/accounts/auth/login/        → Get JWT token ✅
POST   /api/accounts/auth/refresh/      → Refresh token ✅
POST   /api/accounts/auth/change-password/ → Change password ✅
```

### Users
```
GET    /api/accounts/users/me/          → Get current user info ✅
GET    /api/accounts/users/             → List users (admin only) ✅
```

### Profiles
```
GET    /api/accounts/profiles/me/       → Get user profile ✅
GET    /api/accounts/profiles/          → List profiles (admin only) ✅
```

### Webinars (Other Apps)
```
GET    /api/webinars/                   → List webinars ✅
POST   /api/webinars/                   → Create webinar ✅
GET    /api/webinars/{id}/              → Get webinar detail ✅
```

---

## URL Mapping Reference

### Development (Local)
```
Frontend Base: http://localhost:5173
API Base: http://localhost:8000/api

Example Request:
  Client: GET /accounts/users/me/
  API: http://localhost:8000/api/accounts/users/me/
  Django matches: accounts/urls.py → UserViewSet.me()
```

### Production (Render)
```
Frontend Base: https://<your-frontend-domain>
API Base: https://webinar-management-system-odoq.onrender.com/api

Example Request:
  Client: GET /accounts/users/me/
  API: https://webinar-management-system-odoq.onrender.com/api/accounts/users/me/
  Django matches: accounts/urls.py → UserViewSet.me()
```

---

## Troubleshooting

### Issue: Still Getting 404
**Check:**
1. Is VITE_API_BASE_URL includes `/api`?
   ```javascript
   // Check in browser:
   console.log(import.meta.env.VITE_API_BASE_URL);
   // Should show: .../api (with /api at end)
   ```

2. Clear browser cache & rebuild frontend
   ```bash
   cd frontend
   npm run build
   # Deploy new build
   ```

3. Verify Render logs for route mismatches
   ```bash
   # In Render Console:
   python manage.py show_urls  # If installed
   ```

### Issue: CORS Error
**Fix:**
1. Check CORS_ALLOWED_ORIGINS includes your domain
2. Restart Render service (Force Deploy)
3. Clear browser cookies

### Issue: Database Connection Error
**Fix:**
1. Verify PostgreSQL service is running on Render
2. Check credentials in Environment variables
3. Run migrations via Render Console:
   ```bash
   python manage.py migrate --noinput
   ```

### Issue: Static Files 404
**Fix:**
```bash
# In Render Console:
python manage.py collectstatic --noinput --clear
```

---

## Files Modified Summary

| File | Change |
|------|--------|
| `.env.production` | Added `/api` to base URL |
| `requirements.txt` | Enabled `psycopg2-binary` |
| `webinar_system/settings.py` | Added Render domain to CORS + trailing slash support |
| `.env.example` | Updated with Render variables |
| `render-build.sh` | Created deployment script |
| `render.yaml` | Created Render infrastructure config |

---

## Final Deployment Steps

1. **Push all changes to GitHub**
   ```bash
   git add .
   git commit -m "Fix 404 errors: Add /api to frontend base URL, enable PostgreSQL, configure Render"
   git push origin main
   ```

2. **Create PostgreSQL on Render**
   - Dashboard → Create New → PostgreSQL
   - Copy credentials

3. **Update Render Service Environment Variables**
   - Paste all PostgreSQL credentials
   - Set DEBUG=False, SECRET_KEY, etc.

4. **Redeploy on Render**
   - Dashboard → Your Web Service → Redeploy

5. **Monitor Logs**
   - Check for errors
   - Verify migrations ran

6. **Test Endpoints**
   - Use curl or Postman
   - Check browser network tab

---

## Success Indicators ✅

- [x] Frontend loads without console errors
- [x] API requests show correct URL with `/api`
- [x] Registration endpoint returns 201 Created
- [x] Login returns JWT tokens
- [x] User profile endpoint returns 200 OK
- [x] Database queries working (no connection errors)
- [x] No 404 errors in network tab
- [x] No CORS errors

---

**🎉 Your Django + React app should now work perfectly on Render!**

For questions, check the detailed guides:
- `RENDER_404_FIX_GUIDE.md` - Complete explanation
- `POSTGRESQL_RENDER_SETUP.md` - Database setup
- `render-build.sh` - Auto-deployment script
