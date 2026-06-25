import { apiCrm } from "@/lib/axios/api/customer";
import type { Ticket, PaginatedTickets } from "@/types/ticket";

export const ticketsApi = {
  /** All available (unclaimed) tickets */
  getAvailable: (params?: { page?: number; pageSize?: number; search?: string }) =>
    apiCrm.get<PaginatedTickets>("/tickets/available", { params }),

  /** Tickets claimed by the authenticated agent */
  getClaimed: (params?: { page?: number; pageSize?: number }) =>
    apiCrm.get<PaginatedTickets>("/tickets/claimed", { params }),

  /** Tickets resolved by the authenticated agent */
  getResolved: (params?: { page?: number; pageSize?: number }) =>
    apiCrm.get<PaginatedTickets>("/tickets/resolved", { params }),

  /** Single ticket detail */
  getById: (id: string) => apiCrm.get<Ticket>(`/tickets/${id}`),

  /** Claim an available ticket */
  claim: (id: string) => apiCrm.patch<Ticket>(`/tickets/${id}/claim`),

  /** Unclaim / release a ticket */
  unclaim: (id: string) => apiCrm.patch<Ticket>(`/tickets/${id}/unclaim`),

  /** Mark a claimed ticket as resolved */
  resolve: (id: string) => apiCrm.patch<Ticket>(`/tickets/${id}/resolve`),
};
