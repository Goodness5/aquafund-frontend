"use client";

import Link from "next/link";
import { useMemo } from "react";
import { formatEther } from "viem";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth/useScaffoldReadContract";

export function ProjectsPreview() {
	const { targetNetwork } = useTargetNetwork();
	const { data: ids } = useScaffoldReadContract({
		contractName: "AquaFundRegistry",
		functionName: "getProjectsPaginated",
		args: [0n, 6n],
		chainId: targetNetwork.id,
	} as any);
	const list = useMemo(() => (ids || []).slice(0, 6).map(Number), [ids]);
	return (
		<section className="bg-[#0c2b13] text-base-content">
			<div className="container mx-auto px-4 py-10 md:py-14">
				<h2 className="text-2xl md:text-3xl font-bold text-base-content mb-4">The World Is Thirsty. Help It Drink</h2>
				<p className="opacity-80 max-w-2xl">Explore curated water impact projects or browse by region.</p>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
					{list.map(id => <ProjectCard key={id} id={id} />)}
				</div>
				<div className="text-center mt-8">
					<Link href="/projects" className="btn btn-secondary">Browse all</Link>
				</div>
			</div>
		</section>
	);
}

function ProjectCard({ id }: { id: number }) {
	const { targetNetwork } = useTargetNetwork();
	const { data: info } = useScaffoldReadContract({
		contractName: "AquaFundRegistry",
		functionName: "getProjectDetails",
		args: [BigInt(id)],
		chainId: targetNetwork.id,
	} as any);
	const goal = info?.fundingGoal ?? 0n;
	const raised = info?.fundsRaised ?? 0n;

	return (
		<div className="rounded-xl overflow-hidden bg-base-100 shadow-md flex flex-col">
			<div className="h-40 bg-[linear-gradient(135deg,#0f3a1a,#0a2312)]" />
			<div className="p-4 flex flex-col gap-2">
				<div className="font-semibold">Project #{id}</div>
				<Progress value={raised} max={goal} />
				<div className="text-sm opacity-80">{formatEther(raised)} / {formatEther(goal)} BNB</div>
				<Link href={`/projects/${id}`} className="btn btn-primary btn-sm mt-2">Support</Link>
			</div>
		</div>
	);
}

function Progress({ value, max }: { value: bigint; max: bigint }) {
	const pct = max > 0n ? Number((value * 10000n) / max) / 100 : 0;
	return (
		<div className="w-full bg-base-300 rounded-full h-2">
			<div className="bg-primary h-2 rounded-full" style={{ width: `${Math.min(100, pct)}%` }} />
		</div>
	);
}


