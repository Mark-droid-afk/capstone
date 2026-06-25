"use client";

import { Message } from "@/types/conversation";
import { format } from "date-fns";

interface Props {
  message: Message | null;
  isOpen: boolean;
  onClose: () => void;
}

function formatDateTime(iso: string) {
  return format(new Date(iso), "EEE, MMM d, yyyy · h:mm a");
}

export default function MessageDetailModal({ message, isOpen, onClose }: Props) {
  if (!isOpen || !message) return null;

  const isAgent = message.senderRole === "agent";

  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Panel */}
      <div className="relative bg-white rounded-2xl shadow-theme-xl w-full max-w-sm mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-theme-sm font-semibold text-gray-900">Message Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <i className="ti ti-x text-xl" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Content */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-theme-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {message.content}
            </p>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-theme-xs text-gray-400 mb-0.5">Sender</p>
              <p className="text-theme-sm font-medium text-gray-800">
                {message.senderName}
              </p>
            </div>
            <div>
              <p className="text-theme-xs text-gray-400 mb-0.5">Role</p>
              <span className={`inline-block text-theme-xs font-medium px-2 py-0.5 rounded-full ${
                isAgent
                  ? "bg-brand-50 text-brand-600"
                  : "bg-gray-100 text-gray-600"
              }`}>
                {isAgent ? "Agent" : "Customer"}
              </span>
            </div>
            <div>
              <p className="text-theme-xs text-gray-400 mb-0.5">Sent at</p>
              <p className="text-theme-sm text-gray-700">
                {formatDateTime(message.sentAt)}
              </p>
            </div>
            <div>
              <p className="text-theme-xs text-gray-400 mb-0.5">Read</p>
              <span className={`inline-block text-theme-xs font-medium px-2 py-0.5 rounded-full ${
                message.isRead
                  ? "bg-success-50 text-success-600"
                  : "bg-gray-100 text-gray-500"
              }`}>
                {message.isRead ? "Read" : "Unread"}
              </span>
            </div>
          </div>
        </div>

        <div className="px-6 pb-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-theme-sm font-medium border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
