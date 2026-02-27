"""
Quick verification script for Inbox messaging system implementation.

Run this script to verify the backend implementation is working correctly.
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'webinar_system.settings')
django.setup()

from django.contrib.auth.models import User
from communications.models import Conversation, Message, UserNotification
from communications.services import create_notification


def test_inbox_system():
    """Test the inbox messaging system"""
    print("=" * 60)
    print("🔍 INBOX SYSTEM VERIFICATION")
    print("=" * 60)
    
    # Test 1: Check models are registered
    print("\n✅ Test 1: Models Registration")
    print(f"   Conversation model: {Conversation.__name__}")
    print(f"   Message model: {Message.__name__}")
    print(f"   Table: {Conversation._meta.db_table}")
    print(f"   Table: {Message._meta.db_table}")
    
    # Test 2: Check notification type
    print("\n✅ Test 2: Notification Type")
    notification_types = dict(UserNotification.NOTIFICATION_TYPES)
    if 'new_message' in notification_types:
        print(f"   'new_message' notification type: ✓ Found")
        print(f"   Display name: {notification_types['new_message']}")
    else:
        print("   ❌ 'new_message' notification type not found")
    
    # Test 3: Check fields
    print("\n✅ Test 3: Model Fields")
    conv_fields = [f.name for f in Conversation._meta.get_fields()]
    msg_fields = [f.name for f in Message._meta.get_fields()]
    
    print(f"   Conversation fields: {', '.join(conv_fields)}")
    print(f"   Message fields: {', '.join(msg_fields)}")
    
    required_conv_fields = ['participants', 'related_webinar', 'last_message_at']
    required_msg_fields = ['conversation', 'sender', 'content', 'is_read']
    
    for field in required_conv_fields:
        if field in conv_fields:
            print(f"   ✓ Conversation.{field}")
        else:
            print(f"   ❌ Missing Conversation.{field}")
    
    for field in required_msg_fields:
        if field in msg_fields:
            print(f"   ✓ Message.{field}")
        else:
            print(f"   ❌ Missing Message.{field}")
    
    # Test 4: Check database tables exist
    print("\n✅ Test 4: Database Tables")
    try:
        conv_count = Conversation.objects.count()
        msg_count = Message.objects.count()
        print(f"   Conversations in DB: {conv_count}")
        print(f"   Messages in DB: {msg_count}")
        print("   ✓ Tables accessible")
    except Exception as e:
        print(f"   ❌ Database error: {str(e)}")
    
    # Test 5: Try creating a test conversation (if users exist)
    print("\n✅ Test 5: Conversation Creation Test")
    users = User.objects.all()[:2]
    if len(users) >= 2:
        try:
            # Check if test conversation already exists
            test_conv = Conversation.objects.filter(
                participants=users[0]
            ).filter(
                participants=users[1]
            ).first()
            
            if not test_conv:
                test_conv = Conversation.objects.create()
                test_conv.participants.set(users)
                print(f"   ✓ Created test conversation: {test_conv.id}")
            else:
                print(f"   ✓ Test conversation exists: {test_conv.id}")
            
            # Try creating a test message
            test_msg = Message.objects.create(
                conversation=test_conv,
                sender=users[0],
                content="Test message from verification script"
            )
            print(f"   ✓ Created test message: {test_msg.id}")
            
            # Update last_message_at
            test_conv.last_message_at = test_msg.created_at
            test_conv.save()
            print(f"   ✓ Updated last_message_at: {test_conv.last_message_at}")
            
            # Test notification creation
            create_notification(
                user=users[1],
                title="Test Message Notification",
                message=f"{users[0].username} sent you a test message",
                notification_type="new_message"
            )
            print(f"   ✓ Created test notification")
            
        except Exception as e:
            print(f"   ❌ Error creating test data: {str(e)}")
            import traceback
            traceback.print_exc()
    else:
        print("   ⚠ Not enough users in database to test (need at least 2)")
    
    # Test 6: Check API endpoints are registered
    print("\n✅ Test 6: API Endpoints")
    try:
        from communications.urls import router
        registered_viewsets = [reg[0] for reg in router.registry]
        print(f"   Registered viewsets: {', '.join(registered_viewsets)}")
        if 'inbox' in registered_viewsets:
            print("   ✓ Inbox viewset registered")
        else:
            print("   ❌ Inbox viewset not registered")
    except Exception as e:
        print(f"   ⚠ Could not check URL registration: {str(e)}")
    
    print("\n" + "=" * 60)
    print("✨ VERIFICATION COMPLETE")
    print("=" * 60)
    print("\n📝 Next Steps:")
    print("   1. Start development server: python manage.py runserver")
    print("   2. Start frontend: cd frontend && npm run dev")
    print("   3. Navigate to /inbox in your browser")
    print("   4. Check the implementation guide: INBOX_IMPLEMENTATION_COMPLETE.md")
    print("\n")


if __name__ == '__main__':
    test_inbox_system()
