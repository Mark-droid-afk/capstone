import { apiCrm } from "@/lib/axios/api/customer";
import type {
  Conversation,
  Message,
  PaginatedConversations,
  PaginatedMessages,
} from "@/types/conversation";

interface ListParams {
  page?: number;
  pageSize?: number;
}

export const conversationsApi = {
  getAll: (params?: ListParams) =>
    apiCrm.get<PaginatedConversations>("/conversations", { params }),

  getUnread: (params?: ListParams) =>
    apiCrm.get<PaginatedConversations>("/conversations", {
      params: { ...params, isRead: false },
    }),

  getRead: (params?: ListParams) =>
    apiCrm.get<PaginatedConversations>("/conversations", {
      params: { ...params, isRead: true },
    }),

  getById: (id: string) =>
    apiCrm.get<Conversation>(`/conversations/${id}`),

  getMessages: (id: string, params?: ListParams) =>
    apiCrm.get<PaginatedMessages>(`/conversations/${id}/messages`, { params }),

  sendMessage: (id: string, content: string) =>
    apiCrm.post<Message>(`/conversations/${id}/messages`, { content }),

  markRead: (id: string) =>
    apiCrm.patch<void>(`/conversations/${id}/read`),

  markUnread: (id: string) =>
    apiCrm.patch<void>(`/conversations/${id}/unread`),
};
