"use client";

import { useState } from "react";
import React from "react";
import Link from "next/link";
import ProjectsHero from "../_components/ProjectsHero";
import { ProjectCard } from "../_components/ProjectCard";
import FundraisingBenefits from "../_components/fundraising/FundraisingBenefits";

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

/**
 * CreateProjectForm lets users create a new project by submitting
 * name and description to the backend (/api/projects).
 * It provides loading, error, and success feedback.
 */
function CreateProjectForm() {
  // Only include required backend fields: title, description, images, fundingGoal
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [images, setImages] = React.useState("");
  const [fundingGoal, setFundingGoal] = React.useState("");
  const [metadataHash, setMetadataHash] = React.useState("");
  const [creatorId, setCreatorId] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState(false);

  // Returns true if creator is admin or NGO, otherwise throws error
  async function checkCreatorRole(creatorId: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/users/${creatorId}`);
      if (!res.ok) {
        throw new Error("Unable to fetch user information");
      }
      const user = await res.json();
      if (user.role === "ADMIN" || user.role === "NGO") {
        return true;
      } else {
        throw new Error("Creator must have ADMIN or NGO role");
      }
    } catch (err: any) {
      throw new Error(err.message || "Role verification failed");
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      // Check creator role first (now proxied)
      await checkCreatorRole(creatorId);
      // If check passes, create the project
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          images: images
            .split(",")
            .map(i => i.trim())
            .filter(i => i),
          fundingGoal: Number(fundingGoal),
          metadataHash,
          creatorId,
        }),
      });
      if (!res.ok) throw new Error("Failed to create project, ensure you're an admin");
      setTitle("");
      setDescription("");
      setImages("");
      setFundingGoal("");
      setMetadataHash("");
      setCreatorId("");
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-8 p-4 bg-base-200 rounded-xl shadow flex flex-col gap-4 max-w-xl mx-auto"
    >
      <h2 className="text-xl font-bold">Create New Project</h2>
      <input
        type="text"
        className="input input-bordered"
        placeholder="Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        required
      />
      <textarea
        className="textarea textarea-bordered"
        placeholder="Description"
        value={description}
        onChange={e => setDescription(e.target.value)}
        required
      />
      <input
        type="text"
        className="input input-bordered"
        placeholder="Image URLs (comma separated)"
        value={images}
        onChange={e => setImages(e.target.value)}
        required
      />
      <input
        type="number"
        className="input input-bordered"
        placeholder="Funding Goal (number)"
        value={fundingGoal}
        min="0"
        onChange={e => setFundingGoal(e.target.value)}
        required
      />
      <input
        type="text"
        className="input input-bordered"
        placeholder="Metadata Hash"
        value={metadataHash}
        onChange={e => setMetadataHash(e.target.value)}
        required
      />
      <input
        type="text"
        className="input input-bordered"
        placeholder="Creator ID"
        value={creatorId}
        onChange={e => setCreatorId(e.target.value)}
        required
      />
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? "Creating..." : "Create Project"}
      </button>
      {error && <div className="text-error">{error}</div>}
      {success && <div className="text-success">Project created!</div>}
    </form>
  );
}
export default function ProjectsPage() {
  const [visibleCount, setVisibleCount] = useState(8);
  const displayedProjects = MOCK_PROJECTS.slice(0, visibleCount);
  const hasMore = visibleCount < MOCK_PROJECTS.length;

  const handleShowMore = () => {
    setVisibleCount(prev => Math.min(prev + 8, MOCK_PROJECTS.length));
  };

  return (
    <div className="">
      <ProjectsHero />
      <div className="container mx-auto px-10 py-10">
        <h1 className="text-3xl font-bold mb-6">Active Projects</h1>
        {/* The project creation form appears above the list of projects. */}

        {/* <CreateProjectForm /> */}
      <div className="grid grid-cols-1 sm:grid-cols-2  lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayedProjects.map((project) => (
          <Link key={project.id} href={`/projects/${project.id}`} className="group block">
            <ProjectCard variant="light" project={project} />
          </Link>
        ))}
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
      </div>
    </div>
  );
}
