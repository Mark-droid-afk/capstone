"use client";
import React, { useState, useEffect } from "react";
import WebhookLogs from "@/components/Manager/WebhookLogs";
import { apiAuth } from "@/lib/api";

type ManagerUser = {
  username: string;
  role: string;
  subRole?: string;
};

const ALLOWED_ROLES = ["Admin", "Manager"];
const ALLOWED_SUB_ROLES = ["Order Manager"];

function isAllowed(user: ManagerUser) {
  return (
    ALLOWED_ROLES.includes(user.role) ||
    ALLOWED_SUB_ROLES.includes(user.subRole ?? "")
  );
}

export default function ManagerWebhooksPage() {
  const [manager, setManager] = useState<ManagerUser | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  // Login form state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // On mount: try to validate existing ERP session
  useEffect(() => {
    const stored = sessionStorage.getItem("manager_session");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as ManagerUser;
        if (isAllowed(parsed)) {
          setManager(parsed);
          setIsChecking(false);
          return;
        }
      } catch {}
    }
    setIsChecking(false);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const res = await apiAuth.post("/api/erp-auth/login", { username, password });
      const data = res.data;

      // Validate role from response
      const user: ManagerUser = {
        username: data.username ?? username,
        role: data.role ?? "",
        subRole: data.subRole ?? "",
      };

      if (!isAllowed(user)) {
        setLoginError("Access denied. This page is restricted to Order Managers and Admins.");
        return;
      }

      sessionStorage.setItem("manager_session", JSON.stringify(user));
      setManager(user);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        "Invalid credentials. Please try again.";
      setLoginError(msg);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("manager_session");
    setManager(null);
    setUsername("");
    setPassword("");
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-2">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  // ─── LOGIN GATE ────────────────────────────────────────────────────────
  if (!manager) {
    return (
      <div className="min-h-screen bg-gray-2 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-7 h-7 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-dark">Manager Access</h1>
            <p className="text-gray-500 text-sm mt-1">
              This page is restricted to Order Managers and Admins
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="manager-username"
                className="block text-sm font-medium text-dark mb-1.5"
              >
                Username
              </label>
              <input
                id="manager-username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-colors"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label
                htmlFor="manager-password"
                className="block text-sm font-medium text-dark mb-1.5"
              >
                Password
              </label>
              <input
                id="manager-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-colors"
                placeholder="Enter your password"
              />
            </div>

            {loginError && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {loginError}
              </div>
            )}

            <button
              id="manager-login-btn"
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoggingIn ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ─── DASHBOARD ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-2">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 xl:px-0 py-10">
        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-dark">
              Webhook Monitoring
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Xendit GCash payment audit log
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-dark">{manager.username}</p>
              <p className="text-xs text-gray-500">
                {manager.subRole || manager.role}
              </p>
            </div>
            <button
              id="manager-logout-btn"
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Logout
            </button>
          </div>
        </div>

        {/* Role badge */}
        <div className="mb-6 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-medium px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
            Authorized — {manager.subRole || manager.role}
          </span>
          <span className="text-xs text-gray-400">
            Showing all Xendit GCash payment transactions
          </span>
        </div>

        {/* Webhook logs table */}
        <WebhookLogs />
      </div>
    </div>
  );
}
