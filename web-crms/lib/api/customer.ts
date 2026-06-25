import { apiCrm } from "@/lib/axios/api/customer";
import type {
  Customer,
  MarketingHistory,
  Order,
  PaginatedResponse,
} from "@/types/customer";

export const customersApi = {
  getAll: (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
    type?: string;
  }) => apiCrm.get<PaginatedResponse<Customer>>("/customers", { params }),

  getById: (id: string) => apiCrm.get<Customer>(`/customers/${id}`),

  create: (
    data: Pick<
      Customer,
      "firstName" | "lastName" | "email" | "phone" | "customerType" | "address"
    >,
  ) => apiCrm.post<Customer>("/customers", data),

  updateStatus: (id: string, status: Customer["status"]) =>
    apiCrm.patch(`/customers/${id}/status`, { status }),

  updateType: (id: string, customerType: Customer["customerType"]) =>
    apiCrm.patch(`/customers/${id}/type`, { customerType }),

  updateNotes: (id: string, notes: string) =>
    apiCrm.patch(`/customers/${id}/notes`, { notes }),

  updateAddress: (id: string, address: string) =>
    apiCrm.patch(`/customers/${id}/address`, { address }),

  delete: (id: string) => apiCrm.delete(`/customers/${id}`),

  getMarketingHistory: (
    id: string,
    params?: { page?: number; pageSize?: number },
  ) =>
    apiCrm.get<PaginatedResponse<MarketingHistory>>(
      `/customers/${id}/marketing-history`,
      { params },
    ).then((res) => {
      if (res.data && Array.isArray(res.data.data)) {
        res.data.data = res.data.data.map((m) => {
          let channel = m.channel as string;
          if (channel === "SocialMedia" || channel === "socialMedia") channel = "social_media";
          else if (channel === "PushNotification" || channel === "pushNotification") channel = "push_notification";
          else channel = channel.toLowerCase();

          return {
            ...m,
            channel: channel as any,
            interactionType: m.interactionType.toLowerCase() as any,
          };
        });
      }
      return res;
    }),

  getOrderHistory: (
    id: string,
    params?: { page?: number; pageSize?: number },
  ) =>
    apiCrm.get<PaginatedResponse<Order>>(`/customers/${id}/order-history`, {
      params,
    }),
};
