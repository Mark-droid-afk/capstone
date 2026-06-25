"use client";

import { useState } from "react";
import { customersApi } from "@/lib/api/customer";
import { CustomerType } from "@/types/customer";
import { toast } from "sonner";
import { sanitizeName, sanitizePhoneNumber, formatAddress, StructuredAddress } from "@/lib/utils/sanitizers/customer";
import { normalizeName } from "@/lib/utils/helpers/customer";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddCustomerModal({ open, onClose, onSuccess }: Props) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    customerType: "" as CustomerType,
  });
  const [address, setAddress] = useState<StructuredAddress>({
    unit: "",
    street: "",
    subdivision: "",
    barangay: "",
    city: "",
    zipCode: "",
    province: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleNameChange = (field: "firstName" | "lastName", value: string) => {
    set(field, normalizeName(sanitizeName(value)));
  };

  const handlePhoneChange = (value: string) => {
    set("phone", sanitizePhoneNumber(value));
  };

  const handleSubmit = async () => {
    if (
      !form.firstName ||
      !form.lastName ||
      !form.email ||
      !form.customerType
    ) {
      setError("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const formattedAddress = formatAddress(address);
      await customersApi.create({
        ...form,
        phone: form.phone || undefined,
        address: formattedAddress,
      });
      toast.success("Customer added successfully");
      onSuccess();
      onClose();
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        customerType: "" as CustomerType,
      });
      setAddress({
        unit: "",
        street: "",
        subdivision: "",
        barangay: "",
        city: "",
        zipCode: "",
        province: "",
      });
    } catch {
      toast.error("Failed to add customer");
      setError("Failed to add customer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-theme-xl w-full max-w-md mx-4 p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Add Customer</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <i className="ti ti-x text-xl" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-theme-sm font-medium text-gray-700">
              First Name <span className="text-error-500">*</span>
            </label>
            <input
              value={form.firstName}
              onChange={(e) => handleNameChange("firstName", e.target.value)}
              className="w-full px-3 py-2 text-theme-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-theme-sm font-medium text-gray-700">
              Last Name <span className="text-error-500">*</span>
            </label>
            <input
              value={form.lastName}
              onChange={(e) => handleNameChange("lastName", e.target.value)}
              className="w-full px-3 py-2 text-theme-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-theme-sm font-medium text-gray-700">
            Email <span className="text-error-500">*</span>
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            className="w-full px-3 py-2 text-theme-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-theme-sm font-medium text-gray-700">
            Phone <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            className="w-full px-3 py-2 text-theme-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-theme-sm font-medium text-gray-700">
            Customer Type <span className="text-error-500">*</span>
          </label>
          <select
            value={form.customerType}
            onChange={(e) => set("customerType", e.target.value)}
            className="w-full px-3 py-2 text-theme-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-white"
          >
            <option value="">Select type</option>
            <option value="regular">Regular</option>
            <option value="institutional_buyer">Institutional Buyer</option>
          </select>
        </div>

        <div className="space-y-3 border-t border-gray-100 pt-4">
          <h3 className="text-theme-sm font-semibold text-gray-900">Address Details</h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-theme-xs font-medium text-gray-700">
                Unit / Building / House No.
              </label>
              <input
                value={address.unit}
                onChange={(e) => setAddress((p) => ({ ...p, unit: e.target.value }))}
                className="w-full px-3 py-2 text-theme-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-theme-xs font-medium text-gray-700">
                Street Name
              </label>
              <input
                value={address.street}
                onChange={(e) => setAddress((p) => ({ ...p, street: e.target.value }))}
                className="w-full px-3 py-2 text-theme-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-theme-xs font-medium text-gray-700">
                Subdivision / Village / District
              </label>
              <input
                value={address.subdivision}
                onChange={(e) => setAddress((p) => ({ ...p, subdivision: e.target.value }))}
                className="w-full px-3 py-2 text-theme-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-theme-xs font-medium text-gray-700">
                Barangay
              </label>
              <input
                value={address.barangay}
                onChange={(e) => setAddress((p) => ({ ...p, barangay: e.target.value }))}
                className="w-full px-3 py-2 text-theme-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-theme-xs font-medium text-gray-700">
                City / Municipality
              </label>
              <input
                value={address.city}
                onChange={(e) => setAddress((p) => ({ ...p, city: e.target.value }))}
                className="w-full px-3 py-2 text-theme-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-theme-xs font-medium text-gray-700">
                Zip Code
              </label>
              <input
                value={address.zipCode}
                onChange={(e) => setAddress((p) => ({ ...p, zipCode: e.target.value }))}
                className="w-full px-3 py-2 text-theme-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-theme-xs font-medium text-gray-700">
              Province
            </label>
            <input
              value={address.province}
              onChange={(e) => setAddress((p) => ({ ...p, province: e.target.value }))}
              className="w-full px-3 py-2 text-theme-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
        </div>

        {error && <p className="text-theme-sm text-error-500">{error}</p>}

        <div className="flex justify-end gap-2 pt-1">
          <button
            onClick={onClose}
            className="px-4 py-2 text-theme-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 text-theme-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add Customer"}
          </button>
        </div>
      </div>
    </div>
  );
}
