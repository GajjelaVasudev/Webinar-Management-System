# Django Backend API Setup Guide

This document explains how to set up the Django backend to work with the React frontend.

## Required Packages

Install the following in your Django project:

```bash
pip install djangorestframework
pip install djangorestframework-simplejwt
pip install django-cors-headers
```

## Django Settings Configuration

Update your `webinar_system/settings.py`:

### 1. Add Installed Apps

```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third-party apps
    'corsheaders',
    'rest_framework',
    'rest_framework_simplejwt',
    
    # Local apps
    'events',
]
```

### 2. Configure REST Framework

```python
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
    'DEFAULT_FILTER_BACKENDS': [
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
}

# Simple JWT Configuration
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}
```

### 3. Configure CORS

```python
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Add this at the top
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    # Add production URL when deploying
]

CORS_ALLOW_CREDENTIALS = True
```

## Events App API Serializers

Create `events/serializers.py`:

```python
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Event

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name')

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'
        read_only_fields = ('id', 'created_at')

class EventDetailSerializer(serializers.ModelSerializer):
    attendees_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Event
        fields = '__all__'
        read_only_fields = ('id', 'created_at')
    
    def get_attendees_count(self, obj):
        return obj.attendees.count()

class RegisterSerializer(serializers.Serializer):
    webinar_id = serializers.IntegerField()
```

## Events App ViewSets

Update `events/views.py` to include API views:

```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth.models import User
from .models import Event, Registration
from .serializers import (
    EventSerializer,
    EventDetailSerializer,
    UserSerializer,
    RegisterSerializer,
)

# Authentication Views
class CustomTokenObtainPairView(TokenObtainPairView):
    """Login endpoint - returns tokens and user info"""
    
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        user = User.objects.get(username=request.data['username'])
        response.data['user'] = UserSerializer(user).data
        return response

class RegisterView(viewsets.ViewSet):
    """User registration endpoint"""
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['post'])
    def create(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not all([username, email, password]):
            return Response(
                {'error': 'Missing required fields'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if User.objects.filter(username=username).exists():
            return Response(
                {'error': 'Username already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )
        
        return Response(
            UserSerializer(user).data,
            status=status.HTTP_201_CREATED
        )

# Webinar/Event ViewSet
class EventViewSet(viewsets.ModelViewSet):
    """Webinar listing and management"""
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [AllowAny]
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return EventDetailSerializer
        return EventSerializer
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def register(self, request, pk=None):
        """Register user for webinar"""
        event = self.get_object()
        user = request.user
        
        # Check if already registered
        if Registration.objects.filter(user=user, event=event).exists():
            return Response(
                {'detail': 'Already registered for this webinar'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        Registration.objects.create(user=user, event=event)
        
        return Response(
            {'detail': 'Successfully registered'},
            status=status.HTTP_201_CREATED
        )

# Recordings ViewSet (if using separate Recording model)
class RecordingViewSet(viewsets.ReadOnlyModelViewSet):
    """Recording listing and retrieval"""
    # Adjust based on your Recording model
    queryset = Event.objects.filter(recorded=True)
    serializer_class = EventSerializer
    permission_classes = [AllowAny]
```

## Update URLs Configuration

Update `webinar_system/urls.py`:

```python
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from events.views import (
    CustomTokenObtainPairView,
    RegisterView,
    EventViewSet,
    RecordingViewSet,
)

router = DefaultRouter()
router.register(r'webinars', EventViewSet, basename='webinar')
router.register(r'recordings', RecordingViewSet, basename='recording')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/register/', RegisterView.as_view({'post': 'create'}), name='register'),
    path('api/', include(router.urls)),
]
```

## Database Models

Ensure your `events/models.py` has these fields:

```python
from django.db import models
from django.contrib.auth.models import User

class Event(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    speaker = models.CharField(max_length=200, blank=True)
    content = models.TextField(blank=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)
    attendees = models.ManyToManyField(User, related_name='events', through='Registration')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title

class Registration(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    registered_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'event')

class Recording(models.Model):
    title = models.CharField(max_length=200)
    webinar_id = models.IntegerField()
    video_url = models.URLField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title
```

## Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

## Testing the API

Use curl or Postman to test:

### Login
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "user", "password": "pass"}'
```

### List Webinars
```bash
curl http://localhost:8000/api/webinars/
```

### Register for Webinar
```bash
curl -X POST http://localhost:8000/api/webinars/1/register/ \
  -H "Authorization: Bearer <token>"
```

## Production Deployment

Before deploying:

1. Set `DEBUG = False` in settings
2. Update `ALLOWED_HOSTS`
3. Update `CORS_ALLOWED_ORIGINS` with production frontend URL
4. Use environment variables for sensitive data
5. Enable HTTPS (set `SECURE_SSL_REDIRECT = True`)
