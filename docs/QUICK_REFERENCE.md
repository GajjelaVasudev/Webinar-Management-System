# Quick Reference: Role-Based System

## For Developers

### Key Concepts

```
Backend = Single Source of Truth
Frontend = User Experience Layer
Role = User's permission level (admin or user)
```

### Adding a New Admin Feature

#### 1. Backend
```python
# views.py - Add permission check
from events.views import IsAdmin

class MyAdminViewSet(viewsets.ViewSet):
    permission_classes = [IsAdmin]  # Protects the endpoint
    
    def create(self, request):
        # Only admins reach here
        ...
```

#### 2. Frontend
```jsx
// pages/MyAdminPage.js
import RoleProtectedRoute from '../routes/RoleProtectedRoute';

export default function MyAdminPage() {
    const { isAdmin } = useAuth();
    
    if (!isAdmin()) {
        navigate('/');
        return null;
    }
    
    return <div>Admin-only content</div>;
}

// App.js
<Route path="/admin/my-feature" element={
    <RoleProtectedRoute allowedRoles={['admin']}>
        <MyAdminPage />
    </RoleProtectedRoute>
} />
```

#### 3. Navigation
```jsx
// Navbar.js
{isAdmin() && effectiveRole === 'admin' && (
    <li>
        <Link to="/admin/my-feature">My Feature</Link>
    </li>
)}
```

### Checking User Role

```javascript
// In any component using useAuth hook
const { role, isAdmin, isAuthenticated, getEffectiveRole } = useAuth();

// Check if admin
if (isAdmin()) { /* ... */ }

// Get current display role (including view-as mode)
const displayRole = getEffectiveRole();

// Check if admin is viewing as user
const { viewingAsRole } = useAuth();
if (viewingAsRole === 'user') { /* admin viewing as user */ }
```

### API Calls with Role Protection

```javascript
// Making an API call (automatically includes JWT token)
import apiClient from '../services/api';

// This will fail with 403 if user is not admin
const response = await apiClient.post('/api/webinars/', {
    title: 'New Webinar',
    date: '2024-01-15',
    time: '14:00',
});
```

### Database Setup

```bash
# Run migrations
python manage.py migrate

# Create test admin user (interactive)
python manage.py createsuperuser

# Then in Django shell:
python manage.py shell
>>> from django.contrib.auth.models import User
>>> from events.models import UserProfile
>>> admin = User.objects.get(username='your_admin')
>>> UserProfile.objects.create(user=admin, role='admin')
```

### Testing

```python
# Test if user has admin role
from events.models import UserProfile
user = User.objects.get(username='testuser')
is_admin = user.profile.role == 'admin'
```

## Key Files to Know

| File | Purpose |
|------|---------|
| `events/models.py` | UserProfile model definition |
| `events/serializers.py` | UserProfileSerializer |
| `events/views.py` | IsAdmin permission, UserProfileViewSet |
| `events/api_urls.py` | API endpoint routing |
| `frontend/src/context/AuthContext.js` | Role state management |
| `frontend/src/routes/RoleProtectedRoute.js` | Route protection |
| `frontend/src/components/Navbar.js` | Role-based navigation |
| `frontend/src/App.js` | Route definitions |

## Common Patterns

### Pattern 1: Admin-Only Form
```jsx
function AdminForm() {
    const { isAdmin } = useAuth();
    
    if (!isAdmin()) return <Navigate to="/" />;
    
    const handleSubmit = async (data) => {
        try {
            await apiClient.post('/api/admin-endpoint/', data);
        } catch (err) {
            if (err.response?.status === 403) {
                // Not authorized
            }
        }
    };
    
    return <form onSubmit={handleSubmit}>...</form>;
}
```

### Pattern 2: Role-Specific Styling
```jsx
function Component() {
    const { role } = useAuth();
    
    return (
        <div className={role === 'admin' ? styles.adminView : styles.userView}>
            Content
        </div>
    );
}
```

### Pattern 3: Admin/User Toggle (Admin Only)
```jsx
function Menu() {
    const { isAdmin, switchRole, viewingAsRole } = useAuth();
    
    if (!isAdmin()) return null;
    
    return (
        <button onClick={() => switchRole('user')}>
            {viewingAsRole === 'user' ? 'Back to Admin' : 'View as User'}
        </button>
    );
}
```

## Frontend Features by Role

### Admin Features
- Access `/admin/dashboard`
- Schedule webinars
- Manage registrations
- Upload resources
- View statistics
- Toggle "View as User" mode

### User Features
- Browse webinars
- Register for webinars
- View recordings
- Manage their registrations

## Backend Permission Logic

```
Request → JWT Token → User → UserProfile → Role → IsAdmin() → API Response

If role == 'admin':
    ✓ Can create/update/delete webinars
    ✓ Can access admin endpoints
Else:
    ✗ Returns 403 Forbidden
```

## Debugging Checklist

- [ ] User has UserProfile in database
- [ ] UserProfile.role is set to 'admin' or 'user'
- [ ] JWT token is valid (not expired)
- [ ] Frontend received role from `/api/users/profile/me/`
- [ ] Role is stored in localStorage
- [ ] isAdmin() returns correct boolean
- [ ] getEffectiveRole() accounts for viewingAsRole

## Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| 403 Forbidden | Not admin | Check user role on backend |
| 401 Unauthorized | Invalid token | Log in again |
| User has no attribute 'profile' | No UserProfile | Create UserProfile for user |
| isAdmin is not a function | useAuth not used | Ensure component uses useAuth hook |
| Cannot read property 'role' | Role not loaded | Wait for AuthContext loading |

