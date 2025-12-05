"use client";

import { ReactNode } from "react";
import { AuthGuard } from "../_components/AuthGuard";
import { NGOGuard } from "../_components/NGOGuard";

export default function FundraiserLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <NGOGuard requireApproved={true}>{children}</NGOGuard>
    </AuthGuard>
  );
}

