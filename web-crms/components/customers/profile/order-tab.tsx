"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Order } from "@/types/customer";
import { customersApi } from "@/lib/api/customer";

const statusStyle: Record<string, string> = {
  pending: "bg-warning-50 text-warning-700",
  processing: "bg-blue-light-50 text-blue-light-600",
  completed: "bg-success-50 text-success-700",
  cancelled: "bg-error-50 text-error-700",
};

interface Props {
  customerId: string;
}

export default function OrderTab({ customerId }: Props) {
  const [items, setItems] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Order | null>(null);

  const PAGE_SIZE = 10;

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await customersApi.getOrderHistory(customerId, {
        page,
        pageSize: PAGE_SIZE,
      });
      setItems(res.data.data);
      setTotal(res.data.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, [page]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-theme-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[650px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Order #", "Status", "Items", "Total", "Date"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-theme-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-gray-400 text-theme-sm whitespace-nowrap"
                  >
                    <i className="ti ti-loader-2 animate-spin mr-2" />
                    Loading...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-gray-400 text-theme-sm whitespace-nowrap"
                  >
                    No order history found.
                  </td>
                </tr>
              ) : (
                items.map((o) => (
                  <tr
                    key={o.id}
                    onClick={() => setSelected(o)}
                    className="hover:bg-brand-25 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-brand-500 hover:underline whitespace-nowrap">
                      #{o.orderNumber}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusStyle[o.status] ?? "bg-gray-100 text-gray-600"}`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-theme-sm whitespace-nowrap">
                      {o.items.length} item{o.items.length !== 1 ? "s" : ""}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">
                      ₱{o.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-theme-sm whitespace-nowrap">
                      {format(new Date(o.createdAt), "MMM d, yyyy")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-theme-sm text-gray-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 text-theme-sm font-medium border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <i className="ti ti-chevron-left" /> Previous
            </button>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 text-theme-sm font-medium border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next <i className="ti ti-chevron-right" />
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-999 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSelected(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-theme-xl w-full max-w-md mx-4 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">
                Order #{selected.orderNumber}
              </h3>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="ti ti-x text-xl" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-theme-xs text-gray-400 uppercase tracking-wide mb-1">
                  Status
                </p>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusStyle[selected.status] ?? "bg-gray-100 text-gray-600"}`}
                >
                  {selected.status}
                </span>
              </div>
              <div>
                <p className="text-theme-xs text-gray-400 uppercase tracking-wide mb-1">
                  Date
                </p>
                <p className="text-theme-sm text-gray-700">
                  {format(new Date(selected.createdAt), "MMM d, yyyy h:mm a")}
                </p>
              </div>
            </div>

            <div>
              <p className="text-theme-xs text-gray-400 uppercase tracking-wide mb-2">
                Items
              </p>
              <div className="space-y-2">
                {selected.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <div>
                      <p className="text-theme-sm font-medium text-gray-800">
                        {item.productName}
                      </p>
                      <p className="text-theme-xs text-gray-400">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="text-theme-sm font-semibold text-gray-900">
                      ₱{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <p className="text-theme-sm font-semibold text-gray-900">Total</p>
              <p className="text-base font-bold text-gray-900">
                ₱{selected.totalAmount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
