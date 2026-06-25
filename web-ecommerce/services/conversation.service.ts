import { apiCrm } from "@/lib/api";
import type {
  ConversationDetail,
  ConversationMessage,
  CustomerConversationDetailDto,
  MessageDto,
  SendMessagePayload,
} from "@/types/conversation";

// ---------------------------------------------------------------------------
// Shape adapter: backend MessageDto → UI ConversationMessage
// ---------------------------------------------------------------------------
function adaptMessage(dto: MessageDto): ConversationMessage {
  return {
    ...dto,
    senderType: dto.senderType || dto.senderRole || "customer",
    senderFirstName: dto.senderFirstName || dto.senderName || "User",
  };
}

function adaptDetail(dto: CustomerConversationDetailDto): ConversationDetail {
  return {
    ...dto,
    messages: dto.messages.map(adaptMessage),
  };
}

// ---------------------------------------------------------------------------
// API calls
// ---------------------------------------------------------------------------

/**
 * GET /api/v1/customer/tickets/{ticketId}/conversation
 */
export async function getConversation(
  _customerId: string,
  ticketId: string
): Promise<ConversationDetail> {
  const res = await apiCrm.get<CustomerConversationDetailDto>(
    `/api/v1/customer/tickets/${ticketId}/conversation`
  );
  return adaptDetail(res.data);
}

/**
 * POST /api/v1/customer/tickets/{ticketId}/conversation/messages
 */
export async function sendMessage(
  _customerId: string,
  ticketId: string,
  payload: SendMessagePayload
): Promise<ConversationMessage> {
  const res = await apiCrm.post<MessageDto>(
    `/api/v1/customer/tickets/${ticketId}/conversation/messages`,
    payload
  );
  return adaptMessage(res.data);
}

/**
 * GET single message detail (future use)
 */
export async function getMessageById(
  _customerId: string,
  ticketId: string,
  messageId: string
): Promise<ConversationMessage> {
  const res = await apiCrm.get<MessageDto>(
    `/api/v1/customer/tickets/${ticketId}/conversation/messages/${messageId}`
  );
  return adaptMessage(res.data);
}

