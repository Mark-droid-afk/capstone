"use client";
import React, { useEffect, useRef, useState } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import Login from "./Login";
import Shipping from "./Shipping";
import ShippingMethod from "./ShippingMethod";
import PaymentMethod from "./PaymentMethod";
import Coupon from "./Coupon";
import Billing, { BillingRef } from "./Billing";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useSelector, useDispatch } from "react-redux";
import { selectCartItems, selectTotalPrice, removeAllItemsFromCart } from "@/redux/features/cart-slice";
import apiPos from "@/lib/apiPos";
import { toast } from "sonner";
const Checkout = () => {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const dispatch = useDispatch();

  const cartItems = useSelector(selectCartItems);
  const totalPrice = useSelector(selectTotalPrice);

  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const billingRef = useRef<BillingRef>(null);

  // Ref to keep latest paymentMethod in closure
  const paymentMethodRef = useRef(paymentMethod);
  useEffect(() => {
    paymentMethodRef.current = paymentMethod;
  }, [paymentMethod]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/signin");
    }
  }, [user, isLoading]);

  if (isLoading) return <div>Loading...</div>;
  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      setErrorMsg("Your cart is empty.");
      return;
    }

    // Validate billing fields before submitting
    if (billingRef.current && !billingRef.current.validate()) {
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const billingValues = billingRef.current ? billingRef.current.getValues() : null;
    const contactPerson = billingValues
      ? `${billingValues.firstName} ${billingValues.lastName}`.trim()
      : `${user.firstName} ${user.lastName}`.trim();

    const deliveryAddress = billingValues
      ? `${billingValues.streetAddress}${billingValues.streetAddressTwo ? `, ${billingValues.streetAddressTwo}` : ""}, ${billingValues.town}, Philippines`
      : "";

    const institutionalStreet = billingValues
      ? `${billingValues.streetAddress}${billingValues.streetAddressTwo ? `, ${billingValues.streetAddressTwo}` : ""}`
      : "";

    const institutionalCity = billingValues ? billingValues.town : "";

    try {
      const payload = {
        customerId: null,
        customerAuthId: user.id,
        orderType: "Online",
        paymentMethod: paymentMethodRef.current,
        deliveryAddress,
        institutionalStreet,
        institutionalCity,
        institutionalProvince: "Metro Manila",
        institutionalZipCode: "",
        contactPerson,
        isPreorder: false,
        applyPwdDiscount: false,
        items: cartItems.map((item) => ({
          variationId: item.id,
          quantity: item.quantity,
        })),
      };

      const res = await apiPos.post("/api-pos/order-entry/orders/ecommerce", payload);
      const data = res.data;

      // EC-020: If GCash, redirect to Xendit sandbox portal
      if (data.paymentUrl) {
        dispatch(removeAllItemsFromCart());
        toast.success("Order placed successfully! Redirecting to payment portal...");
        window.location.href = data.paymentUrl;
        return;
      }

      // COD or no payment URL → redirect to success page
      dispatch(removeAllItemsFromCart());
      toast.success("Order placed successfully!");
      router.push(`/checkout/success?orderId=${data.orderId}&orderNumber=${data.orderNumber}&method=${encodeURIComponent(paymentMethodRef.current)}`);
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to place order. Please try again.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Breadcrumb title={"Checkout"} pages={["checkout"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-11">
              {/* <!-- checkout left --> */}
              <div className="lg:max-w-[670px] w-full">
                {/* <!-- login box --> */}
                <Login />

                {/* <!-- billing details --> */}
                <Billing ref={billingRef} />

                {/* <!-- address box two --> */}
                <Shipping />

                {/* <!-- others note box --> */}
                <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5 mt-7.5">
                  <div>
                    <label htmlFor="notes" className="block mb-2.5">
                      Other Notes (optional)
                    </label>

                    <textarea
                      name="notes"
                      id="notes"
                      rows={5}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Notes about your order, e.g. special notes for delivery."
                      className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full p-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    />
                  </div>
                </div>
              </div>

              {/* <!-- checkout right --> */}
              <div className="max-w-[455px] w-full">
                {/* <!-- order list box --> */}
                <div className="bg-white shadow-1 rounded-[10px]">
                  <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
                    <h3 className="font-medium text-xl text-dark">Your Order</h3>
                  </div>

                  <div className="pt-2.5 pb-8.5 px-4 sm:px-8.5">
                    {/* <!-- title --> */}
                    <div className="flex items-center justify-between py-5 border-b border-gray-3">
                      <h4 className="font-medium text-dark">Product</h4>
                      <h4 className="font-medium text-dark text-right">Subtotal</h4>
                    </div>

                    {/* <!-- cart items (dynamic) --> */}
                    {cartItems.length === 0 ? (
                      <div className="py-5 text-center text-gray-500">Your cart is empty.</div>
                    ) : (
                      cartItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between py-5 border-b border-gray-3"
                        >
                          <p className="text-dark">
                            {item.title}
                            {item.quantity > 1 && (
                              <span className="text-dark-5 text-sm ml-1">× {item.quantity}</span>
                            )}
                          </p>
                          <p className="text-dark text-right">
                            ₱{(item.discountedPrice * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))
                    )}

                    {/* <!-- total --> */}
                    <div className="flex items-center justify-between pt-5">
                      <p className="font-medium text-lg text-dark">Total</p>
                      <p className="font-medium text-lg text-dark text-right">
                        ₱{totalPrice.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* <!-- coupon box --> */}
                <Coupon />

                {/* <!-- shipping box --> */}
                <ShippingMethod />

                {/* <!-- payment box --> */}
                <PaymentMethod onPaymentChange={setPaymentMethod} />

                {/* Error message */}
                {errorMsg && (
                  <div className="mt-4 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                    {errorMsg}
                  </div>
                )}

                {/* Xendit notice */}
                {paymentMethod === "GCash" && (
                  <div className="mt-4 rounded-md bg-blue-50 border border-blue-200 p-3 text-sm text-blue-700">
                    You will be redirected to the Xendit payment portal to complete your payment.
                  </div>
                )}

                {/* <!-- checkout button --> */}
                <button
                  id="checkout-submit-btn"
                  type="submit"
                  disabled={isSubmitting || cartItems.length === 0}
                  className="w-full flex justify-center font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark mt-7.5 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting
                    ? "Processing…"
                    : paymentMethod === "GCash"
                    ? "Pay via Xendit →"
                    : "Place Order"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default Checkout;
