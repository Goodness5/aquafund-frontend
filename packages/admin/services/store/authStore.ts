/**
 * Authentication Store for Admin App
 * 
 * This store manages the authentication state for the admin dashboard.
 * It uses Web3 wallet-based authentication with JWT tokens.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Address } from "viem";

export interface AuthState {
  // Auth token from backend
  token: string | null;
  // Token expiration timestamp
  expiresAt: string | null;
  // Authenticated wallet address
  address: Address | null;
  // User role (e.g., "ADMIN", "SUPER_ADMIN")
  role: string | null;
  // Whether user is authenticated
  isAuthenticated: boolean;
  
  // Actions
  setAuth: (token: string, expiresAt: string, address: Address, role: string) => void;
  clearAuth: () => void;
  updateToken: (token: string, expiresAt: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      expiresAt: null,
      address: null,
      role: null,
      isAuthenticated: false,

      setAuth: (token, expiresAt, address, role) => {
        set({
          token,
          expiresAt,
          address,
          role,
          isAuthenticated: true,
        });
      },

      clearAuth: () => {
        set({
          token: null,
          expiresAt: null,
          address: null,
          role: null,
          isAuthenticated: false,
        });
      },

      updateToken: (token, expiresAt) => {
        set((state) => ({
          ...state,
          token,
          expiresAt,
        }));
      },
    }),
    {
      name: "admin-auth-storage",
      // Only persist essential auth data
      partialize: (state) => ({
        token: state.token,
        expiresAt: state.expiresAt,
        address: state.address,
        role: state.role,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

