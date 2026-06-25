"use client";

import { useState } from "react";
import { Feedback } from "./types";
import StarRating from "./StarRating";

interface FeedbackFormProps {
  onSubmit: (feedback: Omit<Feedback, "id">) => void;
}

const MAX_CHARS = 500;

export default function FeedbackForm({ onSubmit }: FeedbackFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [author, setAuthor] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const remaining = MAX_CHARS - comment.length;

  function handleSubmit() {
    if (!author.trim()) { setError("Please enter your name."); return; }
    if (rating === 0) { setError("Please select a rating."); return; }
    if (!comment.trim()) { setError("Please write a comment."); return; }
    setError("");
    onSubmit({ author: author.trim(), rating, comment: comment.trim(), date: new Date().toISOString().split("T")[0] });
    setRating(0);
    setComment("");
    setAuthor("");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #E5E7EB",
    borderRadius: 8,
    fontSize: 14,
    color: "#1A1D23",
    outline: "none",
    boxSizing: "border-box",
    background: "#fff",
    fontFamily: "inherit",
  };

  return (
    <div
      style={{
        background: "#F8F9FF",
        border: "1px solid #E8EAFF",
        borderRadius: 12,
        padding: "20px 24px",
        marginTop: 8,
      }}
    >
      <p style={{ margin: "0 0 16px", fontWeight: 600, fontSize: 15, color: "#1A1D23" }}>
        Leave a review
      </p>

      {submitted && (
        <div style={{ background: "#E6F9F0", border: "1px solid #A7E6C8", borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: "#1A7A4A" }}>
          Your review has been submitted. Thank you!
        </div>
      )}

      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 13, color: "#4B5163", display: "block", marginBottom: 6 }}>Your name</label>
        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="e.g. Juan Dela Cruz"
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 13, color: "#4B5163", display: "block", marginBottom: 6 }}>Rating</label>
        <StarRating value={rating} interactive size="lg" onChange={setRating} />
      </div>

      <div style={{ marginBottom: 4 }}>
        <label style={{ fontSize: 13, color: "#4B5163", display: "block", marginBottom: 6 }}>Comment</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value.slice(0, MAX_CHARS))}
          placeholder="Share your experience with this product..."
          rows={4}
          style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
        />
        <p style={{ margin: "4px 0 0", fontSize: 12, color: remaining < 50 ? "#E24B4A" : "#8B8FA8", textAlign: "right" }}>
          {remaining} characters remaining
        </p>
      </div>

      {error && (
        <p style={{ margin: "8px 0", fontSize: 13, color: "#E24B4A" }}>{error}</p>
      )}

      <button
        onClick={handleSubmit}
        style={{
          marginTop: 12,
          background: "#3B4CCA",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          padding: "10px 24px",
          fontSize: 14,
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        Submit review
      </button>
    </div>
  );
}