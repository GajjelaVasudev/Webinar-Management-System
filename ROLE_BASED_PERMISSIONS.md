# Role-Based Permission System - Implementation Guide

## Overview

This guide explains the comprehensive role-based permission system implemented for the webinar application. The system ensures that the backend is the single source of truth for authentication and authorization, while the frontend dynamically adjusts the UI based on the user's role.

## Architecture

### Backend (Django)

#### 1. **UserProfile Model**
```python
class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('admin', 'Administrator'),
        ('user', 'Regular User'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
```

- One-to-one relationship with Django's User model
- Each user has a role: 'admin' or 'user'
- Default role is 'user'

#### 2. **IsAdmin Permission Class**
```python
class IsAdmin(IsAuthenticated):
    """Permission class to check if user is admin"""
    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        return request.user.profile.role == 'admin'
```

- Only authenticated admins can perform admin operations
- Used for protecting create/update/delete operations on webinars

#### 3. **User Profile API Endpoint**
- **URL**: `/api/users/profile/me/`
- **Method**: GET
- **Auth**: Required (JWT)
- **Response**:
```json
{
    "id": 1,
    "username": "admin_user",
    "email": "admin@example.com",
    "role": "admin"
}
```

#### 4. **Protected Endpoints**
- Create webinar: `POST /api/webinars/` - Admin only
- Update webinar: `PATCH /api/webinars/{id}/` - Admin only
- Delete webinar: `DELETE /api/webinars/{id}/` - Admin only
- View webinars: `GET /api/webinars/` - Public
- Register for webinar: `POST /api/webinars/{id}/register/` - Authenticated users

### Frontend (React)

#### 1. **Enhanced AuthContext**
```javascript
{
    user,              // Current user object
    role,              // 'admin' or 'user'
    isAuthenticated,   // Boolean
    loading,           // Loading state
    viewingAsRole,     // Current viewing mode for admins
    login(),           // Login function
    register(),        // Register function
    logout(),          // Logout function
    switchRole(),      // Admin role switching
    getEffectiveRole(), // Get the current display role
    isAdmin(),         // Check if user is admin
    isViewingAs(),     // Check current view mode
}
```

#### 2. **RoleProtectedRoute Component**
```jsx
<RoleProtectedRoute allowedRoles={['admin']}>
    <AdminDashboard />
</RoleProtectedRoute>
```

- Protects routes based on user role
- Redirects to home if unauthorized
- Checks effective role (including viewing mode)

#### 3. **Dynamic Navigation Bar**
- Shows different menu items based on role
- Admin sees: Dashboard, Schedule Webinar, Manage Registrations, Upload Resources
- User sees: My Webinars, Live Sessions, Recordings
- Admin-only "View as User" toggle button
- Role badge displayed next to username

## Setup Instructions

### Backend Setup

#### 1. Create and Run Migration
```bash
# Create migration for UserProfile model
python manage.py makemigrations

# Apply migrations
python manage.py migrate
```

#### 2. Create Admin Users
```python
from django.contrib.auth.models import User
from events.models import UserProfile

# Create admin user
admin_user = User.objects.create_user(
    username='admin',
    email='admin@example.com',
    password='admin123'
)
UserProfile.objects.create(user=admin_user, role='admin')

# Create regular user
regular_user = User.objects.create_user(
    username='user1',
    email='user1@example.com',
    password='user123'
)
UserProfile.objects.create(user=regular_user, role='user')
```

Or use Django admin:
```bash
python manage.py createsuperuser
# Then manually create UserProfile in Django admin
```

#### 3. Verify API Endpoints
```bash
# Test login and get user role
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Get current user profile (use access token)
curl -X GET http://localhost:8000/api/users/profile/me/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Frontend Setup

#### 1. Install Dependencies (if not already done)
```bash         
cd frontend
npm install axios react-router-dom
```

#### 2. Environment Configuration
Create `.env` file in frontend directory:
```
REACT_APP_API_URL=http://localhost:8000
```

#### 3. Run Development Server
```bash
npm start
```

The app will be available at `http://localhost:3000`

## Usage

### For Admin Users

1. **Login** with admin credentials
2. **Navigation Bar** shows admin menu:
   - 📊 Dashboard - View statistics and webinars
   - 📅 Schedule Webinar - Create new webinars
   - 👥 Manage Registrations - View attendee registrations
   - 📁 Upload Resources - Upload webinar recordings

3. **Role Switching** - Click "👤 View as User" button to see the UI as a regular user
   - The button becomes "👁️ User Mode" when active
   - All menu items switch dynamically
   - Click again to return to admin view

4. **Admin Dashboard** features:
   - Statistics cards (Total Webinars, Registrations, Upcoming Sessions)
   - Webinar management table with View/Edit/Delete buttons
   - Quick action buttons for common tasks

5. **Schedule Webinar**:
   - Enter webinar title, description, date, and time
   - Live preview of the webinar
   - Submit to create new webinar

6. **Manage Registrations**:
   - Select a webinar to view attendees
   - Search attendees by username
   - Remove users from webinars

7. **Upload Resources**:
   - Select webinar and paste recording link
   - Manage multiple recordings per webinar
   - Delete recordings as needed

### For Regular Users

1. **Login** with user credentials
2. **Navigation Bar** shows user menu:
   - Home - Browse all webinars
   - My Webinars - Registered webinars
   - Live Sessions - Upcoming sessions
   - Recordings - View recordings

