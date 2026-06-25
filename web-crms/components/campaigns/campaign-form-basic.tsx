"use client";

import { CampaignFormData } from "@/types/campaign";

interface Props {
  form: CampaignFormData;
  onChange: (patch: Partial<CampaignFormData>) => void;
}

const inputCls =
  "w-full px-3 py-2 text-theme-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white";

export default function CampaignFormBasic({ form, onChange }: Props) {
  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="space-y-1">
        <label className="text-theme-sm font-medium text-gray-700">
          Title <span className="text-error-500">*</span>
        </label>
        <input
          value={form.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="e.g. Summer Sale Campaign"
          className={inputCls}
        />
      </div>

      {/* Subject */}
      <div className="space-y-1">
        <label className="text-theme-sm font-medium text-gray-700">
          Subject <span className="text-error-500">*</span>
        </label>
        <input
          value={form.subject}
          onChange={(e) => onChange({ subject: e.target.value })}
          placeholder="e.g. Don't miss our biggest sale of the year!"
          className={inputCls}
        />
      </div>

      {/* Description */}
      <div className="space-y-1">
        <label className="text-theme-sm font-medium text-gray-700">
          Description <span className="text-error-500">*</span>
        </label>
        <textarea
          value={form.description}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={4}
          placeholder="Write the campaign message body here..."
          className={`${inputCls} resize-none`}
        />
      </div>

      {/* Channel */}
      <div className="space-y-2">
        <p className="text-theme-sm font-medium text-gray-700">
          Channel <span className="text-error-500">*</span>
        </p>
        <div className="grid grid-cols-2 gap-3">
          {(["email", "in_app"] as const).map((ch) => (
            <label
              key={ch}
              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                form.channel === ch
                  ? "border-brand-500 bg-brand-25"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="channel"
                value={ch}
                checked={form.channel === ch}
                onChange={() => onChange({ channel: ch })}
                className="accent-brand-500"
              />
              <div className="flex items-center gap-2">
                <i
                  className={`ti ${ch === "email" ? "ti-mail" : "ti-bell"} text-base ${
                    form.channel === ch ? "text-brand-500" : "text-gray-400"
                  }`}
                />
                <span className="text-theme-sm font-medium text-gray-800">
                  {ch === "email" ? "Email" : "In-App"}
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>
      {/* Audience */}
      <div className="space-y-2">
        <p className="text-theme-sm font-medium text-gray-700">Audience</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: "all", label: "All Customers", icon: "ti-users" },
            { value: "Regular", label: "Regular", icon: "ti-user" },
            {
              value: "InstitutionalBuyer",
              label: "Institutional",
              icon: "ti-building",
            },
          ].map((opt) => (
            <label
              key={opt.value}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border cursor-pointer transition-colors text-center ${
                form.audienceFilter === opt.value
                  ? "border-brand-500 bg-brand-25"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="audienceFilter"
                value={opt.value}
                checked={form.audienceFilter === opt.value}
                onChange={() => onChange({ audienceFilter: opt.value })}
                className="sr-only"
              />
              <i
                className={`ti ${opt.icon} text-base ${form.audienceFilter === opt.value ? "text-brand-500" : "text-gray-400"}`}
              />
              <span className="text-theme-xs font-medium text-gray-700">
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
