import apiClient from './api';

export interface Participant {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface Message {
  id: number;
  conversation: number;
  sender: number;
  sender_username: string;
  sender_first_name: string;
  sender_last_name: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface LastMessagePreview {
  content: string;
  sender_username: string;
  created_at: string;
}

export interface Conversation {
  id: number;
  participants: Participant[];
  related_webinar: number | null;
  related_webinar_title: string | null;
  last_message_preview: LastMessagePreview | null;
  unread_count: number;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MessagesResponse {
  messages: Message[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

export interface SendMessageRequest {
  participant_ids: number[];
  related_webinar_id?: number | null;
  content: string;
}

const inboxService = {
  /**
   * Get all conversations for current user
   */
  async getConversations(): Promise<Conversation[]> {
    const response = await apiClient.get('/communications/inbox/conversations/');
    return response.data;
  },

  /**
   * Get messages for a specific conversation
   */
  async getMessages(conversationId: number, page: number = 1, pageSize: number = 50): Promise<MessagesResponse> {
    const response = await apiClient.get(`/communications/inbox/messages/${conversationId}/`, {
      params: { page, page_size: pageSize }
    });
    return response.data;
  },

  /**
   * Send a message (creates conversation if needed)
   */
  async sendMessage(data: SendMessageRequest): Promise<Message> {
    const response = await apiClient.post('/communications/inbox/send/', data);
    return response.data;
  },

  /**
   * Mark all messages in a conversation as read
   */
  async markConversationAsRead(conversationId: number): Promise<void> {
    await apiClient.post(`/communications/inbox/mark-read/${conversationId}/`);
  },
};

export default inboxService;
