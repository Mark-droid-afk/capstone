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
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

interface Props {
  campaign: Campaign | null;
  onClose: () => void;
}

export default function CampaignDetailModal({ campaign, onClose }: Props) {
  if (!campaign) return null;

  const ch = channelStyle[campaign.channel] ?? channelStyle.email;
  const sta = statusStyle[campaign.status] ?? statusStyle.draft;

  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-theme-xl w-full max-w-lg mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${ch.cls}`}
            >
              <i className={`ti ${ch.icon} text-xs`} /> {ch.label}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${sta.cls}`}
            >
              {sta.label}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <i className="ti ti-x text-xl" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="px-6 py-5 space-y-5">
            {/* Title + subject */}
            <div>
              <p className="text-theme-xs text-gray-400 uppercase tracking-wide mb-1">
                #{campaign.id.slice(0, 8)}
              </p>
              <h2 className="text-lg font-semibold text-gray-900 mb-0.5">
                {campaign.title}
              </h2>
              <p className="text-theme-sm text-gray-500">
                <span className="text-gray-400">Subject: </span>
                {campaign.subject}
              </p>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-theme-xs p-4">
              <h3 className="text-theme-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Message
              </h3>
              <p className="text-theme-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {campaign.description}
              </p>
            </div>

            {/* Image */}
            {campaign.imageUrl && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-theme-xs p-4">
                <h3 className="text-theme-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Image
                </h3>
                <div className="rounded-lg overflow-hidden border border-gray-100">
                  <img
                    src={campaign.imageUrl}
                    alt="Campaign"
                    className="w-full object-contain max-h-52"
                  />
                </div>
              </div>
            )}

            {/* Stats */}
            {(campaign.status === "active" || campaign.status === "ended") &&
              campaign.sentCount !== undefined && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-theme-xs p-4">
                  <h3 className="text-theme-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                    Performance
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-theme-xs text-gray-400 mb-0.5">Sent</p>
                      <p className="text-xl font-bold text-gray-900">
                        {campaign.sentCount.toLocaleString()}
                      </p>
                    </div>
                    {campaign.openRate !== undefined && (
                      <div>
                        <p className="text-theme-xs text-gray-400 mb-0.5">
                          Open Rate
                        </p>
                        <p className="text-xl font-bold text-gray-900">
                          {campaign.openRate}%
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

            {/* Schedule & Template */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-theme-xs p-4">
              <h3 className="text-theme-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Details
              </h3>
              <div className="space-y-2">
                <p className="text-theme-xs text-gray-500 flex items-center gap-1.5">
                  <i className="ti ti-clock text-gray-400" />
                  Schedule:{" "}
                  {campaign.scheduleType === "now"
                    ? "Sent immediately"
                    : campaign.scheduleType === "scheduled" &&
                        campaign.scheduledAt
                      ? format(
                          new Date(campaign.scheduledAt),
                          "MMM d, yyyy · h:mm a",
                        )
                      : campaign.recurringDays
                        ? campaign.recurringDays
                            .map((d) => DAY_LABELS[d])
                            .join(", ")
                        : "—"}
                </p>
                {campaign.templateName && (
                  <p className="text-theme-xs text-gray-500 flex items-center gap-1.5">
                    <i className="ti ti-layout text-gray-400" />
                    Template: {campaign.templateName}
                  </p>
                )}
                <p className="text-theme-xs text-gray-500 flex items-center gap-1.5">
                  <i className="ti ti-calendar text-gray-400" />
                  Created:{" "}
                  {format(new Date(campaign.createdAt), "MMM d, yyyy · h:mm a")}
                </p>
                {campaign.endedAt && (
                  <p className="text-theme-xs text-success-600 flex items-center gap-1.5">
                    <i className="ti ti-send" />
                    Sent:{" "}
                    {format(new Date(campaign.endedAt), "MMM d, yyyy · h:mm a")}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-theme-sm font-medium border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
