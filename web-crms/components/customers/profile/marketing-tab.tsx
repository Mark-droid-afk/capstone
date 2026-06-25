"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { MarketingHistory } from "@/types/customer";
import { customersApi } from "@/lib/api/customer";

const channelIcon: Record<string, string> = {
  email: "ti-mail",
  sms: "ti-message",
  social_media: "ti-brand-instagram",
  push_notification: "ti-bell",
};

const interactionStyle: Record<string, string> = {
  sent: "bg-gray-100 text-gray-600",
  opened: "bg-blue-light-50 text-blue-light-600",
  clicked: "bg-warning-50 text-warning-700",
  converted: "bg-success-50 text-success-700",
};

interface Props {
  customerId: string;
}

export default function MarketingTab({ customerId }: Props) {
  const [items, setItems] = useState<MarketingHistory[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<MarketingHistory | null>(null);

  const PAGE_SIZE = 10;

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await customersApi.getMarketingHistory(customerId, {
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
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Title", "Channel", "Interaction", "Sent At"].map((h) => (
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
                    colSpan={4}
                    className="px-4 py-10 text-center text-gray-400 text-theme-sm whitespace-nowrap"
                  >
                    <i className="ti ti-loader-2 animate-spin mr-2" />
                    Loading...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-10 text-center text-gray-400 text-theme-sm whitespace-nowrap"
                  >
                    No marketing history found.
                  </td>
                </tr>
              ) : (
                items.map((m) => (
                  <tr
                    key={m.id}
                    onClick={() => setSelected(m)}
                    className="hover:bg-brand-25 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-brand-500 hover:underline whitespace-nowrap max-w-[250px] truncate">
                      {m.title}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-gray-600">
                        <i className={`ti ${channelIcon[m.channel]} text-base`} />
                        <span className="capitalize text-theme-sm">
                          {m.channel.replace("_", " ")}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${interactionStyle[m.interactionType]}`}
                      >
                        {m.interactionType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-theme-sm whitespace-nowrap">
                      {format(new Date(m.sentAt), "MMM d, yyyy")}
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
                {selected.title}
              </h3>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="ti ti-x text-xl" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-theme-xs text-gray-400 uppercase tracking-wide mb-1">
                  Description
                </p>
                <p className="text-theme-sm text-gray-700">
                  {selected.description}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-theme-xs text-gray-400 uppercase tracking-wide mb-1">
                    Channel
                  </p>
                  <div className="flex items-center gap-1.5 text-theme-sm text-gray-700">
                    <i className={`ti ${channelIcon[selected.channel]}`} />
                    <span className="capitalize">
                      {selected.channel.replace("_", " ")}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-theme-xs text-gray-400 uppercase tracking-wide mb-1">
                    Interaction
                  </p>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${interactionStyle[selected.interactionType]}`}
                  >
                    {selected.interactionType}
                  </span>
                </div>
                <div>
                  <p className="text-theme-xs text-gray-400 uppercase tracking-wide mb-1">
                    Sent At
                  </p>
                  <p className="text-theme-sm text-gray-700">
                    {format(new Date(selected.sentAt), "MMM d, yyyy h:mm a")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
