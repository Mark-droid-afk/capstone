"use client";
import React, { useEffect, useState } from "react";
import apiPos from "@/lib/apiPos";

type WebhookLog = {
  paymentId: number;
  orderId: number;
  orderNumber: string | null;
  orderSource: string | null;
  amountPaid: number;
  paymentChannel: string;
  paymentStatus: string;
  gatewayReferenceNumber: string | null;
  paidAt: string | null;
};

const statusConfig: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  Success: { label: "Success", bg: "bg-green-100", text: "text-green-700" },
  Pending: { label: "Pending", bg: "bg-yellow-100", text: "text-yellow-700" },
  Failed: { label: "Failed", bg: "bg-red-100", text: "text-red-700" },
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(amount);

const formatDate = (iso: string | null) => {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
};

export default function WebhookLogs() {
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchLogs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiPos.get("/api-pos/webhooks/xendit/logs");
      setLogs(res.data);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load webhook logs."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filtered = logs.filter((log) => {
    const matchesSearch =
      searchTerm === "" ||
      log.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.gatewayReferenceNumber
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || log.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const summary = {
    total: logs.length,
    success: logs.filter((l) => l.paymentStatus === "Success").length,
    pending: logs.filter((l) => l.paymentStatus === "Pending").length,
    failed: logs.filter((l) => l.paymentStatus === "Failed").length,
    totalAmount: logs
      .filter((l) => l.paymentStatus === "Success")
      .reduce((sum, l) => sum + l.amountPaid, 0),
  };

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total Transactions</p>
          <p className="text-2xl font-bold text-dark">{summary.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Successful</p>
          <p className="text-2xl font-bold text-green-600">{summary.success}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{summary.pending}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total Collected</p>
          <p className="text-2xl font-bold text-blue-600">
            {formatCurrency(summary.totalAmount)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <input
              type="text"
              placeholder="Search by order number or gateway ref..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-200 rounded-lg px-4 py-2 text-sm flex-1 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
            >
              <option value="All">All Statuses</option>
              <option value="Success">Success</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
          <button
            onClick={fetchLogs}
            className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <p className="text-red-600 font-medium mb-2">Failed to load data</p>
            <p className="text-gray-500 text-sm">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">No webhook logs found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">
                    #
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">
                    Order Number
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">
                    Source
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">
                    Channel
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">
                    Amount
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">
                    Gateway Ref
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">
                    Paid At
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((log, idx) => {
                  const statusStyle =
                    statusConfig[log.paymentStatus] ?? statusConfig.Pending;
                  return (
                    <tr
                      key={log.paymentId}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-gray-400">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-3 font-medium text-dark">
                        {log.orderNumber ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            log.orderSource === "Ecommerce"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {log.orderSource ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {log.paymentChannel}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-dark">
                        {formatCurrency(log.amountPaid)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}
                        >
                          {statusStyle.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 max-w-[180px] truncate text-xs font-mono">
                        {log.gatewayReferenceNumber ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {formatDate(log.paidAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
