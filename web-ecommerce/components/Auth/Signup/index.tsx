"use client";

import Breadcrumb from "@/components/Common/Breadcrumb";
import { useAuth } from "@/context/AuthContext";
import { apiAuth } from "@/lib/api";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { toast } from "sonner";

const Signup = () => {
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const { setUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [passwordMismatch, setPasswordMismatch] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isCreating, setIsCreating] = React.useState(false);
  const [form, setForm] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    address: "",
  });
  const [confirmPassword, setConfirmPassword] = React.useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    setIsCreating(true);

    if (form.password !== confirmPassword) {
      toast.error("Passwords do not match.");
      setIsLoading(false);
      setIsCreating(false);
      setPasswordMismatch(true);
      return;
    }

    setPasswordMismatch(false);
    console.log("Submitting form:", form);
    try {
      const res = await apiAuth.post("/api/customer-auth/register", {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        phoneNumber: form.phone,
        address: form.address,
      });
      if (res.data) {
        toast.success(res.data.message || "Registration successful. Please check your email to confirm your account.");
        const redirect = searchParams.get("redirect") ?? "/signin";
        router.replace(redirect);
      } else {
        toast.error("Failed to create account. Please try again.");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? err?.response?.data?.message ?? "Failed to create account. Please try again.");
      console.error("registration error:", err);
    } finally {
      setIsLoading(false);
      setIsCreating(false);
    }
  };

  return (
    <>
      <Breadcrumb title={"Signup"} pages={["Signup"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="max-w-[570px] w-full mx-auto rounded-xl bg-white shadow-1 p-4 sm:p-7.5 xl:p-11">
            <div className="text-center mb-11">
              <h2 className="font-semibold text-xl sm:text-2xl xl:text-heading-5 text-dark mb-1.5">
                Create an Account
              </h2>
              <p>Enter your detail below</p>
            </div>
            <div className="mt-5.5">
              <form onSubmit={handleSubmit}>
                <div className="mb-5">
                  <label htmlFor="name" className="block mb-2.5">
                    First Name <span className="text-red">*</span>
                  </label>

                  <input
                    value={form.firstName}
                    onChange={e => setForm({ ...form, firstName: e.target.value })}
                    type="text"
                    name="name"
                    id="name"
                    placeholder="Enter your first name"
                    className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                  />
                </div>
                <div className="mb-5">
                  <label htmlFor="name" className="block mb-2.5">
                    Last Name <span className="text-red">*</span>
                  </label>

                  <input
                    value={form.lastName}
                    onChange={e => setForm({ ...form, lastName: e.target.value })}
                    type="text"
                    name="name"
                    id="name"
                    placeholder="Enter your last name"
                    className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                  />
                </div>

                <div className="mb-5">
                  <label htmlFor="email" className="block mb-2.5">
                    Email Address <span className="text-red">*</span>
                  </label>

                  <input
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    type="email"
                    name="email"
                    id="email"
                    placeholder="Enter your email address"
                    className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                  />
                </div>

                <div className="mb-5">
                  <label htmlFor="phone" className="block mb-2.5">
                    Phone Number
                  </label>

                  <input
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    type="text"
                    name="phone"
                    id="phone"
                    placeholder="Enter your phone number"
                    className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                  />
                </div>

                <div className="mb-5">
                  <label htmlFor="address" className="block mb-2.5">
                    Address
                  </label>

                  <input
                    value={form.address}
                    onChange={e => setForm({ ...form, address: e.target.value })}
                    type="text"
                    name="address"
                    id="address"
                    placeholder="Enter your address"
                    className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                  />
                </div>

                <div className="mb-5">
                  <label htmlFor="password" className="block mb-2.5">
                    Password <span className="text-red">*</span>
                  </label>

                  <input
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    type="password"
                    name="password"
                    id="password"
                    placeholder="Enter your password"
                    autoComplete="on"
                    className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                  />
                </div>

                <div className="mb-5.5">
                  <label htmlFor="re-type-password" className="block mb-2.5">
                    Re-type Password <span className="text-red">*</span>
                  </label>
                  <p className="text-red text-sm">
                    {passwordMismatch && "Passwords do not match"}
                  </p>

                  <input
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    type="password"
                    name="re-type-password"
                    id="re-type-password"
                    placeholder="Re-type your password"
                    autoComplete="on"
                    className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex justify-center font-medium text-white bg-dark py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue mt-7.5"
                >
                  {isCreating ? "Creating account..." : "Create Account"}
                </button>

                <p className="text-center mt-6">
                  Already have an account?
                  <Link
                    href="/signin"
                    className="text-dark ease-out duration-200 hover:text-blue pl-2"
                  >
                    Sign in Now
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Signup;
