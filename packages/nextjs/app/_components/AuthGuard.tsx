"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "../../services/store/authStore";

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function AuthGuard({ children, redirectTo = "/accounts/sign-in" }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, loadFromStorage, token } = useAuthStore();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // Load auth from storage on mount (only once)
    loadFromStorage();
    // Small delay to ensure state is loaded
    const timer = setTimeout(() => {
      setHasChecked(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []); // Empty deps - only run once on mount

  useEffect(() => {
    // Only redirect if we've checked and user is definitely not authenticated
    // Don't redirect on every pathname change - only when actually not authenticated
    if (hasChecked && !isAuthenticated && !token) {
      // Prevent redirect loops by checking if we're already on the sign-in page
      if (pathname !== redirectTo && !pathname?.startsWith("/accounts/sign-in")) {
        const returnUrl = encodeURIComponent(pathname || "/");
        router.replace(`${redirectTo}?return=${returnUrl}`);
      }
    }
  }, [hasChecked, isAuthenticated, token, router, pathname, redirectTo]);

  // Show nothing while checking authentication
  if (!hasChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[#475068]">Loading...</div>
      </div>
    );
  }

  // Only render children if authenticated
  if (!isAuthenticated || !token) {
    return null;
  }

  return <>{children}</>;
}

