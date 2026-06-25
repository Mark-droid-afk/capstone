"use client";

import { Ticket } from "@/types/ticket";
import { format } from "date-fns";

const priorityStyle: Record<string, string> = {
  low: "bg-gray-100 text-gray-600",
  medium: "bg-warning-50 text-warning-700",
  high: "bg-orange-50 text-orange-700",
  urgent: "bg-error-50 text-error-700",
};

const statusStyle: Record<string, string> = {
  available: "bg-brand-50 text-brand-600",
  claimed: "bg-warning-50 text-warning-700",
  resolved: "bg-success-50 text-success-700",
  cancelled: "bg-error-50 text-error-600",
};

const categoryLabel: Record<string, string> = {
  concern: "Concern",
  inquiry: "Inquiry",
  request: "Request",
  other: "Other",
};

interface TicketDetailModalProps {
  ticket: Ticket | null;
  onClose: () => void;
  onClaim?: (id: string) => void;
  onUnclaim?: (id: string) => void;
  onResolve?: (id: string) => void;
  onMessage?: (conversationId: string) => void;
  loading?: boolean;
}

export default function TicketDetailModal({
  ticket,
  onClose,
  onClaim,
  onUnclaim,
  onResolve,
  onMessage,
  loading = false,
}: TicketDetailModalProps) {
  if (!ticket) return null;

  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-theme-xl w-full max-w-lg mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle[ticket.status] ?? statusStyle.available}`}
            >
              {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityStyle[ticket.priority] ?? priorityStyle.low}`}
            >
              {ticket.priority.charAt(0).toUpperCase() +
                ticket.priority.slice(1)}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <i className="ti ti-x text-xl" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto custom-scrollbar flex-1">
          <div className="px-6 py-5 space-y-5">
            {/* Title & category */}
            <div>
              <p className="text-theme-xs text-gray-400 uppercase tracking-wide mb-1">
                {categoryLabel[ticket.category] ?? "Other"} · #
                {ticket.id.slice(0, 8)}
              </p>
              <h2 className="text-lg font-semibold text-gray-900">
                {ticket.title}
              </h2>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-theme-xs p-4">
              <h3 className="text-theme-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Description
              </h3>
              <p className="text-theme-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {ticket.description}
              </p>
            </div>

            {/* Attachment */}
            {ticket.imageUrl && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-theme-xs p-4">
                <h3 className="text-theme-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Attachment
                </h3>
                <div className="rounded-lg overflow-hidden border border-gray-100">
                  <img
                    src={ticket.imageUrl}
                    alt="Attachment"
                    className="w-full object-contain max-h-60"
                  />
                </div>
              </div>
            )}

            {/* Customer info */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-theme-xs p-4">
              <h3 className="text-theme-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Customer
              </h3>
              <div className="flex items-center gap-3 mb-3">
                {ticket.customer.profileImage ? (
                  <img
                    src={ticket.customer.profileImage}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-500 text-sm font-semibold">
                    {ticket.customer.firstName[0]}
                    {ticket.customer.lastName[0]}
                  </div>
                )}
                <div>
                  <p className="text-theme-sm font-semibold text-gray-900">
                    {ticket.customer.firstName} {ticket.customer.lastName}
                  </p>
                  <p className="text-theme-xs text-gray-500">
                    {ticket.customer.email}
                  </p>
                </div>
              </div>
              {ticket.customer.phone && (
                <p className="text-theme-xs text-gray-500 flex items-center gap-1.5">
                  <i className="ti ti-phone text-gray-400" />
                  {ticket.customer.phone}
                </p>
              )}
            </div>

            {/* Assigned agent */}
            {ticket.agent && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-theme-xs p-4">
                <h3 className="text-theme-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Assigned Agent
                </h3>
                <p className="text-theme-sm text-gray-700 flex items-center gap-1.5 mb-1">
                  <i className="ti ti-user text-gray-400" />
                  {ticket.agent.firstName} {ticket.agent.lastName}
                </p>
                <p className="text-theme-xs text-gray-500 flex items-center gap-1.5">
                  <i className="ti ti-mail text-gray-400" />
                  {ticket.agent.email}
                </p>
              </div>
            )}

            {/* Timeline */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-theme-xs p-4">
              <h3 className="text-theme-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Timeline
              </h3>
              <div className="space-y-2">
                <p className="text-theme-xs text-gray-500 flex items-center gap-1.5">
                  <i className="ti ti-calendar text-gray-400" />
                  Created:{" "}
                  {format(new Date(ticket.createdAt), "MMM d, yyyy · h:mm a")}
                </p>
                <p className="text-theme-xs text-gray-500 flex items-center gap-1.5">
                  <i className="ti ti-clock text-gray-400" />
                  Updated:{" "}
                  {format(new Date(ticket.updatedAt), "MMM d, yyyy · h:mm a")}
                </p>
                {ticket.resolvedAt && (
                  <p className="text-theme-xs text-success-600 flex items-center gap-1.5">
                    <i className="ti ti-circle-check" />
                    Resolved:{" "}
                    {format(
                      new Date(ticket.resolvedAt),
                      "MMM d, yyyy · h:mm a",
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-2">
          {onClaim && ticket.status === "available" && (
            <button
              onClick={() => onClaim(ticket.id)}
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 text-theme-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 disabled:opacity-50 transition-colors"
            >
              <i className="ti ti-hand-stop text-base" />
              Claim Ticket
            </button>
          )}
          {onUnclaim && ticket.status === "claimed" && (
            <button
              onClick={() => onUnclaim(ticket.id)}
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 text-theme-sm font-medium border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              <i className="ti ti-hand-off text-base" />
              Unclaim
            </button>
          )}
          {onResolve && ticket.status === "claimed" && (
            <button
              onClick={() => onResolve(ticket.id)}
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 text-theme-sm font-medium text-white bg-success-500 rounded-lg hover:bg-success-600 disabled:opacity-50 transition-colors"
            >
              <i className="ti ti-circle-check text-base" />
              Mark Resolved
            </button>
          )}
          {ticket.conversationId && onMessage && (
            <button
              onClick={() => onMessage(ticket.conversationId!)}
              className="flex items-center gap-1.5 px-4 py-2 text-theme-sm font-medium border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <i className="ti ti-message text-base" />
              Message
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
