"use client";

import React from "react";
import { Ticket } from "@/types/ticket";

type TicketCardProps = {
  ticket: Ticket;
  onView: (ticket: Ticket) => void;
  onCancel: (ticket: Ticket) => void;
  onMessage: (ticket: Ticket) => void;
};

const STATUS_STYLES: Record<string, string> = {
  Pending: "text-yellow bg-yellow-light-4",
  Ongoing: "text-blue bg-blue-light-5",
  Completed: "text-green bg-green-light-6",
  Cancelled: "text-dark-4 bg-gray-2",
};

const TYPE_STYLES: Record<string, string> = {
  Concern: "text-red bg-red-light-6",
  Inquiry: "text-purple bg-purple-light",
  Request: "text-blue bg-blue-light-5",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const TicketCard = ({ ticket, onView, onCancel, onMessage }: TicketCardProps) => {
  const isOngoing = ticket.status === "Ongoing";
  const isPending = ticket.status === "Pending";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-gray-3 py-5 px-4 sm:px-7.5 hover:bg-gray-1 transition-colors duration-150">
      {/* Left section — info */}
      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        {/* Type + Status badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`text-xs font-medium py-0.5 px-2.5 rounded-[30px] ${
              TYPE_STYLES[ticket.type] ?? "text-dark-4 bg-gray-2"
            }`}
          >
            {ticket.type}
          </span>
          <span
            className={`text-xs font-medium py-0.5 px-2.5 rounded-[30px] ${
              STATUS_STYLES[ticket.status] ?? "text-dark-4 bg-gray-2"
            }`}
          >
            {ticket.status}
          </span>
        </div>

        {/* Title */}
        <p className="font-medium text-dark text-sm leading-snug truncate pr-4">
          {ticket.title}
        </p>

        {/* Date + agent */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5">
          <p className="text-custom-xs text-dark-4">
            Submitted {formatDate(ticket.createdAt)}
          </p>
          {ticket.claimedByName && (
            <p className="text-custom-xs text-dark-4">
              Handled by{" "}
              <span className="text-blue font-medium">{ticket.claimedByName}</span>
            </p>
          )}
        </div>
      </div>

      {/* Right section — actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Message button — active only when Ongoing */}
        <button
          id={`ticket-message-${ticket.id}`}
          onClick={() => onMessage(ticket)}
          disabled={!isOngoing}
          title={isOngoing ? "Open chat" : "Available once a support agent claims your ticket"}
          className={`flex items-center gap-1.5 text-custom-xs font-medium py-2 px-3.5 rounded-md border ease-out duration-200 ${
            isOngoing
              ? "border-blue text-blue hover:bg-blue hover:text-white"
              : "border-gray-3 text-dark-5 cursor-not-allowed"
          }`}
        >
          <svg
            className="fill-current"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2C6.477 2 2 6.253 2 11.5c0 2.304.878 4.41 2.32 6.03L3.05 21.07a.75.75 0 0 0 .984.963l4.124-1.65A10.135 10.135 0 0 0 12 21c5.523 0 10-4.253 10-9.5S17.523 2 12 2Zm-4 9.25a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm3 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm3 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z"
              fill=""
            />
          </svg>
          Message
        </button>

        {/* View button */}
        <button
          id={`ticket-view-${ticket.id}`}
          onClick={() => onView(ticket)}
          className="flex items-center gap-1.5 text-custom-xs font-medium py-2 px-3.5 rounded-md border border-gray-3 text-dark-2 hover:border-blue hover:text-blue ease-out duration-200"
        >
          <svg
            className="fill-current"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5C21.27 7.61 17 4.5 12 4.5ZM12 17a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"
              fill=""
            />
          </svg>
          View
        </button>

        {/* Cancel button — only for Pending */}
        {isPending && (
          <button
            id={`ticket-cancel-${ticket.id}`}
            onClick={() => onCancel(ticket)}
            className="flex items-center gap-1.5 text-custom-xs font-medium py-2 px-3.5 rounded-md border border-red/40 text-red hover:bg-red hover:text-white ease-out duration-200"
          >
            <svg
              className="fill-current"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18.364 5.636a9 9 0 1 1-12.728 12.728A9 9 0 0 1 18.364 5.636ZM9.172 9.172a1 1 0 0 0 0 1.414L10.586 12l-1.414 1.414a1 1 0 0 0 1.414 1.414L12 13.414l1.414 1.414a1 1 0 0 0 1.414-1.414L13.414 12l1.414-1.414a1 1 0 0 0-1.414-1.414L12 10.586l-1.414-1.414a1 1 0 0 0-1.414 0Z"
                fill=""
              />
            </svg>
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default TicketCard;
