"use client";
import React, { forwardRef, useImperativeHandle, useState } from "react";

const NAME_LIMIT = 32;
const STREET_LIMIT = 32;

interface BillingFields {
  firstName: string;
  lastName: string;
  companyName: string;
  streetAddress: string;
  streetAddressTwo: string;
  town: string;
  phone: string;
  email: string;
}

export interface BillingRef {
  validate: () => boolean;
  getValues: () => BillingFields;
}

const inputBase =
  "rounded-md border bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20";

const Counter = ({ value, limit }: { value: string; limit: number }) => {
  const over = value.length >= limit;
  return (
    <span className={`text-xs mt-1 block text-right ${over ? "text-red-500 font-semibold" : "text-dark-5"}`}>
      {value.length}/{limit}
    </span>
  );
};

const Billing = forwardRef<BillingRef>((_, ref) => {
  const [fields, setFields] = useState<BillingFields>({
    firstName: "",
    lastName: "",
    companyName: "",
    streetAddress: "",
    streetAddressTwo: "",
    town: "",
    phone: "",
    email: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof BillingFields, string>>>({});
  const [popupError, setPopupError] = useState<string | null>(null);

  const set = (key: keyof BillingFields, limit?: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;

    // Names: allow only letters, numbers, spaces
    if (key === "firstName" || key === "lastName" || key === "companyName") {
      val = val.replace(/[^a-zA-Z0-9\s]/g, "");
    }

    // Address & Town: allow letters, numbers, spaces, and safe punctuation
    if (key === "streetAddress" || key === "streetAddressTwo" || key === "town") {
      val = val.replace(/[^a-zA-Z0-9\s.,#-]/g, "");
    }

    // Phone: strip non-numeric chars
    if (key === "phone") {
      val = val.replace(/\D/g, "");
    }

    // Prevent typing past the limit
    if (limit && val.length > limit) {
      return;
    }

    setFields((prev) => ({ ...prev, [key]: val }));
    // Clear individual error on change
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof BillingFields, string>> = {};

    if (!fields.firstName.trim()) newErrors.firstName = "First name is required.";
    else if (fields.firstName.length > NAME_LIMIT) newErrors.firstName = `Max ${NAME_LIMIT} characters.`;

    if (!fields.lastName.trim()) newErrors.lastName = "Last name is required.";
    else if (fields.lastName.length > NAME_LIMIT) newErrors.lastName = `Max ${NAME_LIMIT} characters.`;

    if (!fields.streetAddress.trim()) newErrors.streetAddress = "Street address is required.";
    else if (fields.streetAddress.length > STREET_LIMIT) newErrors.streetAddress = `Max ${STREET_LIMIT} characters.`;

    if (!fields.town.trim()) newErrors.town = "Town / City is required.";

    if (!fields.phone.trim()) newErrors.phone = "Phone number is required.";
    else if (!/^\d+$/.test(fields.phone)) newErrors.phone = "Phone must contain numbers only.";

    if (!fields.email.trim()) newErrors.email = "Email address is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) newErrors.email = "Enter a valid email address.";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors)[0];
      setPopupError(firstError ?? "Please fix the errors in Billing details.");
      return false;
    }

    setPopupError(null);
    return true;
  };

  useImperativeHandle(ref, () => ({ validate, getValues: () => fields }));

  const borderClass = (key: keyof BillingFields) =>
    errors[key] ? "border-red-500" : "border-gray-3";

  return (
    <div className="mt-9">
      {/* Error Popup */}
      {popupError && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full mx-4 text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-dark mb-2">Incomplete Details</h3>
            <p className="text-dark-5 text-sm mb-6">{popupError}</p>
            <button
              type="button"
              onClick={() => setPopupError(null)}
              className="bg-blue text-white rounded-lg px-8 py-2.5 font-medium hover:bg-blue/90 transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}

      <h2 className="font-medium text-dark text-xl sm:text-2xl mb-5.5">Billing details</h2>

      <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5">
        {/* First / Last Name */}
        <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
          <div className="w-full">
            <label htmlFor="firstName" className="block mb-2.5">
              First Name <span className="text-red">*</span>
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              placeholder="Juan"
              value={fields.firstName}
              onChange={set("firstName", NAME_LIMIT)}
              className={`${inputBase} ${borderClass("firstName")}`}
            />
            <Counter value={fields.firstName} limit={NAME_LIMIT} />
            {errors.firstName && <p className="text-red-500 text-xs mt-0.5">{errors.firstName}</p>}
          </div>

          <div className="w-full">
            <label htmlFor="lastName" className="block mb-2.5">
              Last Name <span className="text-red">*</span>
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              placeholder="dela Cruz"
              value={fields.lastName}
              onChange={set("lastName", NAME_LIMIT)}
              className={`${inputBase} ${borderClass("lastName")}`}
            />
            <Counter value={fields.lastName} limit={NAME_LIMIT} />
            {errors.lastName && <p className="text-red-500 text-xs mt-0.5">{errors.lastName}</p>}
          </div>
        </div>

        {/* Company Name (optional) */}
        <div className="mb-5">
          <label htmlFor="companyName" className="block mb-2.5">Company Name</label>
          <input
            type="text"
            id="companyName"
            name="companyName"
            value={fields.companyName}
            onChange={set("companyName")}
            className={`${inputBase} border-gray-3`}
          />
        </div>

        {/* Country / Region */}
        <div className="mb-5">
          <label htmlFor="countryName" className="block mb-2.5">
            Country/ Region <span className="text-red">*</span>
          </label>
          <div className="relative">
            <select
              id="countryName"
              className="w-full bg-gray-1 rounded-md border border-gray-3 text-dark-4 py-3 pl-5 pr-9 duration-200 appearance-none outline-none focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
            >
              <option value="PH">Philippines</option>
            </select>
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-4 pointer-events-none">
              <svg className="fill-current" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.41469 5.03569L2.41467 5.03571L2.41749 5.03846L7.76749 10.2635L8.0015 10.492L8.23442 10.2623L13.5844 4.98735L13.5844 4.98735L13.5861 4.98569C13.6809 4.89086 13.8199 4.89087 13.9147 4.98569C14.0092 5.08024 14.0095 5.21864 13.9155 5.31345C13.9152 5.31373 13.915 5.31401 13.9147 5.31429L8.16676 10.9622L8.16676 10.9622L8.16469 10.9643C8.06838 11.0606 8.02352 11.0667 8.00039 11.0667C7.94147 11.0667 7.89042 11.0522 7.82064 10.9991L2.08526 5.36345C1.99127 5.26865 1.99154 5.13024 2.08609 5.03569C2.18092 4.94086 2.31986 4.94086 2.41469 5.03569Z" fill="" stroke="" strokeWidth="0.666667" />
              </svg>
            </span>
          </div>
        </div>

        {/* Street Address */}
        <div className="mb-5">
          <label htmlFor="address" className="block mb-2.5">
            Street Address <span className="text-red">*</span>
          </label>
          <input
            type="text"
            id="address"
            name="address"
            placeholder="House number and street name"
            value={fields.streetAddress}
            onChange={set("streetAddress", STREET_LIMIT)}
            className={`${inputBase} ${borderClass("streetAddress")}`}
          />
          <Counter value={fields.streetAddress} limit={STREET_LIMIT} />
          {errors.streetAddress && <p className="text-red-500 text-xs mt-0.5">{errors.streetAddress}</p>}

          <div className="mt-5">
            <input
              type="text"
              id="addressTwo"
              name="addressTwo"
              placeholder="Apartment, suite, unit, etc. (optional)"
              value={fields.streetAddressTwo}
              onChange={set("streetAddressTwo")}
              className={`${inputBase} border-gray-3`}
            />
          </div>
        </div>

        {/* Town / City */}
        <div className="mb-5">
          <label htmlFor="town" className="block mb-2.5">
            Town/ City <span className="text-red">*</span>
          </label>
          <input
            type="text"
            id="town"
            name="town"
            value={fields.town}
            onChange={set("town")}
            className={`${inputBase} ${borderClass("town")}`}
          />
          {errors.town && <p className="text-red-500 text-xs mt-0.5">{errors.town}</p>}
        </div>

        {/* Phone */}
        <div className="mb-5">
          <label htmlFor="phone" className="block mb-2.5">
            Phone <span className="text-red">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            inputMode="numeric"
            placeholder="09XXXXXXXXX"
            value={fields.phone}
            onChange={set("phone")}
            className={`${inputBase} ${borderClass("phone")}`}
          />
          {errors.phone && <p className="text-red-500 text-xs mt-0.5">{errors.phone}</p>}
        </div>

        {/* Email */}
        <div className="mb-5.5">
          <label htmlFor="email" className="block mb-2.5">
            Email Address <span className="text-red">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={fields.email}
            onChange={set("email")}
            className={`${inputBase} ${borderClass("email")}`}
          />
          {errors.email && <p className="text-red-500 text-xs mt-0.5">{errors.email}</p>}
        </div>

        {/* Create Account checkbox */}
        <div>
          <label htmlFor="checkboxLabelTwo" className="text-dark flex cursor-pointer select-none items-center">
            <div className="relative">
              <input type="checkbox" id="checkboxLabelTwo" className="sr-only" />
              <div className="mr-2 flex h-4 w-4 items-center justify-center rounded border border-gray-4">
                <span className="opacity-0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="4" y="4.00006" width="16" height="16" rx="4" fill="#3C50E0" />
                    <path fillRule="evenodd" clipRule="evenodd" d="M16.3103 9.25104C16.471 9.41178 16.5612 9.62978 16.5612 9.85707C16.5612 10.0844 16.471 10.3024 16.3103 10.4631L12.0243 14.7491C11.8635 14.9098 11.6455 15.0001 11.4182 15.0001C11.191 15.0001 10.973 14.9098 10.8122 14.7491L8.24062 12.1775C8.08448 12.0158 7.99808 11.7993 8.00003 11.5745C8.00199 11.3498 8.09214 11.1348 8.25107 10.9759C8.41 10.8169 8.62499 10.7268 8.84975 10.7248C9.0745 10.7229 9.29103 10.8093 9.4527 10.9654L11.4182 12.931L15.0982 9.25104C15.2589 9.09034 15.4769 9.00006 15.7042 9.00006C15.9315 9.00006 16.1495 9.09034 16.3103 9.25104Z" fill="white" />
                  </svg>
                </span>
              </div>
            </div>
            Create an Account
          </label>
        </div>
      </div>
    </div>
  );
});

Billing.displayName = "Billing";
export default Billing;
