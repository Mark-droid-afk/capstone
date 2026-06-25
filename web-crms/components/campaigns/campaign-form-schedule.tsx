"use client";

import { CampaignFormData, RecurringDay } from "@/types/campaign";

const DAYS: { key: RecurringDay; label: string }[] = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

interface Props {
  form: CampaignFormData;
  onChange: (patch: Partial<CampaignFormData>) => void;
}

export default function CampaignFormSchedule({ form, onChange }: Props) {
  const toggleDay = (day: RecurringDay) => {
    const days = form.recurringDays.includes(day)
      ? form.recurringDays.filter((d) => d !== day)
      : [...form.recurringDays, day];
    onChange({ recurringDays: days });
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-theme-xs text-gray-400 uppercase tracking-wide mb-3">
          When to send
        </p>
        <div className="space-y-2">
          {(["now", "scheduled", "recurring"] as const).map((type) => (
            <label
              key={type}
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                form.scheduleType === type
                  ? "border-brand-500 bg-brand-25"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="scheduleType"
                value={type}
                checked={form.scheduleType === type}
                onChange={() => onChange({ scheduleType: type })}
                className="mt-0.5 accent-brand-500"
              />
              <div>
                <p className="text-theme-sm font-medium text-gray-800">
                  {type === "now"       ? "Send Now"  :
                   type === "scheduled" ? "Scheduled" :
                                          "Recurring"}
                </p>
                <p className="text-theme-xs text-gray-400">
                  {type === "now"
                    ? "Campaign will be sent immediately after publishing."
                    : type === "scheduled"
                    ? "Pick a specific date and time to send."
                    : "Repeat on selected days every week."}
                </p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Scheduled — datetime picker */}
      {form.scheduleType === "scheduled" && (
        <div className="space-y-1">
          <label className="text-theme-sm font-medium text-gray-700">
            Schedule Date &amp; Time <span className="text-error-500">*</span>
          </label>
          <input
            type="datetime-local"
            value={form.scheduledAt}
            onChange={(e) => onChange({ scheduledAt: e.target.value })}
            className="w-full px-3 py-2 text-theme-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
          />
        </div>
      )}

      {/* Recurring — day checkboxes */}
      {form.scheduleType === "recurring" && (
        <div className="space-y-2">
          <p className="text-theme-sm font-medium text-gray-700">
            Repeat on <span className="text-error-500">*</span>
          </p>
          <div className="flex gap-2 flex-wrap">
            {DAYS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => toggleDay(key)}
                className={`px-4 py-2 rounded-lg text-theme-sm font-medium border transition-colors ${
                  form.recurringDays.includes(key)
                    ? "border-brand-500 bg-brand-500 text-white"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
