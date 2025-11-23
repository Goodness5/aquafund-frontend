"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { XMarkIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { Button } from "../../_components/Button";

interface CreateAccountModalProps {
  onClose: () => void;
  onAccountCreated: (email?: string) => void;
}

const AUTH_TOKEN_KEY = "access_token";

export default function CreateAccountModal({
  onClose,
  onAccountCreated,
}: CreateAccountModalProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (token) {
        router.push("/dashboard");
      }
    }
  }, [router]);

  const handleContinue = () => {
    const trimmedEmail = email.trim();
    
    if (!trimmedEmail) {
      setError("Please enter your email address");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    // Clear any previous errors
    setError(null);

    // Pass email to parent, which will show SetPasswordModal
    onAccountCreated(trimmedEmail);
  };

  const handleGoogleSignIn = async () => {
    // TODO: Implement Google OAuth
    console.log("Google sign in");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-4 sm:p-6 md:p-8 w-full max-w-md sm:max-w-lg md:w-[45%] border-[#001627] border-[1em] shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-[#001627]">Create Account</h2>
          <button
            onClick={onClose}
            className="text-[#475068] hover:text-[#001627] transition-colors flex-shrink-0"
            disabled={loading}
          >
            <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <ExclamationCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 flex-1">{error}</p>
          </div>
        )}

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
          className="w-full bg-[#0350B5] text-white hover:bg-[#034093]"
          onClick={handleContinue}
          disabled={!email.trim() || loading}
        >
          Continue
        </Button>

        {/* Sign In Link */}
        <p className="text-xs sm:text-sm text-[#475068] mt-4 text-center">
          Already have an account?{" "}
          <button
            onClick={() => router.push("/accounts/sign-in")}
            className="text-[#0350B5] hover:underline font-medium"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
