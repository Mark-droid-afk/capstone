"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/Common/Breadcrumb";
import { useAuth } from "@/context/AuthContext";
import { Ticket, TicketStatus } from "@/types/ticket";
import {
  cancelTicket,
  createTicket,
  getTicketsByStatus,
} from "@/services/ticket.service";
import { CreateTicketPayload } from "@/types/ticket";
import TicketCard from "./TicketCard";
import TicketDetailModal from "./TicketDetailModal";
import CreateTicketModal from "./CreateTicketModal";
import { toast } from "sonner";

// ─── Types ───────────────────────────────────────────────────────────────────

type Tab = {
  key: TicketStatus;
  label: string;
  color: string;
  activeColor: string;
};

// ─── Constants ───────────────────────────────────────────────────────────────

const TABS: Tab[] = [
  {
    key: "Pending",
    label: "Pending",
    color: "text-yellow",
    activeColor: "border-yellow text-yellow",
  },
  {
    key: "Ongoing",
    label: "Ongoing",
    color: "text-blue",
    activeColor: "border-blue text-blue",
  },
  {
    key: "Completed",
    label: "Completed",
    color: "text-green",
    activeColor: "border-green text-green",
  },
  {
    key: "Cancelled",
    label: "Cancelled",
    color: "text-dark-4",
    activeColor: "border-dark-4 text-dark-4",
  },
];

// ─── Skeleton loader ──────────────────────────────────────────────────────────

const TicketSkeleton = () => (
  <div className="flex flex-col gap-3 px-7.5 py-5">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="flex items-center justify-between border-t border-gray-3 pt-4 animate-pulse"
      >
        <div className="flex flex-col gap-2 flex-1">
          <div className="flex gap-2">
            <div className="h-5 w-16 bg-gray-3 rounded-full" />
            <div className="h-5 w-16 bg-gray-3 rounded-full" />
          </div>
          <div className="h-4 w-64 bg-gray-3 rounded" />
          <div className="h-3 w-32 bg-gray-3 rounded" />
        </div>
        <div className="flex gap-2 shrink-0">
          <div className="h-8 w-20 bg-gray-3 rounded-md" />
          <div className="h-8 w-16 bg-gray-3 rounded-md" />
        </div>
      </div>
    ))}
  </div>
);

// ─── Confirm cancel dialog ────────────────────────────────────────────────────

type ConfirmCancelProps = {
  ticket: Ticket;
  onConfirm: () => void;
  onDismiss: () => void;
  isCancelling: boolean;
};

