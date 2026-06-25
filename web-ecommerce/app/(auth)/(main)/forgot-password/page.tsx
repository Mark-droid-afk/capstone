import React from "react";
import { Metadata } from "next";
import ForgotPassword from "@/components/Auth/ForgotPassword";

export const metadata: Metadata = {
  title: "Forgot Password Page | NextCommerce Nextjs E-commerce template",
  description: "This is Forgot Password Page for NextCommerce Template",
  // other metadata
};

const ForgotPasswordPage = () => {
  return (
    <main>
      <ForgotPassword />
    </main>
  );
};

export default ForgotPasswordPage;
