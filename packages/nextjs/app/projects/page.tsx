"use client";

import { useState, useMemo, useEffect } from "react";
import React from "react";
import Link from "next/link";
import { formatEther } from "viem";
import ProjectsHero from "../_components/ProjectsHero";
import { ProjectCard } from "../_components/ProjectCard";
import FundraisingBenefits from "../_components/fundraising/FundraisingBenefits";
import { MagnifyingGlassIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth/useScaffoldReadContract";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";

interface Project {
  id: number;
  title: string;
  donations: number;
  image: string;
  raised: number;
  goal: number;
  description: string;
}

export default function ProjectsPage() {
  const { targetNetwork } = useTargetNetwork();
  const [visibleCount, setVisibleCount] = useState(8);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string>("All Countries");
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Get all project IDs from registry
  const { data: allProjectIds, isLoading: isLoadingIds, error: projectIdsError } = (useScaffoldReadContract as any)({
    contractName: "AquaFundRegistry",
    functionName: "getAllProjectIds",
    chainId: targetNetwork.id,
  } as any);

  // Debug logging
  useEffect(() => {
    console.log("Projects fetch state:", {
      allProjectIds,
      isLoadingIds,
      error: projectIdsError,
      targetNetwork: targetNetwork.id,
    });
  }, [allProjectIds, isLoadingIds, projectIdsError, targetNetwork]);

  // Fetch project details for each project ID directly from contract
  useEffect(() => {
    if (isLoadingIds) {
      return; // Still loading
    }

    if (projectIdsError) {
      console.error("Error fetching project IDs:", projectIdsError);
      setProjects([]);
      setLoading(false);
      return;
    }

    if (!allProjectIds) {
      setProjects([]);
      setLoading(false);
      return;
    }

    // Check if allProjectIds is an array
    if (!Array.isArray(allProjectIds)) {
      console.warn("allProjectIds is not an array:", allProjectIds);
      setProjects([]);
      setLoading(false);
      return;
    }

    if (allProjectIds.length === 0) {
      setProjects([]);
      setLoading(false);
      return;
    }

    // Fetch project details for each project ID
    const fetchProjectDetails = async () => {
      try {
        const projectPromises = (allProjectIds as bigint[]).slice(0, 50).map(async (projectId) => {
          try {
            // Use useScaffoldReadContract for each project (we'll need to batch this differently)
            // For now, create basic project objects from IDs
            return {
              id: Number(projectId),
              title: `Project #${projectId}`,
              donations: 0, // Can be fetched from contract if needed
              image: "/Home.png", // Default image, can be enhanced with metadata
              raised: 0, // Will be fetched from contract
              goal: 0, // Will be fetched from contract
              description: `Blockchain Project ID: ${projectId}`,
            };
          } catch (error) {
            console.error(`Failed to fetch project ${projectId}:`, error);
            return null;
          }
        });

        const results = await Promise.all(projectPromises);
        const validProjects = results.filter((p) => p !== null) as Project[];
        setProjects(validProjects);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [allProjectIds, isLoadingIds, projectIdsError]);

  // Extract unique countries from projects
  const countries = useMemo(() => {
    const countrySet = new Set<string>(["All Countries"]);
    // For now, we'll use "Nigeria" for all projects, but this can be updated
    projects.forEach(() => countrySet.add("Nigeria"));
    return Array.from(countrySet).sort();
  }, [projects]);

  // Filter projects based on search and country
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = 
        searchQuery === "" || 
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCountry = 
        selectedCountry === "All Countries" || 
        "Nigeria" === selectedCountry; // Update when country field is added
      
      return matchesSearch && matchesCountry;
    });
  }, [projects, searchQuery, selectedCountry]);

  const displayedProjects = filteredProjects.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProjects.length;

  const handleShowMore = () => {
    setVisibleCount(prev => Math.min(prev + 8, filteredProjects.length));
  };

  // Reset visible count when filters change
  React.useEffect(() => {
    setVisibleCount(8);
  }, [searchQuery, selectedCountry]);

  return (
    <div className="">
      <ProjectsHero />
      <div className="container mx-auto px-10 py-10">
        {/* Did You Know Section */}
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-[#001627] mb-3">
            Did You Know?
          </h2>
          <p className="text-lg text-[#475068] mb-6">
            About 700 million people lack basic access to clean and safe drinking water
          </p>
          
          {/* Search and Filter Section */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
            {/* Country Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-[#CAC4D0] rounded-full text-[#001627] hover:bg-[#F5F5F5] transition-colors"
              >
                <span>Explore by Country</span>
                <ChevronDownIcon className="w-4 h-4" />
              </button>
              
              {isCountryDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setIsCountryDropdownOpen(false)}
                  />
                  <div className="absolute top-full left-0 mt-2 bg-white border border-[#CAC4D0] rounded-xl shadow-lg z-20 min-w-[200px] max-h-[300px] overflow-y-auto">
                    {countries.map((country) => (
                      <button
                        key={country}
                        onClick={() => {
                          setSelectedCountry(country);
                          setIsCountryDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-[#E1FFFF] transition-colors ${
                          selectedCountry === country ? "bg-[#E1FFFF] font-semibold" : ""
                        }`}
                      >
                        {country}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Search Bar */}
            <div className="relative flex-1 sm:max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#475068]" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-[#CAC4D0] rounded-full text-[#001627] placeholder-[#475068] focus:outline-none focus:ring-2 focus:ring-[#0350B5] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-6">Active Projects</h1>
        {/* The project creation form appears above the list of projects. */}

        {/* <CreateProjectForm /> */}
      {loading ? (
        <div className="col-span-full text-center py-12">
          <p className="text-[#475068] text-lg">Loading projects from blockchain...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2  lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayedProjects.length > 0 ? (
            displayedProjects.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`} className="group block">
                <ProjectCard variant="light" project={project} />
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-[#475068] text-lg">No projects found. Be the first to create one!</p>
            </div>
          )}
        </div>
      )}
      {hasMore && (
        <div className="flex justify-center mt-16">
          <button 
            className=" border rounded-full cursor-pointer px-3 py-2 border-[#001627] text-center items-center justify-center" 
            onClick={handleShowMore}
          >
            Show More
          </button>
        </div>
      )}
      </div>
      <div className="px-10">
      <FundraisingBenefits />
      </div>
    </div>
  );
}
