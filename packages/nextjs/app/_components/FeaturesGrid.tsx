"use client";

import { AdjustmentsHorizontalIcon, GlobeAltIcon, ShieldCheckIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { FadeInSection } from "./FadeInSection";

const features = [
  {
    title: "Composable Fundraisers",
    description: "Deploy audited smart contracts in minutes and customize disbursement logic.",
    icon: AdjustmentsHorizontalIcon,
  },
  {
    title: "Global Reach",
    description: "Tap into a global donor pool and route funds directly to verified NGOs.",
    icon: GlobeAltIcon,
  },
  {
    title: "Transparent Impact",
    description: "Every donation, milestone, and payout is recorded on-chain for supporters.",
    icon: ShieldCheckIcon,
  },
  {
    title: "Engaged Community",
    description: "Reward supporters with badges, updates, and shared governance moments.",
    icon: SparklesIcon,
  },
];

export function FeaturesGrid() {
  return (
    <section
      aria-labelledby="features-heading"
      className="container mx-auto px-4 py-16 text-[color:var(--color-base-content)] md:py-20"
    >
      <div className="mx-auto max-w-2xl text-center">
        <FadeInSection>
          <h2 id="features-heading" className="text-3xl font-semibold md:text-4xl">
            Built for transparent, unstoppable fundraising
          </h2>
          <p className="mt-3 text-[#001627b3]">
            AquaFund gives teams everything they need to launch, govern, and scale water impact initiatives.
          </p>
        </FadeInSection>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {features.map((feature, index) => (
          <FadeInSection
            key={feature.title}
            className="rounded-3xl border border-[#CAC4D0] bg-base-100 p-6 shadow-md"
            delay={index * 90}
          >
            <feature.icon className="h-10 w-10 rounded-full border border-[#0350b533] bg-[#0350b51a] p-2 text-[color:var(--af-accent)]" />
            <h3 className="mt-4 text-xl font-semibold">{feature.title}</h3>
            <p className="mt-2 text-sm text-[#001627b3]">{feature.description}</p>
          </FadeInSection>
        ))}
      </div>
    </section>
  );
}
