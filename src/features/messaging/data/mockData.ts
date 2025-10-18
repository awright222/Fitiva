/**
 * Mock data for messaging feature
 * 
 * TODO: SUPABASE INTEGRATION POINTS
 * ================================
 * 
 * 1. Messages Table (messages):
 *    - Replace mockMessages with: supabase.from('messages').select('*')
 *    - Add RLS policies for sender/receiver access control
 *    - Enable real-time subscriptions for instant message delivery
 * 
 * 2. Conversations:
 *    - Create view or function to aggregate latest messages by participant
 *    - Use: supabase.from('conversations_view').select('*')
 * 
 * 3. Real-time Features:
 *    - New messages: supabase.channel('messages').on('INSERT')
 *    - Read receipts: supabase.channel('messages').on('UPDATE')
 *    - Typing indicators: supabase.channel('typing').send()
 * 
 * 4. Functions to Replace:
 *    - getConversations() -> supabase.from('conversations_view').select()
 *    - getMessages() -> supabase.from('messages').select().eq('conversation_id', id)
 *    - sendMessage() -> supabase.from('messages').insert()
 *    - markAsRead() -> supabase.from('messages').update().eq('id', id)
 * 
 * This will be replaced with real Supabase queries later
 */

import { Message, Conversation } from '../types';

// Helper function to generate dates
const getDateString = (daysFromNow: number, hoursFromNow: number = 0): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(date.getHours() + hoursFromNow);
  return date.toISOString();
};

// Mock messages data
export const mockMessages: Message[] = [
  // Conversation between Client 1 and Trainer 2
  {
    id: '1',
    sender_id: '1', // Client
    receiver_id: '2', // Trainer
    content: 'Hi Sarah! I wanted to ask about our session tomorrow. Should I bring anything specific?',
    created_at: getDateString(-1, -2), // Yesterday, 2 hours ago
    read_at: getDateString(-1, -1),
    sender_name: 'John Doe',
    receiver_name: 'Sarah Wilson',
  },
  {
    id: '2',
    sender_id: '2', // Trainer
    receiver_id: '1', // Client
    content: 'Hi John! Just bring a water bottle and wear comfortable workout clothes. We\'ll focus on upper body tomorrow 💪',
    created_at: getDateString(-1, -1), // Yesterday, 1 hour ago
    read_at: getDateString(-1, 0),
    sender_name: 'Sarah Wilson',
    receiver_name: 'John Doe',
  },
  {
    id: '3',
    sender_id: '1', // Client
    receiver_id: '2', // Trainer
    content: 'Perfect! Looking forward to it. Thanks for the heads up!',
    created_at: getDateString(-1, 0), // Yesterday
    read_at: getDateString(-1, 0),
    sender_name: 'John Doe',
    receiver_name: 'Sarah Wilson',
  },
  {
    id: '4',
    sender_id: '2', // Trainer
    receiver_id: '1', // Client
    content: 'Great! See you at 3 PM tomorrow. Let me know if you need to reschedule.',
    created_at: getDateString(0, -3), // Today, 3 hours ago
    sender_name: 'Sarah Wilson',
    receiver_name: 'John Doe',
  },

  // Conversation between Client 4 and Trainer 2
  {
    id: '5',
    sender_id: '4', // Different Client
    receiver_id: '2', // Same Trainer
    content: 'Hi Sarah, I had a question about the nutrition plan you mentioned.',
    created_at: getDateString(0, -5), // Today, 5 hours ago
    read_at: getDateString(0, -4),
    sender_name: 'Emma Davis',
    receiver_name: 'Sarah Wilson',
  },
  {
    id: '6',
    sender_id: '2', // Trainer
    receiver_id: '4', // Client
    content: 'Of course! What specifically would you like to know about the plan?',
    created_at: getDateString(0, -4), // Today, 4 hours ago
    read_at: getDateString(0, -3),
    sender_name: 'Sarah Wilson',
    receiver_name: 'Emma Davis',
  },
  {
    id: '7',
    sender_id: '4', // Client
    receiver_id: '2', // Trainer
    content: 'I\'m having trouble with the meal prep suggestions. Do you have any simpler alternatives?',
    created_at: getDateString(0, -2), // Today, 2 hours ago
    sender_name: 'Emma Davis',
    receiver_name: 'Sarah Wilson',
  },

  // Conversation between Client 5 and Trainer 2
  {
    id: '8',
    sender_id: '5', // Another Client
    receiver_id: '2', // Same Trainer
    content: 'Thanks for the great session today! I really felt the difference in my form.',
    created_at: getDateString(0, -6), // Today, 6 hours ago
    read_at: getDateString(0, -6),
    sender_name: 'Mike Chen',
    receiver_name: 'Sarah Wilson',
  },
  {
    id: '9',
    sender_id: '2', // Trainer
    receiver_id: '5', // Client
    content: 'I\'m so glad to hear that! Your technique has improved significantly. Keep up the great work! 🎉',
    created_at: getDateString(0, -5), // Today, 5 hours ago
    read_at: getDateString(0, -5),
    sender_name: 'Sarah Wilson',
    receiver_name: 'Mike Chen',
  },

  // Older conversation
  {
    id: '10',
    sender_id: '1', // Client
    receiver_id: '2', // Trainer
    content: 'Hi Sarah, I wanted to schedule our next session. What times work best for you next week?',
    created_at: getDateString(-3, 0), // 3 days ago
    read_at: getDateString(-3, 2),
    sender_name: 'John Doe',
    receiver_name: 'Sarah Wilson',
  },
];

