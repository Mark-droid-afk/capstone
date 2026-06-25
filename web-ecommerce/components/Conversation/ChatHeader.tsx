"use client";

import React from "react";
import { useRouter } from "next/navigation";

type ChatHeaderProps = {
  ticketTitle: string;
  ticketType: string;
  ticketStatus: string;
  assignedFirstName?: string;
  assignedLastName?: string;
  onCancelTicket?: () => void;
};

const STATUS_STYLES: Record<string, string> = {
  pending: "text-yellow bg-yellow-light-4",
  ongoing: "text-blue bg-blue-light-5",
  resolved: "text-green bg-green-light-6",
  cancelled: "text-dark-4 bg-gray-2",
};

const TYPE_STYLES: Record<string, string> = {
  concern: "text-red bg-red-light-6",
  inquiry: "text-purple bg-purple-light",
  request: "text-blue bg-blue-light-5",
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const ChatHeader = ({
  ticketTitle,
  ticketType,
  ticketStatus,
  assignedFirstName,
  assignedLastName,
  onCancelTicket,
}: ChatHeaderProps) => {
  const router = useRouter();
  const isPending = ticketStatus === "pending";
  const isActive = ticketStatus === "ongoing" || ticketStatus === "pending";

  return (
    <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-gray-3 bg-white shrink-0">
      {/* Back button */}
      <button
        id="chat-back"
        onClick={() => router.back()}
        className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-2 ease-out duration-200 text-dark-4 hover:text-dark shrink-0"
        title="Back to concerns"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M15 18l-6-6 6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
          <span
            className={`text-xs font-medium py-0.5 px-2 rounded-full ${
              TYPE_STYLES[ticketType] ?? "text-dark-4 bg-gray-2"
            }`}
          >
            {capitalize(ticketType)}
          </span>
          <span
            className={`text-xs font-medium py-0.5 px-2 rounded-full ${
              STATUS_STYLES[ticketStatus] ?? "text-dark-4 bg-gray-2"
            }`}
          >
            {capitalize(ticketStatus)}
          </span>
        </div>

        <p className="font-semibold text-dark text-sm leading-snug truncate">
          {ticketTitle}
        </p>

        {assignedFirstName ? (
          <p className="text-custom-xs text-dark-4 mt-0.5">
            Handled by{" "}
            <span className="text-blue font-medium">
              {assignedFirstName} {assignedLastName ?? ""}
            </span>
          </p>
        ) : (
          <p className="text-custom-xs text-dark-4 mt-0.5">
            Waiting to be assigned to a support agent…
          </p>
        )}
      </div>

      {/* Cancel ticket — only for pending tickets */}
      {isPending && onCancelTicket && (
        <button
          id="chat-cancel-ticket"
          onClick={onCancelTicket}
          className="shrink-0 flex items-center gap-1.5 text-custom-xs font-medium py-2 px-3 rounded-md border border-red/40 text-red hover:bg-red hover:text-white ease-out duration-200"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path
              d="M18.364 5.636a9 9 0 1 1-12.728 12.728A9 9 0 0 1 18.364 5.636ZM9.172 9.172a1 1 0 0 0 0 1.414L10.586 12l-1.414 1.414a1 1 0 0 0 1.414 1.414L12 13.414l1.414 1.414a1 1 0 0 0 1.414-1.414L13.414 12l1.414-1.414a1 1 0 0 0-1.414-1.414L12 10.586l-1.414-1.414a1 1 0 0 0-1.414 0Z"
              fill="currentColor"
            />
          </svg>
          Cancel Ticket
        </button>
      )}

      {/* Closed label for non-active tickets */}
      {!isActive && (
        <span className="shrink-0 text-custom-xs text-dark-4 italic">
          {ticketStatus === "resolved" ? "Resolved" : "Closed"}
        </span>
      )}
    </div>
  );
};

export default ChatHeader;
