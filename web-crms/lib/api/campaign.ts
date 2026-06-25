import { apiCrm } from "@/lib/axios/api/customer";
import type {
  Campaign,
  CampaignChannel,
  CampaignScheduleType,
  CampaignTemplate,
  PaginatedCampaigns,
  RecurringDay,
} from "@/types/campaign";

interface ListParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

interface CreatePayload {
  title: string;
  subject: string;
  description: string;
  channel: CampaignChannel;
  scheduleType: CampaignScheduleType;
  scheduledAt?: string;
  recurringDays?: RecurringDay[];
  templateId?: string;
  imageUrl?: string;
  audienceFilter?: string;
}

interface DraftPayload {
  title: string;
  subject?: string;
  description?: string;
  channel?: CampaignChannel;
  audienceFilter?: string;
}

export const campaignsApi = {
  getActive: (params?: ListParams) =>
    apiCrm.get<PaginatedCampaigns>("/campaigns", {
      params: { ...params, status: "active" },
    }),

  getDrafts: (params?: ListParams) =>
    apiCrm.get<PaginatedCampaigns>("/campaigns", {
      params: { ...params, status: "draft" },
    }),

  getHistory: (params?: ListParams) =>
    apiCrm.get<PaginatedCampaigns>("/campaigns", {
      params: { ...params, status: "ended" },
    }),

  getById: (id: string) =>
    apiCrm.get<Campaign>(`/campaigns/${id}`),

  getTemplates: () =>
    apiCrm.get<CampaignTemplate[]>("/campaigns/templates"),

  create: (data: CreatePayload) =>
    apiCrm.post<Campaign>("/campaigns", data),

  draft: (data: DraftPayload) =>
    apiCrm.post<Campaign>("/campaigns/draft", data),
};
