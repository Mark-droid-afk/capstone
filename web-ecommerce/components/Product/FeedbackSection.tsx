"use client";

import { useState } from "react";
import { Feedback } from "./types";
import RatingSummary from "./RatingSummary";
import FeedbackList from "./FeedbackList";
import FeedbackForm from "./FeedbackForm";

interface FeedbackSectionProps {
  initialFeedbacks: Feedback[];
}

export default function FeedbackSection({ initialFeedbacks }: FeedbackSectionProps) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(initialFeedbacks);

  function handleNewFeedback(fb: Omit<Feedback, "id">) {
    const newFb: Feedback = { ...fb, id: `f-${Date.now()}` };
    setFeedbacks((prev) => [newFb, ...prev]);
  }

  return (
    <section style={{ marginTop: 48 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#3B4CCA" strokeWidth={2}>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span style={{ fontSize: 13, color: "#3B4CCA", fontWeight: 500 }}>Reviews</span>
      </div>
      <h2 style={{ margin: "0 0 16px", fontSize: 22, fontWeight: 700, color: "#1A1D23" }}>
        Ratings & Feedback
      </h2>

      <RatingSummary feedbacks={feedbacks} />

      <div style={{ marginTop: 24 }}>
        <FeedbackForm onSubmit={handleNewFeedback} />
      </div>

      <div style={{ marginTop: 28 }}>
        <p style={{ margin: "0 0 14px", fontWeight: 600, fontSize: 15, color: "#1A1D23" }}>
          {feedbacks.length} {feedbacks.length === 1 ? "review" : "reviews"}
        </p>
        <FeedbackList feedbacks={feedbacks} />
      </div>
    </section>
  );
}