// Mock users for participant info
export const mockUsers = {
  '1': { name: 'John Doe', avatar: '👨‍💼', role: 'client' }, // Default client for demo
  '81bf6d71-c465-438a-bb2c-c2d0461755e5': { name: 'John Doe', avatar: '👨‍💼', role: 'client' }, // Real client UUID from logs
  '2': { name: 'Sarah Wilson', avatar: '👩‍🏫', role: 'trainer' },
  '3': { name: 'Mike Rodriguez', avatar: '�‍�', role: 'trainer' },
  '4': { name: 'Jennifer Park', avatar: '👩‍🧘', role: 'trainer' },
  '5': { name: 'David Kim', avatar: '👨‍🔬', role: 'trainer' },
  '6': { name: 'Lisa Thompson', avatar: '👩‍⚕️', role: 'trainer' },
  // Client UUIDs
  'client1-uuid': { name: 'John Doe', avatar: '👨‍💼', role: 'client' },
  'client2-uuid': { name: 'Jane Smith', avatar: '👩‍💻', role: 'client' },
  'client3-uuid': { name: 'Bob Wilson', avatar: '👨‍🔧', role: 'client' },
  'client4-uuid': { name: 'Emma Davis', avatar: '👩‍💻', role: 'client' },
  'client5-uuid': { name: 'Mike Chen', avatar: '👨‍🔬', role: 'client' },
  'client6-uuid': { name: 'Lisa Johnson', avatar: '👩‍🎨', role: 'client' },
  '4505ca13-bda1-4d4f-9524-0bfea6d3516e': { name: 'Sarah Wilson', avatar: '👩‍🏫', role: 'trainer' }, // Real trainer ID from auth
} as const;

// Helper functions for working with mock data
// TODO: Replace all with Supabase queries

// TODO: Replace with: supabase.from('conversations_view').select().eq('user_id', userId)
export const getConversations = (userId: string): Conversation[] => {
  console.log('🔍 Getting conversations for user:', userId);
  console.log('📊 Total messages in system:', mockMessages.length);
  console.log('🗃️ Available mock user IDs:', Object.keys(mockUsers));
  
  // First check if this user exists in our mock data
  if (!mockUsers[userId as keyof typeof mockUsers]) {
    console.log('⚠️  User not found in mockUsers, adding as client:', userId);
    // Dynamically add the user as a client if they don't exist
    (mockUsers as any)[userId] = { 
      name: 'Current User', 
      avatar: '👨‍💼', 
      role: 'client' 
    };
  }
  
  const userMessages = mockMessages.filter(
    msg => msg.sender_id === userId || msg.receiver_id === userId
  );
  
  console.log('📨 Messages for user:', userMessages.length);
  console.log('📋 User messages details:', userMessages.map(m => ({
    id: m.id,
    from: m.sender_id,
    to: m.receiver_id,
    content: m.content.substring(0, 50) + '...'
  })));

  // Group messages by conversation partner
  const conversationsMap = new Map<string, Message[]>();
  
  userMessages.forEach(message => {
    const partnerId = message.sender_id === userId ? message.receiver_id : message.sender_id;
    if (!conversationsMap.has(partnerId)) {
      conversationsMap.set(partnerId, []);
    }
    conversationsMap.get(partnerId)!.push(message);
  });

  // Convert to conversation objects
  const conversations: Conversation[] = [];
  conversationsMap.forEach((messages, partnerId) => {
    console.log(`Processing conversation with partner ${partnerId}, messages:`, messages.length);
    const sortedMessages = messages.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    const lastMessage = sortedMessages[0];
    const partner = mockUsers[partnerId as keyof typeof mockUsers];
    
    console.log('Partner info for', partnerId, ':', partner);
    
    if (partner) {
      const unreadCount = messages.filter(
        msg => msg.receiver_id === userId && !msg.read_at
      ).length;

      const conversation = {
        id: `${userId}-${partnerId}`,
        participant_id: partnerId,
        participant_name: partner.name,
        participant_avatar: partner.avatar,
        participant_role: partner.role as 'client' | 'trainer',
        last_message: lastMessage,
        unread_count: unreadCount,
        updated_at: lastMessage.created_at,
      };
      
      console.log('Created conversation:', conversation);
      conversations.push(conversation);
    } else {
      console.log('No partner found for ID:', partnerId);
    }
  });

  // Sort by last message time
  const sortedConversations = conversations.sort((a, b) => 
    new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );
  
  console.log('Final conversations returned:', sortedConversations.length);
  console.log('Conversations:', sortedConversations);
  
  return sortedConversations;
};

