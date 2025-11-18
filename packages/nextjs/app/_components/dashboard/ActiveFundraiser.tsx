"use client";

import Image from "next/image";
import Link from "next/link";
import { PencilIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

interface ActiveFundraiserProps {
  project?: {
    id: number;
    title: string;
    image: string;
    raised: number;
    goal: number;
    donations: number;
  };
}

const mockActiveFundraiser = {
  id: 1,
  title: "The Oluji Water Project",
  image: "/fundraising-img-1.svg",
  raised: 1898,
  goal: 20000,
  donations: 780,
};

export default function ActiveFundraiser({ project = mockActiveFundraiser }: ActiveFundraiserProps) {
  const progressPercentage = Math.min(100, (project.raised / project.goal) * 100);

  return (
    <div className="bg-white rounded-xl shadow-inner overflow-hidden flex flex-col">
      {/* Image Section - Top */}
      <div className="relative w-full h-64 lg:h-80 overflow-hidden">
        <Image
          src={project.image}
          alt={project.title}
          fill
          className="object-cover"
          style={{ background: "#11212b" }}
        />
        {/* Donations Badge */}
        <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-medium bg-[#0A161C66] text-white backdrop-blur-sm">
          {project.donations} Donations
        </div>
      </div>

      {/* Content Section - Below Image */}
      <div className="p-4 lg:p-6 flex flex-col">
        <h3 className="text-xl lg:text-2xl font-semibold text-[#001627] mb-4">
          {project.title}
        </h3>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="w-full h-2 bg-[#E0E7EF] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ background: "#00BF3C", width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm lg:text-base text-[#475068]">
              <span className="font-bold text-[#001627]">${project.raised.toLocaleString()}</span>{" "}
              out of <span className="font-semibold">${project.goal.toLocaleString()} Goal</span>
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <Link
            href={`/dashboard/fundraisers/${project.id}/edit`}
            className="flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-[#0350B5] text-[#0350B5] rounded-full hover:bg-[#E1FFFF] transition-colors font-medium text-sm lg:text-base"
          >
            <PencilIcon className="w-4 h-4 lg:w-5 lg:h-5" />
            <span>Edit Fundraiser</span>
          </Link>
          <Link
            href={`/projects/${project.id}`}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0350B5] text-white rounded-full hover:bg-[#034093] transition-colors font-medium text-sm lg:text-base"
          >
            <span>View Public Page</span>
            <ArrowTopRightOnSquareIcon className="w-4 h-4 lg:w-5 lg:h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

