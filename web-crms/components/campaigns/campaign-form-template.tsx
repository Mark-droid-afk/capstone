"use client";

import { useEffect, useRef, useState } from "react";
import { campaignsApi } from "@/lib/api/campaign";
import { CampaignFormData, CampaignTemplate } from "@/types/campaign";

interface Props {
  form: CampaignFormData;
  onChange: (patch: Partial<CampaignFormData>) => void;
}

export default function CampaignFormTemplate({ form, onChange }: Props) {
  const [templates, setTemplates] = useState<CampaignTemplate[]>([]);
  const [loadingTpl, setLoadingTpl] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLoadingTpl(true);
    campaignsApi
      .getTemplates()
      .then((res) => setTemplates(res.data ?? []))
      .catch(() => setTemplates([]))
      .finally(() => setLoadingTpl(false));
  }, []);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    onChange({ imageFile: file });
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const clearImage = () => {
    onChange({ imageFile: null });
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="space-y-5">
      {/* Template picker */}
      <div className="space-y-2">
        <p className="text-theme-sm font-medium text-gray-700">
          Template <span className="text-gray-400 font-normal">(optional)</span>
        </p>

        {loadingTpl ? (
          <div className="flex items-center gap-2 text-gray-400 text-theme-sm py-2">
            <i className="ti ti-loader-2 animate-spin text-base" /> Loading templates...
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto custom-scrollbar pr-1">
            {/* No template option */}
            <button
              type="button"
              onClick={() => onChange({ templateId: "" })}
              className={`flex flex-col items-center justify-center gap-1 p-3 rounded-xl border text-center transition-colors ${
                form.templateId === ""
                  ? "border-brand-500 bg-brand-25"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <i className={`ti ti-ban text-lg ${form.templateId === "" ? "text-brand-500" : "text-gray-400"}`} />
              <span className="text-theme-xs font-medium text-gray-700">No template</span>
            </button>

            {templates.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => onChange({ templateId: tpl.id })}
                className={`flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-colors ${
                  form.templateId === tpl.id
                    ? "border-brand-500 bg-brand-25"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {tpl.previewUrl ? (
                  <img src={tpl.previewUrl} alt={tpl.name} className="w-full h-20 object-cover rounded-lg mb-1" />
                ) : (
                  <div className="w-full h-20 bg-gray-100 rounded-lg flex items-center justify-center mb-1">
                    <i className="ti ti-layout text-gray-300 text-2xl" />
                  </div>
                )}
                <span className="text-theme-xs font-semibold text-gray-800 line-clamp-1">{tpl.name}</span>
                <span className="text-theme-xs text-gray-400 line-clamp-1">{tpl.description}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Image upload */}
      <div className="space-y-2">
        <p className="text-theme-sm font-medium text-gray-700">
          Image <span className="text-gray-400 font-normal">(optional)</span>
        </p>

        {preview ? (
          <div className="relative rounded-xl overflow-hidden border border-gray-200">
            <img src={preview} alt="Preview" className="w-full max-h-40 object-cover" />
            <button
              type="button"
              onClick={clearImage}
              className="absolute top-2 right-2 bg-white border border-gray-200 rounded-lg p-1 text-gray-500 hover:text-error-600 hover:border-error-200 transition-colors"
            >
              <i className="ti ti-x text-sm" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl p-6 cursor-pointer hover:border-brand-300 hover:bg-brand-25 transition-colors">
            <i className="ti ti-photo-up text-2xl text-gray-300" />
            <span className="text-theme-sm text-gray-400">Click to upload an image</span>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFile}
            />
          </label>
        )}
      </div>
    </div>
  );
}
