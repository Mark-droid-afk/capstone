"use client";

import { Conversation } from "@/types/conversation";
import { format } from "date-fns";

interface Props {
  conversation: Conversation;
  isSelected: boolean;
  onClick: (c: Conversation) => void;
  onMarkRead: (id: string) => void;
  onMarkUnread: (id: string) => void;
}

export default function ConversationItem({
  conversation: c,
  isSelected,
  onClick,
  onMarkRead,
  onMarkUnread,
}: Props) {
  const initials = `${c.customer.firstName[0]}${c.customer.lastName[0]}`;

  return (
    <div
      onClick={() => onClick(c)}
      className={`group relative flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-gray-100 last:border-0 ${
        isSelected ? "bg-brand-25" : "hover:bg-gray-50"
      }`}
    >
      {/* Unread dot */}
      {!c.isRead && (
        <span className="absolute left-1.5 top-1/2 -translate-y-1/2 size-1.5 rounded-full bg-brand-500" />
      )}

      {/* Avatar */}
      <div className="shrink-0 w-9 h-9 rounded-full bg-brand-50 flex items-center justify-center text-brand-500 text-xs font-semibold overflow-hidden">
        {c.customer.profileImage ? (
          <img src={c.customer.profileImage} alt="" className="w-full h-full object-cover" />
        ) : (
          initials
        )}
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0 pr-6">
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <p className={`text-theme-xs truncate ${!c.isRead ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}>
            {c.customer.firstName} {c.customer.lastName}
          </p>
          <span className="text-theme-xs text-gray-400 shrink-0">
            {format(new Date(c.updatedAt), "h:mm a")}
          </span>
        </div>
        <p className="text-theme-xs text-gray-400 truncate mb-0.5">{c.ticketTitle}</p>
        <p className="text-theme-xs text-gray-400 truncate">
          {c.lastMessage?.content ?? "No messages yet"}
        </p>
      </div>

      {/* Unread badge */}
      {c.unreadCount > 0 && (
        <span className="absolute right-3 top-3 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-brand-500 text-white text-[10px] font-semibold">
          {c.unreadCount > 99 ? "99+" : c.unreadCount}
        </span>
      )}

      {/* Hover actions */}
      <div
        className="absolute right-3 bottom-3 hidden group-hover:flex items-center gap-1"
        onClick={(e) => e.stopPropagation()}
      >
        {c.isRead ? (
          <button
            title="Mark as unread"
            onClick={() => onMarkUnread(c.id)}
            className="p-1 rounded-md text-gray-400 hover:text-brand-500 hover:bg-brand-50 transition-colors"
          >
            <i className="ti ti-mail text-sm" />
          </button>
        ) : (
          <button
            title="Mark as read"
            onClick={() => onMarkRead(c.id)}
            className="p-1 rounded-md text-gray-400 hover:text-success-600 hover:bg-success-50 transition-colors"
          >
            <i className="ti ti-mail-opened text-sm" />
          </button>
        )}
      </div>
    </div>
  );
}
