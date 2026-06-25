"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Breadcrumb from "../Common/Breadcrumb";
import ConcernTab, {
  INITIAL_THREADS,
  MessageIcon,
  CHATBOT_AUTO_REPLY,
  CURRENT_USER_NAME,
  CURRENT_USER_AVATAR_SEED,
} from "./ConcernTab";
import type { StaffThread, ChatMessage, MessageSender } from "./ConcernTab";

// ─── Toast ────────────────────────────────────────────────────────────────────

type Toast = { id: number; message: string };

const ToastContainer = ({
  toasts,
  onRemove,
}: {
  toasts: Toast[];
  onRemove: (id: number) => void;
}) => (
  <div className="fixed top-5 right-5 z-[999] flex flex-col gap-2.5 pointer-events-none">
    {toasts.map((t) => (
      <div
        key={t.id}
        className="pointer-events-auto flex items-start gap-3 bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3.5 min-w-[280px] max-w-[340px] animate-toast-in"
      >
        <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3C50E0" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800">Concern submitted!</p>
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{t.message}</p>
        </div>
        <button
          onClick={() => onRemove(t.id)}
          className="text-gray-400 hover:text-gray-700 shrink-0 mt-0.5"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    ))}
  </div>
);

// ─── Concerns Page ────────────────────────────────────────────────────────────

const Concerns = () => {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/signin");
    }
  }, [user, isLoading]);

  const [threads, setThreads] = useState<StaffThread[]>(INITIAL_THREADS);
  const [panelOpen, setPanelOpen] = useState(false);
  const [lastSubmittedThreadId, setLastSubmittedThreadId] = useState<number | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  const addToast = useCallback(() => {
    const id = ++toastId.current;
    setToasts((prev) => [
      ...prev,
      { id, message: "Our support team will get back to you within 24 hours." },
    ]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4500);
  }, []);

  const handleConcernSubmit = useCallback(
    (subject: string, message: string, attachments?: File[]) => {
      const threadId = Date.now();

      const attachmentObjs =
        attachments && attachments.length > 0
          ? attachments.map((f) => ({
              name: f.name,
              url: URL.createObjectURL(f),
              type: f.type,
            }))
          : undefined;

      const customerMsg: ChatMessage = {
        id: 1,
        sender: "customer",
        text: message,
        timestamp: threadId,
        attachments: attachmentObjs,
      };

      const botMsg: ChatMessage = {
        id: 2,
        sender: "bot",
        text: CHATBOT_AUTO_REPLY,
        timestamp: threadId + 1200,
      };

      const newThread: StaffThread = {
        id: threadId,
        name: user ? `${user.firstName} ${user.lastName}` : CURRENT_USER_NAME,
        subject,
        timestamp: threadId,
        status: "open",
        preview: message.slice(0, 60) + (message.length > 60 ? "..." : ""),
        avatarSeed: CURRENT_USER_AVATAR_SEED,
        messages: [customerMsg],
      };

      setThreads((prev) => [newThread, ...prev]);
      setLastSubmittedThreadId(threadId);
      addToast();

      setTimeout(() => {
        setThreads((prev) =>
          prev.map((t) =>
            t.id === threadId ? { ...t, messages: [...t.messages, botMsg] } : t
          )
        );
      }, 1200);
    },
    [addToast, user]
  );

  const handleSendReply = useCallback(
    (
      threadId: number,
      text: string,
      sender: MessageSender = "staff",
      attachments?: { name: string; url: string; type: string }[]
    ) => {
      const newMsg: ChatMessage = {
        id: Date.now(),
        sender,
        text,
        timestamp: Date.now(),
        attachments,
      };
      setThreads((prev) =>
        prev.map((t) =>
          t.id === threadId ? { ...t, messages: [...t.messages, newMsg] } : t
        )
      );
    },
    []
  );

  const handleMarkResolved = useCallback((threadId: number) => {
    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId ? { ...t, status: "resolved" as const } : t
      )
    );
  }, []);

  const openCount = threads.filter((t) => t.status === "open").length;

  const concernProps = {
    threads,
    panelOpen,
    lastSubmittedThreadId,
    openCount,
    onConcernSubmit: handleConcernSubmit,
    onViewMessage: () => setPanelOpen(true),
    onSendReply: handleSendReply,
    onMarkResolved: handleMarkResolved,
    onPanelOpen: () => setPanelOpen(true),
    onPanelClose: () => setPanelOpen(false),
  };

  if (isLoading) return <div>Loading...</div>;
  if (!user) return null;

  return (
    <>
      <Breadcrumb title="Concerns" pages={["concerns"]} />
      <ToastContainer
        toasts={toasts}
        onRemove={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />

      <section className="overflow-hidden py-10 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="mb-7.5 flex items-center justify-between flex-wrap gap-3">
            <p className="text-dark text-base max-w-xl">
              Have a question or complaint? Submit a concern and our support team will respond promptly.
            </p>

            {/* Messages button */}
            <button
              onClick={() => setPanelOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-150 hover:opacity-90"
              style={{ background: "#3C50E0" }}
            >
              <MessageIcon />
              <span>Messages</span>
              {openCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white text-xs font-bold animate-pulse-slow" style={{ color: "#3C50E0" }}>
                  {openCount}
                </span>
              )}
            </button>
          </div>

          <ConcernTab {...concernProps} />
        </div>
      </section>

      <style>{`
        @keyframes slide-in-right { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .animate-slide-in-right { animation: slide-in-right 0.22s cubic-bezier(0.16,1,0.3,1); }
        @keyframes toast-in { from { transform: translateX(24px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .animate-toast-in { animation: toast-in 0.25s cubic-bezier(0.16,1,0.3,1); }
        @keyframes fade-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        @keyframes pulse-slow { 0%,100% { opacity:1; } 50% { opacity:0.6; } }
        .animate-pulse-slow { animation: pulse-slow 2s ease-in-out infinite; }
        @keyframes dash-in { from { stroke-dashoffset:226; } to { stroke-dashoffset:0; } }
        @keyframes fade-in-scale { from { opacity:0; transform:scale(0.6); } to { opacity:1; transform:scale(1); } }
      `}</style>
    </>
  );
};

export default Concerns;