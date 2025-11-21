"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { XMarkIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { Button } from "../../_components/Button";
import { AUTH_TOKEN_KEY, USER_ROLE_KEY } from "~~/utils/auth";

interface CreateAccountModalProps {
  onClose: () => void;
  onAccountCreated: (email?: string) => void;
}

type Step = "form" | "success";

export default function CreateAccountModal({
  onClose,
  onAccountCreated,
}: CreateAccountModalProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<Step>("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const createAccount = async () => {
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
      setError("Please enter a password");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        // Try to parse error as JSON, fallback to status text if not JSON
        let errorMessage = "Failed to create account";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `Failed to create account: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      // If account was created successfully, proceed to success step
      // Token is optional - store it if provided, but don't block on it
      if (data.token) {
        localStorage.setItem(AUTH_TOKEN_KEY, data.token);
      }
      
      // Store user ID if provided (needed for NGO submission)
      if (data.user?.id || data.userId || data.id) {
        localStorage.setItem("aquafund-user-id", data.user?.id || data.userId || data.id);
      }
      
      // Store user email for NGO form submission
      const userEmail = data.user?.email || data.email || email;
      if (userEmail) {
        localStorage.setItem("aquafund-user-email", userEmail);
      }
      
      // Store user role if provided
      const userRole = data.user?.role || data.role;
      if (userRole) {
        localStorage.setItem(USER_ROLE_KEY, userRole);
      }
      
      // Account created successfully, move to success step
      setStep("success");
    } catch (error) {
      console.error("Failed to create account:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create account. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    // TODO: Implement Google OAuth
    console.log("Google sign in");
    // After OAuth success, call createAccount with email and password
    // const googleEmail = await getGoogleEmail();
    // await createAccount();
  };

  const handleContinue = async () => {
    if (step === "success") {
      // After success, continue to next step
      onAccountCreated(email);
      return;
    }
    
    // Create account with email and password
    await createAccount();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-4 sm:p-6 md:p-8 w-full max-w-md sm:max-w-lg md:w-[45%] border-[#001627] border-[1em] shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-[#001627]">Create Account</h2>
          <button
            onClick={onClose}
            className="text-[#475068] hover:text-[#001627] transition-colors flex-shrink-0"
          >
            <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {step === "success" ? (
          <>
            {/* Success State */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#E1FFFF] flex items-center justify-center mb-4">
                <CheckCircleIcon className="w-12 h-12 sm:w-16 sm:h-16 text-[#00BF3C]" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#001627] mb-2">
                Account Created Successfully!
              </h3>
              <p className="text-sm sm:text-base text-[#475068] text-center mb-6">
                Your account has been created. Click continue to proceed.
              </p>
            </div>

            {/* Continue Button */}
            <Button
              size="lg"
              rounded="full"
              className="w-full bg-[#0350B5] text-white hover:bg-[#034093]"
              onClick={handleContinue}
              disabled={loading}
            >
              Continue
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm sm:text-base text-[#475068] mb-4 sm:mb-6">
              Hold up! Let&apos;s save your progress so you don&apos;t lose your story. Create your NGO account in few minutes.
            </p>

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
                placeholder="Enter your NGO's email address"
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
                placeholder="Enter your password (min. 6 characters)"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-[#CAC4D0] rounded-lg focus:outline-none focus:border-[#0350B5] transition-colors"
                disabled={loading}
              />
            </div>

            {/* Terms */}
            <p className="text-xs text-[#475068] mb-4 sm:mb-6 text-center leading-relaxed">
              By clicking continue, you agree to our{" "}
              <a href="/terms" className="text-[#0350B5] hover:underline">
                terms and conditions
              </a>
            </p>

            {/* Continue Button */}
            <Button
              size="lg"
              rounded="full"
              className="w-full bg-[#0350B5] text-white hover:bg-[#034093] mb-3"
              onClick={handleContinue}
              disabled={!email || !password || loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </Button>

            {/* Login Link */}
            <p className="text-xs sm:text-sm text-[#475068] text-center">
              Already have an account?{" "}
              <button
                onClick={() => {
                  onClose();
                  router.push("/accounts/login");
                }}
                className="text-[#0350B5] hover:underline font-medium"
              >
                Login
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