3. **Features**:
   - View webinar details
   - Register/unregister for webinars
   - Watch recordings
   - Cannot access admin features

## File Structure

```
Frontend:
src/
├── context/
│   └── AuthContext.js                 # Auth state management with role
├── routes/
│   ├── ProtectedRoute.js              # Authentication-based protection
│   └── RoleProtectedRoute.js          # Role-based protection
├── pages/
│   ├── AdminDashboard.js              # Admin dashboard
│   ├── AdminDashboard.module.css
│   ├── ScheduleWebinar.js             # Schedule webinar form
│   ├── ScheduleWebinar.module.css
│   ├── ManageRegistrations.js         # Manage registrations
│   ├── ManageRegistrations.module.css
│   ├── UploadResources.js             # Upload recordings
│   ├── UploadResources.module.css
│   └── ...other pages
├── components/
│   ├── Navbar.js                      # Updated with role-based menu
│   └── Navbar.module.css              # Enhanced styling
└── App.js                             # Updated routes

Backend:
events/
├── models.py                          # UserProfile model
├── serializers.py                     # UserProfileSerializer
├── views.py                           # IsAdmin permission, UserProfileViewSet
├── api_urls.py                        # User profile endpoint
└── ...other files
```

## API Endpoints Summary

### Authentication
- `POST /api/auth/login/` - Login and get JWT token
- `POST /api/auth/refresh/` - Refresh JWT token

### User Profile
- `GET /api/users/profile/me/` - Get current user profile with role

### Webinars
- `GET /api/webinars/` - List all webinars (public)
- `POST /api/webinars/` - Create webinar (admin only)
- `GET /api/webinars/{id}/` - Get webinar details
- `PATCH /api/webinars/{id}/` - Update webinar (admin only)
- `DELETE /api/webinars/{id}/` - Delete webinar (admin only)
- `POST /api/webinars/{id}/register/` - Register for webinar (authenticated)
- `DELETE /api/webinars/{id}/unregister/` - Unregister from webinar (authenticated)

### Recordings
- `GET /api/recordings/` - List all recordings
- `POST /api/recordings/` - Upload recording (admin only)
- `DELETE /api/recordings/{id}/` - Delete recording (admin only)

## Security Features

1. **Backend Authentication**
   - JWT token-based authentication
   - Token expiration after 1 hour
   - Refresh token mechanism

2. **Role-Based Access Control**
   - Backend enforces permissions on API
   - Frontend prevents unauthorized access to UI
   - Fallback to home if unauthorized access attempted

3. **Data Integrity**
   - Only admins can create/modify/delete webinars
   - User data cannot be modified by other users
   - Consistent validation on both frontend and backend

## Troubleshooting

### Backend Issues

**Problem**: Migration fails
```bash
# Solution: Check if UserProfile model is properly defined
# Ensure events app is in INSTALLED_APPS
```

**Problem**: API returns 403 Forbidden for admin operations
```bash
# Check if user has UserProfile with role='admin'
python manage.py shell
from django.contrib.auth.models import User
from events.models import UserProfile
user = User.objects.get(username='admin')
profile = user.profile
print(profile.role)
```

### Frontend Issues

**Problem**: Role not loading after login
```javascript
// Solution: Check browser console for API errors
// Ensure AuthContext fetchUserProfile is called
// Verify JWT token is stored in localStorage
```

**Problem**: Admin routes not accessible
```javascript
// Check:
// 1. User has admin role on backend
// 2. Role is fetched from /api/users/profile/me/
// 3. RoleProtectedRoute allowedRoles includes 'admin'
```

**Problem**: Role switch button not appearing
```javascript
// Verify isAdmin() returns true
// Check that viewingAsRole state is managed properly
// Ensure switchRole() function is defined in AuthContext
```

## Future Enhancements

1. **Advanced Permissions**
   - Moderator role
   - Department-specific roles
   - Custom permissions per resource

2. **Audit Logging**
   - Track admin actions
   - User activity logs

3. **Role Assignment UI**
   - Admin panel to assign/change user roles
   - Bulk user management

4. **Two-Factor Authentication**
   - Enhanced security for admin accounts

5. **Permission Caching**
   - Cache role information to reduce API calls
   - Sync permissions across tabs

## Support & Maintenance

### Testing Role-Based Features
```python
# Test API permission enforcement
from rest_framework.test import APIClient
from django.contrib.auth.models import User
from events.models import UserProfile

client = APIClient()

# Create admin and regular user
admin = User.objects.create_user('admin', password='test')
UserProfile.objects.create(user=admin, role='admin')

user = User.objects.create_user('user', password='test')
UserProfile.objects.create(user=user, role='user')

# Test admin can create webinar
admin_token = # get token by logging in
client.credentials(HTTP_AUTHORIZATION=f'Bearer {admin_token}')
response = client.post('/api/webinars/', {...})
assert response.status_code == 201

# Test regular user cannot create webinar
user_token = # get token by logging in
client.credentials(HTTP_AUTHORIZATION=f'Bearer {user_token}')
response = client.post('/api/webinars/', {...})
assert response.status_code == 403
```

## Conclusion

This role-based permission system provides a secure, scalable foundation for managing different user types in the webinar application. The backend maintains security through API-level permission checks, while the frontend provides an intuitive, role-aware user experience.

