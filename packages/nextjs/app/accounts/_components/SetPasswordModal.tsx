"use client";

import { useState } from "react";
import { XMarkIcon, EyeIcon, EyeSlashIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { Button } from "../../_components/Button";

interface SetPasswordModalProps {
  onClose: () => void;
  onPasswordSet: () => void;
  email?: string;
}

interface PasswordRequirement {
  label: string;
  met: boolean;
}

export default function SetPasswordModal({
  onClose,
  onPasswordSet,
  email,
}: SetPasswordModalProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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
      alert("Please meet all password requirements");
      return;
    }

    if (!passwordsMatch) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      // TODO: Call API to set password
      const response = await fetch("/api/accounts/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to set password");
      }

      // Password set successfully
      onPasswordSet();
    } catch (error) {
      console.error("Failed to set password:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to set password. Please try again.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-4 sm:p-6 md:p-8 w-full max-w-md sm:max-w-lg md:w-[45%] border-[#001627] border-[1em] shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-[#001627]">Set Password</h2>
          <button
            onClick={onClose}
            className="text-[#475068] hover:text-[#001627] transition-colors flex-shrink-0"
          >
            <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

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
          {loading ? "Setting Password..." : "Continue"}
        </Button>
      </div>
    </div>
  );
}

