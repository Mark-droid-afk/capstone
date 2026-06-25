"use client";

import { Message } from "@/types/conversation";
import { format } from "date-fns";

interface Props {
  message: Message;
  isOwn: boolean;
  onClick?: (message: Message) => void;
}

export default function MessageBubble({ message, isOwn, onClick }: Props) {
  return (
    <div
      className={`flex flex-col gap-1 ${
        message.senderRole === "agent" ? "items-end" : "items-start"
      } ${onClick ? "cursor-pointer" : ""}`}
      onClick={() => onClick?.(message)}
    >
      <div
        className={`max-w-[72%] px-4 py-2.5 text-theme-sm leading-relaxed whitespace-pre-line break-words ${
          message.senderRole === "agent" 
            ? "bg-brand-500 text-white rounded-2xl rounded-br-sm"
            : "bg-gray-100 text-gray-800 rounded-2xl rounded-bl-sm"
        }`}
      >
        {message.content}
      </div>
      <div
        className={`flex items-center gap-1.5 px-1 ${isOwn ? "flex-row-reverse" : ""}`}
      >
        <span className="text-theme-xs text-gray-400">{message.senderName}</span>
        <span className="text-theme-xs text-gray-300">·</span>
        <span className="text-theme-xs text-gray-400">
          {format(new Date(message.sentAt), "h:mm a")}
        </span>
      </div>
    </div>
  );
}
