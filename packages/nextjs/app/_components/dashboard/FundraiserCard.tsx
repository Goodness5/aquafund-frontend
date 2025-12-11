"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShareIcon,
  PencilIcon,
  EyeIcon,
  PauseIcon,
  PlayIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";

export interface FundraiserCardData {
  id: number;
  title: string;
  location: string;
  category: string;
  status: "active" | "completed" | "paused";
  raised: number;
  goal: number;
  donors: number;
  daysLeft: number;
  recentDonations: number;
  views: number;
  image?: string;
}

interface FundraiserCardProps {
  fundraiser: FundraiserCardData;
  onEdit?: (id: number) => void;
  onShare?: (id: number) => void;
  onTogglePause?: (id: number) => void;
}

const statusConfig = {
  active: {
    label: "Active",
    className: "bg-green-100 text-green-700 border-green-200",
  },
  completed: {
    label: "Completed",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  paused: {
    label: "Paused",
    className: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
};

export default function FundraiserCard({
  fundraiser,
  onEdit,
  onShare,
  onTogglePause,
}: FundraiserCardProps) {
  const [isPaused, setIsPaused] = useState(fundraiser.status === "paused");
  const status = statusConfig[fundraiser.status];
  const progressPercentage = fundraiser.goal > 0 
    ? Math.min(100, (fundraiser.raised / fundraiser.goal) * 100) 
    : 0;

  const handleTogglePause = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsPaused(!isPaused);
    onTogglePause?.(fundraiser.id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit?.(fundraiser.id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onShare?.(fundraiser.id);
  };

  return (
    <div className="bg-white rounded-xl border border-[#CAC4D0] p-5 shadow-sm hover:shadow-md transition-shadow">
      {/* Header with status, share, and edit */}
      <div className="flex items-start justify-between mb-4">
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold border ${status.className}`}
        >
          {status.label}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-1.5 text-[#475068] hover:text-[#0350B5] hover:bg-[#E1FFFF] rounded-lg transition-colors"
            aria-label="Share fundraiser"
          >
            <ShareIcon className="w-5 h-5" />
          </button>
          <button
            onClick={handleEdit}
            className="p-1.5 text-[#475068] hover:text-[#0350B5] hover:bg-[#E1FFFF] rounded-lg transition-colors"
            aria-label="Edit fundraiser"
          >
            <PencilIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Project Image */}
      {fundraiser.image && (
        <div className="relative w-full h-40 rounded-lg overflow-hidden mb-4 bg-gray-100">
          <Image
            src={fundraiser.image}
            alt={fundraiser.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Project Title */}
      <h3 className="text-lg font-bold text-[#001627] mb-3 line-clamp-2">
        {fundraiser.title}
      </h3>

      {/* Location & Category */}
      <div className="flex items-center gap-2 text-sm text-[#475068] mb-4">
        <MapPinIcon className="w-4 h-4" />
        <span>{fundraiser.location}</span>
        <span className="text-[#CAC4D0]">•</span>
        <span>{fundraiser.category}</span>
      </div>

      {/* Funding Progress */}
      <div className="mb-4">
        <div className="flex items-baseline justify-between mb-2">
          <div>
            <span className="text-xl font-bold text-[#001627]">
              ${fundraiser.raised.toLocaleString()}
            </span>
            <span className="text-sm text-[#475068] ml-1">
              of ${fundraiser.goal.toLocaleString()}
            </span>
          </div>
          <span className="text-sm font-medium text-[#0350B5]">
            {progressPercentage.toFixed(0)}% funded
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full h-2 bg-[#E1FFFF] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#0350B5] rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        
        <p className="text-sm text-[#475068] mt-1">
          {fundraiser.donors} donors
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b border-[#E1FFFF]">
        <div>
          <p className="text-xs text-[#475068] mb-1">Days Left</p>
          <p className="text-base font-semibold text-[#001627]">{fundraiser.daysLeft}</p>
        </div>
        <div>
          <p className="text-xs text-[#475068] mb-1">Recent Donations</p>
          <p className="text-base font-semibold text-[#001627]">{fundraiser.recentDonations}</p>
        </div>
        <div>
          <p className="text-xs text-[#475068] mb-1">Views</p>
          <p className="text-base font-semibold text-[#001627]">{fundraiser.views}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-3">
        <Link
          href={`/projects/${fundraiser.id}`}
          className="flex items-center gap-2 px-4 py-2 bg-[#0350B5] text-white rounded-lg hover:bg-[#034093] transition-colors text-sm font-medium"
        >
          <EyeIcon className="w-4 h-4" />
          View Details
        </Link>
        <button
          onClick={handleTogglePause}
          className="p-2 text-[#475068] hover:text-[#0350B5] hover:bg-[#E1FFFF] rounded-lg transition-colors"
          aria-label={isPaused ? "Resume fundraiser" : "Pause fundraiser"}
        >
          {isPaused ? (
            <PlayIcon className="w-5 h-5" />
          ) : (
            <PauseIcon className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}

