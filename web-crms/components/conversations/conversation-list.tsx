"use client";

import { useCallback, useEffect, useState } from "react";
import { conversationsApi } from "@/lib/api/conversation";
import type { Conversation } from "@/types/conversation";
import ConversationItem from "./conversation-item";

type TabKey = "all" | "unread" | "read";

const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "read", label: "Read" },
];

const PAGE_SIZE = 20;

interface Props {
  selectedId: string | null;
  onSelect: (c: Conversation) => void;
  onMarkRead: (id: string) => void;
  onMarkUnread: (id: string) => void;
  refreshKey: number;
}

export default function ConversationList({
  selectedId,
  onSelect,
  onMarkRead,
  onMarkUnread,
  refreshKey,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchList = useCallback(async (tab: TabKey, pg: number) => {
    setLoading(true);
    try {
      let res;
      if (tab === "unread")
        res = await conversationsApi.getUnread({
          page: pg,
          pageSize: PAGE_SIZE,
        });
      else if (tab === "read")
        res = await conversationsApi.getRead({ page: pg, pageSize: PAGE_SIZE });
      else
        res = await conversationsApi.getAll({ page: pg, pageSize: PAGE_SIZE });

      let data: Conversation[] = res.data.data ?? [];
      let total = res.data.total ?? 0;

      if (tab == "read") {
        data = data.filter(
          (c) =>
            c.ticketStatus !== "resolved" &&
            c.ticketStatus !== "available" &&
            c.ticketStatus !== "cancelled" &&
            c.isRead === false,
        );
        total = data.length;
      }
      if (tab == "unread") {
        data = data.filter(
          (c) =>
            c.ticketStatus !== "resolved" &&
            c.ticketStatus !== "available" &&
            c.ticketStatus !== "cancelled" &&
            c.isRead === true,
        );
        total = data.length;
      }
      if (tab === "all") {
        data = data.filter(
          (c) =>
            c.ticketStatus !== "resolved" && c.ticketStatus !== "available",
        );
        total = data.length;
      }

      setConversations(data);
      setTotal(total);
    } catch {
      setConversations([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList(activeTab, page);
  }, [activeTab, page, fetchList, refreshKey]);

  const switchTab = (tab: TabKey) => {
    setActiveTab(tab);
    setPage(1);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="flex flex-col h-full">
      {/* Search placeholder */}
      <div className="px-3 pt-3 pb-2 shrink-0">
        <div className="relative">
          <i className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            readOnly
            placeholder="Search conversations…"
            className="w-full pl-8 pr-3 py-1.5 text-theme-xs border border-gray-200 rounded-lg bg-gray-50 text-gray-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 px-3 shrink-0">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => switchTab(t.key)}
            className={`px-3 py-2.5 text-theme-xs font-medium border-b-2 transition-colors -mb-px ${
              activeTab === t.key
                ? "border-brand-500 text-brand-500"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-gray-400 text-theme-sm">
            <i className="ti ti-loader-2 animate-spin text-lg mr-2" />{" "}
            Loading...
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <i className="ti ti-message-off text-3xl text-gray-300 mb-2" />
            <p className="text-theme-xs text-gray-400">
              No conversations here.
            </p>
          </div>
        ) : (
          conversations.map((c) => (
            <ConversationItem
              key={c.id}
              conversation={c}
              isSelected={selectedId === c.id}
              onClick={onSelect}
              onMarkRead={onMarkRead}
              onMarkUnread={onMarkUnread}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && !loading && (
        <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100 shrink-0">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="text-theme-xs text-gray-500 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <i className="ti ti-chevron-left text-xs" /> Prev
          </button>
          <span className="text-theme-xs text-gray-400">
            {page} / {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="text-theme-xs text-gray-500 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
          >
            Next <i className="ti ti-chevron-right text-xs" />
          </button>
        </div>
      )}
    </div>
  );
}
