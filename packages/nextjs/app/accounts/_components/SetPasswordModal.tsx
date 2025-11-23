"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { XMarkIcon, EyeIcon, EyeSlashIcon, CheckCircleIcon, ExclamationCircleIcon, ChevronLeftIcon } from "@heroicons/react/24/outline";
import { Button } from "../../_components/Button";
import { useAuthStore } from "../../../services/store/authStore";

interface SetPasswordModalProps {
  onClose: () => void;
  onPasswordSet: () => void;
  email?: string;
}

const AUTH_TOKEN_KEY = "access_token";

type Step = "password" | "otp" | "login" | "success";

interface PasswordRequirement {
  label: string;
  met: boolean;
}

export default function SetPasswordModal({
  onClose,
  onPasswordSet,
  email,
}: SetPasswordModalProps) {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [currentStep, setCurrentStep] = useState<Step>("password");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Clear error when step changes
  useEffect(() => {
    setError(null);
    setSuccessMessage(null);
  }, [currentStep]);

  const checkPasswordRequirements = (): PasswordRequirement[] => {
    return [
      {
        label: "Minimum of 8 characters",
        met: password.length >= 8,
      },
      {
        label: "Lowercase letter(s)",
        met: /[a-z]/.test(password),
      },
      {
        label: "Uppercase letter(s)",
        met: /[A-Z]/.test(password),
      },
      {
        label: "A special character (!@#$%)",
        met: /[!@#$%]/.test(password),
      },
      {
        label: "A number (0-9...)",
        met: /[0-9]/.test(password),
      },
    ];
  };

  const requirements = checkPasswordRequirements();
  const allRequirementsMet = requirements.every((req) => req.met);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const handleSetPassword = async () => {
    if (!allRequirementsMet) {
      setError("Please meet all password requirements");
      return;
    }

    if (!passwordsMatch) {
      setError("Passwords do not match");
      return;
    }

    if (!email) {
      setError("Email is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Register user with email and password
      const response = await fetch("/api/v1/users", {
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
        throw new Error(data.error || "Failed to create account");
      }

      // OTP is sent automatically by backend
      setSuccessMessage("Account created! Please check your email for the OTP code.");
      setCurrentStep("otp");
    } catch (error) {
      console.error("Failed to create account:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create account. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!email || !otp) {
      setError("Please enter the OTP code");
      return;
    }

    if (!/^\d{4,6}$/.test(otp)) {
      setError("Invalid OTP format. Please enter 4-6 digits");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/v1/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Show generic message for 500 errors
        if (response.status >= 500) {
          throw new Error("Internal server error occurred. Please retry.");
        }
        throw new Error(data.error || "Failed to verify OTP");
      }

      setSuccessMessage("Email verified successfully! Please login to continue.");
      setCurrentStep("login");
    } catch (error) {
      console.error("Failed to verify OTP:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to verify OTP. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (loading) return; // Don't allow going back while loading
    
    setError(null);
    setSuccessMessage(null);
    
    if (currentStep === "otp") {
      setCurrentStep("password");
      setOtp(""); // Clear OTP when going back
    } else if (currentStep === "login") {
      setCurrentStep("otp");
      setLoginPassword(""); // Clear login password when going back
    }
  };

  const handleLogin = async () => {
    if (!email || !loginPassword) {
      setError("Please enter your password");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/v1/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: loginPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Show generic message for 500 errors
        if (response.status >= 500) {
          throw new Error("Internal server error occurred. Please retry.");
        }
        throw new Error(data.error || "Failed to login");
      }

      // Store user data and token in Zustand store
      if (data.success && data.data) {
        const { user, token } = data.data;
        
        // Save to Zustand store
        setAuth(user, token);
        
        // Also save token to localStorage for backward compatibility
        if (token) {
          localStorage.setItem(AUTH_TOKEN_KEY, token);
        }

        setSuccessMessage("Login successful!");
        setCurrentStep("success");
        
        // Check if user has ngoId, if not, route to NGO setup (with option to skip)
        // If ngoId exists, route to dashboard
        setTimeout(() => {
          if (user.ngoId === null) {
            // Route to NGO setup page
            router.push("/ngo/get-started");
            // Call onPasswordSet if provided (for backward compatibility)
            if (onPasswordSet) {
              onPasswordSet();
            }
          } else {
            // User already has NGO, route to dashboard
            router.push("/dashboard");
          }
        }, 1500);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Failed to login:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to login. Please check your credentials.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderPasswordStep = () => (
    <>
      <p className="text-sm sm:text-base text-[#475068] mb-4 sm:mb-6">
        Your account needs to be protected. Set and confirm your password.
      </p>

      {/* Password Input */}
      <div className="mb-4 sm:mb-6">
        <label className="block text-xs sm:text-sm font-medium text-[#475068] mb-2">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full px-3 sm:px-4 py-2 sm:py-3 pr-10 text-sm sm:text-base border-2 border-[#CAC4D0] rounded-lg focus:outline-none focus:border-[#0350B5] transition-colors"
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#475068] hover:text-[#001627] transition-colors"
          >
            {showPassword ? (
              <EyeSlashIcon className="w-5 h-5" />
            ) : (
              <EyeIcon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Password Requirements */}
      {password.length > 0 && (
        <div className="mb-4 sm:mb-6">
          <p className="text-xs sm:text-sm font-medium text-[#475068] mb-2">
            Your password should contain:
          </p>
          <ul className="space-y-1.5">
            {requirements.map((req, index) => (
              <li key={index} className="flex items-center gap-2 text-xs sm:text-sm">
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                    req.met
                      ? "bg-[#00BF3C] border-2 border-[#00BF3C]"
                      : "bg-white border-2 border-[#00BF3C]"
                  }`}
                >
                  {req.met && <CheckCircleIcon className="w-3 h-3 text-white" />}
                </div>
                <span className={req.met ? "text-[#00BF3C]" : "text-[#475068]"}>
                  {req.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Confirm Password Input */}
      <div className="mb-4 sm:mb-6">
        <label className="block text-xs sm:text-sm font-medium text-[#475068] mb-2">
          Confirm Password
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
            className="w-full px-3 sm:px-4 py-2 sm:py-3 pr-10 text-sm sm:text-base border-2 border-[#CAC4D0] rounded-lg focus:outline-none focus:border-[#0350B5] transition-colors"
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#475068] hover:text-[#001627] transition-colors"
          >
            {showConfirmPassword ? (
              <EyeSlashIcon className="w-5 h-5" />
            ) : (
              <EyeIcon className="w-5 h-5" />
            )}
          </button>
        </div>
        {confirmPassword.length > 0 && !passwordsMatch && (
          <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
        )}
      </div>

      {/* Continue Button */}
      <Button
        size="lg"
        rounded="full"
        className="w-full bg-[#0350B5] text-white hover:bg-[#034093]"
        onClick={handleSetPassword}
        disabled={!allRequirementsMet || !passwordsMatch || loading}
      >
        {loading ? "Creating Account..." : "Continue"}
      </Button>
    </>
  );

  const renderOtpStep = () => (
    <>
      <div className="flex flex-col items-center mb-6">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#E1FFFF] flex items-center justify-center mb-4">
          <CheckCircleIcon className="w-10 h-10 sm:w-12 sm:h-12 text-[#0350B5]" />
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-[#001627] mb-2">
          Check Your Email
        </h3>
        <p className="text-sm sm:text-base text-[#475068] text-center mb-2">
          We&apos;ve sent a verification code to
        </p>
        <p className="text-sm sm:text-base font-medium text-[#001627] mb-6">
          {email}
        </p>
      </div>

      {/* OTP Input */}
      <div className="mb-4 sm:mb-6">
        <label className="block text-xs sm:text-sm font-medium text-[#475068] mb-2">
          Enter Verification Code
        </label>
        <input
          type="text"
          value={otp}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "").slice(0, 6);
            setOtp(value);
          }}
          placeholder="Enter 4-6 digit code"
          className="w-full px-3 sm:px-4 py-2 sm:py-3 text-lg border-2 border-[#CAC4D0] rounded-lg focus:outline-none focus:border-[#0350B5] transition-colors text-center tracking-widest"
          disabled={loading}
          maxLength={6}
        />
        <p className="text-xs text-[#475068] mt-2 text-center">
          Didn&apos;t receive the code? Check your spam folder or try again.
        </p>
      </div>

      {/* Back and Verify Buttons */}
      <div className="flex gap-3">
        <Button
          size="lg"
          rounded="full"
          variant="default"
          className="flex-1 border-2 border-[#CAC4D0] bg-white text-[#001627] hover:bg-[#F5F5F5] transition-colors"
          onClick={handleBack}
          disabled={loading}
        >
          <span className="flex items-center justify-center gap-2">
            <ChevronLeftIcon className="w-5 h-5" />
            Back
          </span>
        </Button>
        <Button
          size="lg"
          rounded="full"
          className="flex-1 bg-[#0350B5] text-white hover:bg-[#034093]"
          onClick={handleVerifyOtp}
          disabled={!otp || otp.length < 4 || loading}
        >
          {loading ? "Verifying..." : "Verify Code"}
        </Button>
      </div>
    </>
  );

  const renderLoginStep = () => (
    <>
      <div className="flex flex-col items-center mb-6">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#E1FFFF] flex items-center justify-center mb-4">
          <CheckCircleIcon className="w-10 h-10 sm:w-12 sm:h-12 text-[#00BF3C]" />
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-[#001627] mb-2">
          Email Verified!
        </h3>
        <p className="text-sm sm:text-base text-[#475068] text-center mb-6">
          Please login to continue to your account
        </p>
      </div>

      {/* Email Input (read-only) */}
      <div className="mb-4">
        <label className="block text-xs sm:text-sm font-medium text-[#475068] mb-2">
          Email Address
        </label>
        <input
          type="email"
          value={email}
          readOnly
          className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-[#CAC4D0] rounded-lg bg-[#F5F5F5] text-[#475068] cursor-not-allowed"
        />
      </div>

      {/* Password Input */}
      <div className="mb-4 sm:mb-6">
        <label className="block text-xs sm:text-sm font-medium text-[#475068] mb-2">
          Password
        </label>
        <input
          type="password"
          value={loginPassword}
          onChange={(e) => setLoginPassword(e.target.value)}
          placeholder="Enter your password"
          className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-[#CAC4D0] rounded-lg focus:outline-none focus:border-[#0350B5] transition-colors"
          disabled={loading}
        />
      </div>

      {/* Back and Login Buttons */}
      <div className="flex gap-3">
        <Button
          size="lg"
          rounded="full"
          variant="default"
          className="flex-1 border-2 border-[#CAC4D0] bg-white text-[#001627] hover:bg-[#F5F5F5] transition-colors"
          onClick={handleBack}
          disabled={loading}
        >
          <span className="flex items-center justify-center gap-2">
            <ChevronLeftIcon className="w-5 h-5" />
            Back
          </span>
        </Button>
        <Button
          size="lg"
          rounded="full"
          className="flex-1 bg-[#0350B5] text-white hover:bg-[#034093]"
          onClick={handleLogin}
          disabled={!loginPassword || loading}
        >
          {loading ? "Logging in..." : "Login"}
        </Button>
      </div>
    </>
  );

  const renderSuccessStep = () => (
    <>
      <div className="flex flex-col items-center mb-6">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#E1FFFF] flex items-center justify-center mb-4">
          <CheckCircleIcon className="w-12 h-12 sm:w-16 sm:h-16 text-[#00BF3C]" />
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-[#001627] mb-2">
          Account Created Successfully!
        </h3>
        <p className="text-sm sm:text-base text-[#475068] text-center">
          Redirecting to your account setup...
        </p>
      </div>
    </>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-4 sm:p-6 md:p-8 w-full max-w-md sm:max-w-lg md:w-[45%] border-[#001627] border-[1em] shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-[#001627]">
            {currentStep === "password" && "Set Password"}
            {currentStep === "otp" && "Verify Email"}
            {currentStep === "login" && "Login"}
            {currentStep === "success" && "Success"}
          </h2>
          {currentStep !== "success" && (
            <button
              onClick={onClose}
              className="text-[#475068] hover:text-[#001627] transition-colors flex-shrink-0"
              disabled={loading}
            >
              <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <ExclamationCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 flex-1">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
            <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-700 flex-1">{successMessage}</p>
          </div>
        )}

        {/* Step Content */}
        {currentStep === "password" && renderPasswordStep()}
        {currentStep === "otp" && renderOtpStep()}
        {currentStep === "login" && renderLoginStep()}
        {currentStep === "success" && renderSuccessStep()}
      </div>
    </div>
  );
}
