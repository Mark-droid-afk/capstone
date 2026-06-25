"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Customer } from "@/types/customer";
import { customersApi } from "@/lib/api/customer";
import CustomerTable from "@/components/customers/customer-table";
import CustomerFilters from "@/components/customers/customer-filter";
import AddCustomerModal from "@/components/customers/add-customer-modal";

const PAGE_SIZE = 10;

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const fetchCustomers = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await customersApi.getAll({
        page,
        pageSize: PAGE_SIZE,
        search: search || undefined,
        status: status === "all" ? undefined : status,
        type: type === "all" ? undefined : type,
      });
      setCustomers(res.data.data);
      setTotal(res.data.total);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [page, search, status, type]);

  useEffect(() => {
    fetchCustomers(false);
    const interval = setInterval(() => {
      fetchCustomers(true);
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchCustomers]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-title-sm font-semibold text-gray-900">Customers</h1>
          <p className="text-theme-sm text-gray-500 mt-0.5">{total} total customers</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 text-theme-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors shadow-theme-xs"
        >
          <i className="ti ti-plus text-base" />
          Add Customer
        </button>
      </div>

      {/* Filters */}
      <CustomerFilters
        search={search}
        status={status}
        type={type}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        onStatusChange={(v) => { setStatus(v); setPage(1); }}
        onTypeChange={(v) => { setType(v); setPage(1); }}
      />

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400 text-theme-sm h">
          <i className="ti ti-loader-2 animate-spin text-xl mr-2" /> Loading...
        </div>
      ) : (
        <CustomerTable
          customers={customers}
          onRowClick={(id) => router.push(`/customers/${id}`)}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
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

      {/* Modal */}
      <AddCustomerModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSuccess={fetchCustomers}
      />
    </div>
  );
}