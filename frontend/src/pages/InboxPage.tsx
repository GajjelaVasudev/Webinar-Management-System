import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, User, MessageCircle } from 'lucide-react';
import inboxService, { Conversation, Message } from '../services/inboxService';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import { useNavigate } from 'react-router-dom';

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId: number | null;
  onSelectConversation: (id: number) => void;
  currentUserId: number;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
  currentUserId,
}) => {
  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(p => p.id !== currentUserId);
  };

  const getDisplayName = (conversation: Conversation) => {
    const otherParticipant = getOtherParticipant(conversation);
    if (otherParticipant) {
      return otherParticipant.first_name && otherParticipant.last_name
        ? `${otherParticipant.first_name} ${otherParticipant.last_name}`
        : otherParticipant.username;
    }
    return 'Unknown User';
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const formatTime = (timestamp: string | null) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="h-full bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-pink-500 to-purple-600">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <MessageCircle size={24} />
          Messages
        </h2>
      </div>
      
      {conversations.length === 0 ? (
        <div className="p-8 text-center text-gray-400">
          <MessageCircle size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm font-semibold">No conversations yet</p>
          <p className="text-xs mt-1">Start a conversation from a webinar</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {conversations.map((conversation) => {
            const displayName = getDisplayName(conversation);
            const initials = getInitials(displayName);
            const isSelected = conversation.id === selectedConversationId;

            return (
              <button
                key={conversation.id}
                onClick={() => onSelectConversation(conversation.id)}
                className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition ${
                  isSelected ? 'bg-pink-50 border-l-4 border-pink-500' : ''
                }`}
              >
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {initials}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {displayName}
                    </h3>
                    <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                      {formatTime(conversation.last_message_at)}
                    </span>
                  </div>

                  {conversation.related_webinar_title && (
                    <p className="text-xs text-purple-600 mb-1 truncate">
                      Re: {conversation.related_webinar_title}
                    </p>
                  )}

                  {conversation.last_message_preview && (
                    <p className="text-sm text-gray-600 truncate">
                      {conversation.last_message_preview.sender_username === 'You' ? 'You: ' : ''}
                      {conversation.last_message_preview.content}
                    </p>
                  )}

                  {conversation.unread_count > 0 && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-pink-500 text-white">
                        {conversation.unread_count} new
                      </span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

interface ChatWindowProps {
  conversation: Conversation | null;
  messages: Message[];
  onSendMessage: (content: string) => void;
  currentUserId: number;
  loading: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  conversation,
  messages,
  onSendMessage,
  currentUserId,
  loading,
}) => {
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (messageInput.trim()) {
      onSendMessage(messageInput);
      setMessageInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  if (!conversation) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-400">
          <MessageCircle size={64} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-semibold">Select a conversation</p>
          <p className="text-sm mt-1">Choose a conversation from the list to start messaging</p>
        </div>
      </div>
    );
  }

  const otherParticipant = conversation.participants.find(p => p.id !== currentUserId);
  const displayName = otherParticipant
    ? otherParticipant.first_name && otherParticipant.last_name
      ? `${otherParticipant.first_name} ${otherParticipant.last_name}`
      : otherParticipant.username
    : 'Unknown User';

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-pink-500 to-purple-600">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
            {displayName.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-white">{displayName}</h3>
            {conversation.related_webinar_title && (
              <p className="text-xs text-white/80">Re: {conversation.related_webinar_title}</p>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isCurrentUser = message.sender === currentUserId;
            return (
              <div
                key={message.id}
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    isCurrentUser
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isCurrentUser ? 'text-white/70' : 'text-gray-500'
                    }`}
                  >
                    {formatMessageTime(message.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-end gap-2">
          <textarea
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 resize-none rounded-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            rows={1}
            style={{ maxHeight: '120px' }}
          />
          <button
            onClick={handleSend}
            disabled={!messageInput.trim()}
            className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white flex items-center justify-center hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

const InboxPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);

  // Polling interval refs
  const conversationsPollingRef = useRef<NodeJS.Timeout>();
  const messagesPollingRef = useRef<NodeJS.Timeout>();

  // Load conversations
  const loadConversations = async () => {
    try {
      const data = await inboxService.getConversations();
      setConversations(data);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load messages for selected conversation
  const loadMessages = async (conversationId: number) => {
    setMessagesLoading(true);
    try {
      const data = await inboxService.getMessages(conversationId);
      setMessages(data.messages);
      // Mark as read
      await inboxService.markConversationAsRead(conversationId);
      // Refresh conversations to update unread count
      await loadConversations();
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setMessagesLoading(false);
    }
  };

  // Send message
  const handleSendMessage = async (content: string) => {
    if (!selectedConversationId) return;

    const conversation = conversations.find(c => c.id === selectedConversationId);
    if (!conversation) return;

    const otherParticipant = conversation.participants.find(p => p.id !== user?.id);
    if (!otherParticipant) return;

    try {
      await inboxService.sendMessage({
        participant_ids: [otherParticipant.id],
        related_webinar_id: conversation.related_webinar,
        content,
      });
      
      // Reload messages
      await loadMessages(selectedConversationId);
      await loadConversations();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // Initial load
  useEffect(() => {
    loadConversations();
  }, []);

  // Set up polling for conversations list
  useEffect(() => {
    conversationsPollingRef.current = setInterval(() => {
      loadConversations();
    }, 10000); // Poll every 10 seconds

    return () => {
      if (conversationsPollingRef.current) {
        clearInterval(conversationsPollingRef.current);
      }
    };
  }, []);

  // Set up polling for messages when conversation is selected
  useEffect(() => {
    if (selectedConversationId) {
      loadMessages(selectedConversationId);

      messagesPollingRef.current = setInterval(() => {
        loadMessages(selectedConversationId);
      }, 10000); // Poll every 10 seconds
    }

    return () => {
      if (messagesPollingRef.current) {
        clearInterval(messagesPollingRef.current);
      }
    };
  }, [selectedConversationId]);

  const selectedConversation = conversations.find(c => c.id === selectedConversationId) || null;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-[#1e1b4b] text-white px-8 py-5 border-b border-white/10 flex justify-between items-center">
        <Logo
          theme="white"
          className="cursor-pointer hover:opacity-80 transition"
          onClick={() => navigate('/user-portal')}
        />
        <button
          onClick={() => navigate('/user-portal')}
          className="flex items-center gap-2 text-gray-300 hover:text-white transition"
        >
          <ArrowLeft size={20} />
          <span>Back to Portal</span>
        </button>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Conversation List - Left Side */}
        <div className="w-full md:w-96 flex-shrink-0">
          <ConversationList
            conversations={conversations}
            selectedConversationId={selectedConversationId}
            onSelectConversation={setSelectedConversationId}
            currentUserId={user?.id || 0}
          />
        </div>

        {/* Chat Window - Right Side */}
        <div className="flex-1 hidden md:block">
          <ChatWindow
            conversation={selectedConversation}
            messages={messages}
            onSendMessage={handleSendMessage}
            currentUserId={user?.id || 0}
            loading={messagesLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default InboxPage;
