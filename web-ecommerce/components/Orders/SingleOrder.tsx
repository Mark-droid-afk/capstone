import React, { useState } from "react";
import OrderActions from "./OrderActions";
import OrderModal from "./OrderModal";

const SingleOrder = ({ orderItem, smallView, isRefunds }: any) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  const toggleEdit = () => {
    setShowEdit(!showEdit);
  };

  const toggleModal = (status: boolean) => {
    setShowDetails(status);
    setShowEdit(status);
  };

  return (
    <>
      {!smallView && (
        <div className="items-center justify-between border-t border-gray-3 py-5 px-7.5 hidden md:flex">
          <div className="min-w-[111px]">
            <p className="text-custom-sm text-red">
              #{String(orderItem.orderNumber || orderItem.orderId).slice(-8)}
            </p>
          </div>
          <div className="min-w-[175px]">
            <p className="text-custom-sm text-dark">{orderItem.createdAt}</p>
          </div>

          <div className="min-w-[128px]">
            <p
              className={`inline-block text-custom-sm  py-0.5 px-2.5 rounded-[30px] capitalize ${
                orderItem.status === "delivered" || orderItem.status === "completed"
                  ? "text-green bg-green-light-6"
                  : orderItem.status === "pending"
                  ? "text-red bg-red-light-6"
                  : orderItem.status === "processing" || orderItem.status === "preparing"
                  ? "text-yellow bg-yellow-light-4"
                  : orderItem.status === "shipped" || orderItem.status === "out for delivery"
                  ? "text-blue bg-blue-light-5"
                  : orderItem.status === "refund requested"
                  ? "text-orange-500 bg-orange-50"
                  : orderItem.status === "refunded"
                  ? "text-purple-600 bg-purple-50"
                  : "text-dark bg-gray-2"
              }`}
            >
              {orderItem.status?.toLowerCase() === 'completed'
                ? 'Delivered'
                : orderItem.status?.toLowerCase() === 'refund requested'
                ? 'Refund Requested'
                : orderItem.status}
            </p>
          </div>

          {!isRefunds && (
            <div className="min-w-[128px]">
              <p
                className={`inline-block text-custom-sm  py-0.5 px-2.5 rounded-[30px] capitalize ${
                  orderItem.paymentStatus === "paid" || orderItem.paymentStatus === "completed"
                    ? "text-green bg-green-light-6"
                    : orderItem.paymentStatus === "pending" || !orderItem.paymentStatus
                    ? "text-red bg-red-light-6"
                    : "text-dark bg-gray-2"
                }`}
              >
                {orderItem.paymentStatus || "pending"}
              </p>
            </div>
          )}

          <div className="min-w-[213px]">
            <p className="text-custom-sm text-dark">{orderItem.title}</p>
          </div>

          <div className="min-w-[113px]">
            <p className="text-custom-sm text-dark">{orderItem.total}</p>
          </div>

          <div className="flex gap-5 items-center">
            <OrderActions
              toggleDetails={toggleDetails}
              toggleEdit={toggleEdit}
            />
          </div>
        </div>
      )}

      {smallView && (
        <div className="block md:hidden">
          <div className="py-4.5 px-7.5">
            <div className="">
              <p className="text-custom-sm text-dark">
                <span className="font-bold pr-2"> Order:</span> #
                {String(orderItem.orderNumber || orderItem.orderId).slice(-8)}
              </p>
            </div>
            <div className="">
              <p className="text-custom-sm text-dark">
                <span className="font-bold pr-2">Date:</span>{" "}
                {orderItem.createdAt}
              </p>
            </div>

            <div className="">
              <p className="text-custom-sm text-dark">
                <span className="font-bold pr-2">Delivery Status:</span>{" "}
                <span
                  className={`inline-block text-custom-sm  py-0.5 px-2.5 rounded-[30px] capitalize ${
                    orderItem.status === "delivered" || orderItem.status === "completed"
                      ? "text-green bg-green-light-6"
                      : orderItem.status === "pending"
                      ? "text-red bg-red-light-6"
                      : orderItem.status === "processing" || orderItem.status === "preparing"
                      ? "text-yellow bg-yellow-light-4"
                      : orderItem.status === "shipped" || orderItem.status === "out for delivery"
                      ? "text-blue bg-blue-light-5"
                      : orderItem.status === "refund requested"
                      ? "text-orange-500 bg-orange-50"
                      : orderItem.status === "refunded"
                      ? "text-purple-600 bg-purple-50"
                      : "text-dark bg-gray-2"
                  }`}
                >
                  {orderItem.status?.toLowerCase() === 'completed'
                    ? 'Delivered'
                    : orderItem.status?.toLowerCase() === 'refund requested'
                    ? 'Refund Requested'
                    : orderItem.status}
                </span>
              </p>
            </div>

            {!isRefunds && (
              <div className="">
                <p className="text-custom-sm text-dark">
                  <span className="font-bold pr-2">Payment Status:</span>{" "}
                  <span
                    className={`inline-block text-custom-sm  py-0.5 px-2.5 rounded-[30px] capitalize ${
                      orderItem.paymentStatus === "paid" || orderItem.paymentStatus === "completed"
                        ? "text-green bg-green-light-6"
                        : orderItem.paymentStatus === "pending" || !orderItem.paymentStatus
                        ? "text-red bg-red-light-6"
                        : "text-dark bg-gray-2"
                    }`}
                  >
                    {orderItem.paymentStatus || "pending"}
                  </span>
                </p>
              </div>
            )}

            <div className="">
              <p className="text-custom-sm text-dark">
                <span className="font-bold pr-2">Title:</span> {orderItem.title}
              </p>
            </div>

            <div className="">
              <p className="text-custom-sm text-dark">
                <span className="font-bold pr-2">Total:</span> ₱
                {orderItem.total}
              </p>
            </div>

            <div className="">
              <div className="text-custom-sm text-dark flex items-center">
                <span className="font-bold pr-2">Actions:</span>{" "}
                <OrderActions
                  toggleDetails={toggleDetails}
                  toggleEdit={toggleEdit}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <OrderModal
        showDetails={showDetails}
        showEdit={showEdit}
        toggleModal={toggleModal}
        order={orderItem}
      />
    </>
  );
};

export default SingleOrder;
