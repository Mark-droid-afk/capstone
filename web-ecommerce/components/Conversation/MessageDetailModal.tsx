"use client";

import React from "react";
import { ConversationMessage } from "@/types/conversation";
import ModalBackdrop from "@/components/Concerns/ModalBackdrop";

type MessageDetailModalProps = {
  message: ConversationMessage | null;
  isOpen: boolean;
  onClose: () => void;
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const SENDER_LABEL: Record<string, string> = {
  customer: "You",
  employee: "Support Agent",
};

const MessageDetailModal = ({ message, isOpen, onClose }: MessageDetailModalProps) => {
  if (!message) return null;

  return (
    <ModalBackdrop isOpen={isOpen} onClose={onClose} maxWidth="max-w-[480px]">
      <div className="p-6 sm:p-8">
        <div className="mb-5 pr-8">
          <h3 className="font-semibold text-dark text-lg">Message Details</h3>
        </div>

        <div className="bg-gray-1 rounded-lg p-4 mb-5">
          <p className="text-custom-sm text-dark leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-custom-xs text-dark-4 mb-0.5">Sender</p>
            <p className="text-custom-sm text-dark font-medium">
              {message.senderFirstName || SENDER_LABEL[message.senderType] || "Unknown"}
            </p>
          </div>

          <div>
            <p className="text-custom-xs text-dark-4 mb-0.5">Sent at</p>
            <p className="text-custom-sm text-dark font-medium">
              {formatDateTime(message.sentAt)}
            </p>
          </div>

          <div>
            <p className="text-custom-xs text-dark-4 mb-0.5">Type</p>
            <p className="text-custom-sm text-dark font-medium capitalize">
              {message.senderType}
            </p>
          </div>

          <div>
            <p className="text-custom-xs text-dark-4 mb-0.5">Read</p>
            <span
              className={`inline-block text-custom-xs font-medium py-0.5 px-2 rounded-full ${
                message.isRead
                  ? "text-green bg-green-light-6"
                  : "text-dark-4 bg-gray-2"
              }`}
            >
              {message.isRead ? "Read" : "Unread"}
            </span>
          </div>
        </div>

        <div className="border-t border-gray-3 mt-5 pt-5">
          <button
            onClick={onClose}
            className="font-medium py-2.5 px-6 rounded-md border border-gray-3 text-dark-2 hover:border-dark hover:text-dark ease-out duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </ModalBackdrop>
  );
};

export default MessageDetailModal;
