"use client";

import { ReactNode } from "react";

// This layout ensures fundraisers pages inherit the dashboard layout
export default function FundraisersLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

