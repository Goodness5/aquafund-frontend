"use client";

import { useState } from "react";
import Image from "next/image";
import { XMarkIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { Button } from "../../_components/Button";

interface CreateAccountModalProps {
  onClose: () => void;
  onAccountCreated: (email?: string) => void;
}

const AUTH_TOKEN_KEY = "aquafund-auth-token";

export default function CreateAccountModal({
  onClose,
  onAccountCreated,
}: CreateAccountModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const createAccount = async (email?: string) => {
    if (!email) {
      alert("Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/accounts/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create account");
      }

      const data = await response.json();
      if (data.token) {
        localStorage.setItem(AUTH_TOKEN_KEY, data.token);
        // Show success state first
        setIsSuccess(true);
        // Don't call onAccountCreated yet - wait for user to click continue after seeing success
      } else {
        throw new Error("No token received from server");
      }
    } catch (error) {
      console.error("Failed to create account:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create account. Please try again.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    // TODO: Implement Google OAuth
    console.log("Google sign in");
    // After OAuth success, call createAccount with email
    // const googleEmail = await getGoogleEmail();
    // await createAccount(googleEmail);
  };

  const handleEmailContinue = async () => {
    if (isSuccess) {
      // After success, continue to next step
      onAccountCreated(email);
      return;
    }
    
    if (!email) {
      alert("Please enter your email address");
      return;
    }
    await createAccount(email);
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

        {isSuccess ? (
          <>
            {/* Success State */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#E1FFFF] flex items-center justify-center mb-4">
                <CheckCircleIcon className="w-12 h-12 sm:w-16 sm:h-16 text-[#00BF3C]" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#001627] mb-2">
                Verification Successful!
              </h3>
              <p className="text-sm sm:text-base text-[#475068] text-center mb-6">
                Login to your account to continue.
              </p>
            </div>

            {/* Divider */}
            <div className="relative mb-3 sm:mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#CAC4D0]"></div>
              </div>
              <div className="relative flex justify-center text-xs sm:text-sm">
                <span className="px-2 bg-white text-[#475068]">or</span>
              </div>
            </div>

            {/* Email Input */}
            <div className="mb-4 sm:mb-6">
              <label className="block text-xs sm:text-sm font-medium text-[#475068] mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your NGO's email address"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-[#CAC4D0] rounded-lg focus:outline-none focus:border-[#0350B5] transition-colors"
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
              className="w-full bg-[#0350B5] text-white hover:bg-[#034093]"
              onClick={handleEmailContinue}
              disabled={!email || loading}
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

            {/* Email Input */}
            <div className="mb-4 sm:mb-6">
              <label className="block text-xs sm:text-sm font-medium text-[#475068] mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your NGO's email address"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-[#CAC4D0] rounded-lg focus:outline-none focus:border-[#0350B5] transition-colors"
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
              className="w-full bg-[#0350B5] text-white hover:bg-[#034093]"
              onClick={handleEmailContinue}
              disabled={!email || loading}
            >
              {loading ? "Creating Account..." : "Continue"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

