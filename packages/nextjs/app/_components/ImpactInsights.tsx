"use client";

import React, { useEffect, useRef, useState } from "react";
import { FadeInSection } from "./FadeInSection";
import { ChevronDownIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import WorldMap from "@/components/ui/world-map";
import { LocationProjectsModal } from "./LocationProjectsModal";

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
   2. Mock locations (cities with actual coordinates)
   ------------------------------------------------- */
const mockLocations = [
  {
    lat: 6.5244, // Lagos, Nigeria
    lng: 3.3792,
    name: "Lagos",
    country: "Nigeria",
    iso3: "NGA",
  },
  {
    lat: 28.6139, // New Delhi, India
    lng: 77.2090,
    name: "New Delhi",
    country: "India",
    iso3: "IND",
  },
  {
    lat: -23.5505, // São Paulo, Brazil
    lng: -46.6333,
    name: "São Paulo",
    country: "Brazil",
    iso3: "BRA",
  },
  {
    lat: 43.6532, // Toronto, Canada
    lng: -79.3832,
    name: "Toronto",
    country: "Canada",
    iso3: "CAN",
  },
  {
    lat: 52.5200, // Berlin, Germany
    lng: 13.4050,
    name: "Berlin",
    country: "Germany",
    iso3: "DEU",
  },
  {
    lat: -33.8688, // Sydney, Australia
    lng: 151.2093,
    name: "Sydney",
    country: "Australia",
    iso3: "AUS",
  },
];

/* -------------------------------------------------
   3. Generate connection lines between locations
   ------------------------------------------------- */
const generateMapConnections = () => {
  const connections: Array<{
    start: { lat: number; lng: number };
    end: { lat: number; lng: number };
  }> = [];

  // Connect locations in a chain
  for (let i = 0; i < mockLocations.length - 1; i++) {
    connections.push({
      start: {
        lat: mockLocations[i].lat,
        lng: mockLocations[i].lng,
      },
      end: {
        lat: mockLocations[i + 1].lat,
        lng: mockLocations[i + 1].lng,
      },
    });
  }

  return connections;
};

export function ImpactInsights() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    name: string;
    country: string;
    iso3: string;
    coordinates: [number, number];
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mapConnections = generateMapConnections();

  const handleLocationClick = (location: { lat: number; lng: number; name?: string; country?: string; iso3?: string }) => {
    if (!location.name || !location.country || !location.iso3) {
      // Find closest mock location
      let closest = mockLocations[0];
      let minDistance = Infinity;

      mockLocations.forEach((loc) => {
        const distance = Math.sqrt(
          Math.pow(location.lat - loc.lat, 2) + Math.pow(location.lng - loc.lng, 2)
        );
        if (distance < minDistance) {
          minDistance = distance;
          closest = loc;
        }
      });

      setSelectedLocation({
        name: closest.name,
        country: closest.country,
        iso3: closest.iso3,
        coordinates: [closest.lng, closest.lat],
      });
    } else {
      setSelectedLocation({
        name: location.name,
        country: location.country,
        iso3: location.iso3,
        coordinates: [location.lng, location.lat],
      });
    }
    setIsModalOpen(true);
  };

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
          <div className="relative z-0 w-full" style={{ padding: '0 4%' }}>
            <WorldMap 
              locations={mockLocations} 
              dots={mapConnections} 
              lineColor="#0ea5e9" 
              onLocationClick={handleLocationClick}
            >
              {isModalOpen && selectedLocation && (
                <LocationProjectsModal
                  isOpen={isModalOpen}
                  onClose={() => {
                    setIsModalOpen(false);
                    setSelectedLocation(null);
                  }}
                  location={selectedLocation}
                />
              )}
            </WorldMap>
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
