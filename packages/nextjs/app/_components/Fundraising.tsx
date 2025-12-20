"use client";

import React from "react";
import FundraisingHeader from "./fundraising/FundraisingHeader";
import FundraisingSteps from "./fundraising/FundraisingSteps";
import FundraisingHeroImage from "./fundraising/FundraisingHeroImage";
import FundraisingFeatures from "./fundraising/FundraisingFeatures";
import BecomeADonorSection from "./fundraising/BecomeADonorSection";
import FundraisingBenefits from "./fundraising/FundraisingBenefits";
import { ImpactInsights } from "./ImpactInsights";

export function Fundraising() {
  return (
    <section className="py-16 md:py-24 w-full m-auto flex flex-col">
      <div className="gap-4 flex flex-col">
        <FundraisingHeader />
        <div className="flex flex-col justify-between sm:flex-row items-center mb-16 rounded-2xl shadow-xl border border-[#CAC4D0]  p-4  m-auto gap-4">
          <FundraisingHeroImage />
          <FundraisingSteps />
        </div>
        <div className="w-full flex flex-col">

        <ImpactInsights />
        </div>
        <div className="container mx-auto">

        <FundraisingFeatures />
        <BecomeADonorSection />
        <FundraisingBenefits />
        </div>
      </div>
    </section>
  );
}
