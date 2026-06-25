export type CampaignChannel = "email" | "in_app";
export type CampaignStatus =
  | "draft"
  | "active"
  | "scheduled"
  | "recurring"
  | "ended";
export type CampaignScheduleType = "now" | "scheduled" | "recurring";
export type RecurringDay =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface CampaignTemplate {
  id: string;
  name: string;
  description: string;
  previewUrl?: string;
}

export interface Campaign {
  id: string;
  title: string;
  subject: string;
  description: string;
  channel: CampaignChannel;
  status: CampaignStatus;
  scheduleType: CampaignScheduleType;
  scheduledAt?: string;
  recurringDays?: RecurringDay[];
  templateId?: string;
  templateName?: string;
  imageUrl?: string;
  sentCount?: number;
  openRate?: number;
  createdAt: string;
  updatedAt: string;
  endedAt?: string;
}

export interface PaginatedCampaigns {
  data: Campaign[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CampaignFormData {
  title: string;
  subject: string;
  description: string;
  channel: CampaignChannel | "";
  scheduleType: CampaignScheduleType | "";
  scheduledAt: string;
  recurringDays: RecurringDay[];
  templateId: string;
  imageFile: File | null;
  /** "all" | "Regular" | "InstitutionalBuyer" */
  audienceFilter: string;
}

export const defaultFormData = (): CampaignFormData => ({
  title: "",
  subject: "",
  description: "",
  channel: "",
  scheduleType: "",
  scheduledAt: "",
  recurringDays: [],
  templateId: "",
  imageFile: null,
  audienceFilter: "all",
});
