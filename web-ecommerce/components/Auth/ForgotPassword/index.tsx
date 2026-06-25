"use client";

import Breadcrumb from "@/components/Common/Breadcrumb";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiAuth } from "@/lib/api";
import { toast } from "sonner";

const ForgotPassword = () => {
    const { setUser } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const res = await apiAuth.post("/api/customer-auth/login", { email, password });
            setUser(res.data.user);
            if (res.data.user) {
                toast.success("Welcome back!");
            } else {
                toast.error("Login failed. Please try again.");
            } 
            const redirect = searchParams.get("redirect") ?? "/";
            router.replace(redirect);
        } catch (err: any) {
            toast.error(err?.response?.data?.message ?? "Invalid email or password.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Breadcrumb title={"Forgot Password?"} pages={["Forgot Password"]} />
            <section className="overflow-hidden py-20 bg-gray-2">
                <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">

                    <div className="max-w-[570px] w-full mx-auto rounded-xl bg-white shadow-1 p-4 sm:p-7.5 xl:px-11">
                        <p className="text-start text-sm mb-8">
                            <Link href="/signin" className="hover:underline">
                                {"<"} Back to sign in
                            </Link>
                        </p>

                        {error && (
                            <div className="mb-5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>


                            <div className="mb-5">
                                <label htmlFor="email" className="block mb-2.5">
                                    Enter you email below.
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                                />
                            </div>


                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center font-medium text-white bg-dark py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue mt-7.5 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {isLoading ? "Sending..." : "Continue"}
                            </button>

                        </form>
                    </div>
                </div>
            </section >
        </>
    );
};

export default ForgotPassword;