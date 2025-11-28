/**
 * API utility functions for making authenticated requests
 */

import { useAuthStore } from "../services/store/authStore";

/**
 * Make an authenticated API request to the backend via Next.js API routes
 */
export async function authenticatedFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const { token } = useAuthStore.getState();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return fetch(endpoint, {
    ...options,
    headers,
  });
}

/**
 * Fetch NGOs with optional status filter
 */
export async function fetchNGOs(status?: string) {
  const endpoint = status ? `/api/ngos?status=${status}` : "/api/ngos";
  const response = await authenticatedFetch(endpoint);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to fetch NGOs" }));
    throw new Error(error.error || "Failed to fetch NGOs");
  }

  return response.json();
}

/**
 * Approve an NGO
 */
export async function approveNGO(ngoId: string, walletAddress: string, txHash: string) {
  const response = await authenticatedFetch(`/api/ngos/${ngoId}/approve`, {
    method: "POST",
    body: JSON.stringify({ walletAddress, txHash }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to approve NGO" }));
    throw new Error(error.error || "Failed to approve NGO");
  }

  return response.json();
}

/**
 * Reject an NGO
 */
export async function rejectNGO(ngoId: string) {
  const response = await authenticatedFetch(`/api/ngos/${ngoId}/reject`, {
    method: "POST",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to reject NGO" }));
    throw new Error(error.error || "Failed to reject NGO");
  }

  return response.json();
}

