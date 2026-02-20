"""
URL configuration for webinar_system project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
"""
from django.contrib import admin
from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static

# API URL patterns
api_patterns = [
    path('accounts/', include('accounts.urls')),
    path('webinars/', include('webinars.urls')),
    path('registrations/', include('registrations.urls')),
    path('recordings/', include('recordings.urls')),
    path('communications/', include('communications.urls')),
]

urlpatterns = [
    # Admin site
    path('admin/', admin.site.urls),
    
    # API endpoints
    path('api/', include(api_patterns)),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

