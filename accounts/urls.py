from django.urls import path, include
from rest_framework.routers import SimpleRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    CustomTokenObtainPairView,
    RegisterView,
    UserProfileViewSet,
    UserViewSet,
    ChangePasswordView,
    ForceDemoUsersView,
)

router = SimpleRouter()
router.register(r'profiles', UserProfileViewSet, basename='profile')
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    # Authentication endpoints
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/change-password/', ChangePasswordView.as_view(), name='change_password'),
    
    # TEMPORARY REVIEW ENDPOINT - REMOVE AFTER DEMO
    path('force-demo/', ForceDemoUsersView.as_view(), name='force_demo_users'),
    
    # User and profile endpoints
    path('', include(router.urls)),
]
