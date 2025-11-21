"use client";

import { ReactNode } from "react";
import { AuthGuard } from "../_components/AuthGuard";

export default function FundraiserLayout({ children }: { children: ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}

