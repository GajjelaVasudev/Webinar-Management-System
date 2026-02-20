# API Reference & Example Calls

## Base URL

```
http://localhost:8000/api
```

## Authentication Endpoints

### Login (POST /auth/login/)

**Request:**
```json
{
    "username": "john_doe",
    "password": "password123"
}
```

**Response (200 OK):**
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

**Error Response (401 Unauthorized):**
```json
{
    "detail": "No active account found with the given credentials"
}
```

**Frontend Usage:**
```javascript
const { access, refresh, user } = await authService.login('john_doe', 'password123');
localStorage.setItem('access_token', access);
localStorage.setItem('refresh_token', refresh);
localStorage.setItem('user', JSON.stringify(user));
```

---

### Register (POST /auth/register/)

**Request:**
```json
{
    "username": "jane_smith",
    "email": "jane@example.com",
    "password": "secure_password123"
}
```

**Response (201 Created):**
```json
{
    "id": 2,
    "username": "jane_smith",
    "email": "jane@example.com"
}
```

**Error Response (400 Bad Request):**
```json
{
    "error": "Username already exists"
}
```

**Frontend Usage:**
```javascript
await authService.register('jane_smith', 'jane@example.com', 'secure_password123');
// User can now login with these credentials
```

---

### Refresh Token (POST /auth/refresh/)

