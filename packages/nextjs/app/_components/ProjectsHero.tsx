"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "./Button";
import { FadeInSection } from "./FadeInSection";

// Images arranged on three circular lines - each image is unique
// Outer circle (6 images), middle circle (4 images), inner circle (2 images)
const networkImages = [
  // Outer circle images
  { src: "/fundraising-img-1.svg", alt: "Community support", circle: "outer", index: 0 },
  { src: "/rounded-img2.svg", alt: "Agricultural project", circle: "outer", index: 1 },
  { src: "/rounded-img3.svg", alt: "Environmental impact", circle: "outer", index: 2 },
  { src: "/rounded-img4.svg", alt: "Rural development", circle: "outer", index: 3 },
  { src: "/rounded-img5.svg", alt: "Community gathering", circle: "outer", index: 4 },
  { src: "/rounded-img6.svg", alt: "Field work", circle: "outer", index: 5 },
];

export default function ProjectsHero() {
  const getImagePosition = (circle: string, index: number, total: number) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2; // Start from top
    let radius = 0;
    
    // Closer circles: reduced spacing between them
    if (circle === "outer") {
      radius = 160;
    } else if (circle === "middle") {
      radius = 110;
    } else {
      radius = 60;
    }
    
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    
    return { x, y, radius };
  };

  const outerImages = networkImages.filter(img => img.circle === "outer");
  const middleImages = networkImages.filter(img => img.circle === "middle");
  const innerImages = networkImages.filter(img => img.circle === "inner");

  return (
    <section 
      className="py-16 md:py-24 bg-gradient-to-tr from-[#fff] to-[#1BCBEE33] "
      style={{
        // background: "linear-gradient(135deg, #1BCBEE33 0%, #00BF3C15 50%, #CFFED914 100%)",
      }}
    >
      <div className="container mx-auto px-2 md:px-8">
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
            <div className="relative flex items-center justify-center w-full">
              <div className="relative w-full max-w-[500px] aspect-square">
                {/* SVG for three dotted circles only */}
                <svg className="left-0 w-full h-full z-10 pointer-events-none" viewBox="0 0 500 500" preserveAspectRatio="xMidYMid meet">
                  {/* Three Dotted Circles - closer together */}
                  {/* Outer dotted circle */}
                  <circle
                    cx="250"
                    cy="250"
                    r="170"
                    fill="none"
                    stroke="#00BF3C"
                    strokeWidth="2"
                    strokeDasharray="8,4"
                    opacity="0.8"
                  />
                  
                  {/* Middle dotted circle */}
                  <circle
                    cx="250"
                    cy="250"
                    r="145"
                    fill="none"
                    stroke="#00BF3C"
                    strokeWidth="2"
                    strokeDasharray="8,4"
                    opacity="0.8"
                  />
                  
                  {/* Inner dotted circle */}
                  <circle
                    cx="250"
                    cy="250"
                    r="125"
                    fill="none"
                    stroke="#00BF3C"
                    strokeWidth="2"
                    strokeDasharray="8,4"
                    opacity="0.8"
                  />
                </svg>

             
                {/* Images positioned on the three circles */}
                {/* Outer circle images */}
                {outerImages.map((img) => {
                  const pos = getImagePosition(img.circle, img.index, outerImages.length);
                  return (
                    <div
                      key={`outer-${img.index}`}
                      className="absolute top-1/2 left-1/2 z-20"
                      style={{
                        transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`,
                      }}
                    >
                      <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg">
                        <Image
                          src={img.src}
                          alt={img.alt}
                          width={100}
                          height={100}
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

