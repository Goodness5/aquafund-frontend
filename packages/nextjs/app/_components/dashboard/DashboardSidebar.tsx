"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  Squares2X2Icon,
  MegaphoneIcon,
  GiftIcon,
  WalletIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  BuildingOfficeIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: Squares2X2Icon },
  { label: "Fundraisers", href: "/dashboard/fundraisers", icon: MegaphoneIcon },
  { label: "NGO Profile", href: "/dashboard/ngo", icon: BuildingOfficeIcon },
  { label: "Donations", href: "/dashboard/donations", icon: GiftIcon },
  { label: "Wallet", href: "/dashboard/wallet", icon: WalletIcon },
  { label: "Reports", href: "/dashboard/reports", icon: ChartBarIcon },
  { label: "Settings", href: "/dashboard/settings", icon: Cog6ToothIcon },
];

interface DashboardSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function DashboardSidebar({ isOpen = true, onClose }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <aside
        className={`fixed left-0 top-[4rem] h-[calc(100vh-4rem)] w-64 bg-white border-r border-[#CAC4D0] overflow-y-auto z-40 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Mobile close button */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-[#CAC4D0]">
          <span className="font-semibold text-[#001627]">Menu</span>
          <button
            onClick={onClose}
            className="text-[#475068] hover:text-[#001627] transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onClose?.()}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive
                    ? "bg-[#E1FFFF] text-[#0350B5] font-semibold"
                    : "text-[#475068] hover:bg-[#F5F5F5]"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

