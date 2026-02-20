#!/usr/bin/env python
"""Test price field functionality"""
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'webinar_system.settings')
django.setup()

from decimal import Decimal
from events.models import Event, User
from events.serializers import EventSerializer, EventDetailSerializer
from django.contrib.auth.models import User as DjangoUser
from datetime import date, time, datetime, timedelta

print("=" * 60)
print("Testing Price Field Implementation")
print("=" * 60)

# Test 1: Check if price field exists in model
print("\n✓ Test 1: Price field exists in Event model")
try:
    # Create test event with price
    user = DjangoUser.objects.first() or DjangoUser.objects.create_user(
        username='test_price_user',
        email='test_price@test.com',
        password='testpass'
    )
    
    tomorrow = date.today() + timedelta(days=1)
    event = Event.objects.create(
        title='Premium Webinar',
        description='A paid webinar',
        date=tomorrow,
        time=time(10, 0),
        duration=60,
        price=Decimal('29.99'),
        organizer=user
    )
    print(f"  Created event with price: ${event.price}")
    assert event.price == Decimal('29.99'), "Price not saved correctly"
    print(f"  ✓ Price field working correctly")
except Exception as e:
    print(f"  ✗ Error: {e}")

# Test 2: Check serializer includes price
print("\n✓ Test 2: EventSerializer includes price field")
try:
    serializer = EventSerializer(event)
    data = serializer.data
    assert 'price' in data, "Price not in serializer output"
    assert float(data['price']) == 29.99, "Price value incorrect"
    print(f"  Serialized price: {data['price']}")
    print(f"  ✓ Serializer includes price correctly")
except Exception as e:
    print(f"  ✗ Error: {e}")

# Test 3: Check EventDetailSerializer includes price
print("\n✓ Test 3: EventDetailSerializer includes price field")
try:
    serializer = EventDetailSerializer(event)
    data = serializer.data
    assert 'price' in data, "Price not in detail serializer output"
    assert float(data['price']) == 29.99, "Price value incorrect"
    print(f"  Serialized price in detail: {data['price']}")
    print(f"  ✓ Detail serializer includes price correctly")
except Exception as e:
    print(f"  ✗ Error: {e}")

# Test 4: Check free event (price = 0)
print("\n✓ Test 4: Free event handling (price = 0)")
try:
    free_event = Event.objects.create(
        title='Free Webinar',
        description='A free webinar',
        date=tomorrow,
        time=time(14, 0),
        duration=45,
        price=Decimal('0.00'),
        organizer=user
    )
    serializer = EventSerializer(free_event)
    data = serializer.data
    assert float(data['price']) == 0.0, "Free event price incorrect"
    print(f"  Free event price: {data['price']}")
    print(f"  ✓ Free events handled correctly")
except Exception as e:
    print(f"  ✗ Error: {e}")

# Test 5: Registration endpoint returns email
print("\n✓ Test 5: Registration response structure")
try:
    from events.views import EventViewSet
    from rest_framework.test import APIRequestFactory
    from rest_framework.request import Request
    
    factory = APIRequestFactory()
    request_obj = factory.post(f'/webinars/{event.id}/register/')
    request_obj.user = user
    
    viewset = EventViewSet()
    viewset.format_kwarg = None
    viewset.request = Request(request_obj)
    viewset.kwargs = {'pk': event.id}
    
    response = viewset.register(viewset.request, pk=event.id)
    response_data = response.data
    
    assert 'email' in response_data, "Email not in registration response"
    assert 'event_id' in response_data, "Event ID not in registration response"
    assert response_data['email'] == user.email, "Email mismatch"
    print(f"  Registration response includes:")
    print(f"    - email: {response_data['email']}")
    print(f"    - event_id: {response_data['event_id']}")
    print(f"  ✓ Registration response structure correct")
except Exception as e:
    print(f"  ✗ Error: {e}")

# Cleanup
print("\n" + "=" * 60)
print("All Price Field Tests Completed ✓")
print("=" * 60)

# Clean up test data
event.delete()
free_event.delete()
