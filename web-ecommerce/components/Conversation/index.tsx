"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ConversationDetail, ConversationMessage } from "@/types/conversation";
import {
  getConversation,
  sendMessage,
} from "@/services/conversation.service";
import { cancelTicket } from "@/services/ticket.service";
import { useCustomerConversationHub } from "@/hooks/useCustomerConversationHub";
import ChatHeader from "./ChatHeader";
import ChatBubble from "./ChatBubble";
import ChatInput from "./ChatInput";
import MessageDetailModal from "./MessageDetailModal";
import TicketCancelModal from "./TicketCancelModal";
import { toast } from "sonner";


function groupByDate(messages: ConversationMessage[]) {
  const groups: { label: string; messages: ConversationMessage[] }[] = [];
  const map = new Map<string, ConversationMessage[]>();

  for (const msg of messages) {
    const label = new Date(msg.sentAt).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    if (!map.has(label)) {
      map.set(label, []);
      groups.push({ label, messages: map.get(label)! });
    }
    map.get(label)!.push(msg);
  }

  return groups;
}


const ConversationSkeleton = () => (
  <div className="flex flex-col gap-4 px-4 sm:px-6 py-6 animate-pulse">
    <div className="flex items-end gap-2">
      <div className="w-8 h-8 rounded-full bg-gray-3 shrink-0" />
      <div className="h-10 w-56 bg-gray-3 rounded-2xl rounded-bl-sm" />
    </div>
    <div className="flex items-end gap-2 flex-row-reverse">
      <div className="h-10 w-48 bg-gray-3 rounded-2xl rounded-br-sm" />
    </div>
    <div className="flex items-end gap-2">
      <div className="w-8 h-8 rounded-full bg-gray-3 shrink-0" />
      <div className="h-16 w-64 bg-gray-3 rounded-2xl rounded-bl-sm" />
    </div>
    <div className="flex items-end gap-2 flex-row-reverse">
      <div className="h-10 w-40 bg-gray-3 rounded-2xl rounded-br-sm" />
    </div>
  </div>
);


const DateSeparator = ({ label }: { label: string }) => (
  <div className="flex items-center gap-3 my-4">
    <div className="flex-1 border-t border-gray-3" />
    <span className="text-custom-xs text-dark-5 whitespace-nowrap">{label}</span>
    <div className="flex-1 border-t border-gray-3" />
  </div>
);


type ConversationProps = {
  ticketId: string;
};

