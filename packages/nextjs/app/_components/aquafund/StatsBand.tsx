"use client";

import { formatEther } from "viem";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth/useScaffoldReadContract";

export function StatsBand() {
	const { targetNetwork } = useTargetNetwork();
	const { data: stats } = (useScaffoldReadContract as any)({
		contractName: "AquaFundRegistry",
		functionName: "getPlatformStats",
		chainId: targetNetwork.id,
	});
	const s: any = stats;
	return (
		<section className="w-full bg-base-100/70 backdrop-blur border-y">
			<div className="container mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
				<Stat label="Raised in BNB" value={s ? `${formatEther(s.totalFundsRaised as bigint)}` : "—"} />
				<Stat label="Donations Made" value={s?.totalDonations ?? "—"} />
				<Stat label="People Helped" value={s?.totalDonors ?? "—"} />
			</div>
		</section>
	);
}

function Stat({ label, value }: { label: string; value: string | number }) {
	return (
		<div>
			<div className="text-3xl md:text-4xl font-extrabold">{value}</div>
			<div className="opacity-70">{label}</div>
		</div>
	);
}


