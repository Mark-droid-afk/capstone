"use client";

import { useRef, useState } from "react";

interface Props {
  onSend: (content: string) => Promise<void>;
  disabled?: boolean;
}

export default function MessageInput({ onSend, disabled = false }: Props) {
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = async () => {
    const content = value.trim();
    if (!content || sending) return;
    setSending(true);
    try {
      await onSend(content);
      setValue("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.focus();
      }
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 128) + "px";
  };

  return (
    <div className="flex items-end gap-2 px-4 py-3 border-t border-gray-200 shrink-0 bg-white">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        disabled={disabled || sending}
        placeholder="Type a message… (Enter to send, Shift+Enter for newline)"
        rows={1}
        className="flex-1 resize-none px-3 py-2 text-theme-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 disabled:opacity-50 overflow-y-auto custom-scrollbar"
      />
      <button
        onClick={handleSend}
        disabled={!value.trim() || sending || disabled}
        className="flex items-center justify-center w-9 h-9 rounded-xl bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
      >
        {sending ? (
          <i className="ti ti-loader-2 animate-spin text-sm" />
        ) : (
          <i className="ti ti-send text-sm" />
        )}
      </button>
    </div>
  );
}
