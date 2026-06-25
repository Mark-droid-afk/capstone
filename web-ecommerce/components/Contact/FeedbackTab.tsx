"use client";

import React, { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Feedback = {
  id: number;
  displayName: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
  isAnonymous: boolean;
  timestamp: number;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const REVIEW_MAX = 400;

export const INITIAL_FEEDBACKS: Feedback[] = [
  { id: 1, displayName: "Maria Santos", avatar: "MS", rating: 5, comment: "The support team responded quickly and resolved my issue within 24 hours. Very satisfied!", date: "May 20, 2025", isAnonymous: false, timestamp: Date.now() - 7 * 86400000 },
  { id: 2, displayName: "John Rivera", avatar: "JR", rating: 4, comment: "Good experience overall. The team was helpful and professional.", date: "May 18, 2025", isAnonymous: false, timestamp: Date.now() - 9 * 86400000 },
  { id: 3, displayName: "Anonymous Customer", avatar: "AC", rating: 5, comment: "Excellent customer service! They went above and beyond to help me. Highly recommended.", date: "May 15, 2025", isAnonymous: true, timestamp: Date.now() - 12 * 86400000 },
];

// ─── Utilities ────────────────────────────────────────────────────────────────

const AVATAR_COLORS = ["#3C50E0","#0891B2","#059669","#7C3AED","#DB2777","#D97706","#DC2626","#2563EB"];
function avatarColor(initials: string) {
  let hash = 0;
  for (let i = 0; i < initials.length; i++) hash = initials.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
function relativeTime(ts: number) {
  const d = Math.floor((Date.now() - ts) / 1000);
  if (d < 30) return "just now";
  if (d < 60) return `${d}s ago`;
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const StarRating = ({ value, onChange, readOnly = false, size = 20 }: { value: number; onChange?: (v: number) => void; readOnly?: boolean; size?: number }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button" disabled={readOnly} onClick={() => onChange?.(star)} onMouseEnter={() => !readOnly && setHover(star)} onMouseLeave={() => !readOnly && setHover(0)} style={{ background: "none", border: "none", padding: 0, cursor: readOnly ? "default" : "pointer" }}>
          <svg width={size} height={size} viewBox="0 0 24 24" fill={star <= (hover || value) ? "#F59E0B" : "none"} stroke={star <= (hover || value) ? "#F59E0B" : "#D1D5DB"} strokeWidth="1.5">
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
          </svg>
        </button>
      ))}
    </div>
  );
};

const CharCounter = ({ value, max }: { value: string; max: number }) => {
  const len = value.length;
  const pct = len / max;
  const color = pct >= 1 ? "text-red-500" : pct >= 0.85 ? "text-amber-500" : "text-dark-5";
  return <span className={`text-xs tabular-nums ${color}`}>{len}/{max}</span>;
};

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
);
const ShieldIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 mt-0.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
);

// ─── Rating Bar ───────────────────────────────────────────────────────────────

const RatingBar = ({ star, count, total }: { star: number; count: number; total: number }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
      <span style={{ fontSize: 12, color: "#6B7280", width: 10, flexShrink: 0 }}>{star}</span>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="1.5" style={{ flexShrink: 0 }}>
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
      </svg>
      <div style={{ flex: 1, height: 6, background: "#E5E7EB", borderRadius: 999, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: "#FBBF24", borderRadius: 999, transition: "width 0.5s ease" }} />
      </div>
      <span style={{ fontSize: 12, color: "#6B7280", width: 14, textAlign: "right", flexShrink: 0 }}>{count}</span>
    </div>
  );
};

// ─── FeedbackTab ──────────────────────────────────────────────────────────────

type Props = {
  feedbacks: Feedback[];
  onSubmit: (fb: Feedback) => void;
};

