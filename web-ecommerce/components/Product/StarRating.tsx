"use client";

import { useState } from "react";

interface StarRatingProps {
  value: number;
  max?: number;
  interactive?: boolean;
  size?: "sm" | "md" | "lg";
  onChange?: (rating: number) => void;
}

const SIZE_MAP = { sm: 14, md: 18, lg: 24 };

export default function StarRating({
  value,
  max = 5,
  interactive = false,
  size = "md",
  onChange,
}: StarRatingProps) {
  const [hovered, setHovered] = useState<number>(0);
  const px = SIZE_MAP[size];
  const active = interactive ? hovered || value : value;

  return (
    <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
      {Array.from({ length: max }, (_, i) => {
        const filled = i + 1 <= active;
        return (
          <svg
            key={i}
            width={px}
            height={px}
            viewBox="0 0 24 24"
            fill={filled ? "#FAAB00" : "none"}
            stroke={filled ? "#FAAB00" : "#D1D5DB"}
            strokeWidth={1.5}
            style={{ cursor: interactive ? "pointer" : "default", flexShrink: 0 }}
            onMouseEnter={() => interactive && setHovered(i + 1)}
            onMouseLeave={() => interactive && setHovered(0)}
            onClick={() => interactive && onChange?.(i + 1)}
          >
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
          </svg>
        );
      })}
    </div>
  );
}