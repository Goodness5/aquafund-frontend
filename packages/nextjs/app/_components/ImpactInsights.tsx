"use client";

import React, { useEffect, useRef, useState } from "react";
import { FadeInSection } from "./FadeInSection";
import { ChevronDownIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import WorldMap from "@/components/ui/world-map";

/* -------------------------------------------------
   1. Our countries
   ------------------------------------------------- */
type Country = {
  name: string;
  iso3: string;
  coordinates: [number, number];
  color: string;
  projects: number;
  people: number;
};

const countries: Country[] = [
  {
    name: "Canada",
    iso3: "CAN",
    coordinates: [-95.7129, 56.1304] as [number, number],
    color: "#4A90E2",
    projects: 10,
    people: 4281,
  },
  {
    name: "Brazil",
    iso3: "BRA",
    coordinates: [-51.9253, -14.235] as [number, number],
    color: "#10B981",
    projects: 26,
    people: 27390,
  },
  {
    name: "Germany",
    iso3: "DEU",
    coordinates: [10.4515, 51.1657] as [number, number],
    color: "#A78BFA",
    projects: 4,
    people: 280,
  },
  {
    name: "Niger",
    iso3: "NER",
    coordinates: [8.0817, 17.6078] as [number, number],
    color: "#F97316",
    projects: 0,
    people: 0,
  },
  {
    name: "Chad",
    iso3: "TCD",
    coordinates: [18.7322, 15.4542] as [number, number],
    color: "#1E40AF",
    projects: 0,
    people: 0,
  },
  {
    name: "India",
    iso3: "IND",
    coordinates: [78.9629, 20.5937] as [number, number],
    color: "#9333EA",
    projects: 16,
    people: 827390,
  },
  {
    name: "Australia",
    iso3: "AUS",
    coordinates: [133.7751, -25.2744] as [number, number],
    color: "#FCD34D",
    projects: 21,
    people: 16000,
  },
];

/* -------------------------------------------------
   2. Generate map connections from countries with projects
   ------------------------------------------------- */
const generateMapDots = () => {
  const countriesWithProjects = countries.filter(c => c.projects > 0);
  const dots: Array<{
    start: { lat: number; lng: number; label?: string };
    end: { lat: number; lng: number; label?: string };
  }> = [];

  // Create connections between countries with projects
  // Connect each country to the next one in a chain
  for (let i = 0; i < countriesWithProjects.length - 1; i++) {
    const current = countriesWithProjects[i];
    const next = countriesWithProjects[i + 1];
    dots.push({
      start: {
        lat: current.coordinates[1], // lat is second in [lon, lat]
        lng: current.coordinates[0], // lng is first in [lon, lat]
        label: current.name,
      },
      end: {
        lat: next.coordinates[1],
        lng: next.coordinates[0],
        label: next.name,
      },
    });
  }

  // Also create some cross-connections for visual interest
  if (countriesWithProjects.length > 2) {
    // Connect first to third
    dots.push({
      start: {
        lat: countriesWithProjects[0].coordinates[1],
        lng: countriesWithProjects[0].coordinates[0],
      },
      end: {
        lat: countriesWithProjects[2].coordinates[1],
        lng: countriesWithProjects[2].coordinates[0],
      },
    });
  }

  return dots;
};

export function ImpactInsights() {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mapDots = generateMapDots();

  /* -------------------------------------------------
     6. Close dropdown
     ------------------------------------------------- */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showDropdown]);

  return (
    <section id="impact" className="bg-[#000B28] text-[#E1FFFF] relative" style={{ width: '100%'}}>
      {/* ---------- Map (wrapper) with overlay elements ---------- */}
      <FadeInSection className="w-full">
        <div className="relative w-full">
          {/* ---- MAP ---- */}
          <div className="relative z-0 w-full">
            <WorldMap dots={mapDots} lineColor="#0ea5e9" />
          </div>

          {/* Header - Top Left Overlay */}
          <div className="absolute top-0 left-0 z-10 p-4 md:p-8">
            <div className="flex flex-col relative">
              <h2 className="text-3xl md:text-4xl font-semibold text-white mb-2">Did You Know?</h2>
              <p className="text-lg md:text-xl text-[#E1FFFF] font-medium mb-4">
                About 700 million people lack basic access to clean and safe drinking water.
              </p>
              <div className="relative w-fit" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(v => !v)}
                  className="flex items-center gap-2 px-3 py-1.5 border border-white rounded-lg bg-white text-[#000B28] hover:bg-gray-100 text-sm font-medium min-w-[140px]"
                >
                  Explore by Country
                  <ChevronDownIcon className="h-4 w-4" />
                </button>

                {showDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-[9999] max-h-64 overflow-y-auto">
                    {countries.map(c => (
                      <button
                        key={c.iso3}
                        onClick={() => setShowDropdown(false)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm text-[#000B28]"
                      >
                        <span className="block w-3 h-3 rounded" style={{ backgroundColor: c.color }} />
                        <span>{c.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Search Button - Top Right Overlay */}
          <div className="absolute top-0 right-0 z-10 p-4 md:p-8">
            <button className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 border border-white rounded-lg bg-white text-[#000B28] hover:bg-gray-100 text-sm font-medium">
              <MagnifyingGlassIcon className="h-4 w-4" />
              <span>Search</span>
            </button>
          </div>
        </div>
      </FadeInSection>
    </section>
  );
}
