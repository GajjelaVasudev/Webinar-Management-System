#!/usr/bin/env python
"""Debug the get_is_registered method"""
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'webinar_system.settings')
django.setup()

from events.models import Event, Registration
from events.serializers import EventSerializer, EventDetailSerializer
from django.contrib.auth.models import User as DjangoUser
from decimal import Decimal
from datetime import date, time, timedelta
from rest_framework.request import Request
from rest_framework.test import APIRequestFactory

# Create test data
test_user = DjangoUser.objects.filter(username='debug_user').first()
if not test_user:
    test_user = DjangoUser.objects.create_user(
        username='debug_user',
        email='debug@test.com',
        password='debug123'
    )

tomorrow = date.today() + timedelta(days=1)
event = Event.objects.filter(title='Debug Event').first()
if not event:
    event = Event.objects.create(
        title='Debug Event',
        description='For debugging',
        date=tomorrow,
        time=time(10, 0),
        duration=60,
        price=Decimal('49.99'),
        organizer=test_user
    )

# Create registration
registration, _ = Registration.objects.get_or_create(
    user=test_user,
    event=event
)

print(f"\n=== DEBUGGING get_is_registered ===")
print(f"Test User: {test_user.username} (id={test_user.id})")
print(f"Event: {event.title} (id={event.id})")
print(f"Registration exists in DB: {Registration.objects.filter(user=test_user, event=event).exists()}")
print(f"Registration count for event: {event.registrations.count()}")
print(f"Registration.user={registration.user.id}, test_user.id={test_user.id}")

# Test the method directly
factory = APIRequestFactory()
request = factory.get('/api/webinars/')
request.user = test_user

print(f"\nRequest object: {request}")
print(f"Request.user: {request.user}")
print(f"Request.user.is_authenticated: {request.user.is_authenticated}")

wrapped_request = Request(request)
print(f"Wrapped Request: {wrapped_request}")
print(f"Wrapped Request.user: {wrapped_request.user}")
print(f"Wrapped Request.user.is_authenticated: {wrapped_request.user.is_authenticated}")

# Create serializer with context
context = {'request': wrapped_request}
serializer = EventSerializer(event, context=context)

# Debug: Call get_is_registered directly
print(f"\n=== Calling get_is_registered directly ===")
request_from_context = context.get('request')
print(f"Request from context: {request_from_context}")
print(f"Request.user: {request_from_context.user if request_from_context else 'None'}")
print(f"Request.user.is_authenticated: {request_from_context.user.is_authenticated if request_from_context else 'N/A'}")

if request_from_context and request_from_context.user and request_from_context.user.is_authenticated:
    print(f"Checking registrations...")
    registrations_qs = event.registrations.filter(user=request_from_context.user)
    print(f"Query: event.registrations.filter(user=request.user)")
    print(f"Registrations queryset: {registrations_qs}")
    print(f"Exists: {registrations_qs.exists()}")
    
    for reg in event.registrations.all():
        print(f"  Registration: user={reg.user.id}, event={reg.event.id}")

result = serializer.data.get('is_registered')
print(f"\n=== RESULT ===")
print(f"is_registered: {result}")

# Clean up
event.delete()
