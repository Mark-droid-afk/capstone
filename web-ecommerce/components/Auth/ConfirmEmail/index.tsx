"use client";

import Breadcrumb from "@/components/Common/Breadcrumb";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiAuth } from "@/lib/api";
import { toast } from "sonner";

const ConfirmEmail = () => {
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const email = searchParams.get("email");
    const [message, setMessage] = useState("");
    useEffect(() => {
        const confirmEmail = async () => {
            console.log("token:", token);
            console.log("email:", email);

            if (!token || !email) {
                toast.error("Invalid confirmation link. Please check your email and try again.");
                return;
            }

            setIsLoading(true);
            try {
                console.log("sending to API:", { email, token });
                const res = await apiAuth.get("/api/customer-auth/confirm-email", {
                    params: { email, token }
                });
                console.log("response:", res.data);
                setMessage(res.data.message || "Email confirmed successfully! You can now sign in.");
            } catch (err: any) {
                console.log("error response:", err?.response?.data);
                console.log("status:", err?.response?.status);
                const msg = err?.response?.data?.error || "Failed to confirm email. Please try again.";
                toast.error(msg);
            } finally {
                setIsLoading(false);
            }
        };

        confirmEmail();
    }, [token, email]);

    const handleContinue = () => {
        router.push("/signin");
    };

    return (
        <>
            <section className="overflow-hidden py-20 bg-white">
                <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">

                    <div className="max-w-[570px] w-full mx-auto rounded-xl bg-white shadow-3 p-4 sm:p-7.5 xl:px-11">
                        <p className="text-start text-sm mb-8">
                            <Link href="/signin" className="hover:underline">
                                {/* {"<"} Back to sign in */}
                            </Link>
                        </p>

                        {error && (
                            <div className="mb-5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3">
                                {error}
                            </div>
                        )}
                        <div className="text-center mb-11">
                            <h2 className="font-semibold text-xl sm:text-2xl xl:text-heading-5 text-dark mb-1.5">
                                {message || "Confirming your email..."}
                            </h2>
                            <p>Click the button below to continue.</p>
                        </div>


                        <button
                            type="button"
                            onClick={handleContinue}
                            disabled={isLoading}
                            className="w-full flex justify-center font-medium text-white bg-dark py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue mt-7.5 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Sending..." : "Continue"}
                        </button>

                    </div>
                </div>
            </section >
        </>
    );
};

export default ConfirmEmail;