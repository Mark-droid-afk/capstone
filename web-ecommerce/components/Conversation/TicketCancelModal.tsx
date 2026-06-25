"use client";

import React from "react";

type TicketCancelModalProps = {
  isOpen: boolean;
  isCancelling: boolean;
  ticketTitle: string;
  onConfirm: () => void;
  onDismiss: () => void;
};

const TicketCancelModal = ({
  isOpen,
  isCancelling,
  ticketTitle,
  onConfirm,
  onDismiss,
}: TicketCancelModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-99999 flex items-center justify-center bg-dark/70 px-4">
      <div className="w-full max-w-[420px] bg-white rounded-xl shadow-3 p-6 sm:p-8">
        {/* Icon */}
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-light-6 mx-auto mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
              stroke="#EF4444"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h3 className="font-semibold text-dark text-lg text-center mb-1">
          Cancel this ticket?
        </h3>
        <p className="text-custom-sm text-dark-4 text-center mb-1">
          This action cannot be undone.
        </p>
        <p className="text-custom-sm text-dark text-center font-medium mb-6 truncate px-2">
          &ldquo;{ticketTitle}&rdquo;
        </p>

        <div className="flex gap-3">
          <button
            id="cancel-ticket-dismiss"
            onClick={onDismiss}
            disabled={isCancelling}
            className="flex-1 font-medium py-2.5 rounded-md border border-gray-3 text-dark-2 hover:border-dark hover:text-dark ease-out duration-200 disabled:opacity-60"
          >
            Keep Ticket
          </button>
          <button
            id="cancel-ticket-confirm"
            onClick={onConfirm}
            disabled={isCancelling}
            className="flex-1 inline-flex items-center justify-center gap-2 font-medium py-2.5 rounded-md bg-red text-white hover:bg-red/90 ease-out duration-200 disabled:opacity-60"
          >
            {isCancelling && (
              <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {isCancelling ? "Cancelling…" : "Yes, Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketCancelModal;
