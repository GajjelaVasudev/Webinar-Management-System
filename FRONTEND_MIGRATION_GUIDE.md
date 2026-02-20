# Frontend Migration Checklist

## 🎯 Overview

The backend API structure has changed. All endpoints now use the `/api/` prefix with organized app-based routing.

## 📡 API Endpoint Migration

### Authentication Endpoints

| Old Endpoint | New Endpoint | Method |
|--------------|--------------|--------|
| `/login/` | `/api/accounts/auth/login/` | POST |
| `/register/` | `/api/accounts/auth/register/` | POST |
| `/token/refresh/` | `/api/accounts/auth/refresh/` | POST |
| `/change-password/` | `/api/accounts/auth/change-password/` | POST |
| `/users/me/` | `/api/accounts/users/me/` | GET |

### Webinar/Event Endpoints

| Old Endpoint | New Endpoint | Method |
|--------------|--------------|--------|
| `/events/` | `/api/webinars/` | GET |
| `/events/` | `/api/webinars/` | POST |
| `/events/{id}/` | `/api/webinars/{id}/` | GET/PUT/DELETE |
| `/events/upcoming/` | `/api/webinars/upcoming/` | GET |
| `/events/live/` | `/api/webinars/live/` | GET |
| `/events/completed/` | `/api/webinars/completed/` | GET |

### Registration Endpoints

| Old Endpoint | New Endpoint | Method |
|--------------|--------------|--------|
| `/registrations/` | `/api/registrations/` | GET |
| `/register-event/` | `/api/registrations/register/` | POST |
| `/unregister/{id}/` | `/api/registrations/{id}/unregister/` | DELETE |
| `/my-registrations/` | `/api/registrations/my_registrations/` | GET |

### Recording Endpoints

| Old Endpoint | New Endpoint | Method |
|--------------|--------------|--------|
| `/recordings/` | `/api/recordings/` | GET |
| `/recordings/` | `/api/recordings/` | POST |
| `/recordings/{id}/` | `/api/recordings/{id}/` | GET/PUT/DELETE |
| `/recordings/public/` | `/api/recordings/public/` | GET |

### Communication Endpoints

| Old Endpoint | New Endpoint | Method |
|--------------|--------------|--------|
| `/announcements/` | `/api/communications/announcements/` | GET |
| `/announcements/` | `/api/communications/announcements/` | POST |
| `/notifications/` | `/api/communications/notifications/` | GET |
| `/notifications/unread/` | `/api/communications/notifications/unread/` | GET |
| `/notifications/unread-count/` | `/api/communications/notifications/unread_count/` | GET |
| `/notifications/{id}/mark-read/` | `/api/communications/notifications/{id}/mark_read/` | POST |
| `/chat/` | `/api/communications/chat/` | GET/POST |

---

## 🔧 Implementation Steps

### Step 1: Update API Base URL

**File:** `frontend/src/config/api.ts` (or similar)

```typescript
// Before
const API_BASE_URL = 'http://localhost:8000';

// After
const API_BASE_URL = 'http://localhost:8000/api';
```

### Step 2: Update API Service Files

**Example:** `frontend/src/services/authService.ts`

```typescript
// Before
export const login = async (credentials: LoginCredentials) => {
  const response = await axios.post('/login/', credentials);
  return response.data;
};

// After
export const login = async (credentials: LoginCredentials) => {
  const response = await axios.post('/accounts/auth/login/', credentials);
  return response.data;
};
```

### Step 3: Update Axios Instance

**File:** `frontend/src/utils/axios.ts` (or similar)

```typescript
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000/api',  // Add /api prefix
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
```

### Step 4: Search and Replace

Run these searches in your frontend codebase:

