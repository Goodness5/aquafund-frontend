"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "../../_components/Button";
import { AUTH_TOKEN_KEY, USER_ROLE_KEY } from "~~/utils/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    // Validate email
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    // Validate password
    if (!password) {
      setError("Please enter your password");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/v1/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        // Try to parse error as JSON, fallback to status text if not JSON
        let errorMessage = "Failed to login";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `Failed to login: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      console.log("Login response:", responseData);
      
      // Handle nested response structure: { success: true, data: { user: {...}, token: "..." } }
      const data = responseData.data || responseData;
      
      // Store token - check multiple possible locations and field names
      const token = data.token || data.data?.token || responseData.token || 
                    data.accessToken || data.access_token || data.authToken;
      if (token) {
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        console.log("Token stored successfully");
      } else {
        console.error("No token found in login response. Response structure:", responseData);
        throw new Error("Login successful but no authentication token received. Please contact support.");
      }
      
      // Store user ID and email if provided - check nested structure
      const user = data.user || data.data?.user || responseData.user;
      const userId = user?.id || data.userId || data.id || data.user?.userId;
      if (userId) {
        localStorage.setItem("aquafund-user-id", userId);
        console.log("User ID stored:", userId);
      }
      
      // Store user email for NGO form submission
      const userEmail = user?.email || data.email || data.data?.email;
      if (userEmail) {
        localStorage.setItem("aquafund-user-email", userEmail);
        console.log("User email stored:", userEmail);
      }
      
      // Store user role if provided
      const userRole = user?.role || data.role || data.data?.role;
      if (userRole) {
        localStorage.setItem(USER_ROLE_KEY, userRole);
        console.log("User role stored:", userRole);
      }
      
      // Verify token was stored before redirecting
      const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
      if (!storedToken) {
        throw new Error("Failed to store authentication token. Please try again.");
      }
      
      console.log("Authentication successful, redirecting...");
      
      // Redirect to get-started page or dashboard
      const redirectTo = new URLSearchParams(window.location.search).get("redirect") || "/accounts/get-started";
      // Use window.location to force a full page reload so authentication state is properly checked
      window.location.href = redirectTo;
    } catch (error) {
      console.error("Failed to login:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to login. Please try again.";
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
    <div className="min-h-screen bg-gradient-to-b from-[#1BCBEE33] via-[#00bf3c18] to-[#CFFED914] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 w-full max-w-md border-[#001627] border-[1em] shadow-xl">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#001627] mb-2">Welcome Back</h1>
          <p className="text-sm sm:text-base text-[#475068]">
            Login to your NGO account to continue
          </p>
        </div>

        {/* Google Sign In */}
        <Button
          onClick={handleGoogleSignIn}
          disabled={loading}
          rounded="full"
          variant="default"
          size="lg"
          className="w-full mb-4 border-2 border-[#CAC4D0] bg-white text-[#001627] hover:bg-[#F5F5F5] transition-colors font-medium text-sm sm:text-base"
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
        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#CAC4D0]"></div>
          </div>
          <div className="relative flex justify-center text-xs sm:text-sm">
            <span className="px-2 bg-white text-[#475068]">or</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Email Input */}
        <div className="mb-4 sm:mb-6">
          <label className="block text-xs sm:text-sm font-medium text-[#475068] mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            placeholder="Enter your email address"
            className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-[#CAC4D0] rounded-lg focus:outline-none focus:border-[#0350B5] transition-colors"
            disabled={loading}
          />
        </div>

        {/* Password Input */}
        <div className="mb-4 sm:mb-6">
          <label className="block text-xs sm:text-sm font-medium text-[#475068] mb-2">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            placeholder="Enter your password"
            className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-[#CAC4D0] rounded-lg focus:outline-none focus:border-[#0350B5] transition-colors"
            disabled={loading}
          />
        </div>

        {/* Login Button */}
        <Button
          size="lg"
          rounded="full"
          className="w-full bg-[#0350B5] text-white hover:bg-[#034093] mb-4"
          onClick={handleLogin}
          disabled={!email || !password || loading}
        >
          {loading ? "Logging in..." : "Login"}
        </Button>

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

