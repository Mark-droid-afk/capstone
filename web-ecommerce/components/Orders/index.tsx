import React, { useEffect, useState } from "react";
import SingleOrder from "./SingleOrder";
import apiPos from "@/lib/apiPos";

import { useAuth } from "@/context/AuthContext";

const Orders = ({ isRefunds }: { isRefunds?: boolean }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any>([]);

  useEffect(() => {
    if (!user?.id) return;
    apiPos.get(`/api-pos/customers/orders`, {
      headers: { "X-Auth-Id": user.id }
    })
      .then((res) => {
        let data = res.data;
        if (isRefunds) {
          data = data.filter((o: any) => o.orderStatus?.toLowerCase().includes("refund"));
        }
        
        const mapped = data.map((o: any) => ({
          ...o,
          status: o.orderStatus?.toLowerCase() ?? "",
          paymentStatus: o.paymentStatus?.toLowerCase() ?? "",
          title: o.items?.map((i: any) => `${i.productName} (${i.variationName})`).join(", ") ?? "",
          total: `₱${Number(o.totalAmount).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`,
          createdAt: new Date(o.createdAt).toLocaleDateString("en-PH", {
            year: "numeric", month: "short", day: "numeric"
          }),
        }));
        setOrders(mapped);
      })
      .catch((err) => {
        console.log(err.message);
      });
  }, [user?.id]);

  return (
    <>
      <div className="w-full overflow-x-auto">
        <div className="min-w-[898px]">
          {/* <!-- order item --> */}
          {orders.length > 0 && (
            <div className="items-center justify-between py-4.5 px-7.5 hidden md:flex ">
              <div className="min-w-[111px]">
                <p className="text-custom-sm text-dark">Order</p>
              </div>
              <div className="min-w-[175px]">
                <p className="text-custom-sm text-dark">Date</p>
              </div>

              <div className="min-w-[128px]">
                <p className="text-custom-sm text-dark">Delivery Status</p>
              </div>

              {!isRefunds && (
                <div className="min-w-[128px]">
                  <p className="text-custom-sm text-dark">Payment Status</p>
                </div>
              )}

              <div className="min-w-[213px]">
                <p className="text-custom-sm text-dark">Title</p>
              </div>

              <div className="min-w-[113px]">
                <p className="text-custom-sm text-dark">Total</p>
              </div>

              <div className="min-w-[113px]">
                <p className="text-custom-sm text-dark">Action</p>
              </div>
            </div>
          )}
          {orders.length > 0 ? (
            orders.map((orderItem: any, key: number) => (
              <SingleOrder key={key} orderItem={orderItem} smallView={false} isRefunds={isRefunds} />
            ))
          ) : (
            <p className="py-9.5 px-4 sm:px-7.5 xl:px-10">
              You don&apos;t have any orders!
            </p>
          )}
        </div>

        {orders.length > 0 &&
          orders.map((orderItem: any, key: number) => (
            <SingleOrder key={key} orderItem={orderItem} smallView={true} isRefunds={isRefunds} />
          ))}
      </div>
    </>
  );
};

export default Orders;
