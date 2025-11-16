"use client";

import { ReactNode, useState } from "react";
import DashboardHeader from "../_components/dashboard/DashboardHeader";
import DashboardSidebar from "../_components/dashboard/DashboardSidebar";
import MobileWarningModal from "../_components/dashboard/MobileWarningModal";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-[#F5F5F5] flex flex-col overflow-x-hidden">
      <MobileWarningModal />
      <DashboardHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1 w-full min-w-0 overflow-x-hidden">
        <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 lg:ml-64 p-4 lg:p-6 min-h-[calc(100vh-4rem)] min-w-0 max-w-full overflow-x-hidden">
          {children}
        </main>
      </div>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

