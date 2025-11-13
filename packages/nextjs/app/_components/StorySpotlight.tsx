"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, PlayCircleIcon } from "@heroicons/react/24/outline";
import { FadeInSection } from "./FadeInSection";

const commitments = [
  "On-chain transparency keeps every donor informed.",
  "Local partners steward projects with community oversight.",
  "Impact dashboards surface live funding and usage data.",
];

export function StorySpotlight() {
  return (
    <section className="container mx-auto px-4 py-16 text-[color:var(--color-base-content)] md:py-20">
      <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_1fr]">
        <FadeInSection className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#0350b533] bg-[#0350b51a] px-3 py-1 text-xs text-[color:var(--af-accent)]">
            <PlayCircleIcon className="h-4 w-4" />
            <span>Field Notes</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold leading-tight">
            See how a single fundraiser transformed water access for a village in Turkana, Kenya.
          </h2>
          <p className="text-[#001627b3]">
            AquaFund equips NGOs with the tools to plan, deploy, and manage water initiatives transparently. Donors
            receive live updates, and communities gain ownership of sustainable infrastructure.
          </p>
          <ul className="space-y-3 text-sm">
            {commitments.map(point => (
              <li key={point} className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-[color:var(--af-progress)]" aria-hidden />
                <span className="text-[#001627b3]">{point}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/start" className="btn btn-primary">
              Launch Your Fundraiser
            </Link>
            <Link href="#projects" className="btn btn-ghost gap-2">
              Explore projects
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </FadeInSection>

        <FadeInSection className="relative h-full">
          <div className="relative overflow-hidden rounded-3xl border border-[#CAC4D0] bg-base-100 shadow-lg">
            <div className="relative aspect-[4/5] sm:aspect-[3/4]">
              <Image
                src="https://images.unsplash.com/photo-1587017539508-222220c05e66?auto=format&fit=crop&w=900&q=80"
                alt="Community accessing clean water"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 480px"
                priority={false}
              />
            </div>
            <div className="absolute bottom-6 left-6 right-6 rounded-2xl bg-[color:var(--af-surface)]/95 backdrop-blur px-5 py-4 shadow-lg">
              <p className="font-semibold text-sm">Raised 15 BNB in 21 days</p>
              <p className="text-xs text-[#001627b3]">
                Funds installed solar-powered pumps supplying 12,000 liters of clean water daily.
              </p>
            </div>
          </div>
        </FadeInSection>
      </div>
    </section>
  );
}

