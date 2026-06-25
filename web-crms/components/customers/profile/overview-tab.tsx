"use client";

import { useState, useEffect } from "react";
import {
  parseAddress,
  formatAddress,
  renderAddress,
  StructuredAddress,
} from "@/lib/utils/sanitizers/customer";
import { format } from "date-fns";
import {
  Customer,
  Order,
  MarketingHistory,
  CustomerStatus,
  CustomerType,
} from "@/types/customer";
import { customersApi } from "@/lib/api/customer";
import { toast } from "sonner";

const statusStyle: Record<string, string> = {
  active: "bg-success-50 text-success-700",
  inactive: "bg-gray-100 text-gray-600",
  suspended: "bg-error-50 text-error-700",
};

const typeLabel: Record<string, string> = {
  regular: "Regular",
  institutional_buyer: "Institutional Buyer",
};

const channelIcon: Record<string, string> = {
  email: "ti-mail",
  sms: "ti-message",
  social_media: "ti-brand-instagram",
  push_notification: "ti-bell",
};

interface Props {
  customer: Customer;
  recentOrders: Order[];
  recentMarketing: MarketingHistory[];
  onUpdated: () => void;
  onEmailClick: () => void;
}

export default function OverviewTab({
  customer,
  recentOrders,
  recentMarketing,
  onUpdated,
  onEmailClick,
}: Props) {
  const [notes, setNotes] = useState(customer.notes ?? "");
  const [editingNotes, setEditingNotes] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [editingAddress, setEditingAddress] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState<StructuredAddress>(
    parseAddress(customer.address)
  );

  useEffect(() => {
    setAddressForm(parseAddress(customer.address));
  }, [customer.address]);

  const handleSaveAddress = async () => {
    setSavingAddress(true);
    try {
      const formattedAddress = formatAddress(addressForm);
      await customersApi.updateAddress(customer.id, formattedAddress);
      toast.success("Address saved successfully");
      onUpdated();
      setEditingAddress(false);
    } catch {
      toast.error("Failed to save address");
    } finally {
      setSavingAddress(false);
    }
  };

  const handleStatusChange = async (status: CustomerStatus) => {
    try {
      await customersApi.updateStatus(customer.id, status);
      toast.success("Customer status updated");
      onUpdated();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleTypeChange = async (customerType: CustomerType) => {
    try {
      await customersApi.updateType(customer.id, customerType);
      toast.success("Customer type updated");
      onUpdated();
    } catch {
      toast.error("Failed to update type");
    }
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      await customersApi.updateNotes(customer.id, notes);
      toast.success("Notes saved successfully");
      onUpdated();
      setEditingNotes(false);
    } catch {
      toast.error("Failed to save notes");
    } finally {
      setSavingNotes(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await customersApi.delete(customer.id);
      toast.success("Customer deleted successfully");
      window.location.href = "/customers";
    } catch {
      toast.error("Failed to delete customer");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-theme-xs p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            {customer.profileImage ? (
              <img
                src={customer.profileImage}
                alt=""
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center text-brand-500 text-xl font-semibold">
                {customer.firstName[0]}
                {customer.lastName[0]}
              </div>
            )}
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {customer.firstName} {customer.lastName}
              </h2>
              <p className="text-theme-sm text-gray-500">{customer.email}</p>
              {customer.phone && (
                <p className="text-theme-sm text-gray-500">{customer.phone}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-theme-sm font-medium border border-error-200 rounded-lg text-error-600 hover:bg-error-50 transition-colors"
            >
              <i className="ti ti-trash text-base" /> Delete
            </button>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
          <div>
            <p className="text-theme-xs text-gray-400 uppercase tracking-wide mb-1">
              Status
            </p>
            <select
              value={customer.status}
              onChange={(e) =>
                handleStatusChange(e.target.value as CustomerStatus)
              }
              className="text-theme-sm font-medium border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <div>
            <p className="text-theme-xs text-gray-400 uppercase tracking-wide mb-1">
              Type
            </p>
            <select
              value={customer.customerType?.toLowerCase()}
              onChange={(e) => handleTypeChange(e.target.value as CustomerType)}
              className="text-theme-sm font-medium border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            >
              <option value="regular">Regular</option>
              <option value="institutional_buyer">Institutional Buyer</option>
            </select>
          </div>

          <div>
            <p className="text-theme-xs text-gray-400 uppercase tracking-wide mb-1">
              Address
            </p>
            <p className="text-theme-sm text-gray-700">
              {renderAddress(customer.address) || "—"}
            </p>
          </div>

          <div>
            <p className="text-theme-xs text-gray-400 uppercase tracking-wide mb-1">
              Member Since
            </p>
            <p className="text-theme-sm text-gray-700">
              {format(new Date(customer.createdAt), "MMM d, yyyy")}
            </p>
          </div>
        </div>
      </div>

      {/* Address Details */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-theme-xs p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-theme-sm font-semibold text-gray-900">Address Details</h3>
          {!editingAddress ? (
            <button
              onClick={() => setEditingAddress(true)}
              className="text-theme-xs text-brand-500 hover:underline"
            >
              <i className="ti ti-pencil mr-1" />
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditingAddress(false);
                  setAddressForm(parseAddress(customer.address));
                }}
                className="text-theme-xs text-gray-500 hover:underline"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAddress}
                disabled={savingAddress}
                className="text-theme-xs text-brand-500 hover:underline font-medium"
              >
                {savingAddress ? "Saving..." : "Save"}
              </button>
            </div>
          )}
        </div>
        {editingAddress ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-theme-xs font-medium text-gray-500">
                  Unit / Building / House No.
                </label>
                <input
                  value={addressForm.unit}
                  onChange={(e) => setAddressForm((p) => ({ ...p, unit: e.target.value }))}
                  className="w-full px-3 py-2 text-theme-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-theme-xs font-medium text-gray-500">
                  Street Name
                </label>
                <input
                  value={addressForm.street}
                  onChange={(e) => setAddressForm((p) => ({ ...p, street: e.target.value }))}
                  className="w-full px-3 py-2 text-theme-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-theme-xs font-medium text-gray-500">
                  Subdivision / Village / District
                </label>
                <input
                  value={addressForm.subdivision}
                  onChange={(e) => setAddressForm((p) => ({ ...p, subdivision: e.target.value }))}
                  className="w-full px-3 py-2 text-theme-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-theme-xs font-medium text-gray-500">
                  Barangay
                </label>
                <input
                  value={addressForm.barangay}
                  onChange={(e) => setAddressForm((p) => ({ ...p, barangay: e.target.value }))}
                  className="w-full px-3 py-2 text-theme-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-theme-xs font-medium text-gray-500">
                  City / Municipality
                </label>
                <input
                  value={addressForm.city}
                  onChange={(e) => setAddressForm((p) => ({ ...p, city: e.target.value }))}
                  className="w-full px-3 py-2 text-theme-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-theme-xs font-medium text-gray-500">
                  Zip Code
                </label>
                <input
                  value={addressForm.zipCode}
                  onChange={(e) => setAddressForm((p) => ({ ...p, zipCode: e.target.value }))}
                  className="w-full px-3 py-2 text-theme-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-theme-xs font-medium text-gray-500">
                Province
              </label>
              <input
                value={addressForm.province}
                onChange={(e) => setAddressForm((p) => ({ ...p, province: e.target.value }))}
                className="w-full px-3 py-2 text-theme-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>
        ) : (
          <p className="text-theme-sm text-gray-600">
            {renderAddress(customer.address) || <span className="text-gray-400">No address details added.</span>}
          </p>
        )}
      </div>

      {/* Notes */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-theme-xs p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-theme-sm font-semibold text-gray-900">Notes</h3>
          {!editingNotes ? (
            <button
              onClick={() => setEditingNotes(true)}
              className="text-theme-xs text-brand-500 hover:underline"
            >
              <i className="ti ti-pencil mr-1" />
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setEditingNotes(false)}
                className="text-theme-xs text-gray-500 hover:underline"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNotes}
                disabled={savingNotes}
                className="text-theme-xs text-brand-500 hover:underline font-medium"
              >
                {savingNotes ? "Saving..." : "Save"}
              </button>
            </div>
          )}
        </div>
        {editingNotes ? (
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Add notes about this customer..."
            className="w-full px-3 py-2 text-theme-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none"
          />
        ) : (
          <p className="text-theme-sm text-gray-600">
            {notes || <span className="text-gray-400">No notes added.</span>}
          </p>
        )}
      </div>

      {/* Recent Orders */}
      {recentOrders.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-theme-xs p-6">
          <h3 className="text-theme-sm font-semibold text-gray-900 mb-4">
            Recent Orders
          </h3>
          <div className="space-y-3">
            {recentOrders.map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <div>
                  <p className="text-theme-sm font-medium text-gray-800">
                    #{o.orderNumber}
                  </p>
                  <p className="text-theme-xs text-gray-400">
                    {format(new Date(o.createdAt), "MMM d, yyyy")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-theme-sm font-semibold text-gray-900">
                    ₱{o.totalAmount.toLocaleString()}
                  </p>
                  <span className="text-theme-xs text-gray-500">
                    {o.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Marketing */}
      {recentMarketing.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-theme-xs p-6">
          <h3 className="text-theme-sm font-semibold text-gray-900 mb-4">
            Recent Marketing
          </h3>
          <div className="space-y-3">
            {recentMarketing.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0"
              >
                <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center">
                  <i
                    className={`ti ${channelIcon[m.channel]} text-brand-500 text-sm`}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-theme-sm font-medium text-gray-800">
                    {m.title}
                  </p>
                  <p className="text-theme-xs text-gray-400">
                    {format(new Date(m.sentAt), "MMM d, yyyy")}
                  </p>
                </div>
                <span className="text-theme-xs text-gray-500 capitalize">
                  {m.interactionType}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-999 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setConfirmDelete(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-theme-xl w-full max-w-sm mx-4 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-error-50 flex items-center justify-center">
                <i className="ti ti-trash text-error-600 text-lg" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Delete Customer
                </h3>
                <p className="text-theme-sm text-gray-500">
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-4 py-2 text-theme-sm font-medium border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-theme-sm font-medium text-white bg-error-600 rounded-lg hover:bg-error-700 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
