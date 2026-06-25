import React, { useState } from "react";
import OrderTrackingBar from "./OrderTrackingBar";
import RefundModal from "./RefundModal";

const OrderDetails = ({ orderItem }: any) => {
  const [showRefund, setShowRefund] = useState(false);

  // Conditions under which the Refund button is shown:
  // - Order must be delivered (status === "delivered")
  // - COD: always eligible once delivered
  // - Online (Xendit): eligible once delivered AND payment is paid
  const isDelivered =
    orderItem.status?.toLowerCase() === "delivered" ||
    orderItem.status?.toLowerCase() === "completed";

  const isCOD =
    orderItem.paymentMethod?.toLowerCase() === "cod" ||
    orderItem.paymentMethod?.toLowerCase() === "cash on delivery";

  const isOnlinePaid =
    !isCOD &&
    (orderItem.paymentStatus?.toLowerCase() === "paid" ||
      orderItem.paymentStatus?.toLowerCase() === "completed");

  const canRefund = isDelivered && (isCOD || isOnlinePaid);

  // Don't show if already refunded
  const alreadyRefunded =
    orderItem.orderStatus?.toLowerCase() === "refunded" ||
    orderItem.status?.toLowerCase() === "refunded";

  return (
    <>
      <div className="w-full">
        <div className="grid grid-cols-4 gap-4 py-4 px-7.5 border-b border-gray-3 bg-gray-1 rounded-t-xl hidden sm:grid">
          <p className="text-custom-sm font-medium text-dark text-left">Order</p>
          <p className="text-custom-sm font-medium text-dark sm:text-center">Date</p>
          <p className="text-custom-sm font-medium text-dark sm:text-center">Status</p>
          <p className="text-custom-sm font-medium text-dark text-right">Total</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-5 px-7.5 items-center">
          <div className="text-left">
            <p className="text-custom-sm sm:hidden font-medium text-dark mb-1">Order</p>
            <p className="text-custom-sm text-red font-medium">
              #{String(orderItem.orderNumber || orderItem.orderId).slice(-8)}
            </p>
          </div>
          
          <div className="sm:text-center">
            <p className="text-custom-sm sm:hidden font-medium text-dark mb-1">Date</p>
            <p className="text-custom-sm text-dark">
              {orderItem.createdAt}
            </p>
          </div>

          <div className="sm:flex sm:justify-center">
            <div className="text-left sm:text-center">
              <p className="text-custom-sm sm:hidden font-medium text-dark mb-1">Status</p>
              <p
                className={`inline-block text-xs sm:text-custom-sm py-0.5 px-2.5 rounded-[30px] capitalize ${
                  orderItem.status === "delivered" || orderItem.status === "completed"
                    ? "text-green bg-green-light-6"
                    : orderItem.status === "pending"
                    ? "text-red bg-red-light-6"
                    : orderItem.status === "processing" || orderItem.status === "preparing"
                    ? "text-yellow bg-yellow-light-4"
                    : orderItem.status === "shipped" || orderItem.status === "out for delivery"
                    ? "text-blue bg-blue-light-5"
                    : "text-dark bg-gray-2"
                }`}
              >
                {orderItem.status?.toLowerCase() === 'completed' ? 'Delivered' : orderItem.status}
              </p>
            </div>
          </div>

          <div className="sm:text-right">
            <p className="text-custom-sm sm:hidden font-medium text-dark mb-1">Total</p>
            <p className="text-custom-sm text-dark font-medium">
              {orderItem.total}
            </p>
          </div>
        </div>
      </div>

      <div className="px-7.5 w-full pb-4">
        <p className="font-bold">Shipping Address:</p>{" "}
        <p>{orderItem.deliveryAddress || "942 Aspen Road Encino, CA 91316"}</p>
      </div>
      
      <div className="px-7.5 w-full pb-6">
        <OrderTrackingBar orderId={orderItem.orderId} />
      </div>

      {/* Refund button — bottom right, only when eligible */}
      {canRefund && !alreadyRefunded && (
        <div className="w-full px-7.5 pb-6 flex justify-end">
          <button
            onClick={() => setShowRefund(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-red bg-red-light-6 px-5 py-2.5 text-sm font-medium text-red hover:bg-red hover:text-white transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
              />
            </svg>
            Request Refund
          </button>
        </div>
      )}

      {alreadyRefunded && (
        <div className="w-full px-7.5 pb-6 flex justify-end">
          <span className="inline-flex items-center gap-2 rounded-xl bg-gray-2 px-5 py-2.5 text-sm font-medium text-dark-5 cursor-default">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Refund Requested
          </span>
        </div>
      )}

      {showRefund && (
        <RefundModal
          order={orderItem}
          onClose={() => setShowRefund(false)}
          onSuccess={() => setShowRefund(false)}
        />
      )}
    </>
  );
};

export default OrderDetails;
