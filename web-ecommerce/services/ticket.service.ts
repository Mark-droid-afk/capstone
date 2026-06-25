import { apiCrm } from "@/lib/api";
import { CreateTicketPayload, Ticket, TicketStatus } from "@/types/ticket";

/**
 * Fetch all tickets for the authenticated customer filtered by status.
 * GET /api/v1/customer/tickets?status={status}
 */
export async function getTicketsByStatus(status: TicketStatus): Promise<Ticket[]> {
  const res = await apiCrm.get<Ticket[]>(`/api/v1/customer/tickets`, { params: { status } });
  return res.data;
}

/**
 * Create a new ticket. Sends multipart/form-data if an image is attached.
 * POST /api/v1/customer/tickets
 */
export async function createTicket(payload: CreateTicketPayload): Promise<Ticket> {
  const formData = new FormData();
  formData.append("title", payload.title);
  formData.append("description", payload.description);
  formData.append("type", payload.type);
  if (payload.image) {
    formData.append("image", payload.image);
  }
  const res = await apiCrm.post<Ticket>("/api/v1/customer/tickets", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

/**
 * Fetch a single ticket's full details.
 * GET /api/v1/customer/tickets/:id
 */
export async function getTicketById(id: string): Promise<Ticket> {
  const res = await apiCrm.get<Ticket>(`/api/v1/customer/tickets/${id}`);
  return res.data;
}

/**
 * Cancel a pending ticket.
 * PATCH /api/v1/customer/tickets/:id/cancel
 */
export async function cancelTicket(id: string): Promise<void> {
  await apiCrm.patch(`/api/v1/customer/tickets/${id}/cancel`);
}

