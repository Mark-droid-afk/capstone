"use client";

import { Campaign } from "@/types/campaign";
import { format } from "date-fns";

const channelStyle: Record<
  string,
  { label: string; cls: string; icon: string }
> = {
  email: { label: "Email", cls: "bg-brand-50 text-brand-600", icon: "ti-mail" },
  in_app: {
    label: "In-App",
    cls: "bg-success-50 text-success-700",
    icon: "ti-bell",
  },
};

const statusStyle: Record<string, { label: string; cls: string }> = {
  draft: { label: "Draft", cls: "bg-gray-100 text-gray-600" },
  active: { label: "Active", cls: "bg-success-50 text-success-700" },
  scheduled: { label: "Scheduled", cls: "bg-warning-50 text-warning-700" },
  recurring: { label: "Recurring", cls: "bg-brand-50 text-brand-600" },
  ended: { label: "Sent", cls: "bg-success-50 text-success-700" },
};

const DAY_LABELS: Record<string, string> = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};

interface CampaignCardProps {
  campaign: Campaign;
  onClick: (campaign: Campaign) => void;
  isDraft: boolean;
}

export default function CampaignCard({ campaign, onClick, isDraft }: CampaignCardProps) {
  const ch = channelStyle[campaign.channel] ?? channelStyle.email;
  const sta = statusStyle[campaign.status] ?? statusStyle.draft;

  return (
    <div
      onClick={() => onClick(campaign)}
      className="bg-white rounded-2xl border border-gray-200 shadow-theme-xs hover:shadow-theme-md hover:border-gray-300 transition-all duration-150 cursor-pointer"
    >
      <div className="p-5 space-y-3">
        {/* Channel + Status */}
        <div className="flex items-center justify-between gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${ch.cls}`}
          >
            <i className={`ti ${ch.icon} text-xs`} />
            {ch.label}
          </span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${sta.cls}`}
          >
            {sta.label}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-theme-sm font-semibold text-gray-900 line-clamp-2 leading-snug">
          {campaign.title}
        </h3>

        {/* Subject */}
        <p className="text-theme-xs text-gray-500 line-clamp-1">
          <span className="text-gray-400">Subject: </span>
          {campaign.subject}
        </p>

        {/* Description */}
        <p className="text-theme-xs text-gray-500 line-clamp-2">
          {campaign.description}
        </p>

        {/* Stats — active / ended */}
        {(campaign.status === "active" || campaign.status === "ended") &&
          campaign.sentCount !== undefined && (
            <div className="flex gap-4 pt-1 border-t border-gray-100">
              <div>
                <p className="text-theme-xs text-gray-400">Sent</p>
                <p className="text-theme-sm font-semibold text-gray-800">
                  {campaign.sentCount.toLocaleString()}
                </p>
              </div>
              {campaign.openRate !== undefined && (
                <div>
                  <p className="text-theme-xs text-gray-400">Open Rate</p>
                  <p className="text-theme-sm font-semibold text-gray-800">
                    {campaign.openRate}%
                  </p>
                </div>
              )}
            </div>
          )}

        {isDraft && (
          <span className="absolute top-2 right-2 px-1.5 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded">
            Draft
          </span>
        )}

        {/* Meta footer */}
        <div className="flex flex-wrap gap-3 text-theme-xs text-gray-400 pt-1 border-t border-gray-100">
          {campaign.scheduleType === "scheduled" && campaign.scheduledAt && (
            <span className="flex items-center gap-1">
              <i className="ti ti-clock text-xs" />
              {format(new Date(campaign.scheduledAt), "MMM d, yyyy · h:mm a")}
            </span>
          )}
          {campaign.scheduleType === "recurring" && campaign.recurringDays && (
            <span className="flex items-center gap-1">
              <i className="ti ti-repeat text-xs" />
              {campaign.recurringDays.map((d) => DAY_LABELS[d]).join(", ")}
            </span>
          )}
          {campaign.scheduleType === "now" && (
            <span className="flex items-center gap-1">
              <i className="ti ti-send text-xs" />
              Sent immediately
            </span>
          )}
          <span className="flex items-center gap-1 ml-auto">
            <i className="ti ti-calendar text-xs" />
            {format(new Date(campaign.createdAt), "MMM d, yyyy")}
          </span>
        </div>
      </div>
    </div>
  );
}
