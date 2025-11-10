"use client";

export function FeaturesGrid() {
	const items = [
		{ title: "Community Projects", desc: "Fund local water initiatives with real impact." },
		{ title: "Crypto Donations", desc: "Donate with BNB or allowed tokens." },
		{ title: "Transparent", desc: "On-chain tracking of every donation." },
		{ title: "Impact Badges", desc: "Collect NFTs that show your impact." },
		{ title: "Dashboard", desc: "View your donations and fundraisers." },
		{ title: "Smart Contracts", desc: "Secure, decentralized and auditable." },
	];
	return (
		<section className="container mx-auto px-4 py-12">
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
				{items.map(i => (
					<div key={i.title} className="bg-base-100 rounded-xl p-5 shadow-md">
						<h3 className="font-semibold">{i.title}</h3>
						<p className="opacity-80 mt-1">{i.desc}</p>
					</div>
				))}
			</div>
		</section>
	);
}


