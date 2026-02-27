# 🎯 Quick Start Guide - Inbox Messaging System

## 🚀 Start Using the Inbox System

### 1. Start the Backend
```bash
python manage.py runserver
```

### 2. Start the Frontend
```bash
cd frontend
npm run dev
```

### 3. Access the Inbox
- Navigate to `http://localhost:5173/user-portal`
- Login to your account
- Look for the **Mail icon** (📧) in the top navigation bar
- Click it to go to `/inbox`

---

## 📱 User Guide

### Viewing Conversations
- Conversations are listed on the left side
- Most recent messages appear at the top
- **Unread count badge** shows new messages
- Click any conversation to open the chat

### Sending Messages
1. Click on a conversation from the list
2. Type your message in the input field at the bottom
3. Press **Enter** or click the **Send button**
4. Your message appears instantly

### Reading Messages
- When you open a conversation, messages are automatically marked as read
- The unread badge disappears after viewing

### Auto-Updates
- Conversations refresh every **10 seconds**
- New messages appear automatically
- No need to manually refresh the page

---

## 🔧 Developer Quick Reference

### Backend API Endpoints

```python
# Get all conversations for current user
GET /api/communications/inbox/conversations/

# Get messages for a conversation (with pagination)
GET /api/communications/inbox/messages/{conversation_id}/
    ?page=1&page_size=50

# Send a message
POST /api/communications/inbox/send/
{
    "participant_ids": [user_id],
    "related_webinar_id": webinar_id,  # optional
    "content": "Your message here"
}

# Mark conversation as read
POST /api/communications/inbox/mark-read/{conversation_id}/
```

### Frontend Service Usage

```typescript
import inboxService from '../services/inboxService';

// Get conversations
const conversations = await inboxService.getConversations();

// Get messages
const { messages, total, has_more } = await inboxService.getMessages(conversationId);

// Send message
const newMessage = await inboxService.sendMessage({
  participant_ids: [recipientId],
  content: "Hello!"
});

// Mark as read
await inboxService.markConversationAsRead(conversationId);
```

---

## 🎨 UI Components

### Colors Used
- **Primary Gradient:** `from-pink-500 to-purple-600`
- **Active Conversation:** `bg-pink-50 border-l-4 border-pink-500`
- **User Message Bubble:** `bg-gradient-to-r from-pink-500 to-purple-600 text-white`
- **Other Message Bubble:** `bg-white border border-gray-200 text-gray-900`

### Layout
- **Conversation List:** 30% width on desktop, full width on mobile
- **Chat Window:** 70% width on desktop, hidden on mobile
- **Responsive Breakpoint:** `md` (768px)

---

## 🧪 Testing Checklist

Quick tests to verify everything works:

```bash
# Run verification script
python verify_inbox_system.py

# Expected output: All tests pass ✅
```

**Manual Testing:**
- [ ] Navigate to `/inbox` - loads without errors
- [ ] Conversation list displays
- [ ] Click conversation - messages load
- [ ] Type and send message - appears in chat
- [ ] Refresh page - message persists
- [ ] Wait 10 seconds - updates automatically
- [ ] Check notifications - new message notification created

---

## 📊 Database Models

### Conversation
```python
{
    'id': 1,
    'participants': [user1, user2],
    'related_webinar': webinar_object,  # optional
    'created_at': datetime,
    'updated_at': datetime,
    'last_message_at': datetime
}
```

### Message
```python
{
    'id': 1,
    'conversation': conversation_object,
    'sender': user_object,
    'content': "Message text",
    'is_read': False,
    'created_at': datetime
}
```

---

## 🔐 Security Notes

- ✅ All endpoints require JWT authentication
- ✅ Users can only see their own conversations
- ✅ Conversation membership validated on every request
- ✅ Messages can only be sent to existing users

---

## 🐛 Troubleshooting

### Backend Issues

**Problem:** API returns 404
- **Solution:** Ensure migrations are applied: `python manage.py migrate`

**Problem:** Authentication errors
- **Solution:** Check JWT token is being sent in Authorization header

**Problem:** Conversations not showing
- **Solution:** Ensure user is added as a participant to conversations

### Frontend Issues

**Problem:** Inbox page doesn't load
- **Solution:** Check route is added in `App.tsx`

**Problem:** Mail icon not showing
- **Solution:** Verify `Mail` icon imported in UserWebinarPortal

**Problem:** Messages not updating
- **Solution:** Check polling is working (10-second interval)

---

## 📈 Performance Tips

1. **Database:**
   - Indexes are already optimized
   - Use pagination for large conversation lists

2. **Frontend:**
   - Polling interval is 10 seconds (adjust if needed)
   - Messages are paginated (50 per page)

3. **Future Upgrade:**
   - Consider WebSockets for real-time updates
   - Implement message caching

---

## 🎓 Customization Ideas

### Easy Customizations:
```typescript
// Change polling interval (InboxPage.tsx)
const POLLING_INTERVAL = 5000; // 5 seconds instead of 10

// Change messages per page
const PAGE_SIZE = 100; // 100 instead of 50

// Change avatar colors (InboxPage.tsx)
className="bg-gradient-to-br from-blue-400 to-green-500"
```

### Advanced Features to Add:
- Group conversations (3+ participants)
- Message search
- File attachments
- Emoji reactions
- Typing indicators
- Message editing/deletion
- Conversation archiving

---

## 📞 Support

For issues or questions:
1. Check `INBOX_IMPLEMENTATION_COMPLETE.md` for full documentation
2. Run `python verify_inbox_system.py` to diagnose issues
3. Check browser console for frontend errors
4. Check Django logs for backend errors

---

## ✨ You're All Set!

Your messaging system is **ready to use**. Start the servers and enjoy your new WhatsApp-style inbox! 🎉
