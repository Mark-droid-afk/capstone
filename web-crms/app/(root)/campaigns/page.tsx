"use client";

import { useCallback, useEffect, useState } from "react";
import { campaignsApi } from "@/lib/api/campaign";
import type { Campaign } from "@/types/campaign";
import CampaignCard from "@/components/campaigns/campaign-card";
import CampaignDetailModal from "@/components/campaigns/campaign-detail-modal";
import CreateCampaignModal from "@/components/campaigns/create-campaign-modal";

type TabKey = "active" | "drafts" | "history";

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: "active", label: "Campaign List", icon: "ti-speakerphone" },
  { key: "drafts", label: "Campaign Drafts", icon: "ti-file" },
  { key: "history", label: "Campaign History", icon: "ti-history" },
];

const PAGE_SIZE = 12;

export default function CampaignsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("active");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Campaign | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<Campaign | null>(null);

  const fetchCampaigns = useCallback(async (tab: TabKey, pg: number) => {
    setLoading(true);
    try {
      let res;
      if (tab === "active")
        res = await campaignsApi.getActive({ page: pg, pageSize: PAGE_SIZE });
      else if (tab === "drafts")
        res = await campaignsApi.getDrafts({ page: pg, pageSize: PAGE_SIZE });
      else
        res = await campaignsApi.getHistory({ page: pg, pageSize: PAGE_SIZE });
      setCampaigns(res.data.data ?? []);
      setTotal(res.data.total ?? 0);
    } catch {
      setCampaigns([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns(activeTab, page);
  }, [activeTab, page, fetchCampaigns]);

  const switchTab = (tab: TabKey) => {
    setActiveTab(tab);
    setPage(1);
    setSelected(null);
  };

  const handleOpen = async (campaign: Campaign) => {
    try {
      const res = await campaignsApi.getById(campaign.id);

      if (activeTab == "drafts") {
        setEditTarget(res.data);
      } else {
        setSelected(res.data);
      }
    } catch {
      if (activeTab == "drafts") {
        setEditTarget(campaign);
      } else {
        setSelected(campaign);
      }
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const emptyMsg: Record<TabKey, { icon: string; title: string; sub: string }> =
    {
      active: {
        icon: "ti-speakerphone-off",
        title: "No active campaigns",
        sub: "Create a campaign and publish it to see it here.",
      },
      drafts: {
        icon: "ti-file-off",
        title: "No draft campaigns",
        sub: "Save a campaign as draft to find it here.",
      },
      history: {
        icon: "ti-history",
        title: "No campaign history",
        sub: "Campaigns that have been sent will appear here.",
      },
    };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-title-sm font-semibold text-gray-900">
            Campaigns
          </h1>
          <p className="text-theme-sm text-gray-500 mt-0.5">
            {total} total campaigns
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 text-theme-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors shadow-theme-xs"
        >
          <i className="ti ti-plus text-base" />
          New Campaign
        </button>
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

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400 text-theme-sm">
          <i className="ti ti-loader-2 animate-spin text-xl mr-2" /> Loading...
        </div>
      ) : campaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <i
            className={`ti ${emptyMsg[activeTab].icon} text-4xl text-gray-300 mb-3`}
          />
          <p className="text-theme-sm font-medium text-gray-500 mb-1">
            {emptyMsg[activeTab].title}
          </p>
          <p className="text-theme-xs text-gray-400 max-w-xs">
            {emptyMsg[activeTab].sub}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {campaigns.map((c) => (
            <CampaignCard key={c.id} campaign={c} onClick={handleOpen} isDraft={activeTab == "drafts"} />
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
        <CampaignDetailModal
          campaign={selected}
          onClose={() => setSelected(null)}
        />
      )}

      {/* Create modal */}
      {showCreate && (
        <CreateCampaignModal
          onClose={() => setShowCreate(false)}
          onSuccess={() => {
            setShowCreate(false);
            fetchCampaigns(activeTab, page);
          }}
        />
      )}

      {editTarget && (
        <CreateCampaignModal
          initialData={editTarget}
          onClose={() => setEditTarget(null)}
          onSuccess={() => {
            setEditTarget(null);
            fetchCampaigns(activeTab, page);
          }}
        />
      )}
    </div>
  );
}
