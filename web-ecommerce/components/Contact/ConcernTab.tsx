"use client";

import React, { useState, useEffect, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type MessageSender = "customer" | "staff" | "bot";

export type ChatMessage = {
  id: number;
  sender: MessageSender;
  text: string;
  timestamp: number;
  attachments?: { name: string; url: string; type: string }[];
};

export type StaffThread = {
  id: number;
  name: string;
  subject: string;
  timestamp: number;
  status: "open" | "resolved";
  preview: string;
  messages: ChatMessage[];
  avatarSeed?: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const CONCERN_TYPES = [
  { value: "", label: "Select a concern type..." },
  { value: "Complaint", label: "Complaint" },
  { value: "Concern", label: "Concern" },
  { value: "Return / Exchange Issue", label: "Return / Exchange Issue" },
  { value: "General Request", label: "General Request" },
  { value: "Other", label: "Other" },
];

const MESSAGE_MAX = 600;
const REPLY_MAX = 400;

export const CHATBOT_AUTO_REPLY = `Hi there! 👋 Thanks for reaching out. I'm the Bren Raphael's support assistant.

Your concern has been received and our team will review it shortly. In the meantime, here are a few things that may help:

• For order issues, please have your order number ready
• Refunds typically process within 3–5 business days
• For urgent matters, you can also reach us at 0954 336 6829

Our team responds Mon–Sat from 9 AM. We'll get back to you within 24 hours!`;

const now = Date.now();

export const CURRENT_USER_NAME = "Carlos M.";
export const CURRENT_USER_AVATAR_SEED = "12";

export const INITIAL_THREADS: StaffThread[] = [
  {
    id: 1,
    name: CURRENT_USER_NAME,
    subject: "Wrong item delivered",
    timestamp: now - 2 * 60000,
    status: "open",
    preview: "I ordered a blue shirt but received a red one...",
    avatarSeed: CURRENT_USER_AVATAR_SEED,
    messages: [
      { id: 1, sender: "customer", text: "Hi, I placed an order last Monday (Order #10432) for a blue shirt, size M. However, the item I received was a red shirt in size L. I need this resolved urgently as it was a gift.", timestamp: now - 2 * 60000 },
      { id: 2, sender: "staff", text: "Hi Carlos! We're sorry about that mix-up. We've located your order and will arrange a replacement shipment for the correct item right away. You should receive a tracking update within 2 hours.", timestamp: now - 1 * 60000 },
    ],
  },
  {
    id: 2,
    name: CURRENT_USER_NAME,
    subject: "Refund not processed",
    timestamp: now - 3600000,
    status: "open",
    preview: "It's been 5 days and I still haven't received my refund...",
    avatarSeed: CURRENT_USER_AVATAR_SEED,
    messages: [
      { id: 1, sender: "customer", text: "I returned my order on May 22 (Return #RET-8821) and was told the refund would be processed within 3-5 business days. It has now been 5 business days. Please look into this.", timestamp: now - 3600000 },
    ],
  },
  {
    id: 3,
    name: CURRENT_USER_NAME,
    subject: "Login issue",
    timestamp: now - 10800000,
    status: "resolved",
    preview: "I can't log into my account...",
    avatarSeed: CURRENT_USER_AVATAR_SEED,
    messages: [
      { id: 1, sender: "customer", text: "I've been trying to log in since this morning but it keeps saying my password is incorrect. I need access to track my pending order.", timestamp: now - 10800000 },
      { id: 2, sender: "staff", text: "Hi Carlos! We've reset your account credentials. Please check your email for a password reset link. Let us know if you need further assistance!", timestamp: now - 9000000 },
    ],
  },
  {
    id: 4,
    name: CURRENT_USER_NAME,
    subject: "Wrong item delivered",
    timestamp: now - 2 * 60000,
    status: "open",
    preview: "I ordered a blue shirt but received a red one...",
    avatarSeed: CURRENT_USER_AVATAR_SEED,
    messages: [
      { id: 1, sender: "customer", text: "Hi, I placed an order last Monday (Order #10432) for a blue shirt, size M. However, the item I received was a red shirt in size L. I need this resolved urgently as it was a gift.", timestamp: now - 2 * 60000 },
      { id: 2, sender: "staff", text: "Hi Carlos! We're sorry about that mix-up. We've located your order and will arrange a replacement shipment for the correct item right away. You should receive a tracking update within 2 hours.", timestamp: now - 1 * 60000 },
    ],
  },
];

// ─── Utilities ────────────────────────────────────────────────────────────────

const AVATAR_COLORS = ["#3C50E0", "#0891B2", "#059669", "#7C3AED", "#DB2777", "#D97706", "#DC2626", "#2563EB"];

function avatarColor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getAvatarSeed(thread: StaffThread): number {
  if (thread.avatarSeed) return parseInt(thread.avatarSeed, 10);
  let hash = 0;
  for (let i = 0; i < thread.name.length; i++) hash = thread.name.charCodeAt(i) + ((hash << 5) - hash);
  return (Math.abs(hash) % 70) + 1;
}

function relativeTime(ts: number) {
  const d = Math.floor((Date.now() - ts) / 1000);
  if (d < 30) return "just now";
  if (d < 60) return `${d}s ago`;
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);
const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
export const MessageIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const TikTokIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
  </svg>
);
const PaperclipIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </svg>
);
const FileIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
  </svg>
);
const ImageFileIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
  </svg>
);
const BotIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <path d="M12 11V7" /><circle cx="12" cy="5" r="2" />
    <line x1="8" y1="15" x2="8" y2="15" strokeWidth="3" strokeLinecap="round" />
    <line x1="12" y1="15" x2="12" y2="15" strokeWidth="3" strokeLinecap="round" />
    <line x1="16" y1="15" x2="16" y2="15" strokeWidth="3" strokeLinecap="round" />
  </svg>
);
const CharCounter = ({ value, max }: { value: string; max: number }) => {
  const len = value.length;
  const pct = len / max;
  const color = pct >= 1 ? "text-red-500" : pct >= 0.85 ? "text-amber-500" : "text-dark-5";
  return <span className={`text-xs tabular-nums ${color}`}>{len}/{max}</span>;
};

