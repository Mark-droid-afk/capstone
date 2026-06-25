"use client";

import React from "react";
import { ConversationMessage } from "@/types/conversation";

type ChatBubbleProps = {
  message: ConversationMessage;
  isOwn: boolean;
  onClick: (message: ConversationMessage) => void;
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const ChatBubble = ({ message, isOwn, onClick }: ChatBubbleProps) => {
  const isEmployee = message.senderType === "employee";

  return (
    <div
      className={`flex items-end gap-2 group w-full ${isOwn ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar — only for agent messages */}
      {!isOwn && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue flex items-center justify-center text-white text-xs font-semibold select-none">
          {message.senderFirstName?.charAt(0).toUpperCase() ?? "A"}
        </div>
      )}

      {/* Bubble */}
      <div
        className={`max-w-[70%] sm:max-w-[60%] flex flex-col ${
          isOwn ? "items-end" : "items-start"
        }`}
      >
        {/* Sender name — only for agent */}
        {!isOwn && (
          <p className="text-custom-xs text-dark-4 mb-1 ml-1">
            {message.senderFirstName || "Support Agent"}
          </p>
        )}

        {/* Message content — clickable for detail */}
        <button
          id={`msg-bubble-${message.id}`}
          onClick={() => onClick(message)}
          className={`text-left px-4 py-2.5 rounded-2xl text-custom-sm leading-relaxed cursor-pointer ease-out duration-150 ${
            isOwn
              ? "bg-blue text-white flex flex-wrap items-end rounded-br-sm hover:bg-blue-dark"
              : "bg-white text-dark border border-gray rounded-bl-sm items-start hover:border-gray-4"
          } ${message.isPending ? "opacity-60" : ""}`}
          title="Click to view details"
        >
          {message.content}
        </button>

        {/* Timestamp + read indicator */}
        <div
          className={`flex items-center gap-1 mt-1 ${
            isOwn ? "flex-row-reverse" : "flex-row"
          }`}
        >
          <span className="text-[11px] text-dark-5">
            {formatTime(message.sentAt)}
          </span>
          {isOwn && (
            <span
              className={`text-[11px] ${
                message.isRead ? "text-blue" : "text-dark-5"
              }`}
              title={message.isRead ? "Read" : "Sent"}
            >
              {message.isRead ? "✓✓" : "✓"}
            </span>
          )}
          {message.isPending && (
            <span className="text-[11px] text-dark-5 italic">sending…</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