**Request:**
```json
{
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response (200 OK):**
```json
{
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Frontend Usage:**
```javascript
// Handled automatically by axios interceptor
// If access token expires, you can manually refresh:
const newToken = await apiClient.post('/auth/refresh/', {
    refresh: localStorage.getItem('refresh_token')
});
```

---

## Webinar Endpoints

### List All Webinars (GET /webinars/)

**Request:**
```
GET http://localhost:8000/api/webinars/
```

**Response (200 OK):**
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

**Frontend Usage:**
```javascript
const webinars = await webinarService.getWebinars();
// webinars is an array of webinar objects
```

---

### Get Webinar Details (GET /webinars/{id}/)

**Request:**
```
GET http://localhost:8000/api/webinars/1/
```

**Response (200 OK):**
```json
{
    "id": 1,
    "title": "React Fundamentals",
    "description": "Learn React basics",
    "speaker": "John Doe",
    "content": "Detailed content about React fundamentals including components, hooks, state management...",
    "start_time": "2026-01-15T10:00:00Z",
    "end_time": "2026-01-15T12:00:00Z",
    "attendees_count": 45,
    "created_at": "2026-01-05T10:00:00Z"
}
```

**Error Response (404 Not Found):**
```json
{
    "detail": "Not found."
}
```

**Frontend Usage:**
```javascript
const webinar = await webinarService.getWebinar(1);
// Display webinar details
```

---

### Register for Webinar (POST /webinars/{id}/register/)

**Request (with JWT token):**
```
POST http://localhost:8000/api/webinars/1/register/
Headers:
    Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

**Response (201 Created):**
```json
{
    "detail": "Successfully registered"
}
```

**Error Response (400 Bad Request - Already registered):**
```json
{
    "detail": "Already registered for this webinar"
}
```

**Error Response (401 Unauthorized):**
```json
{
    "detail": "Authentication credentials were not provided."
}
```

**Frontend Usage:**
```javascript
try {
    await webinarService.registerWebinar(1);
    alert('Successfully registered for the webinar!');
} catch (error) {
    if (error.response?.status === 400) {
        alert('Already registered');
    }
}
```

---

## Recording Endpoints

### List All Recordings (GET /recordings/)

**Request:**
```
GET http://localhost:8000/api/recordings/
```

**Response (200 OK):**
```json
[
    {
        "id": 1,
        "title": "React Fundamentals Recording",
        "webinar_id": 1,
        "video_url": "https://example.com/videos/react-fundamentals.mp4",
        "created_at": "2026-01-15T14:00:00Z"
    },
    {
        "id": 2,
        "title": "Advanced React Patterns Recording",
        "webinar_id": 2,
        "video_url": "https://example.com/videos/advanced-react.mp4",
        "created_at": "2026-01-22T17:00:00Z"
    }
]
```

**Frontend Usage:**
```javascript
const recordings = await webinarService.getRecordings();
// Display recordings in Dashboard
```

---

### Get Recording Details (GET /recordings/{id}/)

**Request:**
```
GET http://localhost:8000/api/recordings/1/
```

**Response (200 OK):**
```json
{
    "id": 1,
    "title": "React Fundamentals Recording",
    "webinar_id": 1,
    "video_url": "https://example.com/videos/react-fundamentals.mp4",
    "created_at": "2026-01-15T14:00:00Z"
}
```

**Frontend Usage:**
```javascript
const recording = await webinarService.getRecording(1);
// Open video or redirect to video_url
window.open(recording.video_url, '_blank');
```

---

## Testing with cURL

### Test Login
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "john_doe", "password": "password123"}'
```

### Test Register
```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "jane_smith",
    "email": "jane@example.com",
    "password": "secure_password123"
  }'
```

### Test Get Webinars
```bash
curl http://localhost:8000/api/webinars/
```

### Test Get Webinar Detail
```bash
curl http://localhost:8000/api/webinars/1/
```

### Test Register for Webinar (requires token)
```bash
curl -X POST http://localhost:8000/api/webinars/1/register/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Test Get Recordings
```bash
curl http://localhost:8000/api/recordings/
```

---

## Testing with Postman

### Setup in Postman

1. **Create Environment Variables:**
   - `BASE_URL`: `http://localhost:8000/api`
   - `ACCESS_TOKEN`: (empty - will be set by login request)

2. **Create Login Request:**
   - Method: POST
   - URL: `{{BASE_URL}}/auth/login/`
   - Body (raw JSON):
     ```json
     {
         "username": "john_doe",
         "password": "password123"
     }
     ```
   - Tests (post-request script):
     ```javascript
     pm.environment.set("ACCESS_TOKEN", pm.response.json().access);
     ```

3. **Use Token in Other Requests:**
   - Headers:
     - Key: `Authorization`
     - Value: `Bearer {{ACCESS_TOKEN}}`

4. **Example Requests:**
   - GET `{{BASE_URL}}/webinars/`
   - GET `{{BASE_URL}}/webinars/1/`
   - POST `{{BASE_URL}}/webinars/1/register/` (with token)

---

## Frontend Integration Examples

### Using auth.js Service

```javascript
import authService from '../services/auth';

// Login
const { access, user } = await authService.login('username', 'password');

// Check if authenticated
if (authService.isAuthenticated()) {
    console.log('User is logged in');
}

// Get current user
const currentUser = authService.getUser();

// Logout
authService.logout();
```

### Using webinar.js Service

```javascript
import webinarService from '../services/webinar';

// Get all webinars
const webinars = await webinarService.getWebinars();

// Get single webinar
const webinar = await webinarService.getWebinar(1);

// Register for webinar
try {
    await webinarService.registerWebinar(1);
    console.log('Registered successfully');
} catch (error) {
    console.error('Registration failed:', error);
}

// Get recordings
const recordings = await webinarService.getRecordings();
```

### Using Context API

```javascript
import { useAuth } from '../context/AuthContext';

function MyComponent() {
    const { user, isAuthenticated, login, logout } = useAuth();
    
    // Use auth state
    if (isAuthenticated) {
        return <div>Welcome, {user.username}!</div>;
    }
    
    // Call auth functions
    const handleLogin = async () => {
        try {
            await login('username', 'password');
        } catch (error) {
            console.error('Login failed:', error);
        }
    };
}
```

---

## Error Handling

### Common HTTP Status Codes

| Status | Meaning | Example |
|--------|---------|---------|
| 200 | OK | Successfully retrieved resource |
| 201 | Created | Successfully created resource |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | User doesn't have permission |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Django backend error |

### Error Response Format

```json
{
    "detail": "Error message",
    "error": "Error description"
}
```

### Frontend Error Handling

```javascript
try {
    const result = await someApiCall();
} catch (error) {
    if (error.response?.status === 401) {
        // Unauthorized - redirect to login
        window.location.href = '/login';
    } else if (error.response?.status === 400) {
        // Bad request - show error message
        setError(error.response.data.detail);
    } else {
        // Other error
        setError('An error occurred. Please try again.');
    }
}
```

---

## Headers

### Default Headers (sent by Axios)

```
Content-Type: application/json
```

### With Authentication

```
Content-Type: application/json
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

The Authorization header is automatically added by the request interceptor in `services/api.js`.

---

## Request/Response Flow

### Request with Token

```
React Component
    ↓
webinarService.getWebinars()
    ↓
apiClient.get('/webinars/')
    ↓
Request Interceptor (adds token):
    Authorization: Bearer {access_token}
    ↓
HTTP GET http://localhost:8000/api/webinars/
    ↓
Django Backend
    ↓
Response: [webinar1, webinar2, ...]
    ↓
Response Interceptor (checks for errors)
    ↓
Returns data to component
```

### Error Response (401)

```
HTTP Response: 401 Unauthorized
    ↓
Response Interceptor detects 401
    ↓
Clears localStorage (tokens)
    ↓
Redirects to /login
    ↓
User must login again
```

This is all the API documentation you need to integrate the React frontend with your Django backend!
