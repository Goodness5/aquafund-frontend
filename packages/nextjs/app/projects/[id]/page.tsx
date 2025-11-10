"use client";

import { notFound, useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { formatEther, parseEther } from "viem";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth/useScaffoldReadContract";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth/useScaffoldWriteContract";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";

export default function ProjectDetail() {
	const params = useParams();
	const idParam = params?.id;
	const projectId = useMemo(() => {
		const n = Number(idParam);
		return Number.isFinite(n) ? BigInt(n) : null;
	}, [idParam]);
	if (projectId === null) return notFound();

	const { targetNetwork } = useTargetNetwork();
	const { data: info } = useScaffoldReadContract({
		contractName: "AquaFundRegistry",
		functionName: "getProjectDetails",
		args: [projectId],
		chainId: targetNetwork.id,
	});

	const { writeContractAsync: writeProject } = useScaffoldWriteContract({ contractName: "AquaFundProject" });
	const [donation, setDonation] = useState("0.1");

	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="text-3xl font-bold mb-2">Project #{projectId.toString()}</h1>
			<div className="opacity-70 mb-6">Admin: {info?.admin}</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				<div className="lg:col-span-2 bg-base-100 rounded-xl p-6 shadow-md">
					<h2 className="text-xl font-semibold mb-4">Progress</h2>
					<Progress value={info?.fundsRaised ?? 0n} max={info?.fundingGoal ?? 0n} />
					<div className="mt-2 opacity-80">
						Raised {formatEther(info?.fundsRaised ?? 0n)} / {formatEther(info?.fundingGoal ?? 0n)} BNB
					</div>
				</div>
				<div className="bg-base-100 rounded-xl p-6 shadow-md">
					<h2 className="text-xl font-semibold mb-4">Donate</h2>
					<div className="form-control gap-3">
						<input className="input input-bordered" placeholder="Amount in BNB" value={donation} onChange={e => setDonation(e.target.value)} />
						<button
							className="btn btn-primary"
							onClick={async () => {
								await writeProject({
									functionName: "donate",
									args: [],
									value: parseEther(donation || "0"),
								});
							}}
						>
							Donate
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

function Progress({ value, max }: { value: bigint; max: bigint }) {
	const pct = max > 0n ? Number((value * 10000n) / max) / 100 : 0;
	return (
		<div className="w-full bg-base-300 rounded-full h-3">
			<div className="bg-primary h-3 rounded-full" style={{ width: `${Math.min(100, pct)}%` }} />
		</div>
	);
}


