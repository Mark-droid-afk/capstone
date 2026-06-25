"use client";

import { useState } from "react";
import { campaignsApi } from "@/lib/api/campaign";
import { Campaign, CampaignFormData, defaultFormData } from "@/types/campaign";
import CampaignFormBasic from "./campaign-form-basic";
import CampaignFormSchedule from "./campaign-form-schedule";
import CampaignFormTemplate from "./campaign-form-template";
import { toast } from "sonner";

const STEPS = ["Basic Info", "Schedule", "Template & Image"];

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Campaign | null;
}

export default function CreateCampaignModal({
  onClose,
  onSuccess,
  initialData,
}: Props) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<CampaignFormData>(() =>
    initialData
      ? {
          ...defaultFormData(),
          title: initialData.title ?? "",
          subject: initialData.subject ?? "",
          description: initialData.description ?? "",
        }
      : defaultFormData(),
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const patch = (p: Partial<CampaignFormData>) =>
    setForm((prev) => ({ ...prev, ...p }));

  /* ── Validation per step ── */
  const validateStep = (): string => {
    if (step === 0) {
      if (!form.title.trim()) return "Title is required.";
      if (!form.subject.trim()) return "Subject is required.";
      if (!form.description.trim()) return "Description is required.";
      if (!form.channel) return "Please select a channel.";
    }
    if (step === 1) {
      if (!form.scheduleType) return "Please select a schedule type.";
      if (form.scheduleType === "scheduled" && !form.scheduledAt)
        return "Please pick a date and time.";
      if (form.scheduleType === "recurring" && form.recurringDays.length === 0)
        return "Please select at least one day.";
    }
    return "";
  };

  const handleNext = () => {
    const err = validateStep();
    if (err) {
      setError(err);
      return;
    }
    setError("");
    setStep((s) => s + 1);
  };

  /* ── Build payload (converts imageFile → base64) ── */
  const buildPayload = async () => {
    let imageUrl: string | undefined;
    if (form.imageFile) {
      imageUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(form.imageFile!);
      });
    }
    return {
      title: form.title,
      subject: form.subject,
      description: form.description,
      channel: form.channel as "email" | "in_app",
      scheduleType: form.scheduleType as "now" | "scheduled" | "recurring",
      scheduledAt:
        form.scheduleType === "scheduled" ? form.scheduledAt : undefined,
      recurringDays:
        form.scheduleType === "recurring" ? form.recurringDays : undefined,
      templateId: form.templateId || undefined,
      imageUrl,
      audienceFilter: form.audienceFilter,
    };
  };

  /* ── Save Draft ── */
  const handleDraft = async () => {
    if (!form.title.trim()) {
      setError("Title is required to save a draft.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await campaignsApi.draft({
        title: form.title,
        subject: form.subject || undefined,
        description: form.description || undefined,
        channel: (form.channel || undefined) as Parameters<
          typeof campaignsApi.draft
        >[0]["channel"],
        audienceFilter: form.audienceFilter,
      });
      toast.success("Draft saved successfully");
      onSuccess();
      onClose();
    } catch {
      toast.error("Failed to save draft");
      setError("Failed to save draft. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  /* ── Publish ── */
  const handlePublish = async () => {
    const err = validateStep();
    if (err) {
      setError(err);
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = await buildPayload();
      await campaignsApi.create(
        payload as Parameters<typeof campaignsApi.create>[0],
      );
      toast.success("Campaign published successfully");
      onSuccess();
      onClose();
    } catch {
      toast.error("Failed to publish campaign");
      setError("Failed to publish campaign. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-theme-xl w-full max-w-lg mx-4 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">New Campaign</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <i className="ti ti-x text-xl" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-0 px-6 py-3 border-b border-gray-100">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className="flex items-center gap-2 shrink-0">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                    i < step
                      ? "bg-brand-500 text-white"
                      : i === step
                        ? "bg-brand-500 text-white"
                        : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {i < step ? <i className="ti ti-check text-xs" /> : i + 1}
                </div>
                <span
                  className={`text-theme-xs font-medium ${i <= step ? "text-brand-500" : "text-gray-400"}`}
                >
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-px mx-2 ${i < step ? "bg-brand-300" : "bg-gray-200"}`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-5">
          {step === 0 && <CampaignFormBasic form={form} onChange={patch} />}
          {step === 1 && <CampaignFormSchedule form={form} onChange={patch} />}
          {step === 2 && <CampaignFormTemplate form={form} onChange={patch} />}
          {error && (
            <p className="text-theme-xs text-error-500 mt-3">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                onClick={() => {
                  setError("");
                  setStep((s) => s - 1);
                }}
                className="px-4 py-2 text-theme-sm font-medium border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <i className="ti ti-arrow-left text-base mr-1" /> Back
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDraft}
              disabled={saving}
              className="px-4 py-2 text-theme-sm font-medium border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              <i className="ti ti-file text-base mr-1" />
              {saving ? "Saving..." : "Save Draft"}
            </button>
            {step < STEPS.length - 1 ? (
              <button
                onClick={handleNext}
                className="px-4 py-2 text-theme-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors"
              >
                Next <i className="ti ti-arrow-right text-base ml-1" />
              </button>
            ) : (
              <button
                onClick={handlePublish}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 text-theme-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 disabled:opacity-50 transition-colors"
              >
                <i className="ti ti-send text-base" />
                {saving ? "Publishing..." : "Publish"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
