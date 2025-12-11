"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { XMarkIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { useAccount } from "wagmi";
import { formatEther, parseEther } from "viem";

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectTitle: string;
  organizerName: string;
  organizerLink?: string;
  projectImage?: string;
  onContinue: (amount: string, token: string, aquafundTip: number) => void;
}

const tokens = [
  { value: "BNB", label: "BNB", symbol: "BNB" },
  { value: "USDT", label: "USDT", symbol: "USDT" },
  { value: "USDC", label: "USDC", symbol: "USDC" },
  { value: "DAI", label: "DAI", symbol: "DAI" },
];

const aquafundTipPercentages = [5, 10, 15, 20];

export default function DonationModal({
  isOpen,
  onClose,
  projectTitle,
  organizerName,
  organizerLink,
  projectImage,
  onContinue,
}: DonationModalProps) {
  const { isConnected } = useAccount();
  const [selectedToken, setSelectedToken] = useState("BNB");
  const [amount, setAmount] = useState("0");
  const [usdAmount, setUsdAmount] = useState("0.00");
  const [aquafundTip, setAquafundTip] = useState<number | null>(null);
  const [showTokenDropdown, setShowTokenDropdown] = useState(false);

  // Mock USD conversion (in real app, fetch from price API)
  useEffect(() => {
    if (amount && parseFloat(amount) > 0) {
      // Simple conversion - in production, use actual token prices
      const tokenPrice = selectedToken === "BNB" ? 300 : 1; // Mock prices
      const usd = (parseFloat(amount) * tokenPrice).toFixed(2);
      setUsdAmount(usd);
    } else {
      setUsdAmount("0.00");
    }
  }, [amount, selectedToken]);

  if (!isOpen) return null;

  const handleContinue = () => {
    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid donation amount");
      return;
    }
    onContinue(amount, selectedToken, aquafundTip || 0);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-[#001627]">Make a Donation</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <XMarkIcon className="w-6 h-6 text-[#475068]" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Project Information */}
          <div className="flex items-start gap-4">
            {projectImage && (
              <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={projectImage}
                  alt={projectTitle}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#475068] mb-1">
                You are donating to <strong className="text-[#001627]">{projectTitle}</strong>
              </p>
              <p className="text-sm text-[#475068]">
                Your donations will go to{" "}
                {organizerLink ? (
                  <Link href={organizerLink} className="text-[#0350B5] hover:underline">
                    {organizerName}
                  </Link>
                ) : (
                  <strong className="text-[#001627]">{organizerName}</strong>
                )}
              </p>
            </div>
          </div>

          {/* Enter your donation */}
          <div>
            <h3 className="text-lg font-bold text-[#001627] mb-4">Enter your donation</h3>
            <div className="flex items-center gap-2 mb-2">
              {/* Token Selector */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowTokenDropdown(!showTokenDropdown)}
                  className="flex items-center gap-2 px-4 py-3 bg-[#0350B5] text-white rounded-lg hover:bg-[#034093] transition-colors font-medium"
                >
                  <span>{selectedToken}</span>
                  <ChevronDownIcon className="w-4 h-4" />
                </button>
                {showTokenDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowTokenDropdown(false)}
                    />
                    <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[120px]">
                      {tokens.map((token) => (
                        <button
                          key={token.value}
                          type="button"
                          onClick={() => {
                            setSelectedToken(token.value);
                            setShowTokenDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors first:rounded-t-lg last:rounded-b-lg"
                        >
                          {token.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Amount Input */}
              <div className="flex-1 text-center">
                <input
                  type="number"
                  step="0.0001"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-4xl font-bold text-[#001627] text-center w-full border-none outline-none bg-transparent"
                  placeholder="0"
                />
              </div>

              {/* USD Conversion */}
              <div className="bg-gray-100 rounded-lg px-4 py-3 min-w-[100px] text-right">
                <div className="text-sm text-[#475068]">$</div>
                <div className="text-lg font-semibold text-[#001627]">${usdAmount}</div>
              </div>
            </div>
            <Link
              href="#"
              className="text-sm text-[#0350B5] hover:underline"
              onClick={(e) => {
                e.preventDefault();
                // Handle wallet transfer
              }}
            >
              Transfer from your wallet
            </Link>
          </div>

          {/* Give to AquaFund */}
          <div>
            <h3 className="text-lg font-bold text-[#001627] mb-2">Give to AquaFund</h3>
            <p className="text-sm text-[#475068] mb-4">
              AquaFund is completely free for donation organizers. We are able to stay relevant
              for those who leave an optional amount here.
            </p>
            <div className="flex gap-2">
              {aquafundTipPercentages.map((percentage) => (
                <button
                  key={percentage}
                  type="button"
                  onClick={() => setAquafundTip(aquafundTip === percentage ? null : percentage)}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    aquafundTip === percentage
                      ? "bg-[#0350B5] text-white"
                      : "bg-[#E1FFFF] text-[#0350B5] hover:bg-[#0350B5] hover:text-white"
                  }`}
                >
                  {percentage}%
                </button>
              ))}
            </div>
          </div>

          {/* Terms and Continue */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-[#475068] text-center">
              By clicking continue, you agree to our{" "}
              <Link href="/terms" className="text-[#0350B5] hover:underline">
                terms
              </Link>{" "}
              and{" "}
              <Link href="/conditions" className="text-[#0350B5] hover:underline">
                conditions
              </Link>
            </p>
            <button
              onClick={handleContinue}
              disabled={!isConnected || !amount || parseFloat(amount) <= 0}
              className="w-full px-6 py-3 bg-[#0350B5] text-white rounded-lg hover:bg-[#034093] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

