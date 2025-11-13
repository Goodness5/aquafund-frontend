"use client";

import Link from "next/link";
import { FadeInSection } from "./FadeInSection";

export function CallToAction() {
  return (
    <section className="container mx-auto px-4 py-16 md:py-20">
      <FadeInSection className="rounded-3xl bg-gradient-to-r from-[#001627] via-[#0350b5] to-[#00bf3c] px-6 py-12 text-center text-[color:var(--af-text-alt)] shadow-2xl md:px-16">
        <h2 className="text-3xl font-semibold md:text-4xl">Make waves with AquaFund</h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-[#E1FFFFB3] md:text-base">
          Whether you&apos;re launching a community water hub or scaling a national initiative, AquaFund unlocks the
          transparency and reach you need. Start building with guided contracts, analytics, and a community cheering you
          on.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/start" className="btn btn-secondary btn-wide">
            Launch fundraiser
          </Link>
          <Link
            href="/projects"
            className="btn btn-outline border-[#E1FFFF80] text-[color:var(--af-text-alt)] hover:border-[color:var(--af-text-alt)]"
          >
            Discover projects
          </Link>
        </div>
      </FadeInSection>
    </section>
  );
}
