"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  MagnifyingGlassIcon, 
  BellIcon, 
  ChatBubbleLeftRightIcon,
  ChevronDownIcon,
  Bars3Icon,
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  WalletIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline";
import { useAccount, useDisconnect } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useOutsideClick } from "~~/hooks/scaffold-eth";

interface DashboardHeaderProps {
  onMenuClick?: () => void;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "donation" | "fundraiser" | "system";
}

export default function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const userName = "Godon Humanitariann"; // This should come from user data/context
  
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useOutsideClick(notificationsRef, () => setNotificationsOpen(false));
  useOutsideClick(profileRef, () => setProfileOpen(false));

  // Mock notifications
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "New Donation Received",
      message: "You received $500 from 0x742d...f0b",
      time: "2 minutes ago",
      read: false,
      type: "donation",
    },
    {
      id: "2",
      title: "Fundraiser Approved",
      message: "Your fundraiser 'Clean Water Initiative' has been approved",
      time: "1 hour ago",
      read: false,
      type: "fundraiser",
    },
    {
      id: "3",
      title: "Weekly Report Available",
      message: "Your weekly fundraising report is ready to view",
      time: "3 hours ago",
      read: true,
      type: "system",
    },
    {
      id: "4",
      title: "New Donation Received",
      message: "You received $1,200 from 0x8a3f...7f",
      time: "5 hours ago",
      read: true,
      type: "donation",
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleLogout = () => {
    disconnect();
    setProfileOpen(false);
    // Redirect to home or login page
    window.location.href = "/";
  };

  return (
    <header className="w-full bg-white border-b border-[#CAC4D0] px-4 lg:px-6 py-4 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center justify-between gap-4 w-full max-w-full">
        {/* Mobile Menu Button & Logo */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-[#E1FFFF] rounded-full transition-all duration-200 active:scale-95 flex-shrink-0"
          >
            <Bars3Icon className="w-6 h-6 text-[#001627]" />
          </button>
          <Link href="/" className="flex items-center transition-opacity duration-200 hover:opacity-80 flex-shrink-0">
            <Image src="/logo.svg" alt="AquaFund" width={120} height={40} className="w-20 sm:w-24 lg:w-32" />
          </Link>
        </div>

        {/* Greeting - Hidden on mobile */}
        <div className="hidden lg:flex flex-1 ml-8 min-w-0">
          <span className="text-[#001627] font-medium truncate">Hello, {userName}</span>
        </div>

        {/* Search Bar - Hidden on small mobile */}
        <div className="hidden md:flex flex-1 max-w-md mx-2 lg:mx-4 min-w-0">
          <div className="relative w-full">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#475068]" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#F5F5F5] border border-[#CAC4D0] rounded-full text-[#001627] placeholder-[#475068] focus:outline-none focus:ring-2 focus:ring-[#0350B5] focus:border-transparent text-sm transition-all duration-200"
            />
          </div>
        </div>

        {/* Right Icons */}
        <div className="flex items-center gap-2 lg:gap-4 flex-shrink-0">
          {/* Connect Wallet Button */}
          <div>
            <ConnectButton />
          </div>
          
          {/* Notifications Dropdown */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 hover:bg-[#E1FFFF] rounded-full transition-all duration-200 active:scale-95"
            >
              <BellIcon className="w-5 h-5 lg:w-6 lg:h-6 text-[#001627]" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF5A5F] rounded-full animate-pulse"></span>
              )}
            </button>

            {notificationsOpen && (
              <div
                className="absolute right-0 mt-2 w-80 lg:w-96 bg-white border border-[#CAC4D0] rounded-xl shadow-lg z-50 max-h-[500px] overflow-hidden flex flex-col"
                style={{ animation: "fadeInUp 0.2s ease-out" }}
              >
                <div className="flex items-center justify-between p-4 border-b border-[#E0E7EF]">
                  <h3 className="text-lg font-semibold text-[#001627]">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-sm text-[#0350B5] hover:underline transition-colors"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="overflow-y-auto max-h-[400px] scrollbar-hide">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-[#475068]">
                      <BellIcon className="w-12 h-12 mx-auto mb-2 text-[#CAC4D0]" />
                      <p>No notifications</p>
                    </div>
                  ) : (
                    notifications.map((notification, index) => (
                      <div
                        key={notification.id}
                        onClick={() => markAsRead(notification.id)}
                        className={`p-4 border-b border-[#E0E7EF] cursor-pointer transition-all duration-200 hover:bg-[#F5F5F5] ${
                          !notification.read ? "bg-[#E1FFFF]/30" : ""
                        }`}
                        style={{
                          animation: `fadeIn 0.2s ease-out ${index * 0.05}s both`
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                            !notification.read ? "bg-[#0350B5]" : "bg-transparent"
                          }`}></div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-[#001627] mb-1">
                              {notification.title}
                            </h4>
                            <p className="text-xs text-[#475068] mb-2 line-clamp-2">
                              {notification.message}
                            </p>
                            <span className="text-xs text-[#475068]">{notification.time}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-3 border-t border-[#E0E7EF] text-center">
                  <Link
                    href="/dashboard/notifications"
                    className="text-sm text-[#0350B5] hover:underline font-medium"
                    onClick={() => setNotificationsOpen(false)}
                  >
                    View all notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Chat Button */}
          <Link
            href="/dashboard/chat"
            className="hidden lg:flex p-2 hover:bg-[#E1FFFF] rounded-full transition-all duration-200 active:scale-95"
          >
            <ChatBubbleLeftRightIcon className="w-6 h-6 text-[#001627]" />
          </Link>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-1 lg:gap-2 p-2 hover:bg-[#E1FFFF] rounded-full transition-all duration-200 active:scale-95"
            >
              <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-[#0350B5] flex items-center justify-center text-white font-semibold text-xs lg:text-sm">
                {userName.charAt(0)}
              </div>
              <ChevronDownIcon
                className={`hidden lg:block w-4 h-4 text-[#001627] transition-transform duration-200 ${
                  profileOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {profileOpen && (
              <div
                className="absolute right-0 mt-2 w-56 bg-white border border-[#CAC4D0] rounded-xl shadow-lg z-50 overflow-hidden"
                style={{ animation: "fadeInUp 0.2s ease-out" }}
              >
                <div className="p-4 border-b border-[#E0E7EF]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#0350B5] flex items-center justify-center text-white font-semibold">
                      {userName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#001627] truncate">{userName}</p>
                      <p className="text-xs text-[#475068] truncate">
                        {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Not connected"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="py-2">
                  <Link
                    href="/dashboard/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-[#001627] hover:bg-[#F5F5F5] transition-colors"
                  >
                    <UserIcon className="w-5 h-5 text-[#475068]" />
                    <span>Profile</span>
                  </Link>
                  <Link
                    href="/dashboard/wallet"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-[#001627] hover:bg-[#F5F5F5] transition-colors"
                  >
                    <WalletIcon className="w-5 h-5 text-[#475068]" />
                    <span>Wallet</span>
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-[#001627] hover:bg-[#F5F5F5] transition-colors"
                  >
                    <Cog6ToothIcon className="w-5 h-5 text-[#475068]" />
                    <span>Settings</span>
                  </Link>
                  <Link
                    href="/dashboard/reports"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-[#001627] hover:bg-[#F5F5F5] transition-colors"
                  >
                    <DocumentTextIcon className="w-5 h-5 text-[#475068]" />
                    <span>Reports</span>
                  </Link>
                  <div className="border-t border-[#E0E7EF] my-2"></div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-[#FF5A5F] hover:bg-[#FF5A5F]/10 w-full transition-colors"
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

