"use client";
import React, { useState } from "react";
import apiPos from "@/lib/apiPos";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const REFUND_REASONS = [
  "Item arrived damaged",
  "Wrong item received",
  "Item not as described",
  "Other",
];

interface RefundModalProps {
  order: any;
  onClose: () => void;
  onSuccess: () => void;
}

const RefundModal = ({ order, onClose, onSuccess }: RefundModalProps) => {
  const { user } = useAuth();
  const [reason, setReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const finalReason = reason === "Other" ? otherReason : reason;
  const isPaymentXendit =
    order.paymentMethod?.toLowerCase() !== "cod" &&
    order.paymentMethod?.toLowerCase() !== "cash on delivery";

  const handleSubmit = async () => {
    if (!finalReason.trim()) {
      setError("Please select or enter a reason for the refund.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await apiPos.post(
        `/api-pos/customers/orders/${order.orderId}/refund`,
        { reason: finalReason },
        { headers: { "X-Auth-Id": user?.id } }
      );
      setSuccess(true);
      toast.success("Refund requested successfully");
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.response?.data || "Failed to submit refund request. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/50 px-4">
      <div className="relative w-full max-w-[500px] rounded-2xl bg-white shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-gray-3">
          <div>
            <h2 className="text-lg font-semibold text-dark">Request a Refund</h2>
            <p className="text-xs text-dark-5 mt-0.5">
              Order{" "}
              <span className="font-medium text-red">
                #{String(order.orderNumber || order.orderId).slice(-8)}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-2 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.9983 10.586L17.9483 5.63603L19.3623 7.05003L14.4123 12L19.3623 16.95L17.9483 18.364L12.9983 13.414L8.04828 18.364L6.63428 16.95L11.5843 12L6.63428 7.05003L8.04828 5.63603L12.9983 10.586Z" fill="#374151" />
            </svg>
          </button>
        </div>

        {success ? (
          <div className="flex flex-col items-center justify-center px-7 py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-dark mb-2">Refund Requested!</h3>
            <p className="text-sm text-dark-5">
              Your refund request has been submitted. Our team will review it and get back to you.
            </p>
          </div>
        ) : (
          <div className="px-7 py-6 space-y-5">
            {/* Order summary */}
            <div className="bg-gray-1 rounded-xl p-4 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-dark-5">Amount</span>
                <span className="font-semibold text-dark">{order.total}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-dark-5">Payment Method</span>
                <span className="font-medium text-dark capitalize">
                  {isPaymentXendit ? "Online Payment (Xendit)" : "Cash on Delivery"}
                </span>
              </div>
              {isPaymentXendit && (
                <div className="flex items-center gap-1.5 text-xs text-blue mt-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Refund will be processed back to your original payment method.
                </div>
              )}
            </div>

            {/* Reason selector */}
            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Reason for Refund <span className="text-red">*</span>
              </label>
              <div className="space-y-2">
                {REFUND_REASONS.map((r) => (
                  <label
                    key={r}
                    onClick={() => setReason(r)}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      reason === r
                        ? "border-blue bg-blue/5"
                        : "border-gray-3 hover:border-gray-4"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        reason === r ? "border-blue" : "border-gray-4"
                      }`}
                    >
                      {reason === r && (
                        <div className="w-2 h-2 rounded-full bg-blue" />
                      )}
                    </div>
                    <span className="text-sm text-dark">{r}</span>
                  </label>
                ))}
              </div>
              {reason && (
                <button
                  className="text-xs text-dark-5 mt-1 underline"
                  onClick={() => setReason("")}
                >
                  Clear selection
                </button>
              )}
            </div>

            {reason === "Other" && (
              <div>
                <label className="block text-sm font-medium text-dark mb-1.5">
                  Please describe <span className="text-red">*</span>
                </label>
                <textarea
                  value={otherReason}
                  onChange={(e) => setOtherReason(e.target.value)}
                  placeholder="Tell us more about your refund request..."
                  rows={3}
                  className="w-full rounded-xl border border-gray-3 px-4 py-3 text-sm text-dark placeholder:text-dark-5 focus:border-blue focus:outline-none resize-none"
                />
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 rounded-xl bg-red-light-6 px-4 py-3">
                <svg className="w-4 h-4 text-red flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={onClose}
                disabled={submitting}
                className="flex-1 rounded-xl border border-gray-3 py-3 text-sm font-medium text-dark hover:bg-gray-1 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !reason || (reason === "Other" && !otherReason.trim())}
                className="flex-1 rounded-xl bg-red py-3 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Submitting...
                  </>
                ) : (
                  "Submit Refund Request"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RefundModal;
