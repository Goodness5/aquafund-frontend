"use client";

import { useState } from "react";
import Link from "next/link";
import { PlusIcon } from "@heroicons/react/24/outline";
import { Button } from "../../_components/Button";

export default function FundraisersPage() {
  const [fundraisers, setFundraisers] = useState<any[]>([]);

  return (
    <div className="w-full max-w-full min-w-0">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#001627] mb-2">Fundraisers</h1>
          <p className="text-sm lg:text-base text-[#475068]">Manage your fundraising campaigns</p>
        </div>
        <Link href="/dashboard/fundraisers/create">
          <Button
            size="lg"
            rounded="full"
            className="bg-[#0350B5] text-white hover:bg-[#034093] transition-all duration-300 hover:scale-105 active:scale-95 font-medium text-sm lg:text-base shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Create Fundraiser
          </Button>
        </Link>
      </div>

      {fundraisers.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <p className="text-[#475068] text-lg mb-4">You haven't created any fundraisers yet.</p>
          <Link href="/dashboard/fundraisers/create">
            <Button
              size="lg"
              rounded="full"
              className="bg-[#0350B5] text-white hover:bg-[#034093] transition-all duration-300"
            >
              Create Your First Fundraiser
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Fundraiser cards will go here */}
        </div>
      )}
    </div>
  );
}

