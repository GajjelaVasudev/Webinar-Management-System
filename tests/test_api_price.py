#!/usr/bin/env python
"""Test API endpoints for price field and registration"""
import os
import sys
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'webinar_system.settings')
django.setup()

from rest_framework.test import APIClient
from events.models import Event, User as DjangoUser
from decimal import Decimal
from datetime import date, time, timedelta

client = APIClient()

print("=" * 70)
print("API ENDPOINT TESTS - Price Field & Registration")
print("=" * 70)

# Create test user
test_user = DjangoUser.objects.filter(username='api_test_user').first()
if not test_user:
    test_user = DjangoUser.objects.create_user(
        username='api_test_user',
        email='apitest@test.com',
        password='apitest123'
    )
print(f"\n✓ Created test user: {test_user.username}")

# Create test events with different prices
tomorrow = date.today() + timedelta(days=1)

paid_event = Event.objects.filter(title='Premium API Test Event').first()
if not paid_event:
    paid_event = Event.objects.create(
        title='Premium API Test Event',
        description='A paid test event',
        date=tomorrow,
        time=time(10, 0),
        duration=60,
        price=Decimal('49.99'),
        organizer=test_user
    )

free_event = Event.objects.filter(title='Free API Test Event').first()
if not free_event:
    free_event = Event.objects.create(
        title='Free API Test Event',
        description='A free test event',
        date=tomorrow,
        time=time(14, 0),
        duration=45,
        price=Decimal('0.00'),
        organizer=test_user
    )

print(f"✓ Created test events (ID: {paid_event.id}, {free_event.id})")

# Test 1: GET /api/webinars/ includes price field
print("\n" + "=" * 70)
print("Test 1: GET /api/webinars/ - Check Price Field in List")
print("=" * 70)
try:
    response = client.get('/api/webinars/')
    print(f"Response Status: {response.status_code}")
    
    if response.status_code == 200:
        events = response.json()
        if isinstance(events, dict):
            events_list = events.get('results', events.get('data', []))
        else:
            events_list = events
        
        found_paid = False
        found_free = False
        
        for event in events_list:
            if event['id'] == paid_event.id:
                found_paid = True
                print(f"\n✓ Found paid event:")
                print(f"  - ID: {event['id']}")
                print(f"  - Title: {event['title']}")
                print(f"  - Price: ${event.get('price', 'N/A')}")
                assert 'price' in event, "Price field missing!"
                assert float(event['price']) == 49.99, "Price value incorrect"
                
            if event['id'] == free_event.id:
                found_free = True
                print(f"\n✓ Found free event:")
                print(f"  - ID: {event['id']}")
                print(f"  - Title: {event['title']}")
                print(f"  - Price: ${event.get('price', 'N/A')}")
                assert 'price' in event, "Price field missing!"
                assert float(event['price']) == 0.0, "Free event price incorrect"
        
        if found_paid and found_free:
            print("\n✓ Test 1 PASSED: Both events returned with price field")
        else:
            print(f"\n✗ Test 1 FAILED: Missing events (paid={found_paid}, free={found_free})")
    else:
        print(f"✗ Failed with status {response.status_code}")
        print(response.content)
except Exception as e:
    print(f"✗ Test 1 FAILED with error: {e}")

# Test 2: GET /api/webinars/{id}/ returns price and all fields
print("\n" + "=" * 70)
print("Test 2: GET /api/webinars/{id}/ - Check Detailed Price Field")
print("=" * 70)
try:
    response = client.get(f'/api/webinars/{paid_event.id}/')
    print(f"Response Status: {response.status_code}")
    
    if response.status_code == 200:
        event = response.json()
        print(f"\n✓ Event Details:")
        print(f"  - Title: {event['title']}")
        print(f"  - Price: ${event.get('price', 'N/A')}")
        print(f"  - Duration: {event.get('duration', 'N/A')} minutes")
        print(f"  - Description: {event['description'][:50]}...")
        
        assert 'price' in event, "Price field missing in detail view!"
        assert float(event['price']) == 49.99, "Price value incorrect"
        print("\n✓ Test 2 PASSED: Detailed event includes price field")
    else:
        print(f"✗ Failed with status {response.status_code}")
except Exception as e:
    print(f"✗ Test 2 FAILED with error: {e}")

# Test 3: POST /api/webinars/{id}/register/ returns email
print("\n" + "=" * 70)
print("Test 3: POST /api/webinars/{id}/register/ - Check Response Structure")
print("=" * 70)
try:
    # Authenticate the client
    client.force_authenticate(user=test_user)
    
    response = client.post(f'/api/webinars/{paid_event.id}/register/', {})
    print(f"Response Status: {response.status_code}")
    
    if response.status_code in [200, 201]:
        reg_response = response.json()
        print(f"\n✓ Registration Response:")
        print(f"  - Status: {reg_response.get('detail', 'N/A')}")
        print(f"  - Email: {reg_response.get('email', 'N/A')}")
        print(f"  - Event ID: {reg_response.get('event_id', 'N/A')}")
        print(f"  - Registration ID: {reg_response.get('id', 'N/A')}")
        
        assert 'email' in reg_response, "Email field missing in registration response!"
        assert reg_response['email'] == test_user.email, "Email doesn't match user"
        print("\n✓ Test 3 PASSED: Registration response includes email")
    else:
        print(f"✗ Failed with status {response.status_code}")
        print(response.json())
except Exception as e:
    print(f"✗ Test 3 FAILED with error: {e}")

# Test 4: Create webinar with price via API
print("\n" + "=" * 70)
print("Test 4: POST /api/webinars/ - Create Event with Price")
print("=" * 70)
try:
    post_data = {
        'title': 'New API Event',
        'description': 'Created via API test',
        'date': str(tomorrow),
        'time': '15:30',
        'duration': 90,
        'price': '79.99'
    }
    
    response = client.post('/api/webinars/', post_data, format='json')
    print(f"Response Status: {response.status_code}")
    
    if response.status_code == 201:
        event_data = response.json()
        print(f"\n✓ Created Event:")
        print(f"  - ID: {event_data['id']}")
        print(f"  - Title: {event_data['title']}")
        print(f"  - Price: ${event_data.get('price', 'N/A')}")
        print(f"  - Duration: {event_data.get('duration')} minutes")
        
        assert 'price' in event_data, "Price not in creation response"
        print("\n✓ Test 4 PASSED: Event created with price field")
    else:
        print(f"✗ Failed with status {response.status_code}")
        print(response.json())
except Exception as e:
    print(f"✗ Test 4 FAILED with error: {e}")

print("\n" + "=" * 70)
print("ALL API TESTS COMPLETED")
print("=" * 70)

# Cleanup
print("\nCleaning up test data...")
for event in Event.objects.filter(title__contains='API'):
    event.delete()
print("✓ Cleanup complete")
