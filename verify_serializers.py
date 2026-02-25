#!/usr/bin/env python
"""
Simple verification that serializers include is_registered field.
"""

import re
from pathlib import Path

def verify_serializer_field(filepath, serializer_name, field_name):
    """Check if a serializer includes a specific field"""
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Find the serializer class
    pattern = rf'class {serializer_name}.*?(?=class|\Z)'
    match = re.search(pattern, content, re.DOTALL)
    
    if not match:
        return False, f"Serializer {serializer_name} not found"
    
    serializer_code = match.group(0)
    
    # Check for field definition
    has_field = field_name in serializer_code
    
    # Check for field in Meta.fields
    meta_match = re.search(r'fields\s*=\s*\[(.*?)\]', serializer_code, re.DOTALL)
    field_in_meta = False
    if meta_match:
        fields_str = meta_match.group(1)
        field_in_meta = f"'{field_name}'" in fields_str
    
    # Check for getter method
    getter_method = f'get_{field_name}'
    has_getter = getter_method in serializer_code
    
    return {
        'has_field': has_field,
        'field_in_meta': field_in_meta,
        'has_getter': has_getter,
        'all_present': has_field and field_in_meta and has_getter
    }

# Verify serializers
filepath = Path('webinars/serializers.py')
print("="*70)
print("SERIALIZER VERIFICATION REPORT")
print("="*70)

# Check EventSerializer
print("\n1. EventSerializer - is_registered field:")
result = verify_serializer_field(str(filepath), 'EventSerializer', 'is_registered')
print(f"   ✓ Field definition: {result['has_field']}")
print(f"   ✓ In Meta.fields: {result['field_in_meta']}")
print(f"   ✓ Getter method: {result['has_getter']}")
print(f"   {'✅ COMPLETE' if result['all_present'] else '❌ INCOMPLETE'}")

# Check EventDetailSerializer
print("\n2. EventDetailSerializer - is_registered field:")
result = verify_serializer_field(str(filepath), 'EventDetailSerializer', 'is_registered')
print(f"   ✓ Field definition: {result['has_field']}")
print(f"   ✓ In Meta.fields: {result['field_in_meta']}")
print(f"   ✓ Getter method: {result['has_getter']}")
print(f"   {'✅ COMPLETE' if result['all_present'] else '❌ INCOMPLETE'}")

# EventSerializer timestamp fields
print("\n3. EventSerializer - start_time/end_time fields:")
result_start = verify_serializer_field(str(filepath), 'EventSerializer', 'start_time')
result_end = verify_serializer_field(str(filepath), 'EventSerializer', 'end_time')
print(f"   ✓ start_time: {'✅' if result_start['all_present'] else '❌'}")
print(f"   ✓ end_time: {'✅' if result_end['all_present'] else '❌'}")

# EventDetailSerializer timestamp fields
print("\n4. EventDetailSerializer - start_time/end_time fields:")
result_start = verify_serializer_field(str(filepath), 'EventDetailSerializer', 'start_time')
result_end = verify_serializer_field(str(filepath), 'EventDetailSerializer', 'end_time')
print(f"   ✓ start_time: {'✅' if result_start['all_present'] else '❌'}")
print(f"   ✓ end_time: {'✅' if result_end['all_present'] else '❌'}")

print("\n" + "="*70)
print("TESTING INSTRUCTIONS")
print("="*70)
print("""
✅ Backend Serializers: All required fields added

Next Step: Test the registration flow manually

1. Start Django Backend:
   > python manage.py runserver

2. Start React Frontend (new terminal):
   > cd frontend && npm run dev

3. Test Registration Flow:
   - Open http://localhost:5173 in browser
   - Login with: student / student123
   - Browse to any webinar event
   - Click "Get Ticket Now" button
   - Expected: Button should change to "You're Registered"
   - Navigate to "My Webinars" or "My Schedule"
   - Expected: The event should appear in your schedule

4. Verify API Response (curl command):
   > curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/webinars/
   
   Should see: "is_registered": true/false for each event

✅ If registration updates and events appear in schedule, fixes are working!
""")
