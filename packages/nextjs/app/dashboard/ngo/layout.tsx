"use client";

import { ReactNode } from "react";

// This layout ensures NGO pages inherit the dashboard layout
export default function NGOLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