// ─── Avatars ──────────────────────────────────────────────────────────────────

const CustomerAvatar = ({ thread, size = 32, className = "" }: { thread: StaffThread; size?: number; className?: string }) => {
  const seed = getAvatarSeed(thread);
  const initials = thread.name.split(" ").map((n) => n[0]).join("");
  const color = avatarColor(thread.avatarSeed ?? thread.name);
  const [imgError, setImgError] = useState(false);
  return (
    <div className={`rounded-full flex items-center justify-center overflow-hidden shrink-0 ${className}`} style={{ width: size, height: size, background: color }}>
      {!imgError
        ? <img src={`https://i.pravatar.cc/${size * 2}?img=${seed}`} alt={thread.name} width={size} height={size} className="w-full h-full object-cover" onError={() => setImgError(true)} />
        : <span className="font-bold text-white" style={{ fontSize: size * 0.33 }}>{initials}</span>}
    </div>
  );
};

const BotAvatar = ({ size = 28 }: { size?: number }) => (
  <div className="rounded-full flex items-center justify-center shrink-0" style={{ width: size, height: size, background: "linear-gradient(135deg,#6366f1,#3C50E0)" }}>
    <BotIcon />
  </div>
);

const StaffAvatar = ({ size = 28 }: { size?: number }) => (
  <div className="rounded-full flex items-center justify-center shrink-0 text-white font-bold" style={{ width: size, height: size, background: "#3C50E0", fontSize: size * 0.32 }}>S</div>
);

// ─── PreSubmitModal ───────────────────────────────────────────────────────────

