import { create } from "zustand";

export interface User {
  id: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  ngoId: string | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  loadFromStorage: () => void;
}

const STORAGE_KEY = "auth-storage";

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  setAuth: (user: User, token: string) => {
    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token }));
    }
    set({
      user,
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
          const { user, token } = JSON.parse(stored);
          set({
            user,
            token,
            isAuthenticated: true,
          });
        } catch (error) {
          console.error("Failed to load auth from storage:", error);
        }
      }
    }
  },
}));

