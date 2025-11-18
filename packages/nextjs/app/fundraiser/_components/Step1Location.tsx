"use client";

import { useState } from "react";
import { MapPinIcon } from "@heroicons/react/24/outline";
import { FundraiserFormData } from "../create/page";

interface Step1LocationProps {
  formData: FundraiserFormData;
  updateFormData: (updates: Partial<FundraiserFormData>) => void;
}

const countries = [
  "Select country",
  "Nigeria",
  "Kenya",
  "Ghana",
  "Tanzania",
  "Uganda",
  "Ethiopia",
  "South Africa",
  "Zambia",
  "Malawi",
  "Mozambique",
];

export default function Step1Location({
  formData,
  updateFormData,
}: Step1LocationProps) {
  const [showMapHint, setShowMapHint] = useState(false);

  return (
    <div className="space-y-3">
      {/* Country Selection */}
      <div>
        <label style={{ fontSize: "0.85em" }} className="block font-medium text-[#475068] mb-1">
          Country
        </label>
        <div className="relative">
          <select
            value={formData.country}
            onChange={(e) => updateFormData({ country: e.target.value })}
            style={{ fontSize: "0.9em", padding: "0.5em 0.75em" }}
            className="w-full border-2 border-[#CAC4D0] rounded-lg focus:outline-none focus:border-[#0350B5] transition-colors appearance-none bg-white"
          >
            {countries.map((country) => (
              <option key={country} value={country === "Select country" ? "" : country}>
                {country}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg
              className="w-4 h-4 text-[#475068]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Location Input */}
      <div>
        <label style={{ fontSize: "0.85em" }} className="block font-medium text-[#475068] mb-1">
          Location
        </label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => updateFormData({ location: e.target.value })}
          placeholder="Enter the exact location for your project"
          style={{ fontSize: "0.9em", padding: "0.5em 0.75em" }}
          className="w-full border-2 border-[#CAC4D0] rounded-lg focus:outline-none focus:border-[#0350B5] transition-colors"
        />
        <p style={{ fontSize: "0.8em" }} className="text-[#475068] mt-1 flex items-center gap-1">
          Enter coordinates or choose on the{" "}
          <button
            type="button"
            onClick={() => setShowMapHint(!showMapHint)}
            className="text-[#0350B5] hover:underline flex items-center gap-1"
          >
            map
            <MapPinIcon className="w-3.5 h-3.5 text-red-500" />
          </button>
        </p>
        {showMapHint && (
          <div style={{ fontSize: "0.8em", padding: "0.5em" }} className="mt-1 bg-[#E1FFFF] rounded-lg text-[#475068]">
            Map selection feature coming soon. For now, please enter coordinates manually (e.g., 6.5244° N, 3.3792° E).
          </div>
        )}
      </div>
    </div>
  );
}

