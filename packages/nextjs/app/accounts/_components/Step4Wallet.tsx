"use client";

import { WalletIcon } from "@heroicons/react/24/outline";
import { NGOAccountData } from "../get-started/page";
import { Button } from "../../_components/Button";

interface Step4WalletProps {
  formData: NGOAccountData;
  updateFormData: (updates: Partial<NGOAccountData>) => void;
  onConnectWallet: () => void;
  isConnected: boolean;
}

export default function Step4Wallet({
  formData,
  updateFormData,
  onConnectWallet,
  isConnected,
}: Step4WalletProps) {
  return (
    <div className="space-y-3">
      {!isConnected ? (
        <>
          <Button
            onClick={onConnectWallet}
            rounded="full"
            style={{ fontSize: "0.9em", padding: "0.65em 1.2em" }}
            className="w-full bg-[#0350B5] text-white hover:bg-[#034093] flex items-center justify-center gap-2"
          >
            <WalletIcon className="w-5 h-5" />
            <span>Please Connect Your Wallet</span>
          </Button>
          <p style={{ fontSize: "0.85em" }} className="text-[#475068]">
            Don&apos;t have a wallet?{" "}
            <a href="https://metamask.io" target="_blank" rel="noopener noreferrer" className="text-[#0350B5] hover:underline">
              Create one here
            </a>
          </p>
        </>
      ) : (
        <div className="p-3 bg-[#E1FFFF] rounded-lg border-2 border-[#0350B5]">
          <p style={{ fontSize: "0.9em" }} className="text-[#0350B5] font-medium">
            Wallet Connected: {formData.walletAddress.slice(0, 6)}...{formData.walletAddress.slice(-4)}
          </p>
        </div>
      )}
    </div>
  );
}

