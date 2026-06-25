import { Feedback } from "./types";
import StarRating from "./StarRating";

interface RatingSummaryProps {
  feedbacks: Feedback[];
}

export default function RatingSummary({ feedbacks }: RatingSummaryProps) {
  if (feedbacks.length === 0) return null;

  const avg = feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length;
  const counts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: feedbacks.filter((f) => f.rating === star).length,
  }));

  return (
    <div
      style={{
        display: "flex",
        gap: 32,
        alignItems: "flex-start",
        padding: "20px 0",
        borderBottom: "1px solid #F1F0EF",
        flexWrap: "wrap",
      }}
    >
      <div style={{ textAlign: "center", minWidth: 80 }}>
        <p style={{ fontSize: 40, fontWeight: 700, color: "#1A1D23", margin: 0, lineHeight: 1 }}>
          {avg.toFixed(1)}
        </p>
        <div style={{ marginTop: 6, display: "flex", justifyContent: "center" }}>
          <StarRating value={Math.round(avg)} size="sm" />
        </div>
        <p style={{ fontSize: 12, color: "#8B8FA8", margin: "4px 0 0" }}>
          {feedbacks.length} {feedbacks.length === 1 ? "review" : "reviews"}
        </p>
      </div>

      <div style={{ flex: 1, minWidth: 160 }}>
        {counts.map(({ star, count }) => {
          const pct = feedbacks.length > 0 ? Math.round((count / feedbacks.length) * 100) : 0;
          return (
            <div
              key={star}
              style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}
            >
              <span style={{ fontSize: 12, color: "#8B8FA8", width: 8 }}>{star}</span>
              <svg
                width={12}
                height={12}
                viewBox="0 0 24 24"
                fill="#FAAB00"
                stroke="#FAAB00"
                strokeWidth={1.5}
              >
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
              </svg>
              <div
                style={{
                  flex: 1,
                  height: 6,
                  background: "#F1F0EF",
                  borderRadius: 4,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${pct}%`,
                    height: "100%",
                    background: "#FAAB00",
                    borderRadius: 4,
                    transition: "width 0.4s ease",
                  }}
                />
              </div>
              <span style={{ fontSize: 12, color: "#8B8FA8", width: 20, textAlign: "right" }}>
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}