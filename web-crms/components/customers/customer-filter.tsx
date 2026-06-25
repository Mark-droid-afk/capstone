"use client";

interface Props {
  search: string;
  status: string;
  type: string;
  onSearchChange: (v: string) => void;
  onStatusChange: (v: string) => void;
  onTypeChange: (v: string) => void;
}

export default function CustomerFilters({
  search,
  status,
  type,
  onSearchChange,
  onStatusChange,
  onTypeChange,
}: Props) {
  return (
    <div className="flex flex-wrap gap-3">
      <div className="relative">
        <i className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 pr-4 py-2 text-theme-sm border border-gray-200 rounded-lg bg-white text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 w-64"
        />
      </div>

      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className="px-3 py-2 text-theme-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
      >
        <option value="all">All Status</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
        <option value="suspended">Suspended</option>
      </select>

      <select
        value={type}
        onChange={(e) => onTypeChange(e.target.value)}
        className="px-3 py-2 text-theme-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
      >
        <option value="all">All Types</option>
        <option value="regular">Regular</option>
        <option value="InstitutionalBuyer">Institutional Buyer</option>
      </select>
    </div>
  );
}
