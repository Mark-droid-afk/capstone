"use client";
import React, { useState } from "react";

type PaymentMethodProps = {
  onPaymentChange: (method: string) => void;
};

const PaymentMethod = ({ onPaymentChange }: PaymentMethodProps) => {
  const [payment, setPayment] = useState("COD");

  const handleChange = (method: string) => {
    setPayment(method);
    onPaymentChange(method);
  };

  const optionClass = (key: string) =>
    `rounded-md border-[0.5px] py-3.5 px-5 ease-out duration-200 hover:bg-gray-2 hover:border-transparent hover:shadow-none min-w-[240px] ${
      payment === key ? "border-transparent bg-gray-2" : "border-gray-4 shadow-1"
    }`;

  const radioClass = (key: string) =>
    `flex h-4 w-4 items-center justify-center rounded-full ${
      payment === key ? "border-4 border-blue" : "border border-gray-4"
    }`;

  return (
    <div className="bg-white shadow-1 rounded-[10px] mt-7.5">
      <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
        <h3 className="font-medium text-xl text-dark">Payment Method</h3>
      </div>

      <div className="p-4 sm:p-8.5">
        <div className="flex flex-col gap-3">
          {/* COD */}
          <label
            htmlFor="COD"
            className="flex cursor-pointer select-none items-center gap-4"
          >
            <div className="relative">
              <input
                type="radio"
                name="paymentMethod"
                id="COD"
                className="sr-only"
                checked={payment === "COD"}
                onChange={() => handleChange("COD")}
              />
              <div className={radioClass("COD")} />
            </div>
            <div className={optionClass("COD")}>
              <div className="flex items-center gap-2.5">
                {/* Cash icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-green-600 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17 9V7a4 4 0 00-8 0v2M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                <div className="border-l border-gray-4 pl-2.5">
                  <p className="font-medium text-dark">Cash on Delivery</p>
                  <p className="text-sm text-gray-500">Pay when your order arrives</p>
                </div>
              </div>
            </div>
          </label>

          {/* GCash */}
          <label
            htmlFor="GCash"
            className="flex cursor-pointer select-none items-center gap-4"
          >
            <div className="relative">
              <input
                type="radio"
                name="paymentMethod"
                id="GCash"
                className="sr-only"
                checked={payment === "GCash"}
                onChange={() => handleChange("GCash")}
              />
              <div className={radioClass("GCash")} />
            </div>
            <div className={optionClass("GCash")}>
              <div className="flex items-center gap-2.5">
                {/* Cube Icon */}
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="flex-shrink-0 h-6 w-6 text-body"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M11.665 3.75618C11.8762 3.65061 12.1247 3.65061 12.3358 3.75618L18.7807 6.97853L12.3358 10.2009C12.1247 10.3064 11.8762 10.3064 11.665 10.2009L5.22014 6.97853L11.665 3.75618ZM4.29297 8.19199V16.0946C4.29297 16.3787 4.45347 16.6384 4.70757 16.7654L11.25 20.0365V11.6512C11.1631 11.6205 11.0777 11.5843 10.9942 11.5425L4.29297 8.19199ZM12.75 20.037L19.2933 16.7654C19.5474 16.6384 19.7079 16.3787 19.7079 16.0946V8.19199L13.0066 11.5425C12.9229 11.5844 12.8372 11.6207 12.75 11.6515V20.037ZM13.0066 2.41453C12.3732 2.09783 11.6277 2.09783 10.9942 2.41453L4.03676 5.89316C3.27449 6.27429 2.79297 7.05339 2.79297 7.90563V16.0946C2.79297 16.9468 3.27448 17.7259 4.03676 18.1071L10.9942 21.5857L11.3296 20.9149L10.9942 21.5857C11.6277 21.9024 12.3732 21.9024 13.0066 21.5857L19.9641 18.1071C20.7264 17.7259 21.2079 16.9468 21.2079 16.0946V7.90563C21.2079 7.05339 20.7264 6.27429 19.9641 5.89316L13.0066 2.41453Z"
                    fill="#495270"
                  />
                </svg>
                <div className="border-l border-gray-4 pl-2.5">
                  <p className="font-medium text-dark">E-WALLET / CARD / QR PH </p>
                  <p className="text-sm text-gray-500">
                    Redirect to Xendit sandbox for other payment options
                  </p>
                </div>
              </div>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethod;
