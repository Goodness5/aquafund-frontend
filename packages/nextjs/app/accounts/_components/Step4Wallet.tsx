"use client";

import { useEffect } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { NGOAccountData } from "../../ngo/get-started/page";

interface Step4WalletProps {
  formData: NGOAccountData;
  updateFormData: (updates: Partial<NGOAccountData>) => void;
  onConnectWallet?: () => void;
  isConnected?: boolean;
}

export default function Step4Wallet({
  formData,
  updateFormData,
}: Step4WalletProps) {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  
  // Update wallet address when connected
  useEffect(() => {
    if (address && address !== formData.walletAddress) {
      updateFormData({ walletAddress: address });
    }
  }, [address, formData.walletAddress, updateFormData]);
  
  // Clear wallet address when disconnected
  useEffect(() => {
    if (!isConnected && formData.walletAddress) {
      updateFormData({ walletAddress: "" });
    }
  }, [isConnected, formData.walletAddress, updateFormData]);
  
  // Check if wallet is actually connected and address is set
  const hasWalletAddress = !!formData.walletAddress && formData.walletAddress.length > 0;
  const showConnected = isConnected && hasWalletAddress;

  const handleDisconnect = () => {
    disconnect();
    updateFormData({ walletAddress: "" });
  };

  return (
    <div className="space-y-3">
      {!showConnected ? (
        <>
          <div className="w-full">
            <ConnectButton.Custom>
              {({ account, chain, openConnectModal, mounted }) => {
                const connected = mounted && account && chain;

                return (
                  <div>
                    {(() => {
                      if (!connected) {
                        return (
                          <button
                            onClick={openConnectModal}
                            type="button"
                            style={{ fontSize: "0.9em", padding: "0.65em 1.2em" }}
                            className="w-full bg-[#0350B5] text-white hover:bg-[#034093] rounded-full flex items-center justify-center gap-2 font-medium transition-colors"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-5 h-5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3"
                              />
                            </svg>
                            <span>Please Connect Your Wallet</span>
                          </button>
                        );
                      }

                      return null;
                    })()}
                  </div>
                );
              }}
            </ConnectButton.Custom>
          </div>
          <p style={{ fontSize: "0.85em" }} className="text-[#475068]">
            Don&apos;t have a wallet?{" "}
            <a href="https://metamask.io" target="_blank" rel="noopener noreferrer" className="text-[#0350B5] hover:underline">
              Create one here
            </a>
          </p>
        </>
      ) : (
        <div className="space-y-3">
          <div className="p-3 bg-[#E1FFFF] rounded-lg border-2 border-[#0350B5]">
            <div className="flex items-center justify-between">
              <div>
                <p style={{ fontSize: "0.85em" }} className="text-[#475068] mb-1">
                  Wallet Connected
                </p>
                <p style={{ fontSize: "0.9em" }} className="text-[#0350B5] font-medium">
                  {formData.walletAddress.slice(0, 6)}...{formData.walletAddress.slice(-4)}
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <button
                  onClick={openConnectModal}
                  type="button"
                  style={{ fontSize: "0.85em", padding: "0.5em 1em" }}
                  className="flex-1 bg-white text-[#0350B5] border border-[#0350B5] hover:bg-[#F5F5F5] rounded-full font-medium transition-colors"
                >
                  Change Wallet
                </button>
              )}
            </ConnectButton.Custom>
            <button
              onClick={handleDisconnect}
              type="button"
              style={{ fontSize: "0.85em", padding: "0.5em 1em" }}
              className="flex-1 bg-white text-[#ff5a5f] border border-[#ff5a5f] hover:bg-[#F5F5F5] rounded-full font-medium transition-colors"
            >
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

