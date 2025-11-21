"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

const AUTH_TOKEN_KEY = "aquafund-auth-token";

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function AuthGuard({ children, redirectTo = "/accounts/sign-in" }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      const authenticated = !!token;
      setIsAuthenticated(authenticated);

      if (!authenticated) {
        // Redirect to sign-in with return URL
        const returnUrl = encodeURIComponent(pathname || "/");
        router.push(`${redirectTo}?return=${returnUrl}`);
      }
    }
  }, [router, pathname, redirectTo]);

  // Show nothing while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[#475068]">Loading...</div>
      </div>
    );
  }

  // Only render children if authenticated
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

