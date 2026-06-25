"use client";

import React from "react";
import Image from "next/image";
import { Ticket } from "@/types/ticket";
import ModalBackdrop from "./ModalBackdrop";

type TicketDetailModalProps = {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
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

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const TicketDetailModal = ({
  ticket,
  isOpen,
  onClose,
  onCancel,
  onMessage,
}: TicketDetailModalProps) => {
  if (!ticket) return null;

  const isOngoing = ticket.status === "Ongoing";
  const isPending = ticket.status === "Pending";

  return (
    <ModalBackdrop isOpen={isOpen} onClose={onClose} maxWidth="max-w-[640px]">
      <div className="p-6 sm:p-8">
        {/* Header */}
        <div className="mb-6 pr-8">
          <div className="flex flex-wrap items-center gap-2 mb-2">
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
          <h2 className="font-semibold text-dark text-xl leading-snug">
            {ticket.title}
          </h2>
          <p className="text-custom-xs text-dark-4 mt-1">
            Ticket ID:{" "}
            <span className="font-mono text-blue">#{ticket.id.slice(-8).toUpperCase()}</span>
          </p>
        </div>

        {/* Meta info */}
        <div className="grid grid-cols-2 gap-3 mb-5 bg-gray-1 rounded-lg p-4">
          <div>
            <p className="text-custom-xs text-dark-4 mb-0.5">Submitted</p>
            <p className="text-custom-sm text-dark font-medium">
              {formatDateTime(ticket.createdAt)}
            </p>
          </div>
          <div>
            <p className="text-custom-xs text-dark-4 mb-0.5">Last updated</p>
            <p className="text-custom-sm text-dark font-medium">
              {formatDateTime(ticket.updatedAt)}
            </p>
          </div>
          {ticket.claimedByName && (
            <div className="col-span-2">
              <p className="text-custom-xs text-dark-4 mb-0.5">Assigned to</p>
              <p className="text-custom-sm text-blue font-medium">
                {ticket.claimedByName}
              </p>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="mb-5">
          <p className="text-custom-xs text-dark-4 mb-1.5 font-medium uppercase tracking-wide">
            Description
          </p>
          <p className="text-custom-sm text-dark leading-relaxed whitespace-pre-wrap">
            {ticket.description}
          </p>
        </div>

        {/* Attached image */}
        {ticket.imageUrl && (
          <div className="mb-5">
            <p className="text-custom-xs text-dark-4 mb-1.5 font-medium uppercase tracking-wide">
              Attachment
            </p>
            <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-3">
              <Image
                src={ticket.imageUrl}
                alt="Ticket attachment"
                fill
                className="object-cover"
              />
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-gray-3 my-5" />

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          {/* Message — active only when Ongoing */}
          <button
            id={`detail-message-${ticket.id}`}
            onClick={() => {
              onClose();
              onMessage(ticket);
            }}
            disabled={!isOngoing}
            title={
              isOngoing
                ? "Open chat with support agent"
                : "Chat becomes available once a support agent claims your ticket"
            }
            className={`flex items-center gap-2 font-medium py-2.5 px-5 rounded-md ease-out duration-200 ${
              isOngoing
                ? "bg-blue text-white hover:bg-blue-dark"
                : "bg-gray-2 text-dark-5 cursor-not-allowed"
            }`}
          >
            <svg
              className="fill-current"
              width="16"
              height="16"
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
            {isOngoing ? "Open Chat" : "Chat Unavailable"}
          </button>

          {/* Cancel — only for Pending */}
          {isPending && (
            <button
              id={`detail-cancel-${ticket.id}`}
              onClick={() => {
                onClose();
                onCancel(ticket);
              }}
              className="flex items-center gap-2 font-medium py-2.5 px-5 rounded-md border border-red/50 text-red hover:bg-red hover:text-white ease-out duration-200"
            >
              <svg
                className="fill-current"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18.364 5.636a9 9 0 1 1-12.728 12.728A9 9 0 0 1 18.364 5.636ZM9.172 9.172a1 1 0 0 0 0 1.414L10.586 12l-1.414 1.414a1 1 0 0 0 1.414 1.414L12 13.414l1.414 1.414a1 1 0 0 0 1.414-1.414L13.414 12l1.414-1.414a1 1 0 0 0-1.414-1.414L12 10.586l-1.414-1.414a1 1 0 0 0-1.414 0Z"
                  fill=""
                />
              </svg>
              Cancel Ticket
            </button>
          )}

          <button
            onClick={onClose}
            className="flex items-center gap-2 font-medium py-2.5 px-5 rounded-md border border-gray-3 text-dark-2 hover:border-dark hover:text-dark ease-out duration-200 ml-auto"
          >
            Close
          </button>
        </div>
      </div>
    </ModalBackdrop>
  );
};

export default TicketDetailModal;
