"use client";

import { useMemo, useState } from "react";
import React from "react";
import Link from "next/link";
import { formatEther } from "viem";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth/useScaffoldReadContract";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import ProjectsHero from "../_components/ProjectsHero";
import { ProjectCard as PreviewProjectCard } from "../_components/ProjectsPreview";

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
//=========
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
    <div>
      <ProjectsHero />
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-6">Active Projects</h1>
        {/* The project creation form appears above the list of projects. */}

        {/* <CreateProjectForm /> */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {cards.map((projectId: number) => (
          <ProjectCard key={projectId} projectId={projectId} />
        ))}
      </div>
      <div className="flex gap-3 justify-center mt-8">
        <button className="btn" onClick={() => setPage(p => Math.max(0, p - 1))}>
          Prev
        </button>
        <button className="btn btn-primary" onClick={() => setPage(p => p + 1)}>
          Next
        </button>
      </div>
      </div>
    </div>
  );
}

function ProjectCard({ projectId }: { projectId: number }) {
  const { targetNetwork } = useTargetNetwork();
  const { data: info } = (useScaffoldReadContract as any)({
    contractName: "AquaFundRegistry",
    functionName: "getProjectDetails",
    args: [BigInt(projectId)],
    chainId: targetNetwork.id,
  });

  if (!info) {
    return (
      <div className="rounded-xl bg-[#11212b] text-white min-h-[260px] flex items-center justify-center">
        <div className="text-sm opacity-70">Loading...</div>
      </div>
    );
  }

  const goal = info?.fundingGoal ?? 0n;
  const raised = info?.fundsRaised ?? 0n;
  const title = info?.title || `Project #${projectId}`;
  const description = info?.description || "";
  const images = info?.images || [];
  const image = images.length > 0 ? images[0] : "/Home.png";

  // Convert bigint to number for the card component
  const goalNumber = Number(formatEther(goal));
  const raisedNumber = Number(formatEther(raised));
  
  // Mock donations count - you can replace this with actual data if available
  const donations = Math.floor(raisedNumber / 10) || 0;

  const projectData = {
    id: projectId,
    title,
    description,
    image,
    raised: raisedNumber,
    goal: goalNumber,
    donations,
  };

  return (
    <Link href={`/projects/${projectId}`} className="group block">
      <PreviewProjectCard project={projectData} />
    </Link>
  );
}
