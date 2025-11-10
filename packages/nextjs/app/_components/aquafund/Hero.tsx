"use client";

import Link from "next/link";

export function Hero() {
	return (
		<section className="relative overflow-hidden">
			<div className="absolute inset-0 bg-gradient-to-b from-[#0b2d13] to-transparent opacity-20 pointer-events-none" />
			<div className="container mx-auto px-4 py-14 md:py-20 text-center relative">
				<div className="inline-flex items-center gap-2 bg-base-100/70 backdrop-blur rounded-full px-3 py-1 text-xs border">
					<span className="badge badge-success badge-xs" />
					<span>Decentralized & Transparent</span>
				</div>
				<h1 className="text-3xl md:text-5xl font-extrabold mt-4 leading-tight">
					The Ripple of Change<br />Starts Here
				</h1>
				<p className="max-w-2xl mx-auto opacity-80 mt-3">
					Every drop counts. AquaFund connects you to water-saving projects around the world.
				</p>
				<div className="flex items-center justify-center gap-3 mt-6">
					<Link href="/projects" className="btn btn-primary">Browse Projects</Link>
					<Link href="/start" className="btn">Start on AquaFund</Link>
				</div>
			</div>
		</section>
	);
}


