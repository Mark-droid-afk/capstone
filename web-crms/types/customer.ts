export type CustomerType = "regular" | "institutional_buyer";
export type CustomerStatus = "active" | "inactive" | "suspended";
export type MarketingChannel =
  | "email"
  | "sms"
  | "social_media"
  | "push_notification";
export type InteractionType = "sent" | "opened" | "clicked" | "converted";

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  profileImage?: string;
  customerType: CustomerType;
  status: CustomerStatus;
  notes?: string;
  isDeleted?: boolean;
  createdAt: string;
}

export interface MarketingHistory {
  id: string;
  title: string;
  description: string;
  channel: MarketingChannel;
  interactionType: InteractionType;
  sentAt: string;
}

export interface OrderItem {
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  items: OrderItem[];
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
