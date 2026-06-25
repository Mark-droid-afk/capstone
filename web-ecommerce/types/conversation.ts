/** "customer" = customer, "agent" = CRM agent, "employee" = legacy alias for agent */
export type SenderType = "customer" | "agent" | "employee";

/** Mirrors the backend MessageDto */
export interface MessageDto {
  id: string;
  conversationId: string;
  content: string;
  senderId: string;
  senderName: string;
  senderRole: SenderType;
  isRead: boolean;
  sentAt: string;
  /** true for optimistically-added messages not yet confirmed by server */
  isPending?: boolean;
}

/** Legacy alias used by the Conversation UI components */
export type ConversationMessage = MessageDto & {
  /** UI compat: map senderRole → senderType */
  senderType: SenderType;
  senderFirstName: string;
  /** true for optimistically-added messages not yet confirmed by server */
  isPending?: boolean;
};

export interface AssignedAgent {
  employeeFirstName?: string;
  employeeLastName?: string;
}

/** Mirrors the backend CustomerConversationDetailDto */
export interface CustomerConversationDetailDto {
  id: string;
  ticketId: string;
  ticketTitle: string;
  ticketType: string;    // "concern" | "inquiry" | "request"
  ticketStatus: string;  // "pending" | "ongoing" | "cancelled" | "resolved"
  assignedTo: AssignedAgent;
  messages: MessageDto[];
  createdAt: string;
  updatedAt: string;
}

/** For backward compat with old ConversationDetail usage in Conversation/index.tsx */
export interface ConversationDetail {
  id: string;
  ticketId: string;
  ticketTitle: string;
  ticketType: string;
  ticketStatus: string;
  assignedTo: AssignedAgent;
  messages: ConversationMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface SendMessagePayload {
  content: string;
}

export interface EscalatePayload {
  customerId: string;
}