const PreSubmitModal = ({ subject, message, attachments, onConfirm, onEdit }: { subject: string; message: string; attachments: File[]; onConfirm: () => void; onEdit: () => void }) => (
  <div style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} className="animate-fade-in" onClick={onEdit}>
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-modal-in" onClick={(e) => e.stopPropagation()}>
      <div className="px-6 pt-6 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: "#EEF0FD" }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#3C50E0" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-base">Review Your Concern</p>
            <p className="text-xs text-gray-400 mt-0.5">Please confirm before sending</p>
          </div>
        </div>
      </div>
      <div className="px-6 py-5 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Type of Concern</span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border self-start" style={{ background: "#EEF0FD", color: "#3C50E0", borderColor: "#C7CEFF" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
            {subject}
          </span>
        </div>
        <div className="h-px bg-gray-100" />
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Your Message</span>
          <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 leading-relaxed max-h-36 overflow-y-auto">{message}</div>
        </div>
        {attachments.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Attachments ({attachments.length})</span>
            <div className="flex flex-wrap gap-2">
              {attachments.map((f, i) => (
                <div key={i} className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 rounded-lg px-2.5 py-1.5 text-xs text-blue-700 font-medium">
                  {f.type.startsWith("image/") ? <ImageFileIcon /> : <FileIcon />}
                  <span className="truncate max-w-[120px]">{f.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" className="shrink-0"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          <p className="text-xs text-amber-700 leading-relaxed">Once submitted, your concern will be reviewed within <span className="font-semibold">24 hours</span>.</p>
        </div>
      </div>
      <div className="px-6 pb-6 flex flex-col gap-2.5">
        <button onClick={onConfirm} className="w-full inline-flex items-center justify-center gap-2 font-semibold text-white py-3 px-6 rounded-xl text-sm hover:opacity-90 active:scale-[0.98] transition-all duration-150" style={{ background: "#3C50E0" }}>
          <SendIcon /> Confirm & Send
        </button>
        <button onClick={onEdit} className="w-full text-sm text-gray-500 hover:text-gray-800 font-medium py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">← Edit Message</button>
      </div>
    </div>
  </div>
);

// ─── ChatDetail ───────────────────────────────────────────────────────────────

const ChatDetail = ({ thread, onBack, onClose, onSendReply }: {
  thread: StaffThread;
  onBack: () => void;
  onClose: () => void;
  onSendReply: (threadId: number, text: string, sender: MessageSender, attachments?: { name: string; url: string; type: string }[]) => void;
}) => {
  const [reply, setReply] = useState("");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [thread.messages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setPendingFiles((prev) => [...prev, ...files].slice(0, 5));
    e.target.value = "";
  };

  const handleSend = () => {
    const trimmed = reply.trim();
    if (!trimmed && pendingFiles.length === 0) return;
    const attachments = pendingFiles.map((f) => ({ name: f.name, url: URL.createObjectURL(f), type: f.type }));
    onSendReply(thread.id, trimmed, "customer", attachments.length > 0 ? attachments : undefined);
    setReply(""); setPendingFiles([]); textareaRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="shrink-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 z-10">
        <button onClick={onBack} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center shrink-0 transition-colors" aria-label="Back">
          <ArrowLeftIcon />
        </button>
        <CustomerAvatar thread={thread} size={34} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-gray-900 leading-none truncate">{thread.name}</p>
          <p className="text-xs text-gray-400 mt-0.5 truncate">{thread.subject}</p>
        </div>
        <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold shrink-0 ${thread.status === "open" ? "bg-amber-50 text-amber-600 border border-amber-200" : "bg-emerald-50 text-emerald-600 border border-emerald-200"}`}>
          {thread.status === "open" ? "Pending" : "Resolved"}
        </span>
        <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 shrink-0 transition-colors" aria-label="Close">
          <CloseIcon />
        </button>
      </div>

      {/* Subject badge */}
      <div style={{ flexShrink: 0, padding: "12px 16px 4px", background: "#F5F6FA" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, background: "#EEF0FD", color: "#3C50E0", border: "1px solid #C7CEFF" }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
          {thread.subject}
        </span>
      </div>

      {/* Messages — scrollable middle */}
      <div style={{ flex: 1, overflowY: "auto", minHeight: 0, padding: "16px", background: "#F5F6FA", display: "flex", flexDirection: "column", gap: 12 }}>
        {thread.messages.map((msg) => {
          const isCustomer = msg.sender === "customer";
          const isBot = msg.sender === "bot";
          if (isBot) return (
            <div key={msg.id} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
              <BotAvatar size={26} />
              <div style={{ maxWidth: "78%", display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <div style={{ padding: "10px 14px", borderRadius: "4px 18px 18px 18px", fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap", background: "linear-gradient(135deg,#eef2ff,#eff6ff)", border: "1px solid #c7d2fe", color: "#1f2937", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>{msg.text}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                  <span style={{ fontSize: 10, color: "#9ca3af" }}>{formatTime(msg.timestamp)}</span>
                  <span style={{ fontSize: 10, color: "#818cf8", fontWeight: 500 }}>AI Assistant</span>
                </div>
              </div>
            </div>
          );
          return (
            <div key={msg.id} style={{ display: "flex", alignItems: "flex-end", gap: 8, flexDirection: isCustomer ? "row-reverse" : "row" }}>
              {!isCustomer && <StaffAvatar size={26} />}
              <div style={{ maxWidth: "75%", display: "flex", flexDirection: "column", alignItems: isCustomer ? "flex-end" : "flex-start" }}>
                <div style={{ padding: "10px 14px", borderRadius: isCustomer ? "18px 4px 18px 18px" : "4px 18px 18px 18px", fontSize: 14, lineHeight: 1.5, whiteSpace: "pre-wrap", wordBreak: "break-word", background: isCustomer ? "#3C50E0" : "#fff", color: isCustomer ? "#fff" : "#1f2937", border: isCustomer ? "none" : "1px solid #e5e7eb", boxShadow: "0 1px 2px rgba(0,0,0,0.06)" }}>
                  {msg.text}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6, justifyContent: isCustomer ? "flex-end" : "flex-start" }}>
                      {msg.attachments.map((att, i) =>
                        att.type.startsWith("image/") ? (
                          <a key={i} href={att.url} target="_blank" rel="noopener noreferrer">
                            <img src={att.url} alt={att.name} style={{ borderRadius: 8, maxHeight: 128, maxWidth: 180, objectFit: "cover", border: "1px solid rgba(255,255,255,0.3)" }} />
                          </a>
                        ) : (
                          <a key={i} href={att.url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 500, padding: "6px 10px", borderRadius: 8, background: isCustomer ? "rgba(255,255,255,0.2)" : "#f3f4f6", border: `1px solid ${isCustomer ? "rgba(255,255,255,0.3)" : "#e5e7eb"}`, color: isCustomer ? "#fff" : "#374151", textDecoration: "none" }}>
                            <FileIcon /><span style={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{att.name}</span>
                          </a>
                        )
                      )}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, flexDirection: isCustomer ? "row-reverse" : "row" }}>
                  <span style={{ fontSize: 10, color: "#9ca3af" }}>{formatTime(msg.timestamp)}</span>
                  {!isCustomer && <span style={{ fontSize: 10, color: "#9ca3af", fontWeight: 500 }}>Support</span>}
                </div>
              </div>
            </div>
          );
        })}
        {thread.status === "resolved" && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 14px", borderRadius: 12, background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#15803d", fontSize: 13, marginTop: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: 1 }}><polyline points="20 6 9 17 4 12" /></svg>
            <span>This concern has been resolved. Thank you for reaching out!</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Reply box — always pinned to bottom */}
      {thread.status === "open" ? (
        <div style={{ flexShrink: 0, borderTop: "1px solid #e5e7eb", background: "#fff", padding: "12px 16px 16px" }}>
          {pendingFiles.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
              {pendingFiles.map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "4px 8px", fontSize: 12, color: "#1d4ed8", fontWeight: 500 }}>
                  {f.type.startsWith("image/") ? <ImageFileIcon /> : <FileIcon />}
                  <span style={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
                  <button onClick={() => setPendingFiles((p) => p.filter((_, j) => j !== i))} style={{ background: "none", border: "none", cursor: "pointer", color: "#93c5fd", padding: 0, display: "flex" }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf,.doc,.docx,.txt,.zip" onChange={handleFileChange} style={{ display: "none" }} />
            <button type="button" onClick={() => fileInputRef.current?.click()} style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid #e5e7eb", background: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#6b7280", flexShrink: 0, marginBottom: 2 }} title="Attach file">
              <PaperclipIcon />
            </button>
            <div style={{ flex: 1, position: "relative" }}>
              <textarea
                ref={textareaRef}
                rows={2}
                value={reply}
                onChange={(e) => setReply(e.target.value.slice(0, REPLY_MAX))}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Reply to support… (Enter to send)"
                style={{ width: "100%", resize: "none", borderRadius: 12, border: "1px solid #e5e7eb", background: "#f9fafb", padding: "10px 14px", paddingRight: 48, fontSize: 14, outline: "none", fontFamily: "inherit", color: "#1f2937", minHeight: 60, maxHeight: 120, lineHeight: 1.5, boxSizing: "border-box" }}
              />
              <span style={{ position: "absolute", bottom: 10, right: 10, fontSize: 10, color: "#d1d5db" }}>{reply.length}/{REPLY_MAX}</span>
            </div>
            <button onClick={handleSend} disabled={!reply.trim() && pendingFiles.length === 0} style={{ width: 40, height: 40, borderRadius: 12, border: "none", background: reply.trim() || pendingFiles.length > 0 ? "#3C50E0" : "#c7d2fe", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: reply.trim() || pendingFiles.length > 0 ? "pointer" : "not-allowed", flexShrink: 0, marginBottom: 2 }}>
              <SendIcon />
            </button>
          </div>
          <p style={{ margin: "6px 0 0 2px", fontSize: 10, color: "#9ca3af" }}>
            Enter to send · Shift+Enter for new line · attach images or files
          </p>
        </div>
      ) : (
        <div style={{ flexShrink: 0, borderTop: "1px solid #e5e7eb", background: "#f9fafb", padding: "12px 16px", textAlign: "center" }}>
          <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>
            This thread is resolved.{" "}
            <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: "#3b82f6", fontWeight: 500, fontSize: 12 }}>Go back</button>
          </p>
        </div>
      )}
    </div>
  );
};

// ─── MessagesPanel ────────────────────────────────────────────────────────────

// ─── MessagesPanel ────────────────────────────────────────────────────────────

function useSiteHeaderHeight() {
  const [height, setHeight] = useState(110);
  useEffect(() => {
    function measure() {
      const marked = document.querySelector<HTMLElement>("[data-header]");
      if (marked) { setHeight(marked.getBoundingClientRect().bottom); return; }
      let max = 0;
      document.querySelectorAll<HTMLElement>("header, nav, [class*='header'], [class*='navbar']").forEach((el) => {
        const s = window.getComputedStyle(el);
        if ((s.position === "fixed" || s.position === "sticky") && el.getBoundingClientRect().top < 4) {
          max = Math.max(max, el.getBoundingClientRect().bottom);
        }
      });
      if (max > 0) setHeight(max);
    }
    measure();
    window.addEventListener("resize", measure);
    const t = setTimeout(measure, 300);
    return () => { window.removeEventListener("resize", measure); clearTimeout(t); };
  }, []);
  return height;
}

const MessagesPanel = ({ threads, initialThreadId, onClose, onSendReply }: {
  threads: StaffThread[];
  initialThreadId: number | null;
  onClose: () => void;
  onSendReply: (threadId: number, text: string, sender: MessageSender, attachments?: { name: string; url: string; type: string }[]) => void;
}) => {
  const [filter, setFilter] = useState<"All" | "Pending" | "Resolved">("All");
  const [search, setSearch] = useState("");
  const [selectedThread, setSelectedThread] = useState<StaffThread | null>(
    initialThreadId ? threads.find((t) => t.id === initialThreadId) ?? null : null
  );

  const headerHeight = useSiteHeaderHeight();

  useEffect(() => {
    if (selectedThread) {
      const updated = threads.find((t) => t.id === selectedThread.id);
      if (updated) setSelectedThread(updated);
    }
  }, [threads]);

  const filtered = threads.filter((t) => {
    const matchFilter = filter === "All" ? true : filter === "Pending" ? t.status === "open" : t.status === "resolved";
    const matchSearch = search.trim() === "" ? true :
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.messages.some((m) => m.text.toLowerCase().includes(search.toLowerCase()));
    return matchFilter && matchSearch;
  });

  const pendingCount = threads.filter((t) => t.status === "open").length;

  return (
    <>
      {/* Backdrop — sits below the site header */}
      <div
        className="fixed inset-x-0 bottom-0 bg-black/30 backdrop-blur-sm z-40"
        style={{ top: headerHeight }}
        onClick={() => { setSelectedThread(null); onClose(); }}
      />

      {/* Panel — anchored below site header, slides in from right */}
      <div
        className="fixed right-0 bottom-0 z-50 bg-white shadow-2xl flex flex-col overflow-hidden animate-slide-in-right"
        style={{ top: headerHeight, width: "min(420px, 100vw)" }}
      >

        {/* ── Thread view ── */}
        {selectedThread && (
          <ChatDetail
            thread={selectedThread}
            onBack={() => setSelectedThread(null)}
            onClose={() => { setSelectedThread(null); onClose(); }}
            onSendReply={onSendReply}
          />
        )}

        {/* ── List view ── */}
        {!selectedThread && (
          <>
            {/* Header */}
            <div style={{ height: 64, minHeight: 64, flexShrink: 0, borderBottom: "1px solid #e5e7eb", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff", padding: "0 48px" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: "#111827" }}>My Messages</p>
                  {pendingCount > 0 && (
                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 18, height: 18, padding: "0 4px", borderRadius: 999, background: "#3C50E0", color: "#fff", fontSize: 10, fontWeight: 700 }}>{pendingCount}</span>
                  )}
                </div>
                <p style={{ margin: 0, fontSize: 11, color: "#9ca3af", marginTop: 2 }}>Your submitted concerns</p>
              </div>
              <button onClick={onClose} style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", width: 32, height: 32, borderRadius: "50%", border: "none", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#9ca3af" }} aria-label="Close">
                <CloseIcon />
              </button>
            </div>

            {/* Search */}
            <div style={{ flexShrink: 0, padding: "12px 16px 10px", background: "#fff", borderBottom: "1px solid #f3f4f6" }}>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none", display: "flex" }}><SearchIcon /></span>
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search messages..." style={{ width: "100%", paddingLeft: 36, paddingRight: search ? 36 : 12, paddingTop: 8, paddingBottom: 8, borderRadius: 8, border: "1px solid #e5e7eb", background: "#f9fafb", fontSize: 14, outline: "none", color: "#1f2937", boxSizing: "border-box" }} />
                {search && <button onClick={() => setSearch("")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", display: "flex" }}><CloseIcon /></button>}
              </div>
            </div>

            {/* Filter tabs */}
            <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb", background: "#f9fafb", flexShrink: 0 }}>
              {(["All", "Pending", "Resolved"] as const).map((tab) => (
                <button key={tab} onClick={() => setFilter(tab)} style={{ position: "relative", padding: "12px 16px", fontSize: 14, fontWeight: 500, border: "none", background: "transparent", cursor: "pointer", color: filter === tab ? "#3C50E0" : "#9ca3af", borderBottom: filter === tab ? "2px solid #3C50E0" : "2px solid transparent" }}>
                  {tab}
                </button>
              ))}
            </div>

            {/* Thread list */}
            <div style={{ flex: 1, overflowY: "auto", minHeight: 0, padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
              {filtered.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 0", textAlign: "center" }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, color: "#9ca3af" }}>
                    {search ? <SearchIcon /> : <MessageIcon />}
                  </div>
                  <p style={{ color: "#9ca3af", fontSize: 14, margin: 0 }}>{search ? `No results for "${search}"` : "No messages here yet."}</p>
                  {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#3b82f6", fontSize: 12, marginTop: 8 }}>Clear search</button>}
                </div>
              ) : filtered.map((thread) => {
                const lastMsg = thread.messages[thread.messages.length - 1];
                const hasStaffReply = thread.messages.some((m) => m.sender === "staff");
                const hasBotReply = thread.messages.some((m) => m.sender === "bot");
                return (
                  <div key={thread.id} onClick={() => setSelectedThread(thread)} style={{ borderRadius: 12, border: "1px solid #e5e7eb", padding: 16, cursor: "pointer", background: thread.status === "resolved" ? "#f9fafb" : "#fff", opacity: thread.status === "resolved" ? 0.7 : 1, transition: "border-color 0.15s, background 0.15s" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                      <div style={{ position: "relative", flexShrink: 0 }}>
                        <CustomerAvatar thread={thread} size={44} />
                        <span style={{ position: "absolute", bottom: -1, right: -1, width: 12, height: 12, borderRadius: "50%", background: thread.status === "open" ? "#f59e0b" : "#10b981", border: "2px solid #fff" }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 2 }}>
                          <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{thread.name}</p>
                          <span style={{ fontSize: 11, color: "#9ca3af", flexShrink: 0 }}>{relativeTime(thread.timestamp)}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: 12, fontWeight: 500, color: "#4b5563", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 4 }}>{thread.subject}</p>
                        {lastMsg && (
                          <p style={{ margin: 0, fontSize: 12, color: "#9ca3af", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {lastMsg.sender === "staff" && <span style={{ color: "#3b82f6", fontWeight: 500 }}>Support: </span>}
                            {lastMsg.sender === "bot" && <span style={{ color: "#818cf8", fontWeight: 500 }}>AI: </span>}
                            {lastMsg.text || (lastMsg.attachments?.length ? `📎 ${lastMsg.attachments[0].name}` : "")}
                          </p>
                        )}
                        <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
                          <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, fontWeight: 600, background: thread.status === "open" ? "#fffbeb" : "#ecfdf5", color: thread.status === "open" ? "#d97706" : "#059669", border: `1px solid ${thread.status === "open" ? "#fde68a" : "#a7f3d0"}` }}>
                            {thread.status === "open" ? "Pending" : "Resolved"}
                          </span>
                          {hasStaffReply && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, fontWeight: 600, background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe" }}>Staff replied</span>}
                          {hasBotReply && !hasStaffReply && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, fontWeight: 600, background: "#eef2ff", color: "#4f46e5", border: "1px solid #c7d2fe" }}>AI replied</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div style={{ flexShrink: 0, borderTop: "1px solid #e5e7eb", padding: "16px 20px", background: "#fff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f3f4f6", marginBottom: 8 }}>
                <span style={{ fontSize: 14, color: "#6b7280" }}>Pending concerns</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#d97706" }}>{pendingCount}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", marginBottom: 12 }}>
                <span style={{ fontSize: 14, color: "#6b7280" }}>Resolved</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#059669" }}>{threads.filter((t) => t.status === "resolved").length}</span>
              </div>
              <p style={{ margin: 0, fontSize: 12, color: "#9ca3af", textAlign: "center", lineHeight: 1.6 }}>
                Our team responds within <strong style={{ color: "#374151" }}>24 hours</strong>, Mon–Sat from 9 AM.
              </p>
            </div>
          </>
        )}
      </div>
    </>
  );
};

// ─── ConcernTab ───────────────────────────────────────────────────────────────

type Props = {
  threads: StaffThread[];
  panelOpen: boolean;
  lastSubmittedThreadId: number | null;
  openCount: number;
  onConcernSubmit: (subject: string, message: string, attachments?: File[]) => void;
  onViewMessage: () => void;
  onSendReply: (threadId: number, text: string, sender?: MessageSender, attachments?: { name: string; url: string; type: string }[]) => void;
  onMarkResolved: (threadId: number) => void;
  onPanelOpen: () => void;
  onPanelClose: () => void;
  onBack?: () => void;
};

const ConcernTab = ({
  threads, panelOpen, lastSubmittedThreadId, openCount,
  onConcernSubmit, onViewMessage, onSendReply, onPanelOpen, onPanelClose,
}: Props) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [subject, setSubject] = useState("");
  const [otherSubject, setOtherSubject] = useState("");
  const [message, setMessage] = useState("");
  const [formFiles, setFormFiles] = useState<File[]>([]);
  const [submittedSubject, setSubmittedSubject] = useState("");
  const [errors, setErrors] = useState<{ subject?: string; otherSubject?: string; message?: string }>({});
  const formFileInputRef = useRef<HTMLInputElement>(null);
  const pendingSubject = useRef("");
  const pendingMessage = useRef("");
  const pendingFiles = useRef<File[]>([]);
  const isOther = subject === "Other";

  const inputClass = "rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20";
  const labelClass = "block mb-2 text-sm font-medium text-dark";
  const errorClass = "text-red text-xs mt-1.5";

  const validate = () => {
    const errs: { subject?: string; otherSubject?: string; message?: string } = {};
    if (!subject) errs.subject = "Please select a concern type.";
    if (subject === "Other" && !otherSubject.trim()) errs.otherSubject = "Please specify your concern type.";
    if (!message.trim()) errs.message = "Please describe your concern.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const finalSubject = subject === "Other" ? `Other: ${otherSubject.trim()}` : subject;
    pendingSubject.current = finalSubject;
    pendingMessage.current = message;
    pendingFiles.current = formFiles;
    setShowPreviewModal(true);
  };

  const handleConfirmSubmit = () => {
    setShowPreviewModal(false);
    setSubmittedSubject(pendingSubject.current);
    onConcernSubmit(pendingSubject.current, pendingMessage.current, pendingFiles.current);
    setShowConfirm(true);
    setSubject(""); setOtherSubject(""); setMessage(""); setFormFiles([]); setErrors({});
  };

  const handleViewMessage = () => {
    setShowConfirm(false);
    onViewMessage();
    onPanelOpen();
  };

  return (
    <>
      {showPreviewModal && (
        <PreSubmitModal
          subject={pendingSubject.current}
          message={pendingMessage.current}
          attachments={pendingFiles.current}
          onConfirm={handleConfirmSubmit}
          onEdit={() => setShowPreviewModal(false)}
        />
      )}

      <div className="flex flex-col xl:flex-row gap-7.5">
        {/* Left: Contact Info + AI Notice */}
        <div className="xl:max-w-[370px] w-full flex flex-col gap-6">
          <div className="bg-white rounded-xl shadow-1">
            <div className="py-5 px-4 sm:px-7.5 border-b border-gray-3">
              <p className="font-medium text-xl text-dark">Contact Information</p>
            </div>
            <div className="p-4 sm:p-7.5 flex flex-col gap-4">
              <p className="flex items-start gap-3.5 text-sm text-dark">
                <svg className="mt-0.5 shrink-0" width="20" height="20" viewBox="0 0 22 22" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M9.11365 2.97913H12.8837C14.5684 2.97911 15.9027 2.9791 16.947 3.1195C18.0217 3.26399 18.8916 3.56843 19.5776 4.25443C20.2636 4.94043 20.568 5.8103 20.7125 6.88502C20.8529 7.9293 20.8529 9.26363 20.8529 10.9482V11.0517C20.8529 12.7363 20.8529 14.0706 20.7125 15.1149C20.568 16.1896 20.2636 17.0595 19.5776 17.7455C18.8916 18.4315 18.0217 18.7359 16.947 18.8804C15.9027 19.0208 14.5684 19.0208 12.8837 19.0208H9.11366C7.42904 19.0208 6.09471 19.0208 5.05043 18.8804C3.97571 18.7359 3.10584 18.4315 2.41984 17.7455C1.73384 17.0595 1.4294 16.1896 1.28491 15.1149C1.14451 14.0706 1.14452 12.7363 1.14453 11.0517V10.9482C1.14452 9.26363 1.14451 7.9293 1.28491 6.88502C1.4294 5.8103 1.73384 4.94043 2.41984 4.25443C3.10584 3.56843 3.97571 3.26399 5.05043 3.1195C6.09471 2.9791 7.42904 2.97911 9.11365 2.97913Z" fill="#3C50E0" /></svg>
                <a href="mailto:brenraphaelube@gmail.com" className="hover:text-blue duration-150">brenraphaelube@gmail.com</a>
              </p>
              <div className="flex items-start gap-3.5 text-sm text-dark">
                <svg className="mt-0.5 shrink-0" width="20" height="20" viewBox="0 0 22 22" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M4.59146 4.03966C6.13153 2.4996 8.73041 2.61667 9.80274 4.53812L10.3977 5.60414C11.0979 6.85889 10.7995 8.44205 9.77441 9.47969C9.76075 9.49839 9.6884 9.60375 9.67938 9.78783C9.66788 10.0228 9.75133 10.5662 10.5932 11.4081C11.4348 12.2497 11.9781 12.3333 12.2132 12.3219C12.3974 12.3129 12.5029 12.2405 12.5216 12.2269C13.5592 11.2018 15.1424 10.9034 16.3971 11.6036L17.4632 12.1985C19.3846 13.2709 19.5017 15.8698 17.9616 17.4098C17.1378 18.2336 16.0425 18.9655 14.7553 19.0143C12.8478 19.0867 9.6805 18.594 6.54387 15.4574C3.40724 12.3208 2.91463 9.15348 2.98694 7.24596C3.03574 5.95877 3.76769 4.86343 4.59146 4.03966Z" fill="#3C50E0" /></svg>
                <div className="flex flex-col gap-0.5">
                  <a href="tel:+639543366829" className="hover:text-blue duration-150">0954 336 6829</a>
                  <a href="tel:+639622430388" className="hover:text-blue duration-150">0962 243 0388</a>
                </div>
              </div>
              <p className="flex items-start gap-3.5 text-sm text-dark">
                <svg className="mt-0.5 shrink-0" width="20" height="20" viewBox="0 0 22 22" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M3.89453 7.80506C3.89453 4.08157 7.12254 1.14581 10.9987 1.14581C14.8749 1.14581 18.1029 4.08157 18.1029 7.80506C18.1029 11.2986 15.9369 15.4 12.4423 16.8934C11.5248 17.2855 10.4726 17.2855 9.55514 16.8934C6.06051 15.4 3.89453 11.2986 3.89453 7.80506Z" fill="#3C50E0" /></svg>
                Block 14 Lot 1A, Marigman St., San Roque, Antipolo, 1870 Rizal
              </p>
              <p className="flex items-start gap-3.5 text-sm text-dark">
                <svg className="mt-0.5 shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3C50E0" strokeWidth="1.8"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                Opens at <span className="font-semibold ml-1">9:00 AM</span>
              </p>
              <div className="flex items-center gap-3 pt-1 flex-wrap">
                <a href="https://www.instagram.com/brenraphaelsubejamhalaya" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-dark font-medium hover:text-blue duration-150 border border-gray-3 rounded-md px-3 py-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="2" width="20" height="20" rx="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
                  Instagram
                </a>
                <a href="https://www.facebook.com/p/Bren-Raphaels-Ube-Jam-Halaya-61569613527256/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-dark font-medium hover:text-blue duration-150 border border-gray-3 rounded-md px-3 py-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
                  Facebook
                </a>
                <a href="https://www.tiktok.com/@bren.raphaels.ube" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-dark font-medium hover:text-blue duration-150 border border-gray-3 rounded-md px-3 py-1.5">
                  <TikTokIcon /> TikTok
                </a>
              </div>
            </div>
          </div>

          {/* AI Notice */}
          <div className="bg-white rounded-xl shadow-1 p-5 sm:p-6">
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: "#EEF0FD" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3C50E0" strokeWidth="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
              </div>
              <div>
                <p className="font-medium text-dark text-sm">AI Assistant Available</p>
                <p className="text-dark-5 text-sm mt-1 leading-relaxed">If our staff is unavailable, our AI chatbot will assist you right away.</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-dark-5 border-t border-gray-3 pt-4">
              <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
              AI support is available 24/7, even outside business hours.
            </div>
          </div>
        </div>

        {/* Right: Form / Confirmation */}
        <div className="flex-1 bg-white rounded-xl shadow-1 flex flex-col">
          <div className="py-5 px-4 sm:px-7.5 border-b border-gray-3 shrink-0">
            <p className="font-medium text-xl text-dark">Submit Your Concern</p>
            <p className="text-sm text-dark-5 mt-1">{showConfirm ? "Your concern has been received." : "Fill out the form below and our support team will respond promptly."}</p>
          </div>

          {showConfirm ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12 text-center animate-fade-in">
              <div className="relative w-24 h-24 mb-6">
                <svg className="absolute inset-0" viewBox="0 0 96 96" fill="none">
                  <circle cx="48" cy="48" r="42" stroke="#22c55e" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="264" strokeDashoffset="264" style={{ animation: "dash-in 0.65s ease-out forwards 0.1s" }} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center" style={{ animation: "fade-in-scale 0.3s ease-out forwards 0.6s", opacity: 0 }}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-dark mb-2">Concern Submitted!</h3>
              {submittedSubject && (
                <div className="inline-flex items-center gap-2 mt-1 mb-5 px-4 py-2 rounded-full border border-gray-200 bg-gray-50">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3C50E0" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                  <span className="text-sm font-medium text-gray-700">{submittedSubject}</span>
                </div>
              )}
              <p className="text-sm text-dark-5 leading-relaxed max-w-sm mb-8">Our support team will review your message and get back to you within <span className="font-semibold text-dark">24 hours</span>. You can track it in Messages.</p>
              <div className="w-full max-w-xs mb-8 px-5 py-4 rounded-xl bg-blue-50 border border-blue-100 flex items-center gap-3 text-left">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "#EEF0FD" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3C50E0" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-blue-800">Expected response</p>
                  <p className="text-xs text-blue-600 mt-0.5">Within 24 hours · Mon–Sat, 9 AM onwards</p>
                </div>
              </div>
              <div className="flex flex-col w-full max-w-xs gap-3">
                <button onClick={handleViewMessage} className="w-full inline-flex items-center justify-center gap-2 font-medium text-white py-3 px-6 rounded-xl text-sm hover:opacity-90 transition-opacity" style={{ background: "#3C50E0" }}>
                  <MessageIcon /> View My Message
                </button>
                <button onClick={() => setShowConfirm(false)} className="w-full text-sm text-dark-5 hover:text-dark font-medium py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">Submit Another Concern</button>
              </div>
            </div>
          ) : (
            <div className="p-4 sm:p-7.5 xl:p-10">
              <form onSubmit={handleRequestSubmit} noValidate className="flex flex-col gap-5">
                <div>
                  <label className={labelClass}>Type of Concern <span className="text-red">*</span></label>
                  <div className="relative">
                    <select value={subject} onChange={(e) => { setSubject(e.target.value); setOtherSubject(""); setErrors((p) => ({ ...p, subject: undefined, otherSubject: undefined })); }} className={`rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 appearance-none cursor-pointer ${!subject ? "text-dark-5" : "text-dark"}`}>
                      {CONCERN_TYPES.map((opt) => (<option key={opt.value} value={opt.value} disabled={opt.value === ""}>{opt.label}</option>))}
                    </select>
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-dark-5"><ChevronDownIcon /></span>
                  </div>
                  {errors.subject && <p className={errorClass}>⚠ {errors.subject}</p>}
                </div>
                {isOther && (
                  <div className="animate-fade-in">
                    <label className={labelClass}>Please specify <span className="text-red">*</span></label>
                    <input type="text" placeholder="Describe your concern type..." value={otherSubject} maxLength={80} onChange={(e) => { setOtherSubject(e.target.value); setErrors((p) => ({ ...p, otherSubject: undefined })); }} className={inputClass} />
                    {errors.otherSubject && <p className={errorClass}>⚠ {errors.otherSubject}</p>}
                  </div>
                )}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-dark">Describe Your Concern <span className="text-red">*</span></label>
                    <CharCounter value={message} max={MESSAGE_MAX} />
                  </div>
                  <textarea rows={6} placeholder="Please provide as much detail as possible..." value={message} maxLength={MESSAGE_MAX} onChange={(e) => { setMessage(e.target.value); setErrors((p) => ({ ...p, message: undefined })); }} className={`${inputClass} resize-none`} />
                  {errors.message && <p className={errorClass}>⚠ {errors.message}</p>}
                </div>
                <div>
                  <label className={labelClass}>Attachments <span className="text-dark-5 font-normal text-xs">(optional · up to 5 files)</span></label>
                  <input ref={formFileInputRef} type="file" multiple accept="image/*,.pdf,.doc,.docx,.txt,.zip" onChange={(e) => { const files = Array.from(e.target.files ?? []); setFormFiles((prev) => [...prev, ...files].slice(0, 5)); e.target.value = ""; }} className="hidden" />
                  <button type="button" onClick={() => formFileInputRef.current?.click()} className="flex items-center gap-2.5 w-full rounded-md border border-dashed border-gray-3 bg-gray-1 py-3 px-5 text-sm text-dark-5 hover:border-blue/50 hover:text-dark hover:bg-blue-50/30 transition-all duration-200 cursor-pointer">
                    <PaperclipIcon />
                    <span>Click to attach images or files</span>
                    <span className="ml-auto text-xs text-dark-5">JPG, PNG, PDF, DOC…</span>
                  </button>
                  {formFiles.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {formFiles.map((f, i) => (
                        <div key={i} className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 rounded-lg px-2.5 py-1.5 text-xs text-blue-700 font-medium max-w-[200px]">
                          {f.type.startsWith("image/") ? <ImageFileIcon /> : <FileIcon />}
                          <span className="truncate flex-1">{f.name}</span>
                          <span className="text-blue-400 shrink-0 tabular-nums">{formatBytes(f.size)}</span>
                          <button type="button" onClick={() => setFormFiles((prev) => prev.filter((_, j) => j !== i))} className="text-blue-400 hover:text-blue-700 shrink-0 ml-0.5">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="pt-1">
                  <button type="submit" className="inline-flex items-center gap-2 font-medium text-white py-3 px-7 rounded-md hover:opacity-90 transition-opacity" style={{ background: "#3C50E0" }}>
                    <SendIcon /> Review & Send
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {panelOpen && (
        <MessagesPanel
          threads={threads}
          initialThreadId={lastSubmittedThreadId}
          onClose={onPanelClose}
          onSendReply={onSendReply}
        />
      )}

      <style>{`
        @keyframes slide-in-right { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes fade-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        @keyframes modal-in { from { opacity: 0; transform: scale(0.94) translateY(12px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .animate-modal-in { animation: modal-in 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes dash-in { from { stroke-dashoffset: 264; } to { stroke-dashoffset: 0; } }
        @keyframes fade-in-scale { from { opacity: 0; transform: scale(0.6); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </>
  );
};

export default ConcernTab;