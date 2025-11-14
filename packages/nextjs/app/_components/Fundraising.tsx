"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./Button";
import { FadeInSection } from "./FadeInSection";
import TiltedBadge from "./tiltbadge";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import FundraisingHeader from "./fundraising/FundraisingHeader";
import FundraisingSteps from "./fundraising/FundraisingSteps";
import FundraisingHeroImage from "./fundraising/FundraisingHeroImage";
import FundraisingFeatures from "./fundraising/FundraisingFeatures";
import BecomeADonorSection from "./fundraising/BecomeADonorSection";
import FundraisingBenefits from "./fundraising/FundraisingBenefits";

export function Fundraising() {
  return (
    <section className="py-16 md:py-24 w-[90%] m-auto px-4">
      <div className="container mx-auto px-4 md:px-8">
        <FundraisingHeader />
        <div className="flex flex-col justify-between sm:flex-row items-center mb-16 rounded-2xl shadow-xl border border-[#CAC4D0]  p-4  m-auto gap-4">
          <FundraisingHeroImage />
          <FundraisingSteps />
        </div>
        <FundraisingFeatures />
        <BecomeADonorSection />
        <FundraisingBenefits />
      </div>
    </section>
  );
}
