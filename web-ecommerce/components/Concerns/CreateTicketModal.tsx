"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { CreateTicketPayload, TicketType } from "@/types/ticket";
import ModalBackdrop from "./ModalBackdrop";
import { toast } from "sonner";

type CreateTicketModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateTicketPayload) => Promise<void>;
};

const TICKET_TYPES: TicketType[] = ["Concern", "Inquiry", "Request"];

const TYPE_DESCRIPTIONS: Record<TicketType, string> = {
  Concern: "Report a problem or complaint about a product/service.",
  Inquiry: "Ask a question or request information.",
  Request: "Request a specific action or customization.",
};

const CreateTicketModal = ({ isOpen, onClose, onSubmit }: CreateTicketModalProps) => {
  const [type, setType] = useState<TicketType>("Concern");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = "Title is required.";
    else if (title.trim().length < 5) errs.title = "Title must be at least 5 characters.";
    if (!description.trim()) errs.description = "Description is required.";
    else if (description.trim().length < 10)
      errs.description = "Please provide a more detailed description (min 10 characters).";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setImage(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    } else {
      setImagePreview(null);
    }
  };

  const clearImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    // Reset form on close
    setTitle("");
    setDescription("");
    setType("Concern");
    clearImage();
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        type,
        title: title.trim(),
        description: description.trim(),
        image: image ?? undefined,
      });
      toast.success("Ticket created successfully");
      handleClose();
    } catch (err) {
      console.error("Failed to create ticket:", err);
      setErrors({ form: "Something went wrong. Please try again." });
      toast.error("Failed to create ticket. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalBackdrop isOpen={isOpen} onClose={handleClose} maxWidth="max-w-[620px]">
      <div className="p-6 sm:p-8">
        {/* Header */}
        <div className="mb-6 pr-8">
          <h2 className="font-semibold text-dark text-xl">Raise a Concern</h2>
          <p className="text-custom-sm text-dark-4 mt-1">
            Submit a concern, inquiry, or request to our support team.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* Global error */}
          {errors.form && (
            <div className="mb-4 p-3 bg-red-light-6 text-red text-custom-sm rounded-md">
              {errors.form}
            </div>
          )}

          {/* Type selector */}
          <div className="mb-5">
            <label className="block mb-2 text-custom-sm font-medium text-dark">
              Type <span className="text-red">*</span>
            </label>
            <div className="flex gap-2.5 flex-wrap">
              {TICKET_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  id={`ticket-type-${t.toLowerCase()}`}
                  onClick={() => setType(t)}
                  className={`px-4 py-2 rounded-md text-custom-sm font-medium border ease-out duration-200 ${
                    type === t
                      ? "bg-blue text-white border-blue"
                      : "bg-gray-1 text-dark-2 border-gray-3 hover:border-blue hover:text-blue"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-custom-xs text-dark-4">{TYPE_DESCRIPTIONS[type]}</p>
          </div>

          {/* Title */}
          <div className="mb-5">
            <label htmlFor="ticket-title" className="block mb-2 text-custom-sm font-medium text-dark">
              Title <span className="text-red">*</span>
            </label>
            <input
              id="ticket-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((p) => ({ ...p, title: "" }));
              }}
              placeholder="Brief summary of your concern..."
              maxLength={120}
              className={`rounded-md border bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 ${
                errors.title ? "border-red" : "border-gray-3"
              }`}
            />
            {errors.title && (
              <p className="mt-1 text-custom-xs text-red">{errors.title}</p>
            )}
            <p className="mt-1 text-custom-xs text-dark-5 text-right">{title.length}/120</p>
          </div>

          {/* Description */}
          <div className="mb-5">
            <label
              htmlFor="ticket-description"
              className="block mb-2 text-custom-sm font-medium text-dark"
            >
              Description <span className="text-red">*</span>
            </label>
            <textarea
              id="ticket-description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors((p) => ({ ...p, description: "" }));
              }}
              placeholder="Provide detailed information about your concern..."
              rows={4}
              maxLength={1000}
              className={`rounded-md border bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 resize-none ${
                errors.description ? "border-red" : "border-gray-3"
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-custom-xs text-red">{errors.description}</p>
            )}
            <p className="mt-1 text-custom-xs text-dark-5 text-right">
              {description.length}/1000
            </p>
          </div>

          {/* Image upload (optional) */}
          <div className="mb-6">
            <label className="block mb-2 text-custom-sm font-medium text-dark">
              Attachment{" "}
              <span className="text-dark-4 font-normal">(optional)</span>
            </label>

            {imagePreview ? (
              <div className="relative w-full h-40 rounded-lg overflow-hidden border border-gray-3 group">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute top-2 right-2 flex items-center justify-center w-7 h-7 rounded-full bg-dark/60 text-white hover:bg-red ease-out duration-200"
                  title="Remove image"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M18 6 6 18M6 6l12 12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center w-full h-28 rounded-lg border-2 border-dashed border-gray-3 text-dark-4 hover:border-blue hover:text-blue ease-out duration-200 bg-gray-1"
              >
                <svg
                  className="fill-current mb-1.5"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M12 16V8m0 0-3 3m3-3 3 3M6 20h12a2 2 0 0 0 2-2V8.5a2 2 0 0 0-.586-1.414l-2.5-2.5A2 2 0 0 0 15.5 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
                <span className="text-custom-sm font-medium">Click to upload image</span>
                <span className="text-custom-xs mt-0.5">PNG, JPG, WEBP up to 5MB</span>
              </button>
            )}

            <input
              ref={fileInputRef}
              id="ticket-image"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          {/* Divider */}
          <div className="border-t border-gray-3 mb-5" />

          {/* Submit */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="font-medium py-2.5 px-6 rounded-md border border-gray-3 text-dark-2 hover:border-dark hover:text-dark ease-out duration-200"
            >
              Cancel
            </button>
            <button
              id="ticket-submit"
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 font-medium text-white bg-blue py-2.5 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting && (
                <svg
                  className="animate-spin"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              )}
              {isSubmitting ? "Submitting..." : "Submit Ticket"}
            </button>
          </div>
        </form>
      </div>
    </ModalBackdrop>
  );
};

export default CreateTicketModal;
