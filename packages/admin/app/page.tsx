import Link from "next/link";
import {
  DocumentCheckIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

export default function Home() {
  const quickLinks = [
    { name: "NGO Approvals", href: "/ngos", icon: DocumentCheckIcon, description: "Review and approve NGO applications" },
    { name: "Projects", href: "/projects", icon: BuildingOfficeIcon, description: "Manage and monitor all platform projects" },
    { name: "Analytics", href: "/analytics", icon: ChartBarIcon, description: "View platform statistics and insights" },
    { name: "Settings", href: "/settings", icon: Cog6ToothIcon, description: "Configure platform settings and roles" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-sm text-gray-500">Welcome to the AquaFund administration panel</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quickLinks.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#0350B5] rounded-lg">
                <link.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{link.name}</h3>
                <p className="mt-1 text-sm text-gray-500">{link.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
