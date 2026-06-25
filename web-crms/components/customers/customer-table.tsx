"use client";

import { Customer } from "@/types/customer";
import { format } from "date-fns";

const statusStyle: Record<string, string> = {
  active: "bg-success-50 text-success-700",
  inactive: "bg-gray-100 text-gray-600",
  suspended: "bg-error-50 text-error-700",
};

const typeLabel: Record<string, string> = {
  regular: "Regular",
  institutional_buyer: "Institutional Buyer",
};

interface Props {
  customers: Customer[];
  onRowClick: (id: string) => void;
}

export default function CustomerTable({ customers, onRowClick }: Props) {
  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden bg-white shadow-theme-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {["Name", "Email", "Phone", "Type", "Status", "Created At"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-theme-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {customers.map((c) => (
              <tr
                key={c.id}
                onClick={() => onRowClick(c.id)}
                className="hover:bg-brand-25 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3 font-medium text-brand-500 hover:underline whitespace-nowrap">
                  {c.firstName} {c.lastName}
                </td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{c.email}</td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{c.phone ?? "—"}</td>
                <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{c.customerType}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle[c.status]}`}>
                    {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                  {format(new Date(c.createdAt), "MMM d, yyyy")}
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-400 text-theme-sm">
                  No customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}