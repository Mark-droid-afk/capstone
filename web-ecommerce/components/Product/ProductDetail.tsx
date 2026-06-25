"use client";
import { Product } from "./types";
import StarRating from "./StarRating";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { updateQuickView } from "@/redux/features/quickView-slice";
import { useModalContext } from "@/context/QuickViewModalContext";

interface ProductDetailProps {
  product: Product;
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const { name, price, originalPrice, image, category, description, feedbacks } = product;
  const avgRating = feedbacks.length > 0
    ? feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length
    : 0;

  const dispatch = useDispatch<AppDispatch>();
  const { openModal } = useModalContext();

  const handleQuickView = () => {
    dispatch(updateQuickView({
      id: product.id ?? 0,
      title: name,
      price: originalPrice,
      discountedPrice: price,
      reviews: feedbacks.length,
      imgs: {
        thumbnails: [image],
        previews: [image],
      },
    }));
    openModal();
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 40,
        alignItems: "start",
      }}
      className="product-detail-grid"
    >
      <div
        style={{
          background: "#F7F8FC",
          borderRadius: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 40,
          minHeight: 320,
        }}
      >
        <img
          src={image}
          alt={name}
          style={{ maxWidth: "100%", maxHeight: 280, objectFit: "contain" }}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://placehold.co/280x280/F7F8FC/8B8FA8?text=Product";
          }}
        />
      </div>

      <div>
        <p style={{ margin: "0 0 6px", fontSize: 13, color: "#3B4CCA", fontWeight: 500 }}>
          {category}
        </p>

        {/* Clickable product name */}
        <h1
          onClick={handleQuickView}
          style={{
            margin: "0 0 12px",
            fontSize: 26,
            fontWeight: 700,
            color: "#1A1D23",
            lineHeight: 1.3,
            cursor: "pointer",
          }}
          title="Quick view"
        >
          {name}
        </h1>

        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <StarRating value={Math.round(avgRating)} size="sm" />
          <span style={{ fontSize: 13, color: "#8B8FA8" }}>
            ({feedbacks.length} {feedbacks.length === 1 ? "review" : "reviews"})
          </span>

          {/* Quick View button */}
          <button
            onClick={handleQuickView}
            style={{
              marginLeft: 8,
              fontSize: 12,
              color: "#3B4CCA",
              background: "none",
              border: "1px solid #3B4CCA",
              borderRadius: 6,
              padding: "2px 10px",
              cursor: "pointer",
              fontFamily: "inherit",
              fontWeight: 500,
            }}
          >
            Quick View
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 16 }}>
          <span style={{ fontSize: 28, fontWeight: 700, color: "#DB4444" }}>${price}</span>
          <span style={{ fontSize: 16, color: "#8B8FA8", textDecoration: "line-through" }}>
            ${originalPrice}
          </span>
        </div>

        <p style={{ margin: "0 0 24px", fontSize: 14, color: "#4B5163", lineHeight: 1.7 }}>
          {description}
        </p>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            style={{
              background: "#3B4CCA",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "12px 28px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Add to Cart
          </button>
          <button
            style={{
              background: "#fff",
              color: "#1A1D23",
              border: "1px solid #E5E7EB",
              borderRadius: 8,
              padding: "12px 20px",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Add to Wishlist
          </button>
        </div>
      </div>
    </div>
  );
}