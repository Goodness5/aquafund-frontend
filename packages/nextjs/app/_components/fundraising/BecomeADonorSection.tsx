'use client';

import { FadeInSection } from "../FadeInSection";
import { ArrowUpRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { Button } from "../Button";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

// ---------------------------------------------------------------------
// FIXED AVATAR CLUSTER
// ---------------------------------------------------------------------
const avatarCluster = [
  "/avatar1.svg", "/avatar2.svg", "/avatar3.svg", "/avatar4.svg",
  "/avatar5.svg", "/avatar6.svg", "/avatar7.svg", "/avatar8.svg",
  "/avatar9.svg", "/avatar10.svg"
];

export default function BecomeADonorSection() {
  // Responsive container width
  const clusterRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState(340);
  useEffect(() => {
    const update = () => {
      if (clusterRef.current) {
        setSize(clusterRef.current.offsetWidth);
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Avatar positioning math
  const avatarsToShow = avatarCluster.length;
  const avatarRadius = size * 0.39; // wave center, not edge
  return (
    <FadeInSection>
      <div className="become-donor-bg-box">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">

          {/* LEFT SIDE */}
          <div className="max-w-lg">
            <div className="flex items-center gap-2 mb-4 rounded-full w-fit bg-[#E1FFFF] px-3 py-1.5">
              <Image
                src="/donor.svg"
                alt=""
                width={20}
                height={20}
                className="shrink-0"
              />
              <span className="text-sm font-semibold text-[#0350B5]">
                Become a Donor
              </span>
            </div>

            <h3 className="text-2xl md:text-3xl font-bold text-[#001627] mb-4 leading-tight">
              Donors are the heroes of humanity.
            </h3>

            <p className="text-[#475068] mb-6 leading-relaxed">
              Climb the ranks, earn NFTs, and inspire others to join the flow.
            </p>

            <Link href="/projects">
              <Button
                size="lg"
                rounded="full"
                className="bg-[#0350B5] text-white hover:bg-[#034093]"
              >
                Browse Projects
                <ArrowUpRightIcon className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          {/* RIGHT SIDE — RESPONSIVE CLUSTER */}
          <div className="relative flex items-center justify-center min-h-[220px] sm:min-h-[300px] md:min-h-[340px] py-2">
            <div
              ref={clusterRef}
              className="relative w-full max-w-[350px] aspect-square min-h-[180px]"
              style={{ height: size }}
            >
              {avatarCluster.map((src, i) => {
                const angle = (i / avatarsToShow) * 2 * Math.PI;
                const jitter = Math.sin(angle * 2.8 + i) * (size * 0.08);
                const r = avatarRadius + jitter;
                const x = (size / 2) + Math.cos(angle) * r;
                const y = (size / 2) + Math.sin(angle) * r;
                const avatarSize = Math.max(size * 0.22, 52); // between 52px and ~25% cluster width
                return (
                  <div
                    key={i}
                    className="absolute rounded-full overflow-hidden shadow"
                    style={{
                      left: `calc(50% + ${Math.cos(angle)*avatarRadius}px)` ,
                      top: `calc(50% + ${Math.sin(angle)*avatarRadius}px)` ,
                      width: avatarSize,
                      height: avatarSize,
                      zIndex: 10 + Math.floor(10 * Math.sin(angle)),
                      transform: `translate(-50%, -50%) translate(${Math.cos(angle)*jitter}px, ${Math.sin(angle)*jitter}px)`
                    }}
                  >
                    <Image
                      src={src}
                      alt={`Donor avatar ${i + 1}`}
                      width={avatarSize}
                      height={avatarSize}
                      className="object-cover w-full h-full rounded-full"
                      loading="lazy"
                      quality={80}
                    />
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </FadeInSection>
  );
}
