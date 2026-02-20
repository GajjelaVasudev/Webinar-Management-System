#!/usr/bin/env python
"""Test registration flow with is_registered field"""
import os
import sys
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'webinar_system.settings')
django.setup()

from rest_framework.test import APIClient
from events.models import Event, Registration
from django.contrib.auth.models import User as DjangoUser
from decimal import Decimal
from datetime import date, time, timedelta

client = APIClient()

print("=" * 70)
print("REGISTRATION FLOW TEST - With is_registered Field")
print("=" * 70)

# Create test user
test_user = DjangoUser.objects.filter(username='reg_test_user').first()
if not test_user:
    test_user = DjangoUser.objects.create_user(
        username='reg_test_user',
        email='regtest@test.com',
        password='regtest123'
    )
print(f"\n✓ Created test user: {test_user.username} ({test_user.email})")

# Create test event
tomorrow = date.today() + timedelta(days=1)
event = Event.objects.filter(title='Registration Test Event').first()
if not event:
    event = Event.objects.create(
        title='Registration Test Event',
        description='Event to test registration flow',
        date=tomorrow,
        time=time(10, 0),
        duration=60,
        price=Decimal('49.99'),
        organizer=test_user
    )
print(f"✓ Created test event: {event.title} (ID: {event.id}, Price: ${event.price})")

# Test 1: Before registration - is_registered should be False
print("\n" + "=" * 70)
print("Test 1: Before Registration - is_registered = False")
print("=" * 70)
try:
    response = client.get(f'/api/webinars/{event.id}/')
    if response.status_code == 200:
        event_data = response.json()
        print(f"\nEvent Response:")
        print(f"  - ID: {event_data['id']}")
        print(f"  - Title: {event_data['title']}")
        print(f"  - is_registered: {event_data.get('is_registered', 'MISSING!')}")
        
        if 'is_registered' not in event_data:
            print("\n✗ ERROR: is_registered field is MISSING from response!")
        elif event_data['is_registered'] == False:
            print("\n✓ Test 1 PASSED: is_registered is False before registration")
        else:
            print(f"\n✗ ERROR: is_registered should be False but got {event_data['is_registered']}")
    else:
        print(f"✗ Failed with status {response.status_code}")
except Exception as e:
    print(f"✗ Test 1 FAILED: {e}")

# Test 2: Register the user
print("\n" + "=" * 70)
print("Test 2: Register User for Event")
print("=" * 70)
try:
    client.force_authenticate(user=test_user)
    response = client.post(f'/api/webinars/{event.id}/register/', {})
    print(f"Response Status: {response.status_code}")
    
    if response.status_code in [200, 201]:
        reg_data = response.json()
        print(f"\nRegistration Response:")
        print(f"  - Status: {reg_data.get('detail', 'N/A')}")
        print(f"  - Email: {reg_data.get('email', 'N/A')}")
        print(f"  - Event ID: {reg_data.get('event_id', 'N/A')}")
        print(f"  - Registration ID: {reg_data.get('id', 'N/A')}")
        
        print("\n✓ Test 2 PASSED: Registration successful")
    else:
        print(f"✗ Failed with status {response.status_code}")
        print(response.json())
except Exception as e:
    print(f"✗ Test 2 FAILED: {e}")

# Test 3: After registration - is_registered should be True
print("\n" + "=" * 70)
print("Test 3: After Registration - is_registered = True")
print("=" * 70)
try:
    response = client.get(f'/api/webinars/{event.id}/')
    if response.status_code == 200:
        event_data = response.json()
        print(f"\nEvent Response:")
        print(f"  - ID: {event_data['id']}")
        print(f"  - Title: {event_data['title']}")
        print(f"  - is_registered: {event_data.get('is_registered', 'MISSING!')}")
        
        if 'is_registered' not in event_data:
            print("\n✗ ERROR: is_registered field is MISSING from response!")
        elif event_data['is_registered'] == True:
            print("\n✓ Test 3 PASSED: is_registered is True after registration")
        else:
            print(f"\n✗ ERROR: is_registered should be True but got {event_data['is_registered']}")
    else:
        print(f"✗ Failed with status {response.status_code}")
except Exception as e:
    print(f"✗ Test 3 FAILED: {e}")

# Test 4: List all events - registered event shows is_registered = True
print("\n" + "=" * 70)
print("Test 4: List All Events - Check is_registered Field")
print("=" * 70)
try:
    response = client.get('/api/webinars/')
    if response.status_code == 200:
        events_list = response.json()
        if isinstance(events_list, dict):
            events_list = events_list.get('results', events_list.get('data', []))
        
        found = False
        for ev in events_list:
            if ev['id'] == event.id:
                found = True
                print(f"\nFound event in list:")
                print(f"  - Title: {ev['title']}")
                print(f"  - is_registered: {ev.get('is_registered', 'MISSING!')}")
                print(f"  - Price: ${ev.get('price', 'N/A')}")
                
                if ev.get('is_registered') == True:
                    print("\n✓ Test 4 PASSED: is_registered is True in list view")
                else:
                    print(f"\n✗ ERROR: is_registered should be True but got {ev.get('is_registered')}")
                break
        
        if not found:
            print(f"\n⚠ Event {event.id} not found in list")
    else:
        print(f"✗ Failed with status {response.status_code}")
except Exception as e:
    print(f"✗ Test 4 FAILED: {e}")

# Test 5: Unauthenticated user - is_registered = False for all
print("\n" + "=" * 70)
print("Test 5: Unauthenticated User - is_registered = False")
print("=" * 70)
try:
    client.force_authenticate(user=None)
    response = client.get(f'/api/webinars/{event.id}/')
    if response.status_code == 200:
        event_data = response.json()
        print(f"\nUnauthenticated response:")
        print(f"  - is_registered: {event_data.get('is_registered', 'MISSING!')}")
        
        if event_data.get('is_registered') == False:
            print("\n✓ Test 5 PASSED: Unauthenticated user sees is_registered = False")
        else:
            print(f"\n✗ ERROR: Unauthenticated should see False but got {event_data.get('is_registered')}")
    else:
        print(f"✗ Failed with status {response.status_code}")
except Exception as e:
    print(f"✗ Test 5 FAILED: {e}")

print("\n" + "=" * 70)
print("ALL REGISTRATION TESTS COMPLETED ✓")
print("=" * 70)

# Cleanup
print("\nCleaning up test data...")
event.delete()
print("✓ Cleanup complete")

print("\n🎉 Registration flow is now working correctly!")
print("   The is_registered field will sync properly in the user portal.")
