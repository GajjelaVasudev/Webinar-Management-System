from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EventViewSet, RecordingViewSet, CustomTokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView

# Create router for viewsets
router = DefaultRouter()
router.register(r'webinars', EventViewSet, basename='webinar')
router.register(r'recordings', RecordingViewSet, basename='recording')

# API URL patterns
api_patterns = [
    path('', include(router.urls)),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

urlpatterns = [
    path('api/', include(api_patterns)),
]
