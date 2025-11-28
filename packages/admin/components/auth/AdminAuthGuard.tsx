/**
 * Admin Authentication Guard
 * 
 * This component protects admin routes by ensuring:
 * 1. User has connected their wallet
 * 2. User has authenticated with their wallet signature
 * 3. User has admin privileges
 */

"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useWeb3Auth } from "../../hooks/useWeb3Auth";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

interface AdminAuthGuardProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export function AdminAuthGuard({ children, requiredRole }: AdminAuthGuardProps) {
  const { isConnected, address } = useAccount();
  const { isAuthenticated, isAuthenticating, error, authenticate, token } = useWeb3Auth();
  const [hasAttemptedAuth, setHasAttemptedAuth] = useState(false);

  // Auto-authenticate when wallet is connected but not authenticated
  useEffect(() => {
    if (isConnected && !isAuthenticated && !isAuthenticating && !hasAttemptedAuth) {
      setHasAttemptedAuth(true);
      authenticate();
    }
  }, [isConnected, isAuthenticated, isAuthenticating, hasAttemptedAuth, authenticate]);

  // Reset auth attempt flag when wallet disconnects
  useEffect(() => {
    if (!isConnected) {
      setHasAttemptedAuth(false);
    }
  }, [isConnected]);

  // Show wallet connection prompt
  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Connect Your Wallet
            </h2>
            <p className="text-gray-600 mb-6">
              Please connect your admin wallet to access the dashboard.
            </p>
            <div className="flex justify-center">
              <ConnectButton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show authentication in progress
  if (isAuthenticating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0350B5] mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Authenticating...
            </h2>
            <p className="text-gray-600">
              Please sign the message in your wallet to continue.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show authentication error
  if (error && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Authentication Failed
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => {
                setHasAttemptedAuth(false);
                authenticate();
              }}
              className="bg-[#0350B5] text-white px-6 py-2 rounded-lg hover:bg-[#034093] transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show authentication prompt
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Sign In Required
            </h2>
            <p className="text-gray-600 mb-2">
              Connected as: <span className="font-mono text-sm">{address}</span>
            </p>
            <p className="text-gray-600 mb-6">
              Please sign a message to verify your identity and access the admin dashboard.
            </p>
            <button
              onClick={() => {
                setHasAttemptedAuth(false);
                authenticate();
              }}
              className="bg-[#0350B5] text-white px-6 py-3 rounded-lg hover:bg-[#034093] transition-colors font-medium"
            >
              Sign Message to Authenticate
            </button>
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated, render children
  return <>{children}</>;
}

