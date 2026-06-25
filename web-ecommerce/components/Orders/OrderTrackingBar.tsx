import React, { useEffect, useState } from "react";
import apiPos from "@/lib/apiPos";

import { useAuth } from "@/context/AuthContext";

interface OrderTrackingBarProps {
  orderId: number;
}

const OrderTrackingBar = ({ orderId }: OrderTrackingBarProps) => {
  const { user } = useAuth();
  const [trackingStage, setTrackingStage] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    apiPos.get(`/api-pos/customers/orders/${orderId}/tracking`, {
      headers: { "X-Auth-Id": user.id }
    })
      .then((res) => {
        setTrackingStage(res.data.trackingStage);
      })
      .catch((err) => {
        console.error("Failed to load tracking data", err);
      })
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) return <div className="py-4 text-center text-sm text-dark-5">Loading tracking details...</div>;
  if (trackingStage === 0) return null;

  const stages = [
    { id: 1, label: "Pending" },
    { id: 2, label: "Processing" },
    { id: 3, label: "Shipped" },
    { id: 4, label: "Delivered" },
  ];

  return (
    <div className="w-full py-6 px-4">
      <h3 className="text-lg font-medium text-dark mb-6">Delivery Progress</h3>
      <div className="flex justify-between items-center relative">
        {/* Lines container constrained to circle centers */}
        <div className="absolute top-4 left-4 right-4 h-1 bg-gray-3 -z-10 rounded overflow-hidden">
          {/* Active line */}
          <div 
            className="h-full bg-blue transition-all duration-500 rounded" 
            style={{ width: `${(trackingStage - 1) * 33.33}%` }}
          ></div>
        </div>

        {stages.map((stage) => {
          const isActive = trackingStage >= stage.id;
          return (
            <div key={stage.id} className="flex flex-col items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 text-sm font-medium transition-colors duration-300 ${
                  isActive 
                    ? "bg-blue border-blue text-white" 
                    : "bg-white border-gray-4 text-dark-5"
                }`}
              >
                {isActive ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                ) : (
                  stage.id
                )}
              </div>
              <p className={`mt-2 text-xs sm:text-sm font-medium ${isActive ? "text-dark" : "text-dark-5"}`}>
                {stage.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTrackingBar;
