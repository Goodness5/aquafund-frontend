/**
 * Web3 Authentication Utilities
 * 
 * This module provides utilities for Web3-based authentication using message signing.
 * It implements a secure authentication flow where users sign a message with their wallet,
 * and the backend verifies the signature before issuing a JWT token.
 */

import { SiweMessage } from "siwe";
import type { Address } from "viem";

export interface AuthChallenge {
  message: string;
  nonce: string;
  issuedAt: string;
  expiresAt: string;
}

export interface AuthToken {
  token: string;
  expiresAt: string;
  address: Address;
  role: string;
}

/**
 * Generate a SIWE (Sign-In with Ethereum) message for the user to sign
 */
export function generateSiweMessage(
  address: Address,
  chainId: number,
  nonce: string,
  domain: string = typeof window !== "undefined" ? window.location.host : "localhost:3000",
  uri: string = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"
): string {
  const message = new SiweMessage({
    domain,
    address,
    statement: "Sign in to AquaFund Admin Dashboard",
    uri,
    version: "1",
    chainId,
    nonce, // Use the nonce from backend
    issuedAt: new Date().toISOString(),
    expirationTime: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
  });

  return message.prepareMessage();
}

/**
 * Request an authentication challenge from the backend
 */
export async function requestAuthChallenge(
  address: Address,
  backendUrl: string
): Promise<AuthChallenge> {
  const response = await fetch(`${backendUrl}/api/auth/challenge`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ address }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Failed to request challenge" }));
    throw new Error(error.message || "Failed to request authentication challenge");
  }

  const result = await response.json();
  
  // Handle backend response format: { success: true, data: { nonce, issuedAt, expiresAt } }
  if (result.success && result.data) {
    return result.data;
  }
  
  // Fallback for direct format
  return result;
}

/**
 * Verify the signed message with the backend and get an auth token
 */
export async function verifySignature(
  address: Address,
  signature: string,
  message: string,
  backendUrl: string
): Promise<AuthToken> {
  const response = await fetch(`${backendUrl}/api/auth/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      address,
      signature,
      message,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Verification failed" }));
    throw new Error(error.error || error.message || "Failed to verify signature");
  }

  const result = await response.json();
  
  // Handle backend response format: { success: true, data: { token, expiresAt, address, role } }
  if (result.success && result.data) {
    return result.data;
  }
  
  // Fallback for direct format
  return result;
}

/**
 * Refresh an expired auth token
 */
export async function refreshAuthToken(
  currentToken: string,
  backendUrl: string
): Promise<AuthToken> {
  const response = await fetch(`${backendUrl}/api/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${currentToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Refresh failed" }));
    throw new Error(error.error || error.message || "Failed to refresh token");
  }

  const result = await response.json();
  
  // Handle backend response format: { success: true, data: { token, expiresAt, address, role } }
  if (result.success && result.data) {
    return result.data;
  }
  
  // Fallback for direct format
  return result;
}

/**
 * Verify if a token is still valid
 */
export function isTokenValid(expiresAt: string): boolean {
  return new Date(expiresAt) > new Date();
}

/**
 * Calculate time until token expires (in milliseconds)
 */
export function getTokenExpiryTime(expiresAt: string): number {
  return new Date(expiresAt).getTime() - Date.now();
}

