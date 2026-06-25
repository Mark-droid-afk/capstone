"use client";

import React, { useRef, useEffect } from "react";

type ChatInputProps = {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  sending: boolean;
  disabled?: boolean;
  disabledReason?: string;
};

const ChatInput = ({
  value,
  onChange,
  onSend,
  sending,
  disabled = false,
  disabledReason,
}: ChatInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && !sending && value.trim()) {
        onSend();
      }
    }
  };

  if (disabled) {
    return (
      <div className="px-4 sm:px-6 py-4 border-t border-gray-3 bg-gray-1 text-center shrink-0">
        <p className="text-custom-sm text-dark-4 italic">
          {disabledReason ?? "This conversation is closed."}
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 py-3 border-t border-gray-3 bg-white shrink-0">
      <div className="flex items-end gap-3">
        <textarea
          ref={textareaRef}
          id="chat-message-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
          rows={1}
          maxLength={2000}
          className="flex-1 resize-none rounded-xl border border-gray-3 bg-gray-1 placeholder:text-dark-5 text-dark text-custom-sm py-2.5 px-4 outline-none duration-200 focus:border-transparent focus:ring-2 focus:ring-blue/20 max-h-[140px] overflow-y-auto"
        />
        <button
          id="chat-send"
          onClick={onSend}
          disabled={sending || !value.trim()}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-blue text-white hover:bg-blue-dark ease-out duration-200 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Send message"
        >
          {sending ? (
            <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </div>
      <p className="text-[11px] text-dark-5 mt-1 text-right">
        {value.length}/2000
      </p>
    </div>
  );
};

export default ChatInput;