const Conversation = ({ ticketId }: ConversationProps) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [conversation, setConversation] = useState<ConversationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const [selectedMessage, setSelectedMessage] = useState<ConversationMessage | null>(null);
  const [showMessageDetail, setShowMessageDetail] = useState(false);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const sentMessageIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/signin");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user || isLoading) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    getConversation(user.id, ticketId)
      .then((data) => {
        if (!cancelled) setConversation(data);
      })
      .catch(() => {
        if (!cancelled)
          setError("Failed to load conversation. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user, isLoading, ticketId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages.length]);

  const handleReceiveMessage = useCallback(
    (incomingMsg: ConversationMessage) => {
      const adaptedMsg: ConversationMessage = {
        ...incomingMsg,
        senderType: incomingMsg.senderType || incomingMsg.senderRole,
        senderFirstName: incomingMsg.senderFirstName || incomingMsg.senderName,
      };

      if (sentMessageIds.current.has(adaptedMsg.id)) {
        sentMessageIds.current.delete(adaptedMsg.id);
        return;
      }

      setConversation((prev) => {
        if (!prev) return prev;
        
        if (prev.messages.some((m) => m.id === adaptedMsg.id)) {
          return prev;
        }

        if (adaptedMsg.senderRole === "customer" || adaptedMsg.senderType === "customer") {
          const pendingIdx = prev.messages.findIndex(
            (m) => (m.isPending || m.id.startsWith("temp-")) && m.content === adaptedMsg.content
          );
          if (pendingIdx !== -1) {
            const updatedMessages = [...prev.messages];
            updatedMessages[pendingIdx] = { ...adaptedMsg, isPending: false };
            return { ...prev, messages: updatedMessages };
          }
        }

        return { ...prev, messages: [...prev.messages, adaptedMsg] };
      });
    },
    []
  );

  const handleTicketStatusChange = useCallback(
    (payload: { ticketId: string; ticketStatus: string }) => {
      if (payload.ticketId !== ticketId) return;
      setConversation((prev) =>
        prev ? { ...prev, ticketStatus: payload.ticketStatus } : prev
      );
    },
    [ticketId]
  );

  useCustomerConversationHub(
    ticketId,
    handleReceiveMessage,
    handleTicketStatusChange
  );

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || sending || !user || !conversation) return;

    setSending(true);

    const tempId = `temp-${Date.now()}`;
    const optimistic: ConversationMessage = {
      id: tempId,
      conversationId: "",
      content: text,
      senderId: user.id ?? "",
      senderName: user.firstName ?? "You",
      senderRole: "customer",
      senderType: "customer",
      senderFirstName: user.firstName ?? "You",
      isRead: false,
      sentAt: new Date().toISOString(),
      isPending: true,
    };

    setConversation((prev) =>
      prev ? { ...prev, messages: [...prev.messages, optimistic] } : prev
    );
    setInput("");

    try {
      const confirmed = await sendMessage(user.id, ticketId, { content: text });
      sentMessageIds.current.add(confirmed.id);

      setConversation((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: prev.messages.map((m) =>
            m.id === tempId ? { ...confirmed, isPending: false } : m
          ),
        };
      });
    } catch {
      setConversation((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: prev.messages.filter((m) => m.id !== tempId),
        };
      });
      setInput(text); // restore input
    } finally {
      setSending(false);
    }
  }, [input, sending, user, conversation, ticketId]);

  const handleCancelConfirm = async () => {
    if (!user || !conversation) return;
    setIsCancelling(true);
    try {
      await cancelTicket(ticketId);
      setConversation((prev) =>
        prev ? { ...prev, ticketStatus: "cancelled" } : prev
      );
      setShowCancelModal(false);
      toast.success("Ticket cancelled successfully");
    } catch (err: any) {
      toast.error("Failed to cancel ticket. Please try again.");
    } finally {
      setIsCancelling(false);
    }
  };

  const ticketStatus = conversation?.ticketStatus ?? "pending";
  const isClosed = ticketStatus === "cancelled" || ticketStatus === "resolved";
  const disabledReason = isClosed
    ? ticketStatus === "cancelled"
      ? "This ticket has been cancelled. You can no longer send messages."
      : "This ticket has been resolved. You can no longer send messages."
    : undefined;

  if (isLoading || (loading && !conversation)) {
    return (
      <div className="flex flex-col h-full">
        {/* Placeholder header */}
        <div className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-gray-3 bg-white animate-pulse shrink-0">
          <div className="w-8 h-8 rounded-full bg-gray-3" />
          <div className="flex-1 flex flex-col gap-1.5">
            <div className="h-3 w-16 bg-gray-3 rounded" />
            <div className="h-4 w-48 bg-gray-3 rounded" />
            <div className="h-3 w-32 bg-gray-3 rounded" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto bg-gray-1">
          <ConversationSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
        <p className="text-red text-custom-sm">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-custom-sm text-blue hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!conversation) return null;

  const messageGroups = groupByDate(conversation.messages);

  return (
    <>
      <div className="flex flex-col h-full">
        {/* ── Header ── */}
        <ChatHeader
          ticketTitle={conversation.ticketTitle}
          ticketType={conversation.ticketType}
          ticketStatus={ticketStatus}
          assignedFirstName={conversation.assignedTo?.employeeFirstName}
          assignedLastName={conversation.assignedTo?.employeeLastName}
          onCancelTicket={
            ticketStatus === "pending" ? () => setShowCancelModal(true) : undefined
          }
        />

        {/* ── Status banners ── */}
        {ticketStatus === "pending" && !conversation.assignedTo?.employeeFirstName && (
          <div className="px-4 sm:px-6 py-2.5 bg-yellow-light-4 border-b border-yellow/20 text-center">
            <p className="text-custom-xs text-yellow font-medium">
              ⏳ Your ticket is pending. A support agent will be assigned shortly.
            </p>
          </div>
        )}
        {ticketStatus === "cancelled" && (
          <div className="px-4 sm:px-6 py-2.5 bg-gray-2 border-b border-gray-3 text-center">
            <p className="text-custom-xs text-dark-4 font-medium">
              This ticket has been cancelled.
            </p>
          </div>
        )}
        {ticketStatus === "resolved" && (
          <div className="px-4 sm:px-6 py-2.5 bg-green-light-6 border-b border-green/20 text-center">
            <p className="text-custom-xs text-green font-medium">
              ✓ This ticket has been resolved. Thank you!
            </p>
          </div>
        )}

        {/* ── Message list ── */}
        <div className="flex-1 overflow-y-auto bg-gray-1 px-4 sm:px-6 py-4 flex flex-col gap-3">
          {conversation.messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-2">
              <svg
                className="text-gray-3"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="text-dark font-medium">No messages yet</p>
              <p className="text-custom-sm text-dark-4 max-w-xs">
                Send your first message. A support agent will respond shortly.
              </p>
            </div>
          ) : (
            messageGroups.map((group) => (
              <React.Fragment key={group.label}>
                <DateSeparator label={group.label} />
                {group.messages.map((msg) => (
                  <ChatBubble
                    key={msg.id}
                    message={msg}
                    isOwn={
                      (!!msg.senderId && !!user?.id && msg.senderId === user.id) ||
                      msg.senderType === "customer" ||
                      msg.senderRole === "customer"
                    }
                    onClick={(m) => {
                      setSelectedMessage(m);
                      setShowMessageDetail(true);
                    }}
                  />
                ))}
              </React.Fragment>
            ))
          )}
          {/* scroll anchor */}
          <div ref={bottomRef} />
        </div>

        {/* ── Input ── */}
        <ChatInput
          value={input}
          onChange={setInput}
          onSend={handleSend}
          sending={sending}
          disabled={isClosed}
          disabledReason={disabledReason}
        />
      </div>

      {/* ── Modals ── */}
      <MessageDetailModal
        message={selectedMessage}
        isOpen={showMessageDetail}
        onClose={() => {
          setShowMessageDetail(false);
          setSelectedMessage(null);
        }}
      />

      <TicketCancelModal
        isOpen={showCancelModal}
        isCancelling={isCancelling}
        ticketTitle={conversation.ticketTitle}
        onConfirm={handleCancelConfirm}
        onDismiss={() => setShowCancelModal(false)}
      />
    </>
  );
};

export default Conversation;
