from django.urls import path, include
from rest_framework.routers import SimpleRouter

from .views import (
    AnnouncementViewSet,
    UserNotificationViewSet,
    WebinarChatMessageViewSet,
    InboxViewSet,
)

router = SimpleRouter()
router.register(r'announcements', AnnouncementViewSet, basename='announcement')
router.register(r'notifications', UserNotificationViewSet, basename='notification')
router.register(r'chat', WebinarChatMessageViewSet, basename='chat')
router.register(r'inbox', InboxViewSet, basename='inbox')

urlpatterns = [
    path('', include(router.urls)),
]
