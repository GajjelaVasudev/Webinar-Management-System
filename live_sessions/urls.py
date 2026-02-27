from django.urls import path, include
from rest_framework.routers import SimpleRouter

from .views import LiveSessionViewSet

router = SimpleRouter()
router.register(r'', LiveSessionViewSet, basename='live_session')

urlpatterns = [
    path('', include(router.urls)),
]
