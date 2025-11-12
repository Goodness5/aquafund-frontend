"use client";

import { useMemo, useState } from "react";
import React from "react";
import Link from "next/link";
import { formatEther } from "viem";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth/useScaffoldReadContract";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";

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
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Active Projects</h1>
      {/* The project creation form appears above the list of projects. */}

      <CreateProjectForm />
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
