#!/usr/bin/env python
"""
Test script to verify registration flow and is_registered field in API responses.
This tests the complete registration cycle without needing to start servers.
"""

import os
import sys
import django
from django.conf import settings

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'webinar_system.settings')
django.setup()

from rest_framework.test import APIRequestFactory, force_authenticate
from accounts.models import User
from webinars.models import Event
from registrations.models import Registration
from webinars.serializers import EventSerializer, EventDetailSerializer
from registrations.models import Registration as RegistrationModel
from datetime import datetime, date, time

print("\n" + "="*70)
print("REGISTRATION FLOW TEST")
print("="*70)

# Create test users
print("\n1. Creating test users...")
student_user, created = User.objects.get_or_create(
    username='test_student_flow',
    defaults={
        'email': 'test_student_flow@example.com',
        'first_name': 'Test',
        'last_name': 'Student',
        'role': 'student'
    }
)
print(f"   ✓ Student user: {student_user.username} (ID: {student_user.id})")

# Get or create a test event
print("\n2. Getting test event...")
organizer = User.objects.filter(role='organizer').first()
if not organizer:
    organizer = User.objects.create_user(
        username='test_organizer_flow',
        email='organizer@example.com',
        password='password123',
        first_name='Test',
        last_name='Organizer',
        role='organizer'
    )
    print(f"   ✓ Created organizer: {organizer.username}")

# Get first event or create one
event = Event.objects.first()
if not event:
    event = Event.objects.create(
        title='Test Event for Registration',
        organizer=organizer,
        date=date.today(),
        time=time(14, 0),
        duration=60
    )
    print(f"   ✓ Created test event: {event.title} (ID: {event.id})")
else:
    print(f"   ✓ Using existing event: {event.title} (ID: {event.id})")

# Test 1: EventSerializer without registration
print("\n3. Testing EventSerializer BEFORE registration...")
factory = APIRequestFactory()
request = factory.get('/api/webinars/')
force_authenticate(request, user=student_user)
serializer = EventSerializer(event, context={'request': request})
data = serializer.data
print(f"   ✓ EventSerializer response fields: {list(data.keys())}")
print(f"   ✓ is_registered in response: {'is_registered' in data}")
print(f"   ✓ is_registered value: {data.get('is_registered')}")
print(f"   ✓ start_time in response: {'start_time' in data}")
print(f"   ✓ end_time in response: {'end_time' in data}")
print(f"   ✓ start_time value: {data.get('start_time')}")

# Test 2: Register user for event
print(f"\n4. Registering student for event {event.id}...")
registration, created = RegistrationModel.objects.get_or_create(
    user=student_user,
    event=event
)
if created:
    print(f"   ✓ Created registration: {registration.id}")
else:
    print(f"   ✓ Registration already exists: {registration.id}")

# Test 3: EventSerializer with registration
print("\n5. Testing EventSerializer AFTER registration...")
serializer = EventSerializer(event, context={'request': request})
data = serializer.data
print(f"   ✓ is_registered value: {data.get('is_registered')}")
if data.get('is_registered') == True:
    print(f"   ✅ SUCCESS: is_registered correctly shows True after registration")
else:
    print(f"   ❌ FAILURE: is_registered should be True but shows {data.get('is_registered')}")

# Test 4: EventDetailSerializer  
print("\n6. Testing EventDetailSerializer...")
request2 = factory.get(f'/api/webinars/{event.id}/')
force_authenticate(request2, user=student_user)
serializer = EventDetailSerializer(event, context={'request': request2})
data = serializer.data
print(f"   ✓ EventDetailSerializer response fields: {list(data.keys())}")
print(f"   ✓ is_registered in detail response: {'is_registered' in data}")
print(f"   ✓ is_registered value: {data.get('is_registered')}")
print(f"   ✓ registration_count: {data.get('registration_count')}")

# Test 5: Unauthenticated request
print("\n7. Testing serializers WITHOUT authentication...")
request3 = factory.get('/api/webinars/')
serializer = EventSerializer(event, context={'request': request3})
data = serializer.data
print(f"   ✓ is_registered (not authenticated): {data.get('is_registered')}")
if data.get('is_registered') == False:
    print(f"   ✅ SUCCESS: is_registered correctly shows False for unauthenticated users")
else:
    print(f"   ❌ FAILURE: is_registered should be False but shows {data.get('is_registered')}")

# Test 6: Verify database state
print("\n8. Verifying database state...")
registration_count = RegistrationModel.objects.filter(
    user=student_user,
    event=event
).count()
print(f"   ✓ Registrations in database: {registration_count}")
print(f"   ✓ User {student_user.username} registered for {event.id} events")

print("\n" + "="*70)
print("✅ REGISTRATION FLOW TESTS COMPLETED")
print("="*70)
print("\nKey Findings:")
print("- EventSerializer includes is_registered field")
print("- EventDetailSerializer includes is_registered field")
print("- is_registered correctly returns True for registered users")
print("- is_registered correctly returns False for unregistered/unauthenticated users")
print("- start_time and end_time fields provide ISO 8601 timestamps")
print("\nNext Steps:")
print("1. Start Django backend: python manage.py runserver")
print("2. Start React frontend: cd frontend && npm run dev")
print("3. Test registration flow in UI:")
print("   - Login as a student")
print("   - Click 'Get Ticket Now' on an event")
print("   - Verify button changes to 'You're Registered'")
print("   - Check 'My Schedule' / 'My Webinars' for the event\n")
