"use client";

<<<<<<< HEAD
import { useState, useMemo } from "react";
import React from "react";
import Link from "next/link";
import ProjectsHero from "../_components/ProjectsHero";
import { ProjectCard } from "../_components/ProjectCard";
import FundraisingBenefits from "../_components/fundraising/FundraisingBenefits";
import { MagnifyingGlassIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

const MOCK_PROJECTS = [
  {
    id: 1,
    title: "Building Five Wells in Orile–Owu",
    donations: 780,
    image: "/Home.png",
    raised: 12898,
    goal: 30000,
    description: "Building Five Wells in Orile–Owu",
  },
  {
    id: 2,
    title: "Support Olorogbo Village to get a Borehole",
    donations: 780,
    image: "/impact-map.svg",
    raised: 12898,
    goal: 30000,
    description: "Support Olorogbo Village to get a Borehole",
  },
  {
    id: 3,
    title: "Help Parakin have access to Potable Water",
    donations: 780,
    image: "/thumbnail.jpg",
    raised: 12898,
    goal: 30000,
    description: "Help Parakin have access to Potable Water",
  },
  {
    id: 4,
    title: "The Oluji Water Project",
    donations: 780,
    image: "/logo.svg",
    raised: 12898,
    goal: 20000,
    description: "The Oluji Water Project",
  },
  {
    id: 5,
    title: "Clean Water Outreach - Village Y",
    donations: 502,
    image: "/favicon.png",
    raised: 9800,
    goal: 15000,
    description: "Clean Water Outreach - Village Y",
  },
  {
    id: 6,
    title: "Clean Water Outreach - Village Y",
    donations: 502,
    image: "/favicon.png",
    raised: 9800,
    goal: 15000,
    description: "Clean Water Outreach - Village Y",
  },
  {
    id: 7,
    title: "Well Refurbishment for Ajaja",
    donations: 320,
    image: "/Home.png",
    raised: 5190,
    goal: 8000,
    description: "Well Refurbishment for Ajaja",
  },
  {
    id: 8,
    title: "Well Refurbishment for Ajaja",
    donations: 320,
    image: "/Home.png",
    raised: 5190,
    goal: 8000,
    description: "Well Refurbishment for Ajaja",
  },
  {
    id: 9,
    title: "Rural Water Access Initiative - Kogi State",
    donations: 450,
    image: "/thumbnail.jpg",
    raised: 15200,
    goal: 25000,
    description: "Rural Water Access Initiative - Kogi State",
  },
  {
    id: 10,
    title: "Community Well Project - Enugu",
    donations: 620,
    image: "/impact-map.svg",
    raised: 18900,
    goal: 35000,
    description: "Community Well Project - Enugu",
  },
  {
    id: 11,
    title: "Clean Water for Schools - Lagos",
    donations: 890,
    image: "/Home.png",
    raised: 22100,
    goal: 40000,
    description: "Clean Water for Schools - Lagos",
  },
  {
    id: 12,
    title: "Borehole Installation - Kaduna",
    donations: 340,
    image: "/favicon.png",
    raised: 11200,
    goal: 18000,
    description: "Borehole Installation - Kaduna",
  },
  {
    id: 13,
    title: "Water Purification System - Rivers State",
    donations: 560,
    image: "/logo.svg",
    raised: 16800,
    goal: 28000,
    description: "Water Purification System - Rivers State",
  },
  {
    id: 14,
    title: "Village Water Network - Ogun State",
    donations: 420,
    image: "/thumbnail.jpg",
    raised: 13400,
    goal: 22000,
    description: "Village Water Network - Ogun State",
  },
  {
    id: 15,
    title: "Emergency Water Relief - Borno",
    donations: 1100,
    image: "/Home.png",
    raised: 28900,
    goal: 45000,
    description: "Emergency Water Relief - Borno",
  },
  {
    id: 16,
    title: "Sustainable Water Source - Plateau",
    donations: 380,
    image: "/impact-map.svg",
    raised: 9800,
    goal: 16000,
    description: "Sustainable Water Source - Plateau",
  },
  {
    id: 17,
    title: "Community Water Tank - Anambra",
    donations: 510,
    image: "/favicon.png",
    raised: 14500,
    goal: 24000,
    description: "Community Water Tank - Anambra",
  },
  {
    id: 18,
    title: "Water Well Restoration - Delta",
    donations: 290,
    image: "/logo.svg",
    raised: 8700,
    goal: 14000,
    description: "Water Well Restoration - Delta",
  },
  {
    id: 19,
    title: "Rural Water Supply - Benue",
    donations: 470,
    image: "/thumbnail.jpg",
    raised: 16200,
    goal: 27000,
    description: "Rural Water Supply - Benue",
  },
  {
    id: 20,
    title: "Clean Water Initiative - Kwara",
    donations: 540,
    image: "/Home.png",
    raised: 17800,
    goal: 30000,
    description: "Clean Water Initiative - Kwara",
  },
  {
    id: 21,
    title: "Water Access Program - Osun",
    donations: 410,
    image: "/impact-map.svg",
    raised: 12600,
    goal: 21000,
    description: "Water Access Program - Osun",
  },
  {
    id: 22,
    title: "Borehole Project - Ekiti",
    donations: 360,
    image: "/favicon.png",
    raised: 10300,
    goal: 17000,
    description: "Borehole Project - Ekiti",
  },
  {
    id: 23,
    title: "Community Water System - Ondo",
    donations: 480,
    image: "/logo.svg",
    raised: 15600,
    goal: 26000,
    description: "Community Water System - Ondo",
  },
  {
    id: 24,
    title: "Water Well Construction - Abia",
    donations: 390,
    image: "/thumbnail.jpg",
    raised: 11900,
    goal: 19000,
    description: "Water Well Construction - Abia",
  },
];

export default function ProjectsPage() {
  const [visibleCount, setVisibleCount] = useState(8);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string>("All Countries");
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);

  // Extract unique countries from projects (assuming we'll add country field)
  const countries = useMemo(() => {
    const countrySet = new Set<string>(["All Countries"]);
    // For now, we'll use "Nigeria" for all projects, but this can be updated
    MOCK_PROJECTS.forEach(() => countrySet.add("Nigeria"));
    return Array.from(countrySet).sort();
  }, []);

  // Filter projects based on search and country
  const filteredProjects = useMemo(() => {
    return MOCK_PROJECTS.filter(project => {
      const matchesSearch = 
        searchQuery === "" || 
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCountry = 
        selectedCountry === "All Countries" || 
        "Nigeria" === selectedCountry; // Update when country field is added
      
      return matchesSearch && matchesCountry;
    });
  }, [searchQuery, selectedCountry]);

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
      <div className="grid grid-cols-1 sm:grid-cols-2  lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayedProjects.length > 0 ? (
          displayedProjects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`} className="group block">
              <ProjectCard variant="light" project={project} />
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-[#475068] text-lg">No projects found matching your search criteria.</p>
          </div>
        )}
      </div>
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
=======
import { useMemo, useState } from "react";
import Link from "next/link";
import { formatEther } from "viem";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth/useScaffoldReadContract";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";

function ProgressBar({ value, max }: { value: bigint; max: bigint }) {
  const pct = max > 0n ? Number((value * 10000n) / max) / 100 : 0;
  return (
    <div className="w-full bg-base-300 rounded-full h-2">
      <div className="bg-primary h-2 rounded-full" style={{ width: `${Math.min(100, pct)}%` }} />
    </div>
  );
}

export default function ProjectsPage() {
  const { targetNetwork } = useTargetNetwork();
  const [page, setPage] = useState(0);
  const pageSize = 8n;

  const { data: ids } = (useScaffoldReadContract as any)({
    contractName: "AquaFundRegistry",
    functionName: "getProjectsPaginated",
    args: [BigInt(page) * pageSize, pageSize],
    chainId: targetNetwork.id,
  });

  const cards = useMemo(() => (ids || []).map((id: bigint) => Number(id)), [ids]);

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Active Projects</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {cards.map((projectId: number) => (
          <ProjectCard key={projectId} projectId={projectId} />
        ))}
      </div>
      <div className="flex gap-3 justify-center mt-8">
        <button className="btn" onClick={() => setPage((p: number) => Math.max(0, p - 1))}>
          Prev
        </button>
        <button className="btn btn-primary" onClick={() => setPage((p: number) => p + 1)}>
          Next
        </button>
>>>>>>> master
      </div>
    </div>
  );
}
<<<<<<< HEAD
=======

function ProjectCard({ projectId }: { projectId: number }) {
  const { targetNetwork } = useTargetNetwork();
  const { data: info } = (useScaffoldReadContract as any)({
    contractName: "AquaFundRegistry",
    functionName: "getProjectDetails",
    args: [BigInt(projectId)],
    chainId: targetNetwork.id,
  });
  const goal = info?.fundingGoal ?? 0n;
  const raised = info?.fundsRaised ?? 0n;
  return (
    <div className="rounded-xl bg-base-100 shadow-md p-4 flex flex-col gap-3">
      <div className="text-sm opacity-70">Project #{projectId}</div>
      <div className="text-lg font-semibold break-words">Funding Goal: {formatEther(goal)} BNB</div>
      <ProgressBar value={raised} max={goal} />
      <div className="text-sm opacity-80">
        Raised: {formatEther(raised)} / {formatEther(goal)} BNB
      </div>
      <Link className="btn btn-primary btn-sm mt-auto" href={`/projects/${projectId}`}>
        View project
      </Link>
    </div>
  );
}
>>>>>>> master
