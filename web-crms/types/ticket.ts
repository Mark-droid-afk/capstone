export type TicketStatus =
  | "available"
  | "claimed"
  | "resolved"
  | "cancelled";

export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type TicketCategory = "concern" | "inquiry" | "request" | "other";

export interface TicketCustomer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profileImage?: string;
}

export interface TicketAgent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  imageUrl?: string;
  customer: TicketCustomer;
  agent?: TicketAgent;
  conversationId?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface PaginatedTickets {
  data: Ticket[];
  total: number;
  page: number;
  pageSize: number;
}
