"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "../../_components/Button";
import { useAuthStore } from "../../../services/store/authStore";

const AUTH_TOKEN_KEY = "access_token";

export default function SignInPage() {
  const router = useRouter();
  const { user, isAuthenticated, loadFromStorage, setAuth } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load auth from storage on mount
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  // Redirect if already authenticated
  useEffect(() => {
    if (typeof window !== "undefined" && isAuthenticated && user) {
      // If user has NGO, go to dashboard, otherwise stay on sign-in (they'll be redirected after login)
      if (user.ngoId !== null) {
        router.push("/dashboard");
      }
    }
  }, [isAuthenticated, user, router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/v1/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Show generic message for 500 errors
        if (response.status >= 500) {
          throw new Error("Internal server error occurred. Please retry.");
        }
        throw new Error(data.error || "Failed to sign in");
      }

      // Store user data and token in Zustand store
      if (data.success && data.data) {
        const { user: userData, token } = data.data;
        
        // Save to Zustand store
        setAuth(userData, token);
        
        // Also save token to localStorage for backward compatibility
        if (token) {
          localStorage.setItem(AUTH_TOKEN_KEY, token);
        }

        // Check if user has ngoId, if not, route to NGO setup
        // If ngoId exists, route to dashboard
        const returnUrl = new URLSearchParams(window.location.search).get("return");
        if (returnUrl) {
          router.push(returnUrl);
        } else if (userData.ngoId === null) {
          // User doesn't have NGO, route to NGO setup
          router.push("/ngo/get-started");
        } else {
          // User already has NGO, route to dashboard
          router.push("/dashboard");
        }
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Failed to sign in:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to sign in. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    // TODO: Implement Google OAuth
    console.log("Google sign in");
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-4 sm:p-6 md:p-8 w-full max-w-md border-[#001627] border-[1em] shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-[#001627]">Sign In</h2>
          <button
            onClick={() => router.push("/")}
            className="text-[#475068] hover:text-[#001627] transition-colors flex-shrink-0"
          >
            <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <p className="text-sm sm:text-base text-[#475068] mb-4 sm:mb-6">
          Welcome back! Sign in to your NGO account to continue.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Google Sign In */}
        <Button
          onClick={handleGoogleSignIn}
          disabled={loading}
          rounded="full"
          variant="default"
          size="lg"
          className="w-full mb-3 sm:mb-4 border-2 border-[#CAC4D0] bg-white text-[#001627] hover:bg-[#F5F5F5] transition-colors font-medium text-sm sm:text-base"
        >
          <span className="flex items-center justify-center gap-2 sm:gap-3">
            <Image
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              width={20}
              height={20}
              className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
              unoptimized
            />
            <span className="flex items-center">Continue with Google</span>
          </span>
        </Button>

        {/* Divider */}
        <div className="relative mb-3 sm:mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#CAC4D0]"></div>
          </div>
          <div className="relative flex justify-center text-xs sm:text-sm">
            <span className="px-2 bg-white text-[#475068]">or</span>
          </div>
        </div>

        {/* Email and Password Form */}
        <form onSubmit={handleSignIn}>
          <div className="mb-4">
            <label className="block text-xs sm:text-sm font-medium text-[#475068] mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-[#CAC4D0] rounded-lg focus:outline-none focus:border-[#0350B5] transition-colors"
              required
            />
          </div>

          <div className="mb-4 sm:mb-6">
            <label className="block text-xs sm:text-sm font-medium text-[#475068] mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-[#CAC4D0] rounded-lg focus:outline-none focus:border-[#0350B5] transition-colors"
              required
            />
          </div>

          {/* Sign In Button */}
          <Button
            type="submit"
            size="lg"
            rounded="full"
            className="w-full bg-[#0350B5] text-white hover:bg-[#034093] mb-3"
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </Button>
        </form>

        {/* Sign Up Link */}
        <p className="text-xs sm:text-sm text-[#475068] text-center">
          Don&apos;t have an account?{" "}
          <button
            onClick={() => router.push("/accounts/get-started")}
            className="text-[#0350B5] hover:underline font-medium"
          >
            Create Account
          </button>
        </p>
      </div>
    </div>
  );
}

