import { Feedback } from "./types";
import StarRating from "./StarRating";

interface FeedbackCardProps {
  feedback: Feedback;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function FeedbackCard({ feedback }: FeedbackCardProps) {
  const { author, rating, comment, date } = feedback;
  const initials = getInitials(author);

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #F1F0EF",
        borderRadius: 12,
        padding: "16px 20px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: "#EEF0FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 600,
              fontSize: 13,
              color: "#3B4CCA",
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: "#1A1D23" }}>{author}</p>
            <p style={{ margin: 0, fontSize: 12, color: "#8B8FA8" }}>{formatDate(date)}</p>
          </div>
        </div>
        <StarRating value={rating} size="sm" />
      </div>
      <p style={{ margin: 0, fontSize: 14, color: "#4B5163", lineHeight: 1.6 }}>{comment}</p>
    </div>
  );
}