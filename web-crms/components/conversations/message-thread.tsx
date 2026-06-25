"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { conversationsApi } from "@/lib/api/conversation";
import { ticketsApi } from "@/lib/api/ticket";
import { useConversationHub } from "@/hooks/use-conversation-hub";
import type { Conversation } from "@/types/conversation";
import MessageBubble from "./message-bubble";
import MessageInput from "./message-input";
import { toast } from "sonner";
// import MessageDetailModal from "./message-detail-modal";

interface Props {
  conversation: Conversation;
  onMarkRead: (id: string) => void;
  onMarkUnread: (id: string) => void;
  onConversationClose?: () => void;
}

export default function MessageThread({
  conversation,
  onMarkRead,
  onMarkUnread,
  onConversationClose,
}: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [loadingMsgs, setLoadingMsgs] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedMsg, setSelectedMsg] = useState<import("@/types/conversation").Message | null>(null);

  const { messages, setInitialMessages, sendMessage, isConnected } =
    useConversationHub(conversation.id);

  // Fetch history + mark read on conversation open
  useEffect(() => {
    setLoadingMsgs(true);
    conversationsApi
      .getMessages(conversation.id, { page: 1, pageSize: 50 })
      .then((res) => setInitialMessages([...(res.data.data ?? [])].reverse()))
      .catch(() => setInitialMessages([]))
      .finally(() => setLoadingMsgs(false));

    if (!conversation.isRead) {
      conversationsApi
        .markRead(conversation.id)
        .then(() => onMarkRead(conversation.id))
        .catch(() => {});
    }
  }, [conversation.id]); // eslint-disable-line

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (content: string) => {
    try {
      await sendMessage(content);
    } catch {
      // Fallback to REST
      await conversationsApi.sendMessage(conversation.id, content);
    }
  };

  const handleUnclaim = async () => {
    if (!conversation.ticketId) return;
    setActionLoading(true);
    try {
      await ticketsApi.unclaim(conversation.ticketId);
      toast.success("Ticket unclaimed successfully");
      onConversationClose?.();
    } catch {
      toast.error("Failed to unclaim ticket");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!conversation.ticketId) return;
    setActionLoading(true);
    try {
      await ticketsApi.resolve(conversation.ticketId);
      toast.success("Ticket resolved successfully");
      onConversationClose?.();
      router.push("/conversation");
    } catch {
      toast.error("Failed to resolve ticket");
    } finally {
      setActionLoading(false);
    }
  };

  const isClosed =
    conversation.ticketStatus === "resolved" ||
    conversation.ticketStatus === "cancelled";
  console.log(conversation.customer);
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 shrink-0 gap-3 flex-wrap">
        <div className="min-w-0">
          <p className="text-theme-sm font-semibold text-xl text-gray-900 truncate">
            {conversation.customer.firstName} {conversation.customer.lastName}
          </p>
          <p className="text-gray-400 truncate text-semibold text-md">
            {conversation.ticketTitle.charAt(0).toUpperCase() + conversation.ticketTitle.slice(1)}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {/* Live indicator */}
          <span
            className={`inline-flex items-center gap-1.5 text-theme-xs font-medium ${
              isConnected ? "text-success-600" : "text-gray-400"
            }`}
          >
            <span
              className={`size-1.5 rounded-full ${
                isConnected ? "bg-success-500" : "bg-gray-300"
              }`}
            />
            {isConnected ? "Live" : "Reconnecting…"}
          </span>

          {/* Mark read / unread */}
          {conversation.isRead ? (
            <button
              onClick={() => onMarkUnread(conversation.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-theme-xs font-medium border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <i className="ti ti-mail text-sm" /> Mark Unread
            </button>
          ) : (
            <button
              onClick={() => onMarkRead(conversation.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-theme-xs font-medium border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <i className="ti ti-mail-opened text-sm" /> Mark Read
            </button>
          )}

          {/* Unclaim */}
          {!isClosed && (
            <button
              onClick={handleUnclaim}
              disabled={actionLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-theme-xs font-medium border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              <i className="ti ti-hand-off text-sm" /> Unclaim
            </button>
          )}

          {/* Resolve */}
          {!isClosed && (
            <button
              onClick={handleResolve}
              disabled={actionLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-theme-xs font-medium text-white bg-success-500 rounded-lg hover:bg-success-600 disabled:opacity-50 transition-colors"
            >
              <i className="ti ti-circle-check text-sm" /> Resolve
            </button>
          )}

          {isClosed && (
            <span className="px-2.5 py-1 text-theme-xs font-medium rounded-full bg-gray-100 text-gray-500 capitalize">
              {conversation.ticketStatus}
            </span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-5 py-4 space-y-4">
        {loadingMsgs ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-theme-sm">
            <i className="ti ti-loader-2 animate-spin text-xl mr-2" /> Loading…
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <i className="ti ti-message text-4xl text-gray-200 mb-2" />
            <p className="text-theme-xs text-gray-400">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={msg.senderId?.toLowerCase() === user?.id?.toLowerCase()}
              onClick={() => setSelectedMsg(msg)}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {!isClosed ? (
        <MessageInput onSend={handleSend} />
      ) : (
        <div className="px-5 py-3 border-t border-gray-100 text-center">
          <p className="text-theme-xs text-gray-400 italic">
            This conversation is{" "}
            {conversation.ticketStatus === "resolved" ? "resolved" : "closed"}.
          </p>
        </div>
      )}

      {/* Message detail modal */}
      {/* <MessageDetailModal
        message={selectedMsg}
        isOpen={selectedMsg !== null}
        onClose={() => setSelectedMsg(null)}
      /> */}
    </div>
  );
}
