/**
 * Web3 Authentication Hook
 * 
 * This hook provides a complete Web3 authentication flow:
 * 1. Request a challenge from the backend
 * 2. Sign the message with the user's wallet
 * 3. Verify the signature with the backend
 * 4. Store the auth token and manage the session
 */

import { useState, useCallback, useEffect } from "react";
import { useAccount, useSignMessage, useChainId } from "wagmi";
import type { Address } from "viem";
import {
  generateSiweMessage,
  requestAuthChallenge,
  verifySignature,
  refreshAuthToken,
  isTokenValid,
  getTokenExpiryTime,
  type AuthToken,
} from "../services/auth/web3Auth";
import { useAuthStore } from "../services/store/authStore";

interface UseWeb3AuthReturn {
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  error: string | null;
  authenticate: () => Promise<void>;
  logout: () => void;
  token: string | null;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_API_URL || "https://aquafund.koyeb.app";

export function useWeb3Auth(): UseWeb3AuthReturn {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { signMessageAsync } = useSignMessage();
  const { token, setAuth, clearAuth, isAuthenticated } = useAuthStore();

  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Authenticate the user with their wallet
   */
  const authenticate = useCallback(async () => {
    if (!address || !isConnected) {
      setError("Please connect your wallet first");
      return;
    }

    setIsAuthenticating(true);
    setError(null);

    try {
      // Step 1: Request a challenge from the backend
      const challenge = await requestAuthChallenge(address, BACKEND_URL);

      // Step 2: Generate the SIWE message
      const message = generateSiweMessage(
        address,
        chainId,
        challenge.nonce
      );

      // Step 3: Sign the message with the user's wallet
      const signature = await signMessageAsync({
        message,
      });

      // Step 4: Verify the signature with the backend and get the auth token
      const authToken = await verifySignature(
        address,
        signature,
        message,
        BACKEND_URL
      );

      // Step 5: Store the auth token
      setAuth(authToken.token, authToken.expiresAt, address, authToken.role);

      setError(null);
    } catch (err) {
      console.error("Authentication error:", err);
      setError(err instanceof Error ? err.message : "Authentication failed");
      clearAuth();
    } finally {
      setIsAuthenticating(false);
    }
  }, [address, isConnected, chainId, signMessageAsync, setAuth, clearAuth]);

  /**
   * Logout the user
   */
  const logout = useCallback(() => {
    clearAuth();
    setError(null);
  }, [clearAuth]);

  /**
   * Auto-refresh token before it expires
   */
  useEffect(() => {
    if (!token || !isAuthenticated) return;

    const authState = useAuthStore.getState();
    const expiresAt = authState.expiresAt;

    if (!expiresAt || !isTokenValid(expiresAt)) {
      clearAuth();
      return;
    }

    const timeUntilExpiry = getTokenExpiryTime(expiresAt);
    const refreshTime = timeUntilExpiry - 5 * 60 * 1000; // Refresh 5 minutes before expiry

    if (refreshTime <= 0) {
      clearAuth();
      return;
    }

    const refreshTimer = setTimeout(async () => {
      try {
        const newToken = await refreshAuthToken(token, BACKEND_URL);
        setAuth(newToken.token, newToken.expiresAt, newToken.address, newToken.role);
      } catch (err) {
        console.error("Token refresh failed:", err);
        clearAuth();
      }
    }, refreshTime);

    return () => clearTimeout(refreshTimer);
  }, [token, isAuthenticated, setAuth, clearAuth]);

  /**
   * Clear auth if wallet disconnects
   */
  useEffect(() => {
    if (!isConnected && isAuthenticated) {
      clearAuth();
    }
  }, [isConnected, isAuthenticated, clearAuth]);

  /**
   * Verify wallet address matches authenticated address
   */
  useEffect(() => {
    if (isConnected && isAuthenticated && address) {
      const authState = useAuthStore.getState();
      if (authState.address && authState.address.toLowerCase() !== address.toLowerCase()) {
        // Wallet address changed, clear auth
        clearAuth();
      }
    }
  }, [address, isConnected, isAuthenticated, clearAuth]);

  return {
    isAuthenticated,
    isAuthenticating,
    error,
    authenticate,
    logout,
    token,
  };
}

