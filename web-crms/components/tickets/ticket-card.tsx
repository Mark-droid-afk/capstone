"use client";

import { Ticket } from "@/types/ticket";
import { format } from "date-fns";

const priorityStyle: Record<string, string> = {
  low:    "bg-gray-100 text-gray-600",
  medium: "bg-warning-50 text-warning-700",
  high:   "bg-orange-50 text-orange-700",
  urgent: "bg-error-50 text-error-700",
};

const categoryLabel: Record<string, string> = {
  concern: "Concern",
  inquiry: "Inquiry",
  request: "Request",
  other:   "Other",
};

const categoryIcon: Record<string, string> = {
  concern: "ti-alert-circle",
  inquiry: "ti-help-circle",
  request: "ti-file-text",
  other:   "ti-dots-circle-horizontal",
};

interface TicketCardProps {
  ticket: Ticket;
  onClaim?:   (id: string) => void;
  onUnclaim?: (id: string) => void;
  onResolve?: (id: string) => void;
  onClick:    (ticket: Ticket) => void;
  onMessage?: (conversationId: string) => void;
  loading?: boolean;
}

export default function TicketCard({
  ticket,
  onClaim,
  onUnclaim,
  onResolve,
  onClick,
  onMessage,
  loading = false,
}: TicketCardProps) {
  const stop = (fn: () => void) => (e: React.MouseEvent) => { e.stopPropagation(); fn(); };

  return (
    <div
      onClick={() => onClick(ticket)}
      className="bg-white rounded-2xl border border-gray-200 shadow-theme-xs hover:shadow-theme-md hover:border-gray-300 transition-all duration-150 cursor-pointer"
    >
      <div className="p-5 space-y-3">
        {/* Category + Priority */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-gray-400">
            <i className={`ti ${categoryIcon[ticket.category] ?? "ti-ticket"} text-sm`} />
            <span className="text-theme-xs">{categoryLabel[ticket.category] ?? "Other"}</span>
          </div>
          {/* <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityStyle[ticket.priority!] ?? priorityStyle.low}`}>
            {ticket.priority!.charAt(0).toUpperCase() + ticket.priority!.slice(1)}
          </span> */}
        </div>

        {/* Title */}
        <h3 className="text-theme-sm font-semibold text-gray-900 line-clamp-2 leading-snug">
          {ticket.title}
        </h3>

        {/* Description */}
        <p className="text-theme-xs text-gray-500 line-clamp-2">
          {ticket.description}
        </p>

        {/* Attachment thumbnail */}
        {ticket.imageUrl && (
          <div className="rounded-lg overflow-hidden border border-gray-100">
            <img src={ticket.imageUrl} alt="Attachment" className="w-full max-h-36 object-cover" />
          </div>
        )}

        {/* Meta */}
        <div className="flex flex-wrap gap-3 text-theme-xs text-gray-400 pt-1 border-t border-gray-100">
          <span className="flex items-center gap-1">
            <i className="ti ti-user text-xs" />
            {ticket.customer.firstName} {ticket.customer.lastName}
          </span>
          <span className="flex items-center gap-1">
            <i className="ti ti-calendar text-xs" />
            {format(new Date(ticket.createdAt), "MMM d, yyyy")}
          </span>
          {ticket.agent && (
            <span className="flex items-center gap-1 text-brand-500">
              <i className="ti ti-user-check text-xs" />
              {ticket.agent.firstName} {ticket.agent.lastName}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2">
            {onClaim && (
              <button
                onClick={stop(() => onClaim(ticket.id))}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-theme-xs font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 disabled:opacity-50 transition-colors"
              >
                <i className="ti ti-hand-stop text-sm" /> Claim
              </button>
            )}
            {onUnclaim && (
              <button
                onClick={stop(() => onUnclaim(ticket.id))}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-theme-xs font-medium border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <i className="ti ti-hand-off text-sm" /> Unclaim
              </button>
            )}
            {onResolve && (
              <button
                onClick={stop(() => onResolve(ticket.id))}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-theme-xs font-medium text-white bg-success-500 rounded-lg hover:bg-success-600 disabled:opacity-50 transition-colors"
              >
                <i className="ti ti-circle-check text-sm" /> Resolve
              </button>
            )}
          </div>

          {ticket.conversationId && onMessage && (
            <button
              onClick={stop(() => onMessage(ticket.conversationId!))}
              className="flex items-center gap-1.5 px-3 py-1.5 text-theme-xs font-medium border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <i className="ti ti-message text-sm" /> Message
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
