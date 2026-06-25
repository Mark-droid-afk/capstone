"use client";

import { useEffect, useState } from "react";
import { conversationsApi } from "@/lib/api/conversation";
import type { Conversation } from "@/types/conversation";
import ConversationList from "@/components/conversations/conversation-list";
import MessageThread from "@/components/conversations/message-thread";
import { toast } from "sonner";

interface Props {
  initialId?: string;
}

export default function ConversationsShell({ initialId }: Props) {
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!initialId) return;
    conversationsApi
      .getById(initialId)
      .then((res) => setSelected(res.data))
      .catch(() => {});
  }, [initialId]);
  const handleMarkRead = async (id: string) => {
    try {
      await conversationsApi.markRead(id);
      setSelected((s) =>
        s?.id === id &&
        s.ticketStatus !== "resolved" &&
        s.ticketStatus !== "cancelled" &&
        s.ticketStatus !== "available"
          ? { ...s, isRead: true, unreadCount: 0 }
          : s,
      );
      toast.success("Conversation marked as read");
      setRefreshKey((k) => k + 1);
    } catch {
      toast.error("Failed to mark as read");
    }
  };

  const handleMarkUnread = async (id: string) => {
    try {
      await conversationsApi.markUnread(id);
      setSelected((s) =>
        s?.id === id &&
        s.ticketStatus !== "resolved" &&
        s.ticketStatus !== "cancelled" &&
        s.ticketStatus !== "available"
          ? { ...s, isRead: false }
          : s,
      );
      toast.success("Conversation marked as unread");
      setRefreshKey((k) => k + 1);
    } catch {
      toast.error("Failed to mark as unread");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-110px)] md:h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 shrink-0">
        <h1 className="text-title-sm font-semibold text-gray-900">
          Conversations
        </h1>
        <p className="text-theme-sm text-gray-500 mt-0.5">
          Messages from claimed tickets
        </p>
      </div>

      {/* Two-panel body */}
      <div className="flex flex-1 gap-4 px-6 pb-6 min-h-0">
        {/* Left — list */}
        <div className="w-80 shrink-0 h-full flex flex-col bg-white rounded-2xl border border-gray-200 shadow-theme-xs overflow-hidden">
          <ConversationList
            selectedId={selected?.id ?? null}
            onSelect={(c) => setSelected(c)}
            onMarkRead={handleMarkRead}
            onMarkUnread={handleMarkUnread}
            refreshKey={refreshKey}
          />
        </div>

        {/* Right — thread */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl border border-gray-200 shadow-theme-xs overflow-hidden">
          {selected ? (
            <MessageThread
              key={selected.id}
              conversation={selected}
              onMarkRead={handleMarkRead}
              onMarkUnread={handleMarkUnread}
              onConversationClose={() => setSelected(null)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <i className="ti ti-message-circle text-4xl text-gray-200 mb-3" />
              <p className="text-theme-sm font-medium text-gray-500 mb-1">
                No conversation selected
              </p>
              <p className="text-theme-xs text-gray-400">
                Pick a conversation from the list to start messaging.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
