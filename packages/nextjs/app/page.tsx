"use client";

import Link from "next/link";
import { Hero } from "./_components/aquafund/Hero";
import { StatsBand } from "./_components/aquafund/StatsBand";
import { ProjectsPreview } from "./_components/aquafund/ProjectsPreview";
import { HowItWorks } from "./_components/aquafund/HowItWorks";
import { FeaturesGrid } from "./_components/aquafund/FeaturesGrid";

export default function Home() {
	return (
		<>
			<Hero />
			<StatsBand />
			<ProjectsPreview />
			<HowItWorks />
			<section className="text-center py-8">
				<Link href="/start" className="btn btn-primary">Start on AquaFund</Link>
			</section>
			<FeaturesGrid />
			<section className="text-center pb-12">
				<Link href="/projects" className="btn btn-secondary">Explore Projects →</Link>
			</section>
		</>
	);
}
