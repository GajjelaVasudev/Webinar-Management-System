from django.urls import path, include
from rest_framework.routers import SimpleRouter

from .views import RegistrationViewSet

router = SimpleRouter()
router.register(r'', RegistrationViewSet, basename='registration')

urlpatterns = [
    path('', include(router.urls)),
]
