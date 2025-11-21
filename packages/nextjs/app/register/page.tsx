"use client";

import { useState, useEffect } from "react";
import { useAccount, useConnect } from "wagmi";
import { useRouter } from "next/navigation";
import { WalletIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { Button } from "../_components/Button";

interface UserRegistrationData {
  name: string;
  email: string;
  wallet: string;
  companyName: string;
  role: string;
}

const initialFormData: UserRegistrationData = {
  name: "",
  email: "",
  wallet: "",
  companyName: "",
  role: "ADMIN",
};

export default function RegisterPage() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const router = useRouter();
  
  const [formData, setFormData] = useState<UserRegistrationData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof UserRegistrationData, string>>>({});

  // Auto-fill wallet address when connected
  useEffect(() => {
    if (address && isConnected) {
      setFormData((prev) => ({ ...prev, wallet: address }));
    }
  }, [address, isConnected]);

  const updateFormData = (updates: Partial<UserRegistrationData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    // Clear error for the field being updated
    if (updates && Object.keys(updates)[0]) {
      const fieldName = Object.keys(updates)[0] as keyof UserRegistrationData;
      setErrors((prev) => ({ ...prev, [fieldName]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UserRegistrationData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Invalid email format";
      }
    }

    if (!formData.wallet.trim()) {
      newErrors.wallet = "Wallet address is required";
    } else {
      const walletRegex = /^0x[a-fA-F0-9]{40}$/;
      if (!walletRegex.test(formData.wallet)) {
        newErrors.wallet = "Invalid wallet address format";
      }
    }

    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company name is required";
    }

    if (!formData.role.trim()) {
      newErrors.role = "Role is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage =
          result?.error ||
          result?.message ||
          result?.errors?.map((e: any) => e.message || e).join(", ") ||
          `Failed to register user (${response.status}: ${response.statusText})`;
        throw new Error(errorMessage);
      }

      console.log("User registered successfully:", result);
      alert("User registered successfully!");
      
      // Redirect to home or dashboard
      router.push("/");
    } catch (error) {
      console.error("Failed to register user:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to register user. Please try again.";
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex">
      {/* Left Section - Static Content */}
      <div className="hidden lg:flex lg:w-2/5 fundraiser-form-bg-box p-8 items-center">
        <div className="max-w-md">
          <h1 style={{ fontSize: "1.8em" }} className="font-bold text-[#001627] mb-4 leading-tight">
            Create Your Account
          </h1>
          <p style={{ fontSize: "1em" }} className="text-[#475068] leading-relaxed">
            Join AquaFund and start making a difference. Register your account to begin creating impactful projects.
          </p>
        </div>
      </div>

      {/* Right Section - Registration Form */}
      <div className="flex-1 bg-white overflow-y-auto">
        <div className="max-w-xl mx-auto px-6 py-8">
          <h2 style={{ fontSize: "1.5em" }} className="font-bold text-[#001627] mb-6">
            User Registration
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div>
              <label htmlFor="name" style={{ fontSize: "0.9em" }} className="block text-[#001627] font-medium mb-1.5">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => updateFormData({ name: e.target.value })}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0350B5] ${
                  errors.name ? "border-red-500" : "border-[#E0E7EF]"
                }`}
                placeholder="Enter your full name"
                style={{ fontSize: "0.9em" }}
              />
              {errors.name && (
                <p style={{ fontSize: "0.85em" }} className="text-red-500 mt-1">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" style={{ fontSize: "0.9em" }} className="block text-[#001627] font-medium mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => updateFormData({ email: e.target.value })}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0350B5] ${
                  errors.email ? "border-red-500" : "border-[#E0E7EF]"
                }`}
                placeholder="johndoe@example.com"
                style={{ fontSize: "0.9em" }}
              />
              {errors.email && (
                <p style={{ fontSize: "0.85em" }} className="text-red-500 mt-1">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Wallet Address Field */}
            <div>
              <label htmlFor="wallet" style={{ fontSize: "0.9em" }} className="block text-[#001627] font-medium mb-1.5">
                Wallet Address <span className="text-red-500">*</span>
              </label>
              {!isConnected ? (
                <>
                  <Button
                    type="button"
                    onClick={() => connect({ connector: connectors[0] })}
                    rounded="full"
                    style={{ fontSize: "0.9em", padding: "0.65em 1.2em" }}
                    className="w-full bg-[#0350B5] text-white hover:bg-[#034093] flex items-center justify-center gap-2 mb-2"
                  >
                    <WalletIcon className="w-5 h-5" />
                    <span>Connect Your Wallet</span>
                  </Button>
                  <input
                    type="text"
                    id="wallet"
                    value={formData.wallet}
                    onChange={(e) => updateFormData({ wallet: e.target.value })}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0350B5] ${
                      errors.wallet ? "border-red-500" : "border-[#E0E7EF]"
                    }`}
                    placeholder="0x..."
                    style={{ fontSize: "0.9em" }}
                  />
                </>
              ) : (
                <div className="space-y-2">
                  <div className="p-3 bg-[#E1FFFF] rounded-lg border-2 border-[#0350B5] flex items-center gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-[#0350B5] flex-shrink-0" />
                    <p style={{ fontSize: "0.9em" }} className="text-[#0350B5] font-medium">
                      Wallet Connected: {formData.wallet.slice(0, 6)}...{formData.wallet.slice(-4)}
                    </p>
                  </div>
                  <input
                    type="text"
                    id="wallet"
                    value={formData.wallet}
                    onChange={(e) => updateFormData({ wallet: e.target.value })}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0350B5] ${
                      errors.wallet ? "border-red-500" : "border-[#E0E7EF]"
                    }`}
                    placeholder="0x..."
                    style={{ fontSize: "0.9em" }}
                  />
                </div>
              )}
              {errors.wallet && (
                <p style={{ fontSize: "0.85em" }} className="text-red-500 mt-1">
                  {errors.wallet}
                </p>
              )}
            </div>

            {/* Company Name Field */}
            <div>
              <label htmlFor="companyName" style={{ fontSize: "0.9em" }} className="block text-[#001627] font-medium mb-1.5">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="companyName"
                value={formData.companyName}
                onChange={(e) => updateFormData({ companyName: e.target.value })}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0350B5] ${
                  errors.companyName ? "border-red-500" : "border-[#E0E7EF]"
                }`}
                placeholder="Enter your company name"
                style={{ fontSize: "0.9em" }}
              />
              {errors.companyName && (
                <p style={{ fontSize: "0.85em" }} className="text-red-500 mt-1">
                  {errors.companyName}
                </p>
              )}
            </div>

            {/* Role Field */}
            <div>
              <label htmlFor="role" style={{ fontSize: "0.9em" }} className="block text-[#001627] font-medium mb-1.5">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) => updateFormData({ role: e.target.value })}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0350B5] ${
                  errors.role ? "border-red-500" : "border-[#E0E7EF]"
                }`}
                style={{ fontSize: "0.9em" }}
              >
                <option value="ADMIN">ADMIN</option>
                <option value="USER">USER</option>
              </select>
              {errors.role && (
                <p style={{ fontSize: "0.85em" }} className="text-red-500 mt-1">
                  {errors.role}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                size="lg"
                rounded="full"
                style={{ fontSize: "0.9em", padding: "0.65em 1.2em" }}
                className="w-full bg-[#0350B5] text-white hover:bg-[#034093] disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Registering..." : "Register"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

