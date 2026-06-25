import React, { useEffect, useState } from "react";
import apiPos from "@/lib/apiPos";
import { useAuth } from "@/context/AuthContext";

const statusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "approved":
      return "text-green bg-green-light-6";
    case "rejected":
      return "text-red bg-red-light-6";
    case "pending":
    default:
      return "text-yellow bg-yellow-light-4";
  }
};

const Refunds = () => {
  const { user } = useAuth();
  const [refunds, setRefunds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    apiPos
      .get(`/api-pos/customers/refunds`, {
        headers: { "X-Auth-Id": user.id },
      })
      .then((res) => setRefunds(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [user?.id]);

  if (loading) {
    return <p className="py-9.5 px-7.5 text-sm text-dark-5">Loading refunds…</p>;
  }

  if (refunds.length === 0) {
    return (
      <p className="py-9.5 px-7.5 text-sm text-dark-5">
        You have no refund requests yet.
      </p>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      {/* Desktop table */}
      <div className="min-w-[720px]">
        {/* Header */}
        <div className="items-center py-4.5 px-7.5 hidden md:grid grid-cols-[110px_160px_1fr_110px_120px_130px] gap-4">
          <p className="text-custom-sm text-dark">Order</p>
          <p className="text-custom-sm text-dark">Date</p>
          <p className="text-custom-sm text-dark">Item / Reason</p>
          <p className="text-custom-sm text-dark">Qty</p>
          <p className="text-custom-sm text-dark">Amount</p>
          <p className="text-custom-sm text-dark">Refund Status</p>
        </div>

        {/* Rows */}
        {refunds.map((r: any) => (
          <div
            key={r.refundRequestId}
            className="border-t border-gray-3 py-5 px-7.5 hidden md:grid grid-cols-[110px_160px_1fr_110px_120px_130px] gap-4 items-start"
          >
            {/* Order number */}
            <p className="text-custom-sm text-red font-medium">
              #{String(r.orderNumber || r.orderId).replace(/^#/, "")}
            </p>

            {/* Date */}
            <p className="text-custom-sm text-dark">
              {new Date(r.createdAt).toLocaleDateString("en-PH", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>

            {/* Item + reason */}
            <div>
              <p className="text-custom-sm text-dark font-medium">
                {r.productName} ({r.variationName})
              </p>
              <p className="text-custom-xs text-dark-5 mt-0.5 italic">{r.reason}</p>
            </div>

            {/* Qty */}
            <p className="text-custom-sm text-dark">×{r.quantityToReturn}</p>

            {/* Amount */}
            <p className="text-custom-sm text-dark">
              ₱{Number(r.totalAmount).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
            </p>

            {/* Status badge */}
            <span
              className={`inline-block text-custom-sm py-0.5 px-2.5 rounded-[30px] capitalize ${statusColor(
                r.status
              )}`}
            >
              {r.status}
            </span>
          </div>
        ))}
      </div>

      {/* Mobile cards */}
      {refunds.map((r: any) => (
        <div
          key={`mob-${r.refundRequestId}`}
          className="md:hidden border-t border-gray-3 py-5 px-4 space-y-2"
        >
          <div className="flex justify-between">
            <p className="text-custom-sm text-red font-medium">
              #{String(r.orderNumber || r.orderId).replace(/^#/, "")}
            </p>
            <span
              className={`inline-block text-custom-sm py-0.5 px-2.5 rounded-[30px] capitalize ${statusColor(
                r.status
              )}`}
            >
              {r.status}
            </span>
          </div>
          <p className="text-custom-sm text-dark font-medium">
            {r.productName} ({r.variationName}) ×{r.quantityToReturn}
          </p>
          <p className="text-custom-xs text-dark-5 italic">{r.reason}</p>
          <div className="flex justify-between text-custom-xs text-dark-5">
            <span>
              {new Date(r.createdAt).toLocaleDateString("en-PH", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
            <span>
              ₱{Number(r.totalAmount).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Refunds;
