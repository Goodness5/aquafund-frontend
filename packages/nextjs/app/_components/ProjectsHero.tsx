"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "./Button";
import { FadeInSection } from "./FadeInSection";

// Placeholder images for the circular network - replace with actual project images
const networkImages = [
  { src: "/Home.png", alt: "Community support" },
  { src: "/thumbnail.jpg", alt: "Agricultural project" },
  { src: "/impact-map.svg", alt: "Environmental impact" },
  { src: "/Home.png", alt: "Rural development" },
  { src: "/thumbnail.jpg", alt: "Community gathering" },
  { src: "/impact-map.svg", alt: "Field work" },
];

export default function ProjectsHero() {
  return (
    <section 
      className="py-16 md:py-24"
      style={{
        background: "linear-gradient(135deg, #1BCBEE33 0%, #00BF3C15 50%, #CFFED914 100%)",
      }}
    >
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <FadeInSection>
            <div className="max-w-lg">
              <h1 className="text-4xl md:text-5xl font-bold text-[#001627] mb-4 leading-tight">
                Discover projects you can donate to
              </h1>
              <p className="text-lg text-[#475068] mb-8 leading-relaxed">
                Your donation goes a long way! Help others by donating to their fundraiser.
              </p>
              <Link href="/start">
                <Button size="lg" rounded="full" className="bg-[#0350B5] text-white hover:bg-[#034093]">
                  Start a Fundraiser
                </Button>
              </Link>
            </div>
          </FadeInSection>

          {/* Right: Circular Network Visualization */}
          <FadeInSection delay={100}>
            <div className="relative flex items-center justify-center min-h-[500px]">
              <div className="relative w-full max-w-[500px] aspect-square">
                {/* Central Green Circle */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#E1FFFF] rounded-full z-10 shadow-lg" />

                {/* Dashed Lines from Center to Images */}
                <svg className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none" viewBox="0 0 500 500" preserveAspectRatio="xMidYMid meet">
                  {networkImages.map((_, i) => {
                    const angle = (i / networkImages.length) * 2 * Math.PI;
                    const radius = 180;
                    const centerX = 250;
                    const centerY = 250;
                    const endX = centerX + Math.cos(angle) * radius;
                    const endY = centerY + Math.sin(angle) * radius;
                    
                    return (
                      <line
                        key={`line-${i}`}
                        x1={centerX}
                        y1={centerY}
                        x2={endX}
                        y2={endY}
                        stroke="#00BF3C"
                        strokeWidth="2"
                        strokeDasharray="8,4"
                        opacity="0.6"
                      />
                    );
                  })}
                </svg>

                {/* Network Images in Circle */}
                {networkImages.map((img, i) => {
                  const angle = (i / networkImages.length) * 2 * Math.PI;
                  const radius = 180;
                  const x = Math.cos(angle) * radius;
                  const y = Math.sin(angle) * radius;
                  
                  return (
                    <div
                      key={i}
                      className="absolute top-1/2 left-1/2 z-20"
                      style={{
                        transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                      }}
                    >
                      {/* Circular Image */}
                      <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                        <Image
                          src={img.src}
                          alt={img.alt}
                          width={96}
                          height={96}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </FadeInSection>
        </div>
      </div>
    </section>
  );
}

