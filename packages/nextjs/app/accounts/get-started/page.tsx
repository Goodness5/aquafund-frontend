"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CreateAccountModal from "../_components/CreateAccountModal";
import SetPasswordModal from "../_components/SetPasswordModal";
import { useAuthStore } from "../../../services/store/authStore";

const AUTH_TOKEN_KEY = "access_token";

export default function GetStartedPage() {
  const router = useRouter();
  const { user, isAuthenticated, loadFromStorage } = useAuthStore();
  const [showAccountModal, setShowAccountModal] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");

  // Load auth from storage on mount
  useEffect(() => {
    loadFromStorage();
  }, []); // Empty deps - only run once on mount

  // Check authentication status
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (isAuthenticated && user) {
        // User is authenticated - check ngoId
        if (user.ngoId !== null) {
          // User has NGO, redirect to dashboard
          router.push("/dashboard");
        } else {
          // User doesn't have NGO, redirect to NGO setup
          router.push("/dashboard/ngo/setup");
        }
      } else {
        // Not authenticated - show account creation modal
        setShowAccountModal(true);
      }
    }
  }, [isAuthenticated, user, router]);

  const handleAccountCreated = (email?: string) => {
    setShowAccountModal(false);
    // Save email if provided
    if (email) {
      setUserEmail(email);
    }
    // Show password modal after account creation
    setShowPasswordModal(true);
  };

  const handlePasswordSet = () => {
    setShowPasswordModal(false);
    // After password is set and user is logged in, check ngoId
    // The SetPasswordModal will handle the redirect based on ngoId
  };

  // Show account modal if not authenticated
  if (showAccountModal) {
    return (
      <CreateAccountModal
        onClose={() => router.push("/")}
        onAccountCreated={handleAccountCreated}
      />
    );
  }

  // Show password modal after account creation
  if (showPasswordModal) {
    return (
      <SetPasswordModal
        onClose={() => router.push("/")}
        onPasswordSet={handlePasswordSet}
        email={userEmail}
      />
    );
  }

  // Loading state
  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
      <div className="text-[#475068]">Loading...</div>
    </div>
  );
}
