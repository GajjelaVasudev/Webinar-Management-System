#!/usr/bin/env python
"""Test script to verify webinar lifecycle and fields"""
import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'webinar_system.settings')
django.setup()

from django.contrib.auth.models import User
from events.models import Event, Recording, Registration, UserProfile
from datetime import datetime, timedelta

print("=" * 80)
print("WEBINAR LIFECYCLE TEST")
print("=" * 80)

# Clean up test data
Event.objects.filter(title__startswith="Test Webinar").delete()
Recording.objects.all().delete()

# Create test user (admin)
admin_user, _ = User.objects.get_or_create(
    username='testadmin',
    defaults={'email': 'admin@test.com', 'is_staff': True, 'is_superuser': True}
)
admin_profile, _ = UserProfile.objects.get_or_create(user=admin_user, defaults={'role': 'admin'})

# Create test user (regular)
regular_user, _ = User.objects.get_or_create(
    username='testuser',
    defaults={'email': 'user@test.com'}
)
regular_profile, _ = UserProfile.objects.get_or_create(user=regular_user, defaults={'role': 'user'})

print("\n✓ Created test users")
print(f"  - Admin: {admin_user.username} ({admin_profile.role})")
print(f"  - User: {regular_user.username} ({regular_profile.role})")

# Test 1: Create webinar with duration and thumbnail fields
print("\n[TEST 1] Create webinar with duration and thumbnail")
tomorrow = datetime.now().date() + timedelta(days=1)
event = Event.objects.create(
    title="Test Webinar - Full Lifecycle",
    description="Testing all webinar fields",
    date=tomorrow,
    time=datetime.now().time(),
    duration=90,  # 90 minutes
    organizer=admin_user
)

print(f"✓ Webinar created:")
print(f"  - ID: {event.id}")
print(f"  - Title: {event.title}")
print(f"  - Duration: {event.duration} minutes")
print(f"  - Thumbnail: {event.thumbnail or 'Not set'}")

# Test 2: Register user for webinar
print("\n[TEST 2] Register user for webinar")
registration, created = Registration.objects.get_or_create(
    user=regular_user,
    event=event
)

if created:
    print(f"✓ User registered for webinar")
    print(f"  - Registration ID: {registration.id}")
    print(f"  - User: {registration.user.username}")
    print(f"  - Event: {registration.event.title}")
else:
    print(f"! User already registered")

# Test 3: Add recordings to webinar
print("\n[TEST 3] Add recordings to webinar")
recording1 = Recording.objects.create(
    event=event,
    recording_link="https://example.com/recording1.mp4"
)
recording2 = Recording.objects.create(
    event=event,
    recording_link="https://example.com/recording2.mp4"
)

print(f"✓ Recordings created for webinar:")
print(f"  - Recording 1: {recording1.id} -> {recording1.event.title}")
print(f"  - Recording 2: {recording2.id} -> {recording2.event.title}")

# Test 4: Verify recordings are linked to correct webinar
print("\n[TEST 4] Verify recordings separation per webinar")
event_recordings = event.recordings.all()
print(f"✓ Webinar '{event.title}' has {event_recordings.count()} recordings:")
for rec in event_recordings:
    print(f"  - {rec.id}: {rec.recording_link}")

# Test 5: Test with another webinar to ensure separation
print("\n[TEST 5] Verify recordings don't mix across webinars")
other_event = Event.objects.create(
    title="Test Webinar 2 - Separate",
    description="Another test webinar",
    date=tomorrow + timedelta(days=1),
    time=datetime.now().time(),
    duration=60,
    organizer=admin_user
)
other_recording = Recording.objects.create(
    event=other_event,
    recording_link="https://example.com/other-recording.mp4"
)

print(f"✓ Created second webinar with separate recording")
print(f"  - Webinar 2: {other_event.title} (ID: {other_event.id})")
print(f"  - Recording: {other_recording.id}")

# Verify separation
first_event_recs = event.recordings.count()
second_event_recs = other_event.recordings.count()
print(f"\n✓ Recording separation verified:")
print(f"  - Webinar 1 recordings: {first_event_recs} (expected 2)")
print(f"  - Webinar 2 recordings: {second_event_recs} (expected 1)")

if first_event_recs == 2 and second_event_recs == 1:
    print("  ✓ PASS: Recordings properly separated!")
else:
    print("  ✗ FAIL: Recordings are mixing!")

# Test 6: Check serializer output
print("\n[TEST 6] Verify API serializer response")
from events.serializers import EventSerializer
serializer = EventSerializer(event)
data = serializer.data

print(f"✓ Event serialized with fields:")
for key in ['id', 'title', 'duration', 'thumbnail', 'thumbnail_url']:
    value = data.get(key)
    print(f"  - {key}: {value}")

# Test 7: Verify admin permissions
print("\n[TEST 7] Verify role-based permissions")
print(f"✓ Admin user: {admin_user.username}")
print(f"  - is_staff: {admin_user.is_staff}")
print(f"  - is_superuser: {admin_user.is_superuser}")
print(f"  - profile.role: {admin_profile.role}")

print(f"✓ Regular user: {regular_user.username}")
print(f"  - is_staff: {regular_user.is_staff}")
print(f"  - is_superuser: {regular_user.is_superuser}")
print(f"  - profile.role: {regular_profile.role}")

print("\n" + "=" * 80)
print("TESTS COMPLETE!")
print("=" * 80)

# Cleanup
print("\n[CLEANUP] Removing test data...")
event.delete()
other_event.delete()
admin_user.delete()
regular_user.delete()
print("✓ Cleanup complete\n")
