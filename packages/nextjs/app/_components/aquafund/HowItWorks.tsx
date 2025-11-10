"use client";

export function HowItWorks() {
	return (
		<section className="container mx-auto px-4 py-12 md:py-16">
			<h2 className="text-2xl md:text-3xl font-bold text-center">Raising Funds on AquaFund is Easy</h2>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
				<Card title="Start a Fundraiser" desc="Follow prompts to create your page and set your goals. Edit anytime." step={1} />
				<Card title="Connect Your Wallet" desc="Receive donations directly into your fundraiser smart contract." step={2} />
				<Card title="Reach Your Donors" desc="Share your fundraiser link and track live progress." step={3} />
			</div>
		</section>
	);
}

function Card({ title, desc, step }: { title: string; desc: string; step: number }) {
	return (
		<div className="bg-base-100 rounded-xl p-5 shadow-md border">
			<div className="badge badge-success badge-outline">{step}</div>
			<h3 className="text-lg font-semibold mt-2">{title}</h3>
			<p className="opacity-80 mt-1">{desc}</p>
		</div>
	);
}


