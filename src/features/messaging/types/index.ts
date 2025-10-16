/**
 * Types for the messaging feature
 */

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  org_id?: string;
  content: string;
  created_at: string;
  read_at?: string;
  // Populated fields for display
  sender_name?: string;
  sender_avatar?: string;
  receiver_name?: string;
}

export interface Conversation {
  id: string;
  participant_id: string; // The other person in the conversation
  participant_name: string;
  participant_avatar?: string;
  participant_role: 'client' | 'trainer';
  last_message: Message;
  unread_count: number;
  updated_at: string;
}

export interface MessageRequest {
  receiver_id: string;
  content: string;
  org_id?: string;
}

export interface ConversationFilter {
  search?: string;
  role?: 'client' | 'trainer';
  unread_only?: boolean;
}