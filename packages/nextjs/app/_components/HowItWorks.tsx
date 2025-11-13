"use client";

import Link from "next/link";
import { FadeInSection } from "./FadeInSection";

const steps = [
  {
    title: "Launch your contract",
    description: "Set goals, timelines, and payout rules. AquaFund deploys audited contracts automatically.",
    hint: "Wallet setup in minutes",
  },
  {
    title: "Engage your supporters",
    description: "Tell your story with multimedia sections, project milestones, and live updates.",
    hint: "Shareable project pages",
  },
  {
    title: "Unlock transparent impact",
    description: "Trigger milestone payouts as deliverables are met and showcase verified results.",
    hint: "Impact dashboards for donors",
  },
];

export function HowItWorks() {
  return (
    <section
      aria-labelledby="how-heading"
      className="container mx-auto px-4 py-16 text-[color:var(--color-base-content)] md:py-20"
    >
      <FadeInSection className="text-center">
        <h2 id="how-heading" className="text-3xl font-semibold md:text-4xl">
          Raising funds on AquaFund is easy
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-[#001627b3]">
          Launch ready-to-go contracts, align stakeholders, and unlock real-time impact data from kickoff to completion.
        </p>
      </FadeInSection>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {steps.map((step, index) => (
          <FadeInSection
            key={step.title}
            className="rounded-3xl border border-[#CAC4D0] bg-base-100 p-6 shadow-md"
            delay={index * 120}
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#0350b51a] text-sm font-semibold text-[color:var(--af-accent)]">
              0{index + 1}
            </span>
            <h3 className="mt-4 text-xl font-semibold">{step.title}</h3>
            <p className="mt-2 text-sm text-[#001627b3]">{step.description}</p>
            <p className="mt-4 text-xs font-medium uppercase tracking-wide text-[#0350b5b3]">{step.hint}</p>
          </FadeInSection>
        ))}
      </div>

      <FadeInSection className="mt-10 flex flex-wrap justify-center gap-4 text-sm text-[#001627b3]">
        <span>Need a hand?</span>
        <Link href="/ngo" className="link text-[color:var(--af-accent)]">
          Explore partner resources
        </Link>
      </FadeInSection>
    </section>
  );
}