const FeedbackTab = ({ feedbacks, onSubmit }: Props) => {
  const [submitted, setSubmitted] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [errors, setErrors] = useState<{ rating?: string; comment?: string }>({});
  const [sort, setSort] = useState<"recent" | "highest" | "lowest" | "1" | "2" | "3" | "4" | "5">("recent");

  const inputClass = "rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20";
  const errorClass = "text-red text-xs mt-1.5";

  const validate = () => {
    const errs: typeof errors = {};
    if (rating === 0) errs.rating = "Please select a star rating.";
    if (!comment.trim()) errs.comment = "Please write a short review.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const n = new Date();
    const isAnon = anonymous;
    onSubmit({
      id: Date.now(),
      displayName: isAnon ? "Anonymous Customer" : "Customer",
      avatar: isAnon ? "AC" : "CU",
      rating, comment, isAnonymous: isAnon, timestamp: Date.now(),
      date: `${months[n.getMonth()]} ${n.getDate()}, ${n.getFullYear()}`,
    });
    setSubmitted(true);
    setRating(0); setComment(""); setAnonymous(false); setErrors({});
  };

  const sorted = [...feedbacks]
    .sort((a, b) => sort === "recent" ? b.timestamp - a.timestamp : sort === "highest" ? b.rating - a.rating : sort === "lowest" ? a.rating - b.rating : 0)
    .filter((f) => ["1","2","3","4","5"].includes(sort) ? f.rating === Number(sort) : true);

  const avg = feedbacks.length ? feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length : 0;

  return (
    <div className="flex flex-col gap-7.5">
      {/* Form */}
      <div className="bg-white rounded-xl shadow-1">
        <div className="py-5 px-4 sm:px-7.5 border-b border-gray-3">
          <p className="font-medium text-xl text-dark">Leave a Review</p>
          <p className="text-sm text-dark-5 mt-1">Share your experience with our support team.</p>
        </div>
        <div className="p-4 sm:p-7.5">
          {submitted ? (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <p className="font-medium text-dark">Thanks for your feedback!</p>
              <p className="text-sm text-dark-5 mt-1">Your review is now visible to others.</p>
              <button onClick={() => setSubmitted(false)} className="mt-4 text-sm text-blue hover:underline font-medium">Leave another review</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              {/* Rating */}
              <div className="mb-5">
                <label className="block mb-2 text-sm font-medium text-dark">Rating <span className="text-red">*</span></label>
                <StarRating value={rating} onChange={(v) => { setRating(v); setErrors((p) => ({ ...p, rating: undefined })); }} size={24} />
                {errors.rating && <p className={errorClass}>⚠ {errors.rating}</p>}
              </div>

              {/* Review */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-dark">Your Review <span className="text-red">*</span></label>
                  <CharCounter value={comment} max={REVIEW_MAX} />
                </div>
                <textarea rows={4} placeholder="Share your experience..." value={comment} maxLength={REVIEW_MAX} onChange={(e) => { setComment(e.target.value); setErrors((p) => ({ ...p, comment: undefined })); }} className={`${inputClass} resize-none`} />
                {errors.comment && <p className={errorClass}>⚠ {errors.comment}</p>}
              </div>

              {/* Anonymous */}
              <div className="mb-7">
                <label className="flex items-start gap-3 cursor-pointer group select-none">
                  <div className="relative mt-0.5 shrink-0">
                    <input type="checkbox" className="sr-only peer" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} />
                    <div className="w-[18px] h-[18px] rounded border-2 border-gray-3 bg-gray-1 peer-checked:bg-blue peer-checked:border-blue transition-colors duration-150 flex items-center justify-center group-hover:border-blue/60">
                      {anonymous && <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.2"><polyline points="2 6 5 9 10 3" /></svg>}
                    </div>
                  </div>
                  <span className="text-sm font-medium text-dark pt-0.5">Submit Anonymously</span>
                </label>
                {anonymous && (
                  <div className="mt-3 ml-7 flex items-start gap-2 rounded-lg bg-blue/5 border border-blue/20 px-3.5 py-2.5 text-xs text-blue">
                    <ShieldIcon />
                    <span>You will appear as <strong>Anonymous Customer</strong>.</span>
                  </div>
                )}
              </div>

              <button type="submit" className="inline-flex justify-center font-medium text-white bg-blue py-3 px-7 rounded-md hover:bg-blue-dark">
                Submit Review
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Rating Summary */}
      <div className="bg-white rounded-xl shadow-1 p-5 sm:p-7.5">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="text-center shrink-0">
            <p className="text-4xl font-bold text-dark">{feedbacks.length > 0 ? avg.toFixed(1) : "—"}</p>
            <div className="mt-1">
              <StarRating value={Math.round(avg)} readOnly size={18} />
            </div>
            <p className="text-xs text-dark-5 mt-1">{feedbacks.length} review{feedbacks.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex-1 min-w-[180px]">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = feedbacks.filter((f) => f.rating === star).length;
              return <RatingBar key={star} star={star} count={count} total={feedbacks.length} />;
            })}
          </div>
        </div>
      </div>

      {/* Sort + Cards */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm font-medium text-dark">
          {sorted.length} review{sorted.length !== 1 ? "s" : ""}
          {["1","2","3","4","5"].includes(sort) && ` · ${sort}★ only`}
        </p>
        <div className="relative">
          <select value={sort} onChange={(e) => setSort(e.target.value as any)} className="rounded-md border border-gray-3 bg-white text-sm text-dark py-2 pl-4 pr-9 outline-none focus:ring-2 focus:ring-blue/20 appearance-none cursor-pointer">
            <option value="recent">Most Recent</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
            <option disabled>──────────</option>
            <option value="5">5 Stars only</option>
            <option value="4">4 Stars only</option>
            <option value="3">3 Stars only</option>
            <option value="2">2 Stars only</option>
            <option value="1">1 Star only</option>
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-dark-5"><ChevronDownIcon /></span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {sorted.length === 0 ? (
          <div className="bg-white rounded-xl shadow-1 py-14 flex flex-col items-center text-center">
            <p className="text-dark-5 text-sm">No reviews match this filter.</p>
            <button onClick={() => setSort("recent")} className="mt-3 text-sm text-blue font-medium hover:underline">Clear filter</button>
          </div>
        ) : sorted.map((fb) => (
          <div key={fb.id} className="bg-white rounded-xl shadow-1 p-5 sm:p-7.5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-medium text-sm text-white" style={{ background: fb.isAnonymous ? "#9CA3AF" : avatarColor(fb.avatar) }}>
                {fb.isAnonymous
                  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" /></svg>
                  : fb.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-dark">{fb.displayName}</p>
                    {fb.isAnonymous && (
                      <span className="inline-flex items-center gap-1 text-xs bg-gray-2 text-dark-5 px-2 py-0.5 rounded-full font-medium border border-gray-3">
                        <ShieldIcon /> Anonymous
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-dark-5">{relativeTime(fb.timestamp)}</span>
                </div>
                <StarRating value={fb.rating} readOnly size={14} />
                <p className="text-dark-5 text-sm mt-2 leading-relaxed">{fb.comment}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeedbackTab;