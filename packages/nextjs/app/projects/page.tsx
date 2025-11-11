"use client";

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
