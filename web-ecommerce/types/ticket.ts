export type TicketStatus = "Pending" | "Ongoing" | "Completed" | "Cancelled";
export type TicketType = "Concern" | "Inquiry" | "Request";

export interface Ticket {
  id: string;
  title: string;
  description: string;
  type: TicketType;
  status: TicketStatus;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  claimedByName?: string; // employee name once claimed (Ongoing)
  conversationId?: string; // conversation ID for real-time messaging
}

export interface CreateTicketPayload {
  title: string;
  description: string;
  type: TicketType;
  image?: File; // optional image attachment
}
