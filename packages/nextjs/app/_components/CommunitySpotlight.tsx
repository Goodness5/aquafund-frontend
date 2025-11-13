"use client";

import Link from "next/link";
import { HeartIcon, UsersIcon } from "@heroicons/react/24/outline";
import { FadeInSection } from "./FadeInSection";

const champions = [
  { name: "Aqua Trust", focus: "Rural filtration kits" },
  { name: "WaterHope Collective", focus: "Climate resilience" },
  { name: "Flow Foundation", focus: "Sanitation access" },
  { name: "Ripple Labs", focus: "Blockchain transparency" },
  { name: "Hydra Youth", focus: "Girls in STEM" },
  { name: "Blue Horizon", focus: "Coastal restoration" },
];

const supporters = [
  "0xB5...02d9",
  "0xA4...18F1",
  "0x9c...bf64",
  "0x61...dEa3",
  "0x45...Ab81",
  "0x33...6d42",
];

export function CommunitySpotlight() {
  return (
    <section className="bg-[color:var(--af-surface-soft)]/60">
      <div className="container mx-auto space-y-12 px-4 py-16 text-[color:var(--color-base-content)] md:py-20">
        <div className="grid items-center gap-8 lg:grid-cols-[1fr_1.2fr]">
          <FadeInSection className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#00bf3c33] bg-[#00bf3c1a] px-3 py-1 text-xs text-[color:var(--af-progress)]">
              <UsersIcon className="h-4 w-4" />
              <span>Community First</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-semibold leading-tight">
              A network of NGOs, donors, and experts co-create water resilience on AquaFund.
            </h2>
            <p className="text-[#001627b3]">
              From grassroots teams to global partners, AquaFund unites mission-driven organizations to launch impact
              faster. Get matched with mentors, technical advisors, and aligned donors.
            </p>
            <div className="flex flex-wrap gap-2">
              {supporters.map(address => (
                <span key={address} className="badge badge-outline badge-lg gap-2">
                  <span className="h-2 w-2 rounded-full bg-success" />
                  {address}
                </span>
              ))}
            </div>
          </FadeInSection>

          <FadeInSection className="grid gap-4 sm:grid-cols-2">
            {champions.map((partner, index) => (
              <FadeInSection
                key={partner.name}
                as="article"
                className="rounded-3xl border border-[#CAC4D0] bg-base-100 p-6 shadow-sm"
                delay={index * 90}
              >
                <h3 className="font-semibold text-lg">{partner.name}</h3>
                <p className="text-sm text-[#001627b3] mt-2">{partner.focus}</p>
                <button className="btn btn-ghost btn-sm mt-4 gap-2 text-[color:var(--af-accent)]">
                  <HeartIcon className="h-4 w-4" />
                  Follow impact
                </button>
              </FadeInSection>
            ))}
          </FadeInSection>
        </div>

        <FadeInSection className="flex flex-col items-center rounded-3xl border border-[#CAC4D0] bg-base-100 px-6 py-12 text-center shadow-lg md:px-12">
          <h3 className="text-2xl md:text-3xl font-semibold">Ready to ripple good with your next project?</h3>
          <p className="mt-3 max-w-2xl text-[#001627b3]">
            Tap into ready-to-use smart contracts, compliance resources, and a global community rooting for your
            success.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link href="/ngo" className="btn btn-secondary text-[color:var(--color-secondary-content)]">
              For NGOs
            </Link>
            <Link href="/start" className="btn btn-primary">
              Launch fundraiser
            </Link>
          </div>
        </FadeInSection>
      </div>
    </section>
  );
}

