from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    EventViewSet,
    RecordingViewSet,
    RegistrationViewSet,
    AdminUserViewSet,
    CustomTokenObtainPairView,
    UserProfileViewSet,
    RegisterView,
    DashboardStatsView,
    AnnouncementViewSet,
    UserNotificationViewSet,
    WebinarChatMessageViewSet,
    ChangePasswordView,
)
from rest_framework_simplejwt.views import TokenRefreshView

# Create router for viewsets
router = DefaultRouter()
router.register(r'webinars', EventViewSet, basename='webinar')
router.register(r'recordings', RecordingViewSet, basename='recording')
router.register(r'users/profile', UserProfileViewSet, basename='user-profile')
router.register(r'users/admin', AdminUserViewSet, basename='admin-user')
router.register(r'registrations', RegistrationViewSet, basename='registration')
router.register(r'announcements', AnnouncementViewSet, basename='announcement')
router.register(r'notifications', UserNotificationViewSet, basename='notification')
router.register(r'chat/messages', WebinarChatMessageViewSet, basename='chat-message')

api_patterns = [
    path('', include(router.urls)),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('stats/dashboard/', DashboardStatsView.as_view(), name='dashboard_stats'),
]

urlpatterns = [
    path('api/', include(api_patterns)),
]