```bash
# Find all API calls (VS Code search)
Search: (fetch|axios)\s*\(\s*['"`](/[^'"`]+)
Replace: Case-by-case (add /api prefix and update path)
```

### Step 5: Update Each Service File

#### AuthService
```typescript
// frontend/src/services/authService.ts
const AUTH_BASE = '/accounts/auth';

export const authService = {
  login: (data) => api.post(`${AUTH_BASE}/login/`, data),
  register: (data) => api.post(`${AUTH_BASE}/register/`, data),
  refresh: (token) => api.post(`${AUTH_BASE}/refresh/`, { refresh: token }),
  changePassword: (data) => api.post(`${AUTH_BASE}/change-password/`, data),
};
```

#### WebinarService
```typescript
// frontend/src/services/webinarService.ts
const WEBINAR_BASE = '/webinars';

export const webinarService = {
  getAll: () => api.get(`${WEBINAR_BASE}/`),
  getById: (id) => api.get(`${WEBINAR_BASE}/${id}/`),
  create: (data) => api.post(`${WEBINAR_BASE}/`, data),
  update: (id, data) => api.put(`${WEBINAR_BASE}/${id}/`, data),
  delete: (id) => api.delete(`${WEBINAR_BASE}/${id}/`),
  getUpcoming: () => api.get(`${WEBINAR_BASE}/upcoming/`),
  getLive: () => api.get(`${WEBINAR_BASE}/live/`),
  getCompleted: () => api.get(`${WEBINAR_BASE}/completed/`),
};
```

#### RegistrationService
```typescript
// frontend/src/services/registrationService.ts
const REGISTRATION_BASE = '/registrations';

export const registrationService = {
  getMyRegistrations: () => api.get(`${REGISTRATION_BASE}/my_registrations/`),
  register: (eventId) => api.post(`${REGISTRATION_BASE}/register/`, { event: eventId }),
  unregister: (id) => api.delete(`${REGISTRATION_BASE}/${id}/unregister/`),
};
```

#### RecordingService
```typescript
// frontend/src/services/recordingService.ts
const RECORDING_BASE = '/recordings';

export const recordingService = {
  getAll: () => api.get(`${RECORDING_BASE}/`),
  getById: (id) => api.get(`${RECORDING_BASE}/${id}/`),
  getPublic: () => api.get(`${RECORDING_BASE}/public/`),
  create: (data) => api.post(`${RECORDING_BASE}/`, data),
};
```

#### CommunicationService
```typescript
// frontend/src/services/communicationService.ts
const COMM_BASE = '/communications';

export const communicationService = {
  // Announcements
  getAnnouncements: () => api.get(`${COMM_BASE}/announcements/`),
  createAnnouncement: (data) => api.post(`${COMM_BASE}/announcements/`, data),
  
  // Notifications
  getNotifications: () => api.get(`${COMM_BASE}/notifications/`),
  getUnread: () => api.get(`${COMM_BASE}/notifications/unread/`),
  getUnreadCount: () => api.get(`${COMM_BASE}/notifications/unread_count/`),
  markAsRead: (id) => api.post(`${COMM_BASE}/notifications/${id}/mark_read/`),
  markAllAsRead: () => api.post(`${COMM_BASE}/notifications/mark_all_read/`),
  
  // Chat
  getChatMessages: (eventId) => api.get(`${COMM_BASE}/chat/?event=${eventId}`),
  sendMessage: (data) => api.post(`${COMM_BASE}/chat/`, data),
};
```

---

## ✅ Testing Checklist

After updating the frontend, test these features:

### Authentication
- [ ] User can register
- [ ] User can login with username
- [ ] User can login with email
- [ ] JWT tokens are stored correctly
- [ ] Token refresh works
- [ ] Logout works
- [ ] Password change works

### Webinars
- [ ] List all webinars
- [ ] View webinar details
- [ ] Filter by status (upcoming/live/completed)
- [ ] Create webinar (admin)
- [ ] Edit webinar (admin)
- [ ] Delete webinar (admin)

### Registrations
- [ ] Register for webinar
- [ ] View my registrations
- [ ] Unregister from webinar
- [ ] Cannot register twice for same webinar

### Recordings
- [ ] View all recordings
- [ ] View recording details
- [ ] Upload recording (admin)
- [ ] Access control works

### Communications
- [ ] View announcements
- [ ] Create announcement (admin)
- [ ] View notifications
- [ ] Mark notification as read
- [ ] Unread count updates
- [ ] Send chat message
- [ ] View chat messages

---

## 🐛 Debugging Tips

### Check Browser Console
```javascript
// Check API base URL
console.log('API Base:', axios.defaults.baseURL);

// Check if token is set
console.log('Token:', localStorage.getItem('accessToken'));

// Log all requests
axios.interceptors.request.use(request => {
  console.log('Starting Request:', request);
  return request;
});
```

### Common Issues

**1. CORS Errors**
- Check `CORS_ALLOWED_ORIGINS` in Django settings includes frontend URL
- Ensure cookies/credentials are properly configured

**2. 404 Not Found**
- Verify endpoint path matches new structure
- Check if `/api/` prefix is included
- Confirm URL doesn't have double slashes (`//`)

**3. 401 Unauthorized**
- Check if token is being sent in Authorization header
- Verify token hasn't expired
- Try refreshing the token

**4. 403 Forbidden**
- Check user permissions
- Verify IsAdmin permission for admin-only endpoints

---

## 📝 Files to Update

Common files that need updating:

```
frontend/src/
├── config/
│   └── api.ts                    # API base URL
├── services/
│   ├── authService.ts            # Update all endpoints
│   ├── webinarService.ts         # Update all endpoints
│   ├── registrationService.ts   # Update all endpoints
│   ├── recordingService.ts      # Update all endpoints
│   └── communicationService.ts  # Update all endpoints
├── utils/
│   └── axios.ts                  # Update base URL
└── components/
    └── */                        # Update any hardcoded URLs
```

---

## 🚀 Quick Migration Script

Here's a Node.js script to help find all API calls:

```javascript
// findApiCalls.js
const fs = require('fs');
const path = require('path');

function findApiCalls(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      findApiCalls(filePath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js')) {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        if (line.match(/(fetch|axios).*['"`]\/[^'"`]+/)) {
          console.log(`${filePath}:${index + 1}: ${line.trim()}`);
        }
      });
    }
  });
}

findApiCalls('./src');
```

Run with: `node findApiCalls.js`

---

## ✨ Final Notes

1. **Test Incrementally:** Update one service at a time and test before moving to the next
2. **Use Environment Variables:** Store API base URL in `.env` file
3. **Update Documentation:** Document any custom API integrations
4. **Check TypeScript Types:** Update interfaces if response structures changed
5. **Update Tests:** Ensure frontend tests use new endpoints

---

**Need Help?** Check the backend API at `http://localhost:8000/api/` when server is running, or review the backend code in the respective app directories.
