import { Feedback } from "./types";
import FeedbackCard from "./FeedbackCard";

interface FeedbackListProps {
  feedbacks: Feedback[];
}

export default function FeedbackList({ feedbacks }: FeedbackListProps) {
  if (feedbacks.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "40px 0",
          color: "#8B8FA8",
          fontSize: 14,
        }}
      >
        No reviews yet. Be the first to leave one.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {feedbacks.map((fb) => (
        <FeedbackCard key={fb.id} feedback={fb} />
      ))}
    </div>
  );
}