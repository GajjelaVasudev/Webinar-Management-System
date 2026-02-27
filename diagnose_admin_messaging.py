"""
Diagnostic script to test admin-student messaging flow.
This will help identify where the issue is occurring.
"""

import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'webinar_system.settings')
django.setup()

from django.contrib.auth.models import User
from communications.models import Conversation, Message, UserNotification
from rest_framework.test import APIRequestFactory
from communications.views import InboxViewSet


def diagnose_admin_messaging():
    """Diagnose the admin messaging issue"""
    print("=" * 70)
    print("🔍 DIAGNOSING ADMIN MESSAGING ISSUE")
    print("=" * 70)
    
    # Get or create test users
    print("\n📍 Step 1: Setting up test users...")
    student_user, _ = User.objects.get_or_create(
        username='test_student',
        defaults={'email': 'student@test.com', 'first_name': 'Test', 'last_name': 'Student'}
    )
    admin_user, _ = User.objects.get_or_create(
        username='test_admin',
        defaults={'email': 'admin@test.com', 'first_name': 'Test', 'last_name': 'Admin', 'is_staff': True, 'is_superuser': True}
    )
    print(f"   ✓ Student: {student_user.username} (ID: {student_user.id})")
    print(f"   ✓ Admin: {admin_user.username} (ID: {admin_user.id})")
    
    # Clean up old test data
    print("\n📍 Step 2: Cleaning up old test data...")
    Conversation.objects.filter(participants__in=[student_user, admin_user]).delete()
    print("   ✓ Cleared old conversations")
    
    # Simulate student sending message to admin
    print("\n📍 Step 3: Simulating student sending message to admin...")
    try:
        # Create conversation
        conversation = Conversation.objects.create()
        conversation.participants.set([student_user, admin_user])
        print(f"   ✓ Created conversation (ID: {conversation.id})")
        
        # Student sends message
        message = Message.objects.create(
            conversation=conversation,
            sender=student_user,
            content="Hi admin, I have a question!"
        )
        conversation.last_message_at = message.created_at
        conversation.save()
        print(f"   ✓ Student sent message (ID: {message.id})")
        print(f"   ✓ Conversation last_message_at updated: {conversation.last_message_at}")
        
        # Create notification for admin
        notification = UserNotification.objects.create(
            user=admin_user,
            title="New Message",
            content=f"{student_user.username} sent you a message",
            notification_type="new_message"
        )
        print(f"   ✓ Notification created for admin (ID: {notification.id})")
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return
    
    # Test API - Admin fetches conversations
    print("\n📍 Step 4: Testing GET /api/communications/inbox/conversations/ for admin...")
    try:
        factory = APIRequestFactory()
        request = factory.get('/api/communications/inbox/conversations/')
        request.user = admin_user
        
        view = InboxViewSet.as_view({'get': 'list_conversations'})
        response = view(request)
        
        if response.status_code == 200:
            print(f"   ✓ API returned status 200")
            print(f"   ✓ Number of conversations: {len(response.data)}")
            
            if len(response.data) > 0:
                conv = response.data[0]
                print(f"   ✓ First conversation:")
                print(f"      - ID: {conv.get('id')}")
                print(f"      - Participants: {len(conv.get('participants', []))}")
                participant_names = [p.get('username') for p in conv.get('participants', [])]
                print(f"      - Participant usernames: {participant_names}")
                print(f"      - Last message preview: {conv.get('last_message_preview')}")
                print(f"      - Unread count: {conv.get('unread_count')}")
            else:
                print(f"   ⚠️  WARNING: No conversations returned for admin!")
                # Debug: Check database directly
                db_convs = Conversation.objects.filter(participants=admin_user)
                print(f"      - Conversations in DB where admin is participant: {db_convs.count()}")
                for db_conv in db_convs:
                    print(f"        - Conversation {db_conv.id}: {[p.username for p in db_conv.participants.all()]}")
        else:
            print(f"   ❌ API returned status {response.status_code}")
            print(f"   ❌ Response: {response.data}")
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
    
    # Test API - Admin fetches messages
    if conversation:
        print(f"\n📍 Step 5: Testing GET /api/communications/inbox/messages/{conversation.id}/ for admin...")
        try:
            factory = APIRequestFactory()
            request = factory.get(f'/api/communications/inbox/messages/{conversation.id}/')
            request.user = admin_user
            
            view = InboxViewSet.as_view({'get': 'get_messages'})
            response = view(request, conversation_id=conversation.id)
            
            if response.status_code == 200:
                print(f"   ✓ API returned status 200")
                print(f"   ✓ Number of messages: {response.data.get('total', 0)}")
                if response.data.get('messages'):
                    msg = response.data['messages'][0]
                    print(f"   ✓ Message: '{msg.get('content')[:50]}...'")
                    print(f"   ✓ Sender: {msg.get('sender_username')}")
            else:
                print(f"   ❌ API returned status {response.status_code}")
                print(f"   ❌ Response: {response.data}")
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")
            import traceback
            traceback.print_exc()
    
    # Test API - Admin sends reply
    if conversation:
        print(f"\n📍 Step 6: Testing POST /api/communications/inbox/send/ for admin (reply)...")
        try:
            factory = APIRequestFactory()
            request = factory.post('/api/communications/inbox/send/', {
                'participant_ids': [student_user.id],
                'content': 'Thanks for your question!'
            }, format='json')
            request.user = admin_user
            
            view = InboxViewSet.as_view({'post': 'send_message'})
            response = view(request)
            
            if response.status_code == 201:
                print(f"   ✓ API returned status 201")
                print(f"   ✓ Message sent successfully")
                print(f"   ✓ Message ID: {response.data.get('id')}")
                print(f"   ✓ Content: '{response.data.get('content')}'")
                
                # Verify conversation now has 2 messages
                msg_count = Message.objects.filter(conversation=conversation).count()
                print(f"   ✓ Total messages in conversation: {msg_count}")
            else:
                print(f"   ❌ API returned status {response.status_code}")
                print(f"   ❌ Response: {response.data}")
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")
            import traceback
            traceback.print_exc()
    
    print("\n" + "=" * 70)
    print("✨ DIAGNOSIS COMPLETE")
    print("=" * 70)
    print("\n📊 Summary:")
    print("   - If admin can fetch conversations: ✓ Backend is working")
    print("   - If admin can fetch messages: ✓ Permissions are correct")
    print("   - If admin can send message: ✓ Reply functionality works")
    print("\n💡 If any step failed, check the error messages above.")
    print("\n")


if __name__ == '__main__':
    diagnose_admin_messaging()
