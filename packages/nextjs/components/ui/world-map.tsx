"use client";

import { useRef } from "react";
import type React from "react";
import { motion } from "motion/react";
import DottedMap from "dotted-map";


interface MapLocation {
  lat: number;
  lng: number;
  label?: string;
  name?: string;
  country?: string;
  iso3?: string;
}

interface MapProps {
  locations?: MapLocation[];
  dots?: Array<{
    start: { lat: number; lng: number; label?: string };
    end: { lat: number; lng: number; label?: string };
  }>;
  lineColor?: string;
  onLocationClick?: (location: MapLocation) => void;
  children?: React.ReactNode;
}

export default function WorldMap({
  locations = [],
  dots = [],
  lineColor = "#0ea5e9",
  onLocationClick,
  children,
}: MapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const map = new DottedMap({ height: 100, grid: "diagonal" });

  const svgMap = map.getSVG({
    radius: 0.22,
    color: "#E1FFFF40", // Light blue dots with transparency
    shape: "circle",
    backgroundColor: "#000B28", // Dark blue background
  });

  // DottedMap uses equirectangular projection with 2:1 aspect ratio
  // The grid is 200x100, but we need to account for the actual projection
  const BASE_WIDTH = 200;
  const BASE_HEIGHT = 100;

  const projectPoint = (lat: number, lng: number) => {
    // Equirectangular projection for DottedMap
    // Longitude: -180 to 180 maps linearly to 0 to BASE_WIDTH
    // Latitude: 90 to -90 maps to 0 to BASE_HEIGHT (inverted)
    const x = ((lng + 180) / 360) * BASE_WIDTH;
    // For latitude, we need to account for the map's coordinate system
    // DottedMap uses standard equirectangular where equator is at middle
    const y = ((90 - lat) / 180) * BASE_HEIGHT;
    return { x, y };
  };

  const createCurvedPath = (
    start: { x: number; y: number },
    end: { x: number; y: number }
  ) => {
    const midX = (start.x + end.x) / 2;
    const midY = Math.min(start.y, end.y) - 50;
    return `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`;
  };

  return (
    <div ref={containerRef} className="w-full bg-[#000B28] font-sans relative" style={{ aspectRatio: '2/1', minHeight: '50vh' }}>
      {/* Map Area - Always full width, modal overlays */}
      <div className="w-full h-full relative">
        <img
          src={`data:image/svg+xml;utf8,${encodeURIComponent(svgMap)}`}
          className="w-full h-full object-cover [mask-image:linear-gradient(to_bottom,transparent,white_10%,white_90%,transparent)] pointer-events-none select-none"
          alt="world map"
          draggable={false}
        />
        <svg
          ref={svgRef}
          viewBox={`0 0 ${BASE_WIDTH} ${BASE_HEIGHT}`}
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full absolute inset-0 select-none"
          style={{ pointerEvents: onLocationClick ? "auto" : "none" }}
        >
        <defs>
          <linearGradient id="path-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="5%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="95%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Connection lines between locations (render first, behind markers) */}
        {dots.map((dot, i) => {
          const startPoint = projectPoint(dot.start.lat, dot.start.lng);
          const endPoint = projectPoint(dot.end.lat, dot.end.lng);
          return (
            <g key={`path-group-${i}`}>
              <motion.path
                d={createCurvedPath(startPoint, endPoint)}
                fill="none"
                stroke="url(#path-gradient)"
                strokeWidth="0.5"
                initial={{
                  pathLength: 0,
                }}
                animate={{
                  pathLength: 1,
                }}
                transition={{
                  duration: 1,
                  delay: 0.5 * i,
                  ease: "easeOut",
                }}
              />
            </g>
          );
        })}

        {/* Location Markers (render on top) */}
        {locations.map((location, i) => {
          const point = projectPoint(location.lat, location.lng);
          
          return (
            <g key={`location-${i}`}>
              {/* Clickable area */}
              {onLocationClick && (
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="8"
                  fill="transparent"
                  style={{ cursor: "pointer" }}
                  onClick={() => onLocationClick(location)}
                />
              )}
              {/* Main marker dot */}
              <circle
                cx={point.x}
                cy={point.y}
                r="1"
                fill={lineColor}
              />
              {/* Animated pulse ring */}
              <circle
                cx={point.x}
                cy={point.y}
                r="1"
                fill={lineColor}
                opacity="0.5"
              >
                <animate
                  attributeName="r"
                  from="1"
                  to="4"
                  dur="1.5s"
                  begin="0s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  from="0.5"
                  to="0"
                  dur="1.5s"
                  begin="0s"
                  repeatCount="indefinite"
                />
              </circle>
            </g>
          );
        })}
      </svg>
      </div>
      
      {/* Modal Area - Overlay, doesn't affect map layout */}
      {children && (
        <div className="absolute inset-0 flex items-center justify-end pointer-events-none">
          {children}
        </div>
      )}
    </div>
  );
}

