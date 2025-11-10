"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import Link from "next/link";
import { parseEther } from "viem";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth/useScaffoldReadContract";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth/useScaffoldWriteContract";

export default function NgoConsole() {
	const { targetNetwork } = useTargetNetwork();
	const { address } = useAccount();
	const { data: creatorRole } = (useScaffoldReadContract as any)({
		contractName: "AquaFundFactory",
		functionName: "PROJECT_CREATOR_ROLE",
		chainId: targetNetwork.id,
	} as any);
	const { data: isCreator } = (useScaffoldReadContract as any)({
		contractName: "AquaFundFactory",
		functionName: "hasRole",
		args: [creatorRole, address],
		chainId: targetNetwork.id,
	} as any);
	const { data: allowed } = (useScaffoldReadContract as any)({
		contractName: "AquaFundFactory",
		functionName: "getAllowedTokens",
		chainId: targetNetwork.id,
	} as any);
	const { writeContractAsync: writeFactory } = useScaffoldWriteContract({ contractName: "AquaFundFactory" });

	const [admin, setAdmin] = useState<string>("");
	const [goal, setGoal] = useState("10");
	const [meta, setMeta] = useState<`0x${string}`>("0x0000000000000000000000000000000000000000000000000000000000000000");
	const [projectAddress, setProjectAddress] = useState<string>("");
	const { writeContractAsync: writeProject } = useScaffoldWriteContract({ contractName: "AquaFundProject" });

	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="text-3xl font-bold mb-6">NGO Console</h1>
			{!isCreator && <div className="alert alert-warning mb-6">Your wallet is not a registered Project Creator. You can still donate and browse projects.</div>}

			<section className="bg-base-100 rounded-xl p-6 shadow-md mb-8">
				<h2 className="text-xl font-semibold mb-3">Create Project</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<input className="input input-bordered" placeholder="Admin address (0x...)" value={admin} onChange={e => setAdmin(e.target.value)} />
					<input className="input input-bordered" placeholder="Goal in BNB" value={goal} onChange={e => setGoal(e.target.value)} />
					<input className="input input-bordered" placeholder="Metadata bytes32" value={meta} onChange={e => setMeta(e.target.value as `0x${string}`)} />
				</div>
				<div className="mt-4">
					<button
						className="btn btn-primary"
						onClick={async () => {
							await (writeFactory as any)({
								functionName: "createProject",
								args: [admin, parseEther(goal || "0"), meta],
							});
						}}
					>
						Create Project
					</button>
					<Link href="/projects" className="btn ml-2">View Projects</Link>
				</div>
			</section>

			<section className="bg-base-100 rounded-xl p-6 shadow-md mb-8">
				<h2 className="text-xl font-semibold mb-3">Manage Project</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<input className="input input-bordered" placeholder="Project contract address" value={projectAddress} onChange={e => setProjectAddress(e.target.value)} />
					<input className="input input-bordered" placeholder="Evidence hash (bytes32)" onChange={() => {}} />
					<div className="flex gap-2">
						<button className="btn" onClick={() => (writeProject as any)({ address: projectAddress as `0x${string}`, functionName: "submitEvidence", args: [meta] })}>Submit Evidence</button>
						<button className="btn" onClick={() => (writeProject as any)({ address: projectAddress as `0x${string}`, functionName: "releaseFunds", args: [] })}>Release Funds</button>
					</div>
				</div>
			</section>

			<section className="bg-base-100 rounded-xl p-6 shadow-md">
				<h2 className="text-xl font-semibold mb-3">Allowed Tokens</h2>
				<div className="text-sm opacity-80 break-all">{(allowed || []).join(", ")}</div>
			</section>
		</div>
	);
}


