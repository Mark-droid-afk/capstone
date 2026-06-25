"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ticketsApi } from "@/lib/api/ticket";
import type { Ticket } from "@/types/ticket";
import TicketCard from "@/components/tickets/ticket-card";
import TicketDetailModal from "@/components/tickets/ticket-detail-drawer";
import { toast } from "sonner";

type TabKey = "available" | "claimed" | "resolved";

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: "available", label: "Available", icon: "ti-ticket" },
  { key: "claimed", label: "Claimed", icon: "ti-clipboard-check" },
  { key: "resolved", label: "Completed", icon: "ti-circle-check" },
];

const PAGE_SIZE = 12;

export default function TicketsPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabKey>("available");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Ticket | null>(null);

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── fetch ── */
  const fetchTickets = useCallback(
    async (tab: TabKey, pg: number, q: string, silent = false) => {
      if (!silent) setLoading(true);
      try {
        let res;
        if (tab === "available") {
          res = await ticketsApi.getAvailable({
            page: pg,
            pageSize: PAGE_SIZE,
            search: q || undefined,
          });
        } else if (tab === "claimed") {
          res = await ticketsApi.getClaimed({ page: pg, pageSize: PAGE_SIZE });
        } else {
          res = await ticketsApi.getResolved({ page: pg, pageSize: PAGE_SIZE });
        }
        setTickets(res.data.data ?? []);
        setTotal(res.data.total ?? 0);
      } catch {
        setTickets([]);
        setTotal(0);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchTickets(activeTab, page, search, false);
    const interval = setInterval(() => {
      fetchTickets(activeTab, page, search, true);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeTab, page, search, fetchTickets]);

  useEffect(() => {
    if (!selected?.id) return;
    const interval = setInterval(async () => {
      try {
        const res = await ticketsApi.getById(selected.id);
        setSelected((current) => {
          if (!current || current.id !== res.data.id) return current;
          if (
            current.status !== res.data.status ||
            current.priority !== res.data.priority ||
            current.updatedAt !== res.data.updatedAt
          ) {
            return res.data;
          }
          return current;
        });
      } catch {}
    }, 5000);
    return () => clearInterval(interval);
  }, [selected?.id]);

  /* ── tab switch ── */
  const switchTab = (tab: TabKey) => {
    setActiveTab(tab);
    setPage(1);
    setSearch("");
    setSelected(null);
  };

  /* ── search debounce ── */
  const handleSearch = (v: string) => {
    setSearch(v);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setPage(1);
    }, 400);
  };

  /* ── open detail ── */
  const handleOpen = async (ticket: Ticket) => {
    try {
      const res = await ticketsApi.getById(ticket.id);
      setSelected(res.data);
    } catch {
      setSelected(ticket);
    }
  };

  /* ── claim ── */
  const handleClaim = async (id: string) => {
    setActionId(id);
    try {
      await ticketsApi.claim(id);
      await fetchTickets(activeTab, page, search);
      toast.success("Ticket claimed successfully");
      setSelected(null);
    } catch (error) {
      toast.error("Failed to claim ticket");
    } finally {
      setActionId(null);
    }
  };

  /* ── unclaim ── */
  const handleUnclaim = async (id: string) => {
    setActionId(id);
    try {
      await ticketsApi.unclaim(id);
      await fetchTickets(activeTab, page, search);
      toast.success("Ticket unclaimed successfully");
      setSelected(null);
    } catch (error) {
      toast.error("Failed to unclaim ticket");
    } finally {
      setActionId(null);
    }
  };

  /* ── resolve ── */
  const handleResolve = async (id: string) => {
    setActionId(id);
    try {
      await ticketsApi.resolve(id);
      await fetchTickets(activeTab, page, search);
      toast.success("Ticket resolved successfully");
      setSelected(null);
    } catch (error) {
      toast.error("Failed to resolve ticket");
    } finally {
      setActionId(null);
    }
  };

  /* ── message ── */
  const handleMessage = (conversationId: string) => {
    router.push(`/conversation/${conversationId}`);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-title-sm font-semibold text-gray-900">Tickets</h1>
          <p className="text-theme-sm text-gray-500 mt-0.5">
            {total} total tickets
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => switchTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-theme-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === t.key
                ? "border-brand-500 text-brand-500"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <i className={`ti ${t.icon} text-base`} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Filters row */}
      <div className="flex items-center justify-between gap-3">
        {activeTab === "available" && (
          <div className="relative">
            <i className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-theme-sm border border-gray-200 rounded-lg bg-white text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 w-64"
            />
          </div>
        )}
        <div className="ml-auto">
          <button
            onClick={() => fetchTickets(activeTab, page, search)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 text-theme-sm font-medium border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            <i
              className={`ti ti-refresh text-base ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400 text-theme-sm">
          <i className="ti ti-loader-2 animate-spin text-xl mr-2" /> Loading...
        </div>
      ) : tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <i
            className={`ti ${
              activeTab === "available"
                ? "ti-ticket-off"
                : activeTab === "claimed"
                  ? "ti-clipboard-x"
                  : "ti-checks"
            } text-4xl text-gray-300 mb-3`}
          />
          <p className="text-theme-sm font-medium text-gray-500 mb-1">
            {activeTab === "available"
              ? "No available tickets"
              : activeTab === "claimed"
                ? "No claimed tickets"
                : "No completed tickets"}
          </p>
          <p className="text-theme-xs text-gray-400">
            {activeTab === "available"
              ? "All tickets have been claimed. Check back later."
              : activeTab === "claimed"
                ? "Claim a ticket from the Available tab to get started."
                : "Tickets you resolve will appear here."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {tickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onClick={handleOpen}
              onClaim={activeTab === "available" ? handleClaim : undefined}
              onUnclaim={activeTab === "claimed" ? handleUnclaim : undefined}
              onResolve={activeTab === "claimed" ? handleResolve : undefined}
              onMessage={handleMessage}
              loading={actionId === ticket.id}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && !loading && (
        <div className="flex items-center justify-between pt-1">
          <p className="text-theme-sm text-gray-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 text-theme-sm font-medium border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <i className="ti ti-chevron-left" /> Previous
            </button>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 text-theme-sm font-medium border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next <i className="ti ti-chevron-right" />
            </button>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <TicketDetailModal
          ticket={selected}
          onClose={() => setSelected(null)}
          onClaim={activeTab === "available" ? handleClaim : undefined}
          onUnclaim={activeTab === "claimed" ? handleUnclaim : undefined}
          onResolve={activeTab === "claimed" ? handleResolve : undefined}
          onMessage={handleMessage}
          loading={actionId === selected.id}
        />
      )}
    </div>
  );
}
