"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./Button";
import { FadeInSection } from "./FadeInSection";
import TiltedBadge from "./tiltbadge";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

export function Fundraising() {
  const steps = [
    {
      number: 1,
      title: "Start a Fundraiser",
      desc: "Follow the prompts to create your fundraiser and set your goals. You can edit your details anytime.",
    },
    {
      number: 2,
      title: "Connect Your Wallet",
      desc: "Set up and connect the crypto wallet you want to receive donations from your fundraising into.",
    },
    {
      number: 3,
      title: "Reach Your Donors",
      desc: "Reach your donors by sharing the link to your fundraiser. Use your dashboard to track the progress of your fundraising.",
    },
  ];

  const features = [
    {
      title: "Community Projects",
      desc: "Discover verified water projects worldwide.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="8" cy="8" r="3" stroke="#0350B5" strokeWidth="2" fill="none" />
          <circle cx="16" cy="8" r="3" stroke="#0350B5" strokeWidth="2" fill="none" />
          <circle cx="12" cy="16" r="3" stroke="#0350B5" strokeWidth="2" fill="none" />
        </svg>
      ),
    },
    {
      title: "Crypto Donations",
      desc: "Contribute in ETH, USDC, or your preferred tokens.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="#0350B5" strokeWidth="2" fill="none" />
          <path d="M12 6V18M6 12H18" stroke="#0350B5" strokeWidth="2" />
        </svg>
      ),
    },
    {
      title: "Transparent",
      desc: "Every donation is blockchain verifiable.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="6" y="4" width="12" height="16" rx="2" stroke="#0350B5" strokeWidth="2" fill="none" />
          <circle cx="12" cy="10" r="2" fill="#0350B5" />
          <path d="M8 16H16" stroke="#0350B5" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      title: "Impact Badges",
      desc: "Get verifiable proof of your generosity in form of NFTs.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 2L15 9L22 10L17 15L18 22L12 18L6 22L7 15L2 10L9 9L12 2Z"
            stroke="#0350B5"
            strokeWidth="2"
            fill="none"
          />
        </svg>
      ),
    },
    {
      title: "Dashboard",
      desc: "See every step of progress in real time.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="#0350B5" strokeWidth="2" fill="none" />
          <path d="M12 6V12L16 14" stroke="#0350B5" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      title: "Smart Contracts",
      desc: "Automated fund releases and ensure projects meet milestones.",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="4" width="16" height="16" rx="2" stroke="#0350B5" strokeWidth="2" fill="none" />
          <circle cx="8" cy="8" r="1.5" fill="#0350B5" />
          <path d="M12 8H18M8 12H18M8 16H14" stroke="#0350B5" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
    },
  ];

  const avatars = [
    "/avatars/1.jpg",
    "/avatars/2.jpg",
    "/avatars/3.jpg",
    "/avatars/4.jpg",
    "/avatars/5.jpg",
    "/avatars/6.jpg",
    "/avatars/7.jpg",
    "/avatars/8.jpg",
    "/avatars/9.jpg",
    "/avatars/10.jpg",
    "/avatars/11.jpg",
    "/avatars/12.jpg",
  ];

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-8">
        {/* Header with Logo */}
        <FadeInSection className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <TiltedBadge text="Fundraising" imageurl="/fundraising.svg" />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-[#001627] mb-4">
            Raising Funds on <span className="text-[#0350B5]">AquaFund</span> is Easy
          </h2>
        </FadeInSection>

        {/* Main Content: Image + Steps */}
        <div className="grid lg:grid-cols-2 gap-12 items-start mb-16">
          {/* Left: Image */}
          <FadeInSection>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
              <Image src="/fundraiser-kid.jpg" alt="Child collecting clean water" fill className="object-cover" />
            </div>
          </FadeInSection>

          {/* Right: Steps */}
          <FadeInSection className="space-y-6">
            {steps.map(step => (
              <div key={step.number} className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#0350B5] text-white flex items-center justify-center font-bold text-lg">
                  {step.number}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-[#001627] mb-1">{step.title}</h3>
                  <p className="text-[#475068] text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </FadeInSection>
        </div>

        {/* Middle Section: Features + CTA */}
        <FadeInSection className="text-center mb-12">
          <p className="text-lg text-[#001627] mb-6">
            Fundraising on AquaFund Is easy, decentralized, and transparent.
          </p>
          <Link href="/start">
            <Button size="lg">
              Start An AquaFund
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </FadeInSection>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature, i) => (
            <FadeInSection key={i} delay={i * 50}>
              <div className="bg-white border border-[#CAC4D0] rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-[#CFFED914] flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-[#001627] mb-2">{feature.title}</h3>
                <p className="text-sm text-[#475068] leading-relaxed">{feature.desc}</p>
              </div>
            </FadeInSection>
          ))}
        </div>

        {/* Bottom Section: Donors */}
        <FadeInSection>
          <div className="bg-[#E1FFFF] rounded-2xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Left: Donor Info */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7 7a7 7 0 1 0-14 0" stroke="#0350B5" strokeWidth="2" />
                  </svg>
                  <span className="text-sm font-semibold text-[#0350B5]">Become a Donor</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-[#001627] mb-4">
                  Donors are the heroes of humanity.
                </h3>
                <p className="text-[#475068] mb-6 leading-relaxed">
                  Climb the ranks, earn NFTs, and inspire others to join the flow.
                </p>
                <Link href="/projects">
                  <Button size="lg">
                    Browse Projects
                    <ArrowRightIcon className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>

              {/* Right: Avatar Collage */}
              <div className="relative h-64 flex items-center justify-center">
                <div className="relative w-full h-full flex items-center justify-center">
                  {avatars.map((src, i) => {
                    const angle = (i / avatars.length) * 2 * Math.PI;
                    const radius = 80;
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;
                    return (
                      <div
                        key={i}
                        className="absolute w-16 h-16 rounded-full border-4 border-white overflow-hidden shadow-lg"
                        style={{
                          transform: `translate(${x}px, ${y}px)`,
                          zIndex: avatars.length - i,
                        }}
                      >
                        <Image
                          src={src}
                          alt={`Donor ${i + 1}`}
                          width={64}
                          height={64}
                          className="object-cover w-full h-full"
                          onError={e => {
                            // Fallback to placeholder if image doesn't exist
                            (e.target as HTMLImageElement).src =
                              `https://ui-avatars.com/api/?name=Donor+${i + 1}&background=0350B5&color=fff&size=64`;
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </FadeInSection>
      </div>
    </section>
  );
}
