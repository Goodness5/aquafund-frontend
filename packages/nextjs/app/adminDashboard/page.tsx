"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAdminAuthenticated, clearAuth } from "~~/utils/auth";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Check authentication and admin role
    const checkAuth = () => {
      if (isAdminAuthenticated()) {
        setIsAuthorized(true);
        setIsLoading(false);
      } else {
        setIsAuthorized(false);
        setIsLoading(false);
        // Redirect to login page with redirect parameter
        router.push("/accounts/login?redirect=/adminDashboard");
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = () => {
    clearAuth();
    router.push("/accounts/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1BCBEE33] via-[#00bf3c18] to-[#CFFED914] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0350B5] mx-auto mb-4"></div>
          <p className="text-[#475068]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1BCBEE33] via-[#00bf3c18] to-[#CFFED914] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 w-full max-w-md border-[#001627] border-[1em] shadow-xl text-center">
          <h1 className="text-2xl font-bold text-[#001627] mb-4">Access Denied</h1>
          <p className="text-[#475068] mb-6">
            You do not have permission to access this page. Only administrators can view the admin dashboard.
          </p>
          <button
            onClick={() => router.push("/accounts/login")}
            className="px-6 py-2 bg-[#0350B5] text-white rounded-full hover:bg-[#034093] transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1BCBEE33] via-[#00bf3c18] to-[#CFFED914]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 mb-6 border-[#001627] border-[1em] shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#001627] mb-2">Admin Dashboard</h1>
              <p className="text-[#475068]">Manage platform settings and users</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Stats Cards */}
          <div className="bg-white rounded-3xl p-6 border-[#001627] border-[1em] shadow-xl">
            <h3 className="text-lg font-semibold text-[#001627] mb-2">Total Users</h3>
            <p className="text-3xl font-bold text-[#0350B5]">-</p>
            <p className="text-sm text-[#475068] mt-2">Active users on platform</p>
          </div>

          <div className="bg-white rounded-3xl p-6 border-[#001627] border-[1em] shadow-xl">
            <h3 className="text-lg font-semibold text-[#001627] mb-2">Pending NGOs</h3>
            <p className="text-3xl font-bold text-[#0350B5]">-</p>
            <p className="text-sm text-[#475068] mt-2">NGOs awaiting verification</p>
          </div>

          <div className="bg-white rounded-3xl p-6 border-[#001627] border-[1em] shadow-xl">
            <h3 className="text-lg font-semibold text-[#001627] mb-2">Active Projects</h3>
            <p className="text-3xl font-bold text-[#0350B5]">-</p>
            <p className="text-sm text-[#475068] mt-2">Currently active fundraisers</p>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="mt-6 bg-white rounded-3xl p-6 border-[#001627] border-[1em] shadow-xl">
          <h2 className="text-2xl font-bold text-[#001627] mb-4">Admin Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="p-4 border-2 border-[#CAC4D0] rounded-xl hover:border-[#0350B5] hover:bg-[#E1FFFF] transition-colors text-left">
              <h3 className="font-semibold text-[#001627] mb-2">Manage NGOs</h3>
              <p className="text-sm text-[#475068]">Review and verify NGO registrations</p>
            </button>
            <button className="p-4 border-2 border-[#CAC4D0] rounded-xl hover:border-[#0350B5] hover:bg-[#E1FFFF] transition-colors text-left">
              <h3 className="font-semibold text-[#001627] mb-2">Manage Users</h3>
              <p className="text-sm text-[#475068]">View and manage user accounts</p>
            </button>
            <button className="p-4 border-2 border-[#CAC4D0] rounded-xl hover:border-[#0350B5] hover:bg-[#E1FFFF] transition-colors text-left">
              <h3 className="font-semibold text-[#001627] mb-2">Manage Projects</h3>
              <p className="text-sm text-[#475068]">Review and approve fundraising projects</p>
            </button>
            <button className="p-4 border-2 border-[#CAC4D0] rounded-xl hover:border-[#0350B5] hover:bg-[#E1FFFF] transition-colors text-left">
              <h3 className="font-semibold text-[#001627] mb-2">Platform Settings</h3>
              <p className="text-sm text-[#475068]">Configure platform-wide settings</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

