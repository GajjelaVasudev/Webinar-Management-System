#!/usr/bin/env python
"""Test recordings API to diagnose what's wrong"""
import os
import sys
import django
import requests

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'webinar_system.settings')
django.setup()

from django.contrib.auth.models import User
from events.models import Event, Recording
from decimal import Decimal
from datetime import date, time, timedelta

BASE_URL = "http://localhost:8000"
API_URL = f"{BASE_URL}/api"

print("\n" + "=" * 70)
print("RECORDINGS API DIAGNOSTIC TEST")
print("=" * 70)

# Create test data if needed
user = User.objects.filter(username='rectest').first()
if not user:
    user = User.objects.create_user(username='rectest', email='rec@test.com', password='rec123')
    print(f"\n✓ Test user created: {user.username}")
else:
    print(f"\n✓ Test user exists: {user.username}")

# Create event
tomorrow = date.today() + timedelta(days=1)
event = Event.objects.filter(title='Recording Test Event').first()
if not event:
    event = Event.objects.create(
        title='Recording Test Event',
        date=tomorrow,
        time=time(14, 0),
        duration=60,
        price=Decimal('99.99'),
        organizer=user
    )
    print(f"✓ Event created: {event.title}")
else:
    print(f"✓ Event exists: {event.title}")

# Create recordings
Recording.objects.filter(event=event).delete()
rec1 = Recording.objects.create(
    event=event,
    recording_link="https://example.com/recording1.mp4"
)
rec2 = Recording.objects.create(
    event=event,
    recording_link="https://example.com/recording2.mp4"
)
print(f"✓ Recordings created: {rec1.id}, {rec2.id}")

# Test 1: Get recordings without auth
print("\n" + "-" * 70)
print("TEST 1: GET /api/recordings/ (without auth)")
print("-" * 70)

response = requests.get(f"{API_URL}/recordings/")
print(f"Status: {response.status_code}")
print(f"Response:")
import json
data = response.json()
print(json.dumps(data, indent=2))

# Test 2: Login and get with auth
print("\n" + "-" * 70)
print("TEST 2: LOGIN AND GET /api/recordings/ (with JWT)")
print("-" * 70)

login_response = requests.post(f"{API_URL}/auth/login/", json={
    'username': 'rectest',
    'password': 'rec123'
})

if login_response.status_code == 200:
    token = login_response.json()['access']
    headers = {'Authorization': f'Bearer {token}'}
    
    response = requests.get(f"{API_URL}/recordings/", headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response:")
    data = response.json()
    print(json.dumps(data, indent=2))
    
    # Test 3: Get specific event detail
    print("\n" + "-" * 70)
    print(f"TEST 3: GET /api/webinars/{event.id}/ (event with recordings)")
    print("-" * 70)
    
    response = requests.get(f"{API_URL}/webinars/{event.id}/", headers=headers)
    print(f"Status: {response.status_code}")
    data = response.json()
    
    # Check if recordings are in event detail
    if 'recordings' in data:
        print(f"✓ Event has 'recordings' field")
        print(f"  Count: {len(data['recordings'])}")
        print(f"  Data:")
        print(json.dumps(data['recordings'], indent=2))
    else:
        print(f"✗ Event does NOT have 'recordings' field")
        print(f"  Available fields: {list(data.keys())}")
else:
    print(f"✗ Login failed: {login_response.text}")

print("\n" + "=" * 70)
