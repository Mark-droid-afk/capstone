"use client";

import React, { useState, useRef, useCallback } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import FeedbackTab, { INITIAL_FEEDBACKS } from "./FeedbackTab";
import type { Feedback } from "./FeedbackTab";

// ─── Toast ────────────────────────────────────────────────────────────────────

type Toast = { id: number };

const ToastContainer = ({
  toasts,
  onRemove,
}: {
  toasts: Toast[];
  onRemove: (id: number) => void;
}) => (
  <div className="fixed top-5 right-5 z-[999] flex flex-col gap-2.5 pointer-events-none">
    {toasts.map((t) => (
      <div
        key={t.id}
        className="pointer-events-auto flex items-start gap-3 bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3.5 min-w-[280px] max-w-[340px] animate-toast-in"
      >
        <div className="w-7 h-7 rounded-full bg-green-50 flex items-center justify-center shrink-0 mt-0.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800">Review submitted!</p>
          <p className="text-xs text-gray-500 mt-0.5">Your review is now visible to others.</p>
        </div>
        <button
          onClick={() => onRemove(t.id)}
          className="text-gray-400 hover:text-gray-700 shrink-0 mt-0.5"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    ))}
  </div>
);

// ─── Feedback Page ────────────────────────────────────────────────────────────

const FeedbackPage = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(INITIAL_FEEDBACKS);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  const handleSubmit = useCallback((fb: Feedback) => {
    setFeedbacks((prev) => [fb, ...prev]);
    const id = ++toastId.current;
    setToasts((prev) => [...prev, { id }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4500);
  }, []);

  return (
    <>
      <Breadcrumb title="Feedback & Reviews" pages={["feedback"]} />
      <ToastContainer
        toasts={toasts}
        onRemove={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />

      <section className="overflow-hidden py-10 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">

          {/* Description — fades in from top */}
          <div className="mb-7.5 page-enter-desc">
            <p className="text-dark text-base max-w-xl">
              Share your experience with our support team or browse reviews from other customers.
            </p>
          </div>

          {/* Main content — fades up slightly after */}
          <div className="page-enter-content">
            <FeedbackTab feedbacks={feedbacks} onSubmit={handleSubmit} />
          </div>
        </div>
      </section>

      <style>{`
        /* Page entry */
        @keyframes page-desc-in {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes page-content-in {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .page-enter-desc {
          animation: page-desc-in 0.65s cubic-bezier(0.22,1,0.36,1) both;
        }
        .page-enter-content {
          animation: page-content-in 0.75s cubic-bezier(0.22,1,0.36,1) 0.15s both;
        }

        /* Toast */
        @keyframes toast-in { from { transform: translateX(24px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .animate-toast-in { animation: toast-in 0.35s cubic-bezier(0.22,1,0.36,1); }
      `}</style>
    </>
  );
};

export default FeedbackPage;