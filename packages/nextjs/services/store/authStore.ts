import { create } from "zustand";

export interface NGO {
  id: string;
  organizationName: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  [key: string]: any;
}

export interface User {
  id: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  ngoId: string | null;
  walletAddress?: string | null;
}

interface AuthState {
  user: User | null;
  ngo: NGO | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string, ngo?: NGO | null) => void;
  clearAuth: () => void;
  loadFromStorage: () => void;
  hasApprovedNGO: () => boolean;
  hasNGO: () => boolean;
  getNGOStatus: () => string | null;
}

const STORAGE_KEY = "auth-storage";

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  ngo: null,
  token: null,
  isAuthenticated: false,
  setAuth: (user: User, token: string, ngo?: NGO | null) => {
    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token, ngo: ngo || null }));
    }
    set({
      user,
      ngo: ngo || null,
      token,
      isAuthenticated: true,
    });
  },
  clearAuth: () => {
    // Clear from localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem("access_token");
    }
    set({
      user: null,
      ngo: null,
      token: null,
      isAuthenticated: false,
    });
  },
  loadFromStorage: () => {
    // Load from localStorage on mount
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const { user, token, ngo } = JSON.parse(stored);
          set({
            user,
            ngo: ngo || null,
            token,
            isAuthenticated: true,
          });
        } catch (error) {
          console.error("Failed to load auth from storage:", error);
        }
      }
    }
  },
  hasApprovedNGO: () => {
    const state = get();
    const status = state.ngo?.status || state.ngo?.statusVerification;
    return !!(state.ngo && status === "APPROVED");
  },
  hasNGO: () => {
    const state = get();
    return !!state.ngo;
  },
  getNGOStatus: () => {
    const state = get();
    if (!state.ngo) return null;
    return state.ngo.status || state.ngo.statusVerification || null;
  },
}));

