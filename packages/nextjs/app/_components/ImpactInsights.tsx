"use client";

import React, { useEffect, useRef, useState } from "react";
import { FadeInSection } from "./FadeInSection";
import { json } from "d3-fetch";
import { geoMercator, geoPath } from "d3-geo";
import type { FeatureCollection } from "geojson";
import { feature } from "topojson-client";
import { ChevronDownIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

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
   2. Numeric ID → ISO-3 (from ISO 3166-1 numeric)
   ------------------------------------------------- */
const numericIdToIso3: Record<string, string> = {
  "124": "CAN", // Canada
  "076": "BRA", // Brazil
  "276": "DEU", // Germany
  "562": "NER", // Niger
  "148": "TCD", // Chad
  "356": "IND", // India
  "036": "AUS", // Australia
  // Add more if needed
};

/* -------------------------------------------------
   3. ISO-3 → Color
   ------------------------------------------------- */
const iso3ToColor: Record<string, string> = Object.fromEntries(countries.map(c => [c.iso3, c.color]));

/* -------------------------------------------------
   4. Flag helper
   ------------------------------------------------- */
const getFlagUrl = (iso3: string) => {
  const map: Record<string, string> = {
    CAN: "ca",
    BRA: "br",
    DEU: "de",
    NER: "ne",
    TCD: "td",
    IND: "in",
    AUS: "au",
  };
  return `https://flagcdn.com/24x18/${map[iso3] || iso3.toLowerCase().slice(0, 2)}.png`;
};

/* -------------------------------------------------
   5. Constants
   ------------------------------------------------- */
const WORLD_GEOJSON = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
const MAP_WIDTH = 910;
const MAP_HEIGHT = 430;
const POPUP_OFFSET = { x: 0, y: -28 };

export function ImpactInsights() {
  const [worldData, setWorldData] = useState<FeatureCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  /* -------------------------------------------------
     6. Load & Convert TopoJSON
     ------------------------------------------------- */
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const topo: any = await json(WORLD_GEOJSON);
        const geo = feature(topo, topo.objects.countries) as unknown as FeatureCollection;

        // LOG EVERY COUNTRY
        geo.features.forEach((f: any) => {
          const id = f.id?.toString();
          const name = f.properties?.name || "Unknown";
          const iso3 = numericIdToIso3[id];
          const color = iso3 ? iso3ToColor[iso3] : null;

          if (color) {
            console.log(`FILL → ${name} (id: ${id}) → ${iso3} → ${color}`);
          } else {
            console.log(`NO COLOR → ${name} (id: ${id})`);
          }
        });

        setWorldData(geo);
      } catch (e) {
        console.error("Failed to load map:", e);
        setError("Map failed to load.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* -------------------------------------------------
     7. Close dropdown
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

  /* -------------------------------------------------
     8. Projection – centered
     ------------------------------------------------- */
  const projection = geoMercator()
    .scale(145)
    .center([0, 20])
    .translate([MAP_WIDTH / 2, MAP_HEIGHT / 2]);

  const pathGen = geoPath().projection(projection);
  const project = (lon: number, lat: number) => projection([lon, lat]) ?? null;

  return (
    <section id="impact" className="bg-[#FFFDFA] text-[#001627] py-16 md:py-20">
      <div className="container mx-auto px-4 md:px-8">
        {/* Header */}
        <FadeInSection className="mb-8">
          <div className="flex flex-col mb-3">
            <h2 className="text-3xl md:text-4xl font-semibold text-[#001627] mb-2">Did You Know?</h2>
            <p className="text-lg md:text-xl text-[#001627] font-medium">
              About 700 million people lack basic access to clean and safe drinking water.
            </p>
          </div>
        </FadeInSection>

        {/* ---------- Map (wrapper + SVG) ---------- */}
        <FadeInSection>
          <div className="flex justify-center p-2">
            {loading ? (
              <div className="h-[430px] w-full max-w-[920px] flex items-center justify-center bg-white rounded-xl">
                Loading map...
              </div>
            ) : error ? (
              <div className="h-[430px] w-full max-w-[920px] flex items-center justify-center bg-white rounded-xl text-red-600">
                {error}
              </div>
            ) : (
              worldData && (
                <>
                  {/* ---- MAP (low z-index) ---- */}
                  <div className="relative z-0 w-full p-4 mt-8">
                    <svg
                      width={MAP_WIDTH}
                      height={MAP_HEIGHT}
                      viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
                      className="block w-full h-auto bg-[#FFFDFA] "
                    >
                      {/* ---- Countries ---- */}
                      {worldData.features.map((f: any, i) => {
                        const id = f.id?.toString();
                        const iso3 = numericIdToIso3[id];
                        const fill = iso3 ? iso3ToColor[iso3] : "#E5E7EB";

                        return (
                          <path key={f.id ?? i} d={pathGen(f) ?? ""} fill={fill} stroke="#F4F4F7" strokeWidth={0.7} />
                        );
                      })}

                      {/* ---- Markers ---- */}
                      {countries
                        .filter(c => c.projects > 0)
                        .map(country => {
                          const pos = project(country.coordinates[0], country.coordinates[1]);
                          if (!pos) return null;
                          const [x, y] = pos;

                          return (
                            <g key={country.iso3} transform={`translate(${x},${y + POPUP_OFFSET.y})`}>
                              <foreignObject width="100" height="44" x="-50" y="-44">
                                <div className="flex items-center gap-1.5 bg-white/96 rounded-lg px-2 py-1.5 shadow-md text-xs">
                                  <div
                                    className="w-6 h-6 rounded flex items-center justify-center"
                                    style={{ background: country.color }}
                                  >
                                    <img src={getFlagUrl(country.iso3)} alt="" className="w-5 h-4 rounded" />
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="font-semibold text-[#475068]">{country.name}</span>
                                    <div className="flex gap-2 text-[#294056] font-medium">
                                      <span className="flex items-center gap-0.5">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                          <path
                                            d="M5 21V19M19 21V19M3 11L12 3L21 11V19A2 2 0 0 1 19 21H5A2 2 0 0 1 3 19V11Z"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                          />
                                        </svg>
                                        {country.projects}
                                      </span>
                                      <span className="flex items-center gap-0.5">
                                        <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
                                          <path
                                            d="M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7 7a7 7 0 1 0-14 0"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                          />
                                        </svg>
                                        {country.people.toLocaleString()}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </foreignObject>
                            </g>
                          );
                        })}
                    </svg>
                  </div>

                  {/* ---- DROPDOWN (high z-index, rendered AFTER map) ---- */}
                  <div className="absolute top-0 left-0 right-0 flex justify-between items-start my-[4] pointer-events-none">
                    <div className="pointer-events-auto relative z-[9999]" ref={dropdownRef}>
                      <button
                        onClick={() => setShowDropdown(v => !v)}
                        className="flex items-center gap-2 px-3 py-1.5 border border-[#CAC4D0] rounded-lg bg-white text-[#001627] hover:bg-gray-50 text-sm font-medium min-w-[140px]"
                      >
                        Explore by Country
                        <ChevronDownIcon className="h-4 w-4" />
                      </button>

                      {showDropdown && (
                        <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-[#CAC4D0] rounded-lg shadow-xl z-[9999] max-h-64 overflow-y-auto">
                          {countries.map(c => (
                            <button
                              key={c.iso3}
                              onClick={() => setShowDropdown(false)}
                              className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm"
                            >
                              <span className="block w-3 h-3 rounded" style={{ backgroundColor: c.color }} />
                              <span>{c.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <button className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 border border-[#CAC4D0] rounded-lg bg-white text-[#001627] hover:bg-gray-50 text-sm font-medium">
                      <MagnifyingGlassIcon className="h-4 w-4" />
                      <span>Search</span>
                    </button>
                  </div>
                </>
              )
            )}
          </div>
        </FadeInSection>
      </div>
    </section>
  );
}
