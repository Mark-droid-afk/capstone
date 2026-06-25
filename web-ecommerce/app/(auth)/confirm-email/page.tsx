import React from "react";
import { Suspense } from "react";
import { Metadata } from "next";
import ConfirmEmail from "@/components/Auth/ConfirmEmail";
export const metadata: Metadata = {
    title: "Confirm Email | NextCommerce Nextjs E-commerce template",
    description: "This is Confirm Email Page for NextCommerce Template",
    // other metadata
};

const ConfirmEmailPage = () => {
    return (
        <main>
            <Suspense fallback={<div>Loading...</div>}>
                <ConfirmEmail />
            </Suspense>
        </main>
    );
};

export default ConfirmEmailPage;
