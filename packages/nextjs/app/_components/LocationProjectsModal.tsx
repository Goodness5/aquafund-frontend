"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { formatEther } from "viem";
import { DonateButton, ProgressBar } from "./ProjectCard";
import { createProjectUrl } from "~~/utils/slug";

interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  raised: number;
  goal: number;
  donations: number;
  location?: string;
}

interface LocationProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: {
    name: string;
    country: string;
    iso3: string;
    coordinates: [number, number];
  } | null;
}

const getFlagUrl = (iso3: string) => {
  const map: Record<string, string> = {
    CAN: "ca",
    BRA: "br",
    DEU: "de",
    NER: "ne",
    TCD: "td",
    IND: "in",
    AUS: "au",
    NGA: "ng", // Nigeria
  };
  return `https://flagcdn.com/24x18/${map[iso3] || iso3.toLowerCase().slice(0, 2)}.png`;
};

export function LocationProjectsModal({ isOpen, onClose, location }: LocationProjectsModalProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !location) {
      setProjects([]);
      setLoading(false);
      return;
    }

    // Only fetch when modal opens (after click)
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/projects/details");
        if (!response.ok) {
          console.error("Failed to fetch projects");
          setProjects([]);
          return;
        }

        const data = await response.json();
        if (!data.projects || !Array.isArray(data.projects)) {
          setProjects([]);
          return;
        }

        // Filter projects by location (match country name or location field)
        const locationName = location.name.toLowerCase();
        const countryName = location.country.toLowerCase();
        
        const filteredProjects: Project[] = data.projects
          .map((project: any) => {
            const info = project.info;
            const projectLocation = (info.location || "").toLowerCase();
            
            // Check if project location matches the selected location
            if (
              projectLocation.includes(locationName) ||
              projectLocation.includes(countryName) ||
              projectLocation.includes(location.iso3.toLowerCase())
            ) {
              return {
                id: Number(info.projectId),
                title: info.title && info.title !== "N/A" ? info.title : `Project #${info.projectId}`,
                donations: info.donationCount || 0,
                image: info.images && info.images.length > 0 ? info.images[0] : "/Home.png",
                raised: Number(formatEther(BigInt(info.fundsRaised || "0"))),
                goal: Number(formatEther(BigInt(info.fundingGoal || "0"))),
                description: info.description && info.description !== "N/A" ? info.description : `Project ${info.projectId}`,
                location: info.location,
              };
            }
            return null;
          })
          .filter((p: Project | null) => p !== null);

        setProjects(filteredProjects);
      } catch (error) {
        console.error("Error fetching projects:", error);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [isOpen, location]);

  if (!isOpen || !location) return null;

  return (
    <div className="w-full h-full flex items-center justify-end pointer-events-auto" onClick={onClose}>
      <div
        className="h-[85%] w-[28%] bg-white rounded-l-2xl shadow-2xl overflow-hidden flex flex-col border border-gray-200"
        onClick={(e) => {
          e.stopPropagation();
        }}
        style={{ minWidth: '18rem', maxWidth: '24rem' }}
      >
        {/* Header */}
        <div className="bg-[#000B28] text-white flex items-center justify-between flex-shrink-0" style={{ padding: '3%' }}>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <img
              src={getFlagUrl(location.iso3)}
              alt={location.country}
              className="w-5 h-4 rounded object-cover flex-shrink-0"
            />
            <h2 className="text-sm font-bold truncate">{location.name}, {location.country}</h2>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="text-white hover:text-gray-300 transition-colors flex-shrink-0 rounded-full bg-[#000B28] hover:bg-[#001a3a] flex items-center justify-center"
            style={{ width: '1.5rem', height: '1.5rem' }}
            aria-label="Close modal"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-white" style={{ padding: '3%' }}>
          {loading ? (
            <div className="flex items-center justify-center" style={{ height: '50%' }}>
              <p className="text-gray-500 text-xs">Loading projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="flex items-center justify-center" style={{ height: '50%' }}>
              <p className="text-gray-500 text-xs">No projects found for this location.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-[#001627] rounded-lg overflow-hidden shadow-md flex flex-col border-t border-gray-300 first:border-t-0"
                >
                  <div className="relative overflow-hidden" style={{ height: '7rem' }}>
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="text-white flex flex-col" style={{ padding: '3%' }}>
                    <h3 className="font-semibold text-xs mb-2 line-clamp-2">{project.title}</h3>
                    <ProgressBar value={project.raised} max={project.goal} />
                    <div className="flex justify-between items-center mt-1.5 mb-1.5">
                      <span className="text-xs">
                        <span className="font-bold">${project.raised.toLocaleString()}</span>
                        <span className="opacity-80 ml-1">out of ${project.goal.toLocaleString()}</span>
                      </span>
                    </div>
                    <a
                      href={createProjectUrl(project.id, project.title)}
                      className="flex items-center gap-1.5 text-[#E1FFFF] font-semibold text-xs hover:opacity-80 transition-opacity"
                    >
                      <Image
                        src="/bx_donate-heart.svg"
                        width={14}
                        height={14}
                        alt="Donate icon"
                      />
                      Donate
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

