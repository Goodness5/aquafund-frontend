"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../services/store/authStore";

export default function StartFundraiserPage() {
  const router = useRouter();
  const { isAuthenticated, loadFromStorage } = useAuthStore();

  useEffect(() => {
    // Load auth from storage first
    loadFromStorage();
    
    // Small delay to ensure auth state is loaded
    const checkAuth = setTimeout(() => {
      const authState = useAuthStore.getState();
      
      if (authState.isAuthenticated) {
        // User is logged in - redirect directly to fundraisers
        router.replace("/dashboard/fundraisers");
      } else {
        // User is not logged in - redirect to sign-in with nextUrl preserved
        const nextUrl = "/dashboard/fundraisers";
        router.replace(`/accounts/sign-in?return=${encodeURIComponent(nextUrl)}`);
      }
    }, 100);

    return () => clearTimeout(checkAuth);
  }, [router]);

  // Show loading state while checking auth
  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0350B5] mx-auto mb-4"></div>
        <p className="text-[#475068]">Redirecting...</p>
      </div>
    </div>
  );
}

