from django.urls import path, include
from rest_framework.routers import SimpleRouter

from .views import RecordingViewSet

router = SimpleRouter()
router.register(r'', RecordingViewSet, basename='recording')

urlpatterns = [
    path('', include(router.urls)),
]
