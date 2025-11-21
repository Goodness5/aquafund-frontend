"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { FadeInSection } from "./FadeInSection";
import TiltedBadge from "./tiltbadge";
import { ArrowUpRightIcon } from "@heroicons/react/24/outline";

declare global {
  interface Window {
    VANTA?: any;
    THREE?: any;
  }
}

const stats = [
  { label: "Raised in crypto", value: "$15,000" },
  { label: "Boreholes & Wells built", value: "49" },
  { label: "People saved", value: "20,000" },
];

const loadScript = (src: string) =>
  new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script ${src}`));
    document.body.appendChild(script);
  });

export function Hero() {
  const heroRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    let effect: any;
    const element = heroRef.current;
    if (!element) return;

    async function initVanta() {
      try {
        if (!window.THREE) {
          await loadScript("https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js");
        }

        if (!window.VANTA?.DOTS) {
          await loadScript("https://cdnjs.cloudflare.com/ajax/libs/vanta/0.5.24/vanta.dots.min.js");
        }

        if (!window.VANTA?.DOTS) return;

        effect = window.VANTA.DOTS({
          el: element,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.0,
          minWidth: 200.0,
          scale: 1.0,
          scaleMobile: 1.0,
          color: 0xd3eff,
          color2: 0xd3eff,
          backgroundColor: 0xfffffe,
          size: 2.3,
          spacing: 28.0,
        });
      } catch (err) {
        console.error("Failed to initialize Vanta background", err);
      }
    }

    initVanta();

    return () => {
      if (effect?.destroy) {
        effect.destroy();
      }
    };
  }, []);

  return (
    <section ref={heroRef} className="relative overflow-hidden">
      <div className="relative container mx-auto pt-24 px-8 text-center flex flex-col justify-between space-y-8">
        <TiltedBadge text="Decentralized" imageurl="/decentralized.svg" />

        <FadeInSection className="mt-6" delay={80}>
          <h1 className="text-4xl font-[700] leading-tight md:text-6xl">
            The Ripple of Change
            <br className="hidden sm:block" />
            <span> Starts Here</span>
          </h1>
          <p className="mx-auto mt-4 max-w-3xl font-[400] md:text-lg">
            Every drop counts. AquaFund connects you directly to water crowdfunding projects around the world.
          </p>
        </FadeInSection>

        <FadeInSection className="mt-8 flex flex-wrap items-center justify-center gap-4" delay={160}>
          <Link href="/projects" className="btn btn-primary btn-wide gap-2">
            Donate to Projects
            <ArrowUpRightIcon className="h-4 w-4" />
          </Link>
          <Link href="/fundraiser/create" className="btn btn-outline btn-wide gap-2">
            Start a Fundraiser
            <ArrowUpRightIcon className="h-4 w-4" />
          </Link>
        </FadeInSection>

        <FadeInSection className="mx-auto justify-between mt-4 w-[50%] flex " delay={220}>
          {stats.map(stat => (
            <div key={stat.label} className="flex flex-col">
              <p className="text-[3em] font-bold ">{stat.value}</p>
              <p className="text-[1em] tracking-wide ">{stat.label}</p>
            </div>
          ))}
        </FadeInSection>

        {/* <FadeInSection className="mt-14 flex justify-center" delay={280}>
          <a
            href="#projects"
            className="flex items-center gap-2 text-sm font-medium text-[rgba(225,255,255,0.7)] hover:text-[#79C3FF]"
          >
            <ArrowDownIcon className="h-5 w-5 animate-bounce text-[#79C3FF]" />
            Scroll to explore
          </a>
        </FadeInSection> */}
      </div>
    </section>
  );
}
