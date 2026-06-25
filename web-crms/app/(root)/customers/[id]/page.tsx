"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Customer, MarketingHistory, Order } from "@/types/customer";
import { customersApi } from "@/lib/api/customer";
import OverviewTab from "@/components/customers/profile/overview-tab";
import MarketingTab from "@/components/customers/profile/marketing-tab";
import OrderTab from "@/components/customers/profile/order-tab";

type Tab = "overview" | "marketing" | "orders";

export default function CustomerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentMarketing, setRecentMarketing] = useState<MarketingHistory[]>(
    [],
  );
  const [tab, setTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);

  const fetchCustomer = async () => {
    try {
      const [cRes, mRes, oRes] = await Promise.all([
        customersApi.getById(id),
        customersApi.getMarketingHistory(id, { page: 1, pageSize: 5 }),
        customersApi.getOrderHistory(id, { page: 1, pageSize: 5 }),
      ]);
      setCustomer(cRes.data);
      setRecentMarketing(mRes.data.data);
      setRecentOrders(oRes.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const tabs: { key: Tab; label: string; icon: string; hidden?: boolean }[] = [
    { key: "overview", label: "Overview", icon: "ti-user" },
    { key: "marketing", label: "Marketing History", icon: "ti-speakerphone" },
    {
      key: "orders",
      label: "Order History",
      icon: "ti-shopping-cart",
      hidden:
        customer?.customerType?.toLowerCase() !== "regular" &&
        customer?.customerType?.toLowerCase() !== "institutionalbuyer" &&
        customer?.customerType?.toLowerCase() !== "institutional_buyer",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-400 text-theme-sm">
        <i className="ti ti-loader-2 animate-spin text-xl mr-2" /> Loading...
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400 space-y-2">
        <i className="ti ti-user-off text-4xl" />
        <p className="text-theme-sm">Customer not found.</p>
        <button
          onClick={() => router.push("/customers")}
          className="text-brand-500 text-theme-sm hover:underline"
        >
          Back to Customers
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      {/* Back */}
      <button
        onClick={() => router.push("/customers")}
        className="flex items-center gap-1.5 text-theme-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <i className="ti ti-arrow-left text-base" /> Back to Customers
      </button>

      {/* Page Title */}
      <div>
        <h1 className="text-title-sm font-semibold text-gray-900">
          {customer.firstName} {customer.lastName}
        </h1>
        <p className="text-theme-sm text-gray-500 mt-0.5">{customer.email}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {tabs
          .filter((t) => !t.hidden)
          .map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-theme-sm font-medium border-b-2 transition-colors -mb-px ${
                tab === t.key
                  ? "border-brand-500 text-brand-500"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <i className={`ti ${t.icon} text-base`} />
              {t.label}
            </button>
          ))}
      </div>

      {/* Tab Content */}
      {tab === "overview" && (
        <OverviewTab
          customer={customer}
          recentOrders={recentOrders}
          recentMarketing={recentMarketing}
          onUpdated={fetchCustomer}
          onEmailClick={() => router.push("/campaigns")}
        />
      )}
      {tab === "marketing" && <MarketingTab customerId={id} />}
      {tab === "orders" && <OrderTab customerId={id} />}
    </div>
  );
}
