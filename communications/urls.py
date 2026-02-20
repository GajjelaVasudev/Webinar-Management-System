from django.urls import path, include
from rest_framework.routers import SimpleRouter

from .views import (
    AnnouncementViewSet,
    UserNotificationViewSet,
    WebinarChatMessageViewSet,
)

router = SimpleRouter()
router.register(r'announcements', AnnouncementViewSet, basename='announcement')
router.register(r'notifications', UserNotificationViewSet, basename='notification')
router.register(r'chat', WebinarChatMessageViewSet, basename='chat')

urlpatterns = [
    path('', include(router.urls)),
]
