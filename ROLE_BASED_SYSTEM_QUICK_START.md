# 🚀 Role-Based System - Quick Start Guide

## Overview
Your Django + React project now has a **production-ready role-based authentication system** with **ADMIN** and **STUDENT** roles.

---

## ⚡ Quick Test (5 Minutes)

### Step 1: Start Django Server
```bash
cd c:\Users\vgajj\Downloads\PFSD-PROJECT
python manage.py runserver
# Server running at http://localhost:8000
```

### Step 2: Start React Frontend  
```bash
cd frontend
npm run dev
# Frontend running at http://localhost:3000
```

### Step 3: Test Admin Login
1. Go to http://localhost:3000
2. Click "Login"
3. Enter credentials:
   - **Username:** `admin`
   - **Password:** `admin123`
4. ✅ You'll be redirected to `/admin` dashboard
5. You can see "Users & Roles" section with all users

### Step 4: Test Student Login
1. Click Logout (top right)
2. Login again with:
   - **Username:** `student`
   - **Password:** `student123`
3. ✅ You'll be redirected to `/user-portal`
4. You **cannot** access `/admin` (automatic redirect)

### Step 5: Test Profile Page
1. Both users can click their avatar → "Profile"
2. Change password (requires current password)
3. Upload a new profile picture
4. ✅ Avatar updates immediately

### Step 6: Test Admin Role Management
1. Login as `admin`
2. Go to "Users & Roles" in dashboard
3. You can see dropdown to change any user's role
4. Try changing `student` role to `admin`
5. ✅ Role updates in real-time

---

## 🔑 Default Users

| Username | Password | Role | Use Case |
|----------|----------|------|----------|
| admin | admin123 | Admin | Full access to dashboard |
| student | student123 | Student | Regular user portal |
| test_admin | test123 | Admin | Testing |
| test_student | test123 | Student | Testing |

---

## 📍 Key Routes

### Admin Only
- `/admin` - Admin dashboard with users & roles section
- `/admin/dashboard` - Same as above

### For All Authenticated Users
- `/profile` - User profile page (change password, upload picture)
- `/user-portal` - Regular user portal
- `/inbox` - Messages

### Public
- `/` - Landing page
- `/auth` - Login/Register page

---

## ✨ Features Implemented

✅ **Role-Based Authentication**
- ADMIN and STUDENT roles
- JWT tokens include role
- Automatic role assignment on signup

✅ **User Profile Management**
- Upload profile picture
- Auto-generated avatar (first letter + random color)
- Change password securely
- View profile information

✅ **Admin Panel**
- List all users
- Change user roles
- Real-time UI updates

✅ **Security**
- Role-protected endpoints (403 Forbidden for unauthorized)
- Secure password hashing
- Token-based authentication
- Clear separation of admin/student permissions

✅ **Production Ready**
- Clean code with no console.logs
- Proper error handling
- Loading states
- Toast notifications
- TypeScript for type safety

---

## 🔍 What's Different from Before

### Backend Changes
- Profile picture field added to UserProfile model
- Avatar auto-generated on user creation
- Role values changed from 'user' → 'student'
- New admin-only endpoints for role management
- JWT token now includes role claim

### Frontend Changes
- Simplified AuthContext with clear logout behavior
- New Avatar component (circular, soft colors)
- New user profile page (/profile)
- New role management modal
- Enhanced admin dashboard with user management
- Clean, no console logs

---

## 🛠️ API Endpoints

### Public
```
POST   /accounts/auth/login/          - Login (email/username + password)
POST   /accounts/auth/register/       - Register new account
```

### Authenticated
```
POST   /accounts/auth/logout/         - Logout
POST   /accounts/auth/change-password/ - Change password
GET    /accounts/users/me/            - Get current user info
POST   /accounts/users/{id}/upload_profile_picture/ - Upload avatar
```

### Admin Only
```
GET    /accounts/users/               - List all users
POST   /accounts/users/{id}/update_role/ - Change user role
```

---

## 🐛 Testing Tips

### Check Avatar Generation
```bash
# In Django shell
python manage.py shell
>>> from accounts.models import UserProfile
>>> profile = UserProfile.objects.first()
>>> print(profile.profile_picture)
# Output: profile_pictures/avatar_username.png
```

### Check JWT Token
```bash
# Login and copy the access token
# Decode at jwt.io to see claims:
# {
#   "token_type": "access",
#   "exp": 123456789,
#   "iat": 123456789,
#   "jti": "...",
#   "user_id": 1,
#   "role": "admin",
#   "username": "admin",
#   "email": "admin@gmail.com"
# }
```

### Test Admin Endpoint as Student
```bash
# Get student token from login
# Try accessing: GET /accounts/users/
# Expected: 403 Forbidden with message
```

---

## 📋 Verification Checklist

After testing, verify these work:

- [ ] Admin can login (redirects to /admin)
- [ ] Student can login (redirects to /user-portal)
- [ ] Student cannot access /admin (redirects to /)
- [ ] Admin can see all users in dashboard
- [ ] Admin can change user roles
- [ ] Profile picture uploads successfully
- [ ] Password change works
- [ ] Logout clears all tokens
- [ ] Avatar displays correctly (letter + color)
- [ ] Role updates appear instantly in UI
- [ ] No errors in browser console
- [ ] No 500 errors in Django logs

---

## 🚨 Common Issues & Fixes

### Issue: "User not found" on login
- Check username/email spelling
- Verify user exists: `python manage.py createsuperuser`

### Issue: Role not updating in UI
- Refresh the page (F5)
- Check if you're logged in as admin
- Check browser DevTools → Network tab

### Issue: Avatar not displaying
- Check if image file exists in `/media/profile_pictures/`
- Verify MEDIA_URL is set in settings.py
- Try reloading page

### Issue: Cannot access admin endpoints
- Verify you're logged in as admin
- Check token claims at jwt.io
- Verify `IsAdmin` permission class is used

---

## 📞 Need Help?

Check these files for implementation details:
- Backend: `accounts/models.py`, `accounts/views.py`
- Frontend: `src/context/AuthContext.tsx`, `src/pages/UserProfilePage.tsx`
- Documentation: `docs/ROLE_BASED_SYSTEM_PRODUCTION.md`

---

**⏱️ Estimated Testing Time: 5-10 minutes**

Have fun! 🎉

