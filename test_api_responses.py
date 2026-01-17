#!/usr/bin/env python
"""Test script to verify API responses include all required fields"""
import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'webinar_system.settings')
django.setup()

from django.contrib.auth.models import User
from events.models import Event, Recording, UserProfile
from events.serializers import EventSerializer, EventDetailSerializer, RecordingSerializer
from datetime import datetime, timedelta

print("=" * 80)
print("API RESPONSE FIELD VERIFICATION")
print("=" * 80)

# Create test admin user
admin_user, _ = User.objects.get_or_create(
    username='apitest_admin',
    defaults={'email': 'api@test.com', 'is_staff': True, 'is_superuser': True}
)
admin_profile, _ = UserProfile.objects.get_or_create(user=admin_user, defaults={'role': 'admin'})

# Create test webinar
tomorrow = datetime.now().date() + timedelta(days=1)
event = Event.objects.create(
    title="API Test Webinar",
    description="Testing API response fields",
    date=tomorrow,
    time=datetime.now().time(),
    duration=75,
    organizer=admin_user
)

# Create recording
recording = Recording.objects.create(
    event=event,
    recording_link="https://example.com/test-recording.mp4"
)

print("\n[TEST 1] EventSerializer Response Fields")
print("-" * 80)

serializer = EventSerializer(event, context={'request': None})
data = serializer.data

print("Required fields in response:")
required_fields = [
    'id', 'title', 'description', 'date', 'time', 'duration',
    'start_time', 'end_time', 'thumbnail', 'thumbnail_url',
    'organizer', 'organizer_name', 'attendees_count'
]

for field in required_fields:
    present = field in data
    value = data.get(field)
    status = "✓" if present else "✗"
    print(f"  {status} {field:20s} = {repr(value)[:50] if present else 'MISSING'}")

if all(field in data for field in required_fields):
    print("\n✓ PASS: All required fields present!")
else:
    print("\n✗ FAIL: Some fields missing!")

print("\n[TEST 2] EventDetailSerializer Response")
print("-" * 80)

detail_serializer = EventDetailSerializer(event, context={'request': None})
detail_data = detail_serializer.data

print("Key fields in detail response:")
key_fields = ['id', 'title', 'duration', 'thumbnail', 'thumbnail_url', 'recordings']

for field in key_fields:
    present = field in detail_data
    value = detail_data.get(field)
    status = "✓" if present else "✗"
    print(f"  {status} {field:20s} = {repr(value)[:50] if present else 'MISSING'}")

print("\n[TEST 3] Recording Linked to Correct Event")
print("-" * 80)

print(f"Recording ID: {recording.id}")
print(f"Recording.event: {recording.event.id} (Event: {recording.event.title})")
print(f"Recording.recording_link: {recording.recording_link}")

rec_serializer = RecordingSerializer(recording)
rec_data = rec_serializer.data

print(f"\nRecordingSerializer response:")
print(f"  - id: {rec_data.get('id')}")
print(f"  - event: {rec_data.get('event')}")
print(f"  - event_title: {rec_data.get('event_title')}")
print(f"  - recording_link: {rec_data.get('recording_link')}")

if rec_data.get('event') == event.id and rec_data.get('event_title') == event.title:
    print(f"\n✓ PASS: Recording correctly linked to event!")
else:
    print(f"\n✗ FAIL: Recording link incorrect!")

print("\n[TEST 4] Event Recordings Queryable by Event")
print("-" * 80)

event_recordings = event.recordings.all()
print(f"Event {event.id} has {event_recordings.count()} recording(s)")
for rec in event_recordings:
    print(f"  - Recording {rec.id}: {rec.recording_link}")

if event_recordings.count() == 1:
    print(f"\n✓ PASS: Can query recordings by event!")
else:
    print(f"\n✗ FAIL: Recording query failed!")

print("\n[TEST 5] Duration Field Validation")
print("-" * 80)

print(f"Event duration: {event.duration} minutes")
print(f"Serialized duration: {data.get('duration')}")

if event.duration == data.get('duration'):
    print(f"\n✓ PASS: Duration correctly serialized!")
else:
    print(f"\n✗ FAIL: Duration mismatch!")

print("\n" + "=" * 80)
print("VERIFICATION COMPLETE")
print("=" * 80)

# Cleanup
event.delete()
admin_user.delete()

print("\nAll test data cleaned up.\n")
