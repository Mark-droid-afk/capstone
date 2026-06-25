export interface ConversationParticipant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  content: string;
  senderId: string;
  senderName: string;
  senderRole: "agent" | "customer";
  sentAt: string;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  ticketId: string;
  ticketTitle: string;
  ticketType: string;
  ticketStatus: string;  // "available" | "claimed" | "resolved" | "cancelled"
  customer: ConversationParticipant;
  agent?: ConversationParticipant;
  lastMessage?: Message;
  unreadCount: number;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedConversations {
  data: Conversation[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PaginatedMessages {
  data: Message[];
  total: number;
  page: number;
  pageSize: number;
}
