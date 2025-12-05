"use client";

import { useEffect } from "react";
import { FundraiserFormData } from "../create/page";

interface Step4FundManagementProps {
  formData: FundraiserFormData;
  updateFormData: (updates: Partial<FundraiserFormData>) => void;
  walletAddress?: string;
}

const tokens = [
  { value: "USDT", label: "USDT" },
  { value: "USDC", label: "USDC" },
  { value: "DAI", label: "DAI" },
  { value: "STRK", label: "STRK" },
];

const fundUsageOptions = [
  {
    value: "direct" as const,
    title: "Direct execution by NGO",
    description: "Your team manages and executes the project directly",
  },
  {
    value: "contractors" as const,
    title: "Partnered local contractors",
    description: "You'll collaborate with verified local teams to deliver results.",
  },
  {
    value: "aquafund" as const,
    title: "Aquafund-assisted disbursement",
    description: "Aquafund helps disburse funds securely and track progress transparently.",
  },
];

export default function Step4FundManagement({
  formData,
  updateFormData,
  walletAddress,
}: Step4FundManagementProps) {
  // Auto-fill wallet address only once when wallet connects and field is empty
  useEffect(() => {
    if (walletAddress && formData.walletAddress === "") {
      updateFormData({ walletAddress });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress]); // Only run when walletAddress changes, not when formData changes

  return (
    <div className="space-y-4">
      {/* Section 1: How to receive funds */}
      <div>
        <h3 style={{ fontSize: "1.1em" }} className="font-semibold text-[#001627] mb-2">
          Choose how you want to receive funds
        </h3>
        <div className="space-y-2.5">
          {/* Preferred Token */}
          <div>
            <label style={{ fontSize: "0.85em" }} className="block font-medium text-[#475068] mb-1">
              Preferred Token
            </label>
            <div className="relative">
              <select
                value={formData.preferredToken}
                onChange={(e) => updateFormData({ preferredToken: e.target.value })}
                style={{ fontSize: "0.9em", padding: "0.5em 0.75em" }}
                className="w-full border-2 border-[#CAC4D0] rounded-lg focus:outline-none focus:border-[#0350B5] transition-colors appearance-none bg-white"
              >
                <option value="">Select token</option>
                {tokens.map((token) => (
                  <option key={token.value} value={token.value}>
                    {token.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg
                  className="w-4 h-4 text-[#475068]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Wallet Address */}
          <div>
            <label style={{ fontSize: "0.85em" }} className="block font-medium text-[#475068] mb-1">
              Wallet Address
            </label>
            <input
              type="text"
              value={formData.walletAddress || walletAddress || ""}
              onChange={(e) => updateFormData({ walletAddress: e.target.value })}
              placeholder="Paste your wallet address"
              style={{ fontSize: "0.9em", padding: "0.5em 0.75em" }}
              className="w-full border-2 border-[#CAC4D0] rounded-lg focus:outline-none focus:border-[#0350B5] transition-colors"
            />
            {walletAddress && (
              <p style={{ fontSize: "0.8em" }} className="text-[#00BF3C] mt-0.5">
                Using connected wallet: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Section 2: How funds will be used */}
      <div>
        <h3 style={{ fontSize: "1.1em" }} className="font-semibold text-[#001627] mb-2">
          Choose how funds will be used
        </h3>
        <div className="space-y-1.5">
          {fundUsageOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => updateFormData({ fundUsage: option.value })}
              style={{ padding: "0.65em" }}
              className={`w-full text-left rounded-lg border-2 transition-all ${
                formData.fundUsage === option.value
                  ? "border-[#0350B5] bg-[#E1FFFF]/30"
                  : "border-[#CAC4D0] hover:border-[#0350B5]"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    formData.fundUsage === option.value
                      ? "border-[#0350B5] bg-[#0350B5]"
                      : "border-[#CAC4D0]"
                  }`}
                >
                  {formData.fundUsage === option.value && (
                    <div className="w-2.5 h-2.5 rounded-full bg-white" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 style={{ fontSize: "0.9em" }} className="font-semibold text-[#001627] mb-0.5">{option.title}</h4>
                  <p style={{ fontSize: "0.8em" }} className="text-[#475068]">{option.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