const ConfirmCancelBanner = ({
  ticket,
  onConfirm,
  onDismiss,
  isCancelling,
}: ConfirmCancelProps) => (
  <div className="mx-4 sm:mx-7.5 my-3 p-4 bg-red-light-6 border border-red/20 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
    <div>
      <p className="text-custom-sm font-medium text-dark">
        Cancel this ticket?
      </p>
      <p className="text-custom-xs text-dark-4 mt-0.5 truncate max-w-[320px]">
        &ldquo;{ticket.title}&rdquo;
      </p>
    </div>
    <div className="flex gap-2 shrink-0">
      <button
        onClick={onDismiss}
        className="font-medium text-custom-xs py-2 px-4 rounded-md border border-gray-3 text-dark-2 hover:border-dark ease-out duration-200"
      >
        Keep
      </button>
      <button
        onClick={onConfirm}
        disabled={isCancelling}
        className="inline-flex items-center gap-1.5 font-medium text-custom-xs py-2 px-4 rounded-md bg-red text-white hover:bg-red/90 ease-out duration-200 disabled:opacity-60"
      >
        {isCancelling && (
          <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {isCancelling ? "Cancelling..." : "Yes, Cancel"}
      </button>
    </div>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────

const Concerns = () => {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Tab state
  const [activeTab, setActiveTab] = useState<TicketStatus>("Pending");

  // Ticket data per tab (lazy-loaded on first visit)
  const [tabData, setTabData] = useState<
    Record<TicketStatus, { tickets: Ticket[]; loaded: boolean; error: string | null }>
  >({
    Pending: { tickets: [], loaded: false, error: null },
    Ongoing: { tickets: [], loaded: false, error: null },
    Completed: { tickets: [], loaded: false, error: null },
    Cancelled: { tickets: [], loaded: false, error: null },
  });
  const [tabLoading, setTabLoading] = useState(false);

  // Modal state
  const [detailTicket, setDetailTicket] = useState<Ticket | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  // Cancel confirmation
  const [cancelTarget, setCancelTarget] = useState<Ticket | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Auth guard
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/signin");
    }
  }, [user, isLoading, router]);

  // Keep tabData in a ref to avoid loadTab changing on every tabData update
  const tabDataRef = useRef(tabData);
  useEffect(() => {
    tabDataRef.current = tabData;
  }, [tabData]);

  // Load tab data when tab changes or periodically in the background
  const loadTab = useCallback(
    async (status: TicketStatus, isSilent = false) => {
      if (!isSilent && tabDataRef.current[status].loaded) return;
      if (!isSilent) {
        setTabLoading(true);
      }
      try {
        const tickets = await getTicketsByStatus(status);
        setTabData((prev) => ({
          ...prev,
          [status]: { tickets, loaded: true, error: null },
        }));
      } catch {
        if (!isSilent) {
          setTabData((prev) => ({
            ...prev,
            [status]: {
              tickets: [],
              loaded: true,
              error: "Failed to load tickets. Please try again.",
            },
          }));
        }
      } finally {
        if (!isSilent) {
          setTabLoading(false);
        }
      }
    },
    []
  );

  // Poll tickets for the active tab every 5 seconds for real-time updates
  useEffect(() => {
    if (isLoading || !user) return;

    // Load initial data
    loadTab(activeTab);

    const interval = setInterval(() => {
      loadTab(activeTab, true);
    }, 5000);

    return () => clearInterval(interval);
  }, [activeTab, isLoading, user, loadTab]);

  const handleTabChange = (tab: TicketStatus) => {
    setCancelTarget(null);
    setActiveTab(tab);
  };

  // ── Actions ────────────────────────────────────────────────────────────────

  const handleView = (ticket: Ticket) => {
    setDetailTicket(ticket);
    setShowDetail(true);
  };

  const handleCancelRequest = (ticket: Ticket) => {
    setCancelTarget(ticket);
  };

  const handleCancelConfirm = async () => {
    if (!cancelTarget) return;
    setIsCancelling(true);
    try {
      await cancelTicket(cancelTarget.id);
      // Optimistically remove from Pending, mark Cancelled tab as stale
      setTabData((prev) => ({
        ...prev,
        Pending: {
          ...prev.Pending,
          tickets: prev.Pending.tickets.filter((t) => t.id !== cancelTarget.id),
        },
        Cancelled: { tickets: [], loaded: false, error: null }, // force reload
      }));
      toast.success("Ticket cancelled successfully");
    } catch (err: any) {
      toast.error("Failed to cancel ticket. Please try again.");
    } finally {
      setIsCancelling(false);
      setCancelTarget(null);
    }
  };

  const handleMessage = (ticket: Ticket) => {
    router.push(`/conversation/${ticket.id}`);
  };

  const handleCreateSubmit = async (payload: CreateTicketPayload) => {
    const created = await createTicket(payload);
    // Prepend to Pending list
    setTabData((prev) => ({
      ...prev,
      Pending: {
        ...prev.Pending,
        tickets: [created, ...prev.Pending.tickets],
      },
    }));
    // Switch to Pending tab automatically to show the new ticket
    setActiveTab("Pending");
  };

  // ── Render guards ──────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <main>
        <Breadcrumb title="My Concerns" pages={["concerns"]} />
        <section className="py-20 bg-gray-2">
          <div className="max-w-[870px] w-full mx-auto px-4 sm:px-8 xl:px-0">
            <div className="bg-white rounded-xl shadow-1">
              <TicketSkeleton />
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (!user) return null;

  const currentData = tabData[activeTab];

  return (
    <>
      <Breadcrumb title="My Concerns" pages={["concerns"]} />

      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[870px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          {/* Page header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="font-semibold text-dark text-xl sm:text-2xl">
                Support Tickets
              </h2>
              <p className="text-custom-sm text-dark-4 mt-1">
                Track and manage your concerns, inquiries, and requests.
              </p>
            </div>
            <button
              id="open-create-ticket"
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 font-medium text-white bg-blue py-2.5 px-5 rounded-md ease-out duration-200 hover:bg-blue-dark shrink-0"
            >
              <svg
                className="fill-current"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 5v14M5 12h14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              Raise a Concern
            </button>
          </div>

          {/* Card */}
          <div className="bg-white rounded-xl shadow-1">
            {/* ── Tab bar ── */}
            <div className="flex border-b border-gray-3 overflow-x-auto no-scrollbar">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.key;
                const count = tabData[tab.key].loaded
                  ? tabData[tab.key].tickets.length
                  : null;

                return (
                  <button
                    key={tab.key}
                    id={`tab-${tab.key.toLowerCase()}`}
                    onClick={() => handleTabChange(tab.key)}
                    className={`relative flex items-center gap-1.5 py-4 px-5 sm:px-7 text-custom-sm font-medium whitespace-nowrap ease-out duration-200 border-b-2 ${
                      isActive
                        ? `${tab.activeColor} bg-white`
                        : "border-transparent text-dark-4 hover:text-dark"
                    }`}
                  >
                    {tab.label}
                    {count !== null && count > 0 && (
                      <span
                        className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                          isActive
                            ? `bg-blue/10 text-blue`
                            : "bg-gray-2 text-dark-4"
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* ── Cancel confirmation banner ── */}
            {cancelTarget && (
              <ConfirmCancelBanner
                ticket={cancelTarget}
                onConfirm={handleCancelConfirm}
                onDismiss={() => setCancelTarget(null)}
                isCancelling={isCancelling}
              />
            )}

            {/* ── Tab content ── */}
            {tabLoading && !currentData.loaded ? (
              <TicketSkeleton />
            ) : currentData.error ? (
              <div className="py-10 px-7.5 text-center">
                <p className="text-red text-custom-sm">{currentData.error}</p>
                <button
                  onClick={() => {
                    setTabData((prev) => ({
                      ...prev,
                      [activeTab]: { tickets: [], loaded: false, error: null },
                    }));
                  }}
                  className="mt-3 text-custom-sm text-blue hover:underline"
                >
                  Retry
                </button>
              </div>
            ) : currentData.tickets.length === 0 ? (
              <div className="py-16 px-7.5 flex flex-col items-center text-center">
                <svg
                  className="text-gray-3 mb-4"
                  width="56"
                  height="56"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 12h6M9 16h4M5 8h14M7 4h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="font-medium text-dark">
                  No {activeTab.toLowerCase()} tickets
                </p>
                <p className="text-custom-sm text-dark-4 mt-1 max-w-xs">
                  {activeTab === "Pending"
                    ? "You have no pending tickets. Click \"Raise a Concern\" to create one."
                    : `You have no ${activeTab.toLowerCase()} tickets at the moment.`}
                </p>
                {activeTab === "Pending" && (
                  <button
                    onClick={() => setShowCreate(true)}
                    className="mt-4 inline-flex items-center gap-2 font-medium text-white bg-blue py-2.5 px-5 rounded-md ease-out duration-200 hover:bg-blue-dark text-custom-sm"
                  >
                    Raise a Concern
                  </button>
                )}
              </div>
            ) : (
              <div>
                {/* Column headers — desktop */}
                <div className="hidden sm:flex items-center justify-between px-7.5 py-3 bg-gray-1 border-b border-gray-3">
                  <p className="text-custom-xs font-medium text-dark-4 uppercase tracking-wide flex-1">
                    Ticket
                  </p>
                  <p className="text-custom-xs font-medium text-dark-4 uppercase tracking-wide shrink-0 w-48 text-right">
                    Actions
                  </p>
                </div>

                {/* Ticket list */}
                {currentData.tickets.map((ticket) => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    onView={handleView}
                    onCancel={handleCancelRequest}
                    onMessage={handleMessage}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Modals ── */}
      <TicketDetailModal
        ticket={detailTicket}
        isOpen={showDetail}
        onClose={() => {
          setShowDetail(false);
          setDetailTicket(null);
        }}
        onCancel={handleCancelRequest}
        onMessage={handleMessage}
      />

      <CreateTicketModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onSubmit={handleCreateSubmit}
      />
    </>
  );
};

export default Concerns;
