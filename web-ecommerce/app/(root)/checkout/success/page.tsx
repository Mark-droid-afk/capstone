"use client";
import { useSearchParams, useRouter } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import apiPos from "@/lib/apiPos";

function SuccessContent() {
  const params = useSearchParams();
  const router = useRouter();

  const orderId = params.get("orderId");
  const orderNumber = params.get("orderNumber");
  const failed = params.get("failed") === "true";

  const method = params.get("method") || "GCash"; // Fallback to GCash if missing for safety

  const [confirmStatus, setConfirmStatus] = useState<"idle" | "confirming" | "done">("idle");

  useEffect(() => {
    if (failed || !orderNumber) return;

    // Do not verify payment with Xendit if the method is COD.
    if (method.toLowerCase() === "cod" || method.toLowerCase() === "cash on delivery") {
      setConfirmStatus("done");
      return;
    }

    // Tell the backend to verify with Xendit and mark order as Paid
    setConfirmStatus("confirming");
    apiPos
      .post(`/api-pos/webhooks/xendit/confirm-payment?orderNumber=${encodeURIComponent(orderNumber)}`)
      .then(() => setConfirmStatus("done"))
      .catch(() => setConfirmStatus("done")); // silently swallow — UI still shows success
  }, [orderNumber, failed, method]);

  if (failed) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        {/* Error icon */}
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6">
          <svg
            className="w-10 h-10 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-dark mb-3">Payment Failed</h1>
        <p className="text-dark-5 mb-8 max-w-md">
          Your payment could not be completed. Your order{" "}
          {orderNumber ? (
            <span className="font-semibold text-dark">#{orderNumber}</span>
          ) : (
            ""
          )}{" "}
          has been cancelled. Please try again.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/cart"
            className="bg-blue text-white font-medium py-3 px-8 rounded-md hover:bg-blue-dark transition-colors"
          >
            Return to Cart
          </Link>
          <Link
            href="/shop"
            className="bg-gray-2 text-dark font-medium py-3 px-8 rounded-md hover:bg-gray-3 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      {/* Animated checkmark */}
      <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-6 animate-bounce-once">
        <svg
          className="w-12 h-12 text-green-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <h1 className="text-3xl font-bold text-dark mb-3">Order Confirmed!</h1>
      <p className="text-dark-5 mb-2">Thank you for your purchase 🎉</p>

      {orderNumber && (
        <div className="bg-gray-1 rounded-lg px-6 py-4 mb-8 inline-block">
          <p className="text-sm text-dark-5 mb-1">Order Number</p>
          <p className="text-xl font-bold text-blue">{orderNumber}</p>
        </div>
      )}

      <p className="text-dark-5 mb-8 max-w-md">
        Your order has been placed successfully. We will send you a confirmation email shortly.
        You can track your order in{" "}
        <span className="font-medium text-dark">My Account → Orders</span>.
      </p>

      <div className="flex flex-wrap gap-4 justify-center">
        <Link
          href="/my-account"
          className="bg-blue text-white font-medium py-3 px-8 rounded-md hover:bg-blue-dark transition-colors"
        >
          View My Orders
        </Link>
        <Link
          href="/shop"
          className="bg-gray-2 text-dark font-medium py-3 px-8 rounded-md hover:bg-gray-3 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <>
      <section className="py-20 bg-gray-2">
        <div className="max-w-[800px] w-full mx-auto px-4">
          <Suspense fallback={<div className="text-center py-20">Loading…</div>}>
            <SuccessContent />
          </Suspense>
        </div>
      </section>
    </>
  );
}