// TODO: Replace with: supabase.from('messages').select().or(`sender_id.eq.${userId},receiver_id.eq.${userId}`).eq('conversation_partner', partnerId)
export const getMessages = (userId: string, partnerId: string): Message[] => {
  return mockMessages
    .filter(msg => 
      (msg.sender_id === userId && msg.receiver_id === partnerId) ||
      (msg.sender_id === partnerId && msg.receiver_id === userId)
    )
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
};

// TODO: Replace with: supabase.from('messages').insert(messageData)
export const sendMessage = (messageData: { 
  sender_id: string; 
  receiver_id: string; 
  content: string; 
}): Message => {
  console.log('📤 sendMessage called with:', messageData);
  
  // Auto-add users if they don't exist
  if (!mockUsers[messageData.sender_id as keyof typeof mockUsers]) {
    console.log('🆕 Adding sender to mockUsers:', messageData.sender_id);
    (mockUsers as any)[messageData.sender_id] = { 
      name: 'Current User', 
      avatar: '👨‍💼', 
      role: 'client' 
    };
  }
  
  if (!mockUsers[messageData.receiver_id as keyof typeof mockUsers]) {
    console.log('🆕 Adding receiver to mockUsers:', messageData.receiver_id);
    (mockUsers as any)[messageData.receiver_id] = { 
      name: 'Trainer', 
      avatar: '👩‍🏫', 
      role: 'trainer' 
    };
  }
  
  const sender = mockUsers[messageData.sender_id as keyof typeof mockUsers];
  const receiver = mockUsers[messageData.receiver_id as keyof typeof mockUsers];
  
  const newMessage: Message = {
    id: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    sender_id: messageData.sender_id,
    receiver_id: messageData.receiver_id,
    content: messageData.content,
    created_at: new Date().toISOString(),
    sender_name: sender?.name,
    receiver_name: receiver?.name,
  };
  
  console.log('📝 Created new message:', newMessage);
  console.log('👤 Sender info:', sender);
  console.log('🎯 Receiver info:', receiver);
  
  // TODO: Replace with Supabase real-time
  // When REALTIME_ENABLED: Broadcast message to receiver
  // supabase.channel('messages').send({ type: 'message_sent', payload: newMessage })
  
  mockMessages.push(newMessage);
  console.log('✅ Message added to mockMessages array');
  console.log('📊 Total messages now:', mockMessages.length);
  console.log('📋 Latest messages:', mockMessages.slice(-3).map(m => ({
    id: m.id,
    from: m.sender_id,
    to: m.receiver_id,
    content: m.content.substring(0, 30) + '...'
  })));
  
  return newMessage;
};

// TODO: Replace with: supabase.from('messages').update({ read_at: new Date().toISOString() }).eq('id', messageId)
export const markMessageAsRead = (messageId: string): void => {
  const messageIndex = mockMessages.findIndex(msg => msg.id === messageId);
  if (messageIndex !== -1) {
    mockMessages[messageIndex].read_at = new Date().toISOString();
    
    // TODO: Replace with Supabase real-time
    // When REALTIME_ENABLED: Broadcast read receipt to sender
    // supabase.channel('messages').send({ type: 'message_read', payload: { messageId, readAt: mockMessages[messageIndex].read_at } })
  }
};

// TODO: Replace with: supabase.from('messages').update({ read_at: new Date().toISOString() }).eq('sender_id', partnerId).eq('receiver_id', userId).is('read_at', null)
export const markConversationAsRead = (userId: string, partnerId: string): void => {
  mockMessages.forEach(message => {
    if (message.sender_id === partnerId && message.receiver_id === userId && !message.read_at) {
      message.read_at = new Date().toISOString();
    }
  });
};