"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { useMemo } from "react";
import { formatEther } from "viem";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth/useScaffoldReadContract";

export default function Dashboard() {
	const { address } = useAccount();
	const { targetNetwork } = useTargetNetwork();

	const { data: allIds } = useScaffoldReadContract({
		contractName: "AquaFundRegistry",
		functionName: "getAllProjectIds",
		chainId: targetNetwork.id,
	} as any);

	const myProjectIds = useMemo(() => {
		// Filter to projects where admin == address
		return (allIds || []) as bigint[];
	}, [allIds]);

	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="text-3xl font-bold mb-6">Your Dashboard</h1>

			<section className="mb-10">
				<h2 className="text-xl font-semibold mb-3">Your Fundraisers</h2>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
					{(myProjectIds || []).map(id => (
						<ProjectItem key={id.toString()} id={Number(id)} />
					))}
					{(!myProjectIds || myProjectIds.length === 0) && (
						<div className="opacity-70">No fundraisers yet. <Link href="/start" className="link">Start one</Link>.</div>
					)}
				</div>
			</section>
		</div>
	);
}

function ProjectItem({ id }: { id: number }) {
	const { targetNetwork } = useTargetNetwork();
	const { data: info } = useScaffoldReadContract({
		contractName: "AquaFundRegistry",
		functionName: "getProjectDetails",
		args: [BigInt(id)],
		chainId: targetNetwork.id,
	} as any);
	return (
		<div className="bg-base-100 rounded-xl p-4 shadow-md">
			<div className="font-semibold mb-1">Project #{id}</div>
			<div className="text-sm opacity-80">Raised {formatEther(info?.fundsRaised ?? 0n)} / {formatEther(info?.fundingGoal ?? 0n)} BNB</div>
			<div className="mt-3 flex gap-2">
				<Link href={`/projects/${id}`} className="btn btn-sm">View</Link>
			</div>
		</div>
	);
}


