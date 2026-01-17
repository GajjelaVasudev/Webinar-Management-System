#!/usr/bin/env python
"""Test registration flow with JWT authentication"""
import os
import sys
import django
import requests
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'webinar_system.settings')
django.setup()

from django.contrib.auth.models import User as DjangoUser
from events.models import Event
from decimal import Decimal
from datetime import date, time, timedelta

# Base URL for the API
BASE_URL = "http://localhost:8000"
API_URL = f"{BASE_URL}/api"

print("\n" + "=" * 70)
print("REGISTRATION FLOW TEST - With JWT Authentication")
print("=" * 70)

# Step 1: Create or get test user
username = 'testuser123'
email = 'testuser123@test.com'
password = 'testpass123'

test_user = DjangoUser.objects.filter(username=username).first()
if not test_user:
    test_user = DjangoUser.objects.create_user(
        username=username,
        email=email,
        password=password
    )
    print(f"\n✓ Test user created: {username}")
else:
    print(f"\n✓ Test user exists: {username}")

# Step 2: Create a test event
tomorrow = date.today() + timedelta(days=1)
event_title = f"Test Event {date.today()}"
event = Event.objects.filter(title=event_title).first()
if not event:
    event = Event.objects.create(
        title=event_title,
        description='Test event for registration',
        date=tomorrow,
        time=time(14, 0),
        duration=60,
        price=Decimal('99.99'),
        organizer=test_user
    )
    print(f"✓ Test event created: {event.title} (ID: {event.id})")
else:
    print(f"✓ Test event exists: {event.title} (ID: {event.id})")

# Step 3: Login to get JWT token
print("\n" + "-" * 70)
print("STEP 1: LOGIN AND GET JWT TOKEN")
print("-" * 70)

login_data = {
    'username': username,
    'password': password
}

response = requests.post(f"{API_URL}/auth/login/", json=login_data)
print(f"POST {API_URL}/auth/login/")
print(f"Status: {response.status_code}")

if response.status_code == 200:
    tokens = response.json()
    access_token = tokens.get('access')
    print(f"✓ Login successful")
    print(f"  Access Token: {access_token[:50]}...")
else:
    print(f"✗ Login failed: {response.text}")
    sys.exit(1)

# Step 4: Get events list with JWT token
print("\n" + "-" * 70)
print("STEP 2: GET EVENTS LIST (with JWT)")
print("-" * 70)

headers = {'Authorization': f'Bearer {access_token}'}
response = requests.get(f"{API_URL}/webinars/", headers=headers)
print(f"GET {API_URL}/webinars/")
print(f"Status: {response.status_code}")

if response.status_code == 200:
    events_data = response.json()
    if isinstance(events_data, dict):
        events = events_data.get('results', [])
    else:
        events = events_data
    
    print(f"✓ Got {len(events)} events")
    
    # Find our test event
    test_event_data = None
    for ev in events:
        if ev['id'] == event.id:
            test_event_data = ev
            break
    
    if test_event_data:
        print(f"\nTest Event Details:")
        print(f"  - Title: {test_event_data['title']}")
        print(f"  - Price: {test_event_data['price']}")
        print(f"  - is_registered: {test_event_data.get('is_registered', 'MISSING')}")
    else:
        print(f"✗ Test event not found in list")
else:
    print(f"✗ Failed to get events: {response.text}")

# Step 5: Register for the event
print("\n" + "-" * 70)
print("STEP 3: REGISTER FOR EVENT")
print("-" * 70)

response = requests.post(f"{API_URL}/webinars/{event.id}/register/", headers=headers)
print(f"POST {API_URL}/webinars/{event.id}/register/")
print(f"Status: {response.status_code}")

if response.status_code in [200, 201]:
    reg_data = response.json()
    print(f"✓ Registration successful")
    print(f"  Response: {json.dumps(reg_data, indent=2)}")
else:
    print(f"✗ Registration failed: {response.text}")

# Step 6: Get events again after registration
print("\n" + "-" * 70)
print("STEP 4: GET EVENTS LIST AGAIN (after registration)")
print("-" * 70)

response = requests.get(f"{API_URL}/webinars/", headers=headers)
print(f"GET {API_URL}/webinars/")
print(f"Status: {response.status_code}")

if response.status_code == 200:
    events_data = response.json()
    if isinstance(events_data, dict):
        events = events_data.get('results', [])
    else:
        events = events_data
    
    # Find our test event
    test_event_data = None
    for ev in events:
        if ev['id'] == event.id:
            test_event_data = ev
            break
    
    if test_event_data:
        print(f"\nTest Event After Registration:")
        print(f"  - Title: {test_event_data['title']}")
        print(f"  - is_registered: {test_event_data.get('is_registered', 'MISSING')}")
        
        if test_event_data.get('is_registered') == True:
            print(f"\n✅ SUCCESS! is_registered = True")
        else:
            print(f"\n✗ FAILED! is_registered should be True, got {test_event_data.get('is_registered')}")
    else:
        print(f"✗ Test event not found in list after registration")
else:
    print(f"✗ Failed to get events: {response.text}")

# Step 7: Get event detail
print("\n" + "-" * 70)
print("STEP 5: GET EVENT DETAIL")
print("-" * 70)

response = requests.get(f"{API_URL}/webinars/{event.id}/", headers=headers)
print(f"GET {API_URL}/webinars/{event.id}/")
print(f"Status: {response.status_code}")

if response.status_code == 200:
    event_detail = response.json()
    print(f"\nEvent Detail:")
    print(f"  - Title: {event_detail['title']}")
    print(f"  - is_registered: {event_detail.get('is_registered', 'MISSING')}")
    
    if event_detail.get('is_registered') == True:
        print(f"\n✅ SUCCESS! Detail view shows is_registered = True")
    else:
        print(f"\n✗ FAILED! Detail view is_registered should be True, got {event_detail.get('is_registered')}")
else:
    print(f"✗ Failed to get event detail: {response.text}")

print("\n" + "=" * 70)
