"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FadeInSection } from "./FadeInSection";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

const MOCK_PROJECTS = [
  {
    id: 1,
    title: "Building Five Wells in Orile–Owu",
    donations: 780,
    image: "/Home.png",
    raised: 12898,
    goal: 30000,
    description: "Building Five Wells in Orile–Owu",
  },
  {
    id: 2,
    title: "Support Olorogbo Village to get a Borehole",
    donations: 780,
    image: "/impact-map.svg",
    raised: 12898,
    goal: 30000,
    description: "Support Olorogbo Village to get a Borehole",
  },
  {
    id: 3,
    title: "Help Parakin have access to Potable Water",
    donations: 780,
    image: "/thumbnail.jpg",
    raised: 12898,
    goal: 30000,
    description: "Help Parakin have access to Potable Water",
  },
  {
    id: 4,
    title: "The Oluji Water Project",
    donations: 780,
    image: "/logo.svg",
    raised: 12898,
    goal: 20000,
    description: "The Oluji Water Project",
  },
  {
    id: 5,
    title: "Clean Water Outreach - Village Y",
    donations: 502,
    image: "/favicon.png",
    raised: 9800,
    goal: 15000,
    description: "Clean Water Outreach - Village Y",
  },
  {
    id: 6,
    title: "Clean Water Outreach - Village Y",
    donations: 502,
    image: "/favicon.png",
    raised: 9800,
    goal: 15000,
    description: "Clean Water Outreach - Village Y",
  },
  {
    id: 7,
    title: "Well Refurbishment for Ajaja",
    donations: 320,
    image: "/Home.png",
    raised: 5190,
    goal: 8000,
    description: "Well Refurbishment for Ajaja",
  },
  {
    id: 8,
    title: "Well Refurbishment for Ajaja",
    donations: 320,
    image: "/Home.png",
    raised: 5190,
    goal: 8000,
    description: "Well Refurbishment for Ajaja",
  },
];

function DonorTag({ donations }: { donations: number }) {
  return (
    <span
      className="absolute right-3 top-3 px-3 py-1 rounded-full text-xs font-medium"
      style={{
        background: "#0A161C66",
        color: "#fff",
        zIndex: 1,
      }}
    >
      {donations} Donations
    </span>
  );
}

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="w-full h-2 bg-[#183241] rounded-full overflow-hidden mt-2">
      <div
        className="h-full rounded-full"
        style={{ background: "#00BF3C", width: `${pct}%`, transition: "width 400ms" }}
      />
    </div>
  );
}

function DonateButton({ projectId }: { projectId: number }) {
  const router = useRouter();

  return (
    <button
      onClick={e => {
        e.stopPropagation();
        router.push(`/projects/${projectId}`);
      }}
      className="flex items-center gap-1 mt-2 text-[1em] font-semibold hover:opacity-80 transition-opacity cursor-pointer"
      style={{ color: "#E1FFFF", background: "transparent", border: "none" }}
    >
      <Image
        src="/bx_donate-heart.svg"
        width={20}
        height={20}
        alt="Donate icon"
        style={{ marginRight: 4, opacity: 1 }}
      />
      Donate
    </button>
  );
}

function ProjectCard({ project }: { project: (typeof MOCK_PROJECTS)[0] }) {
  return (
    <div
      className="relative flex flex-col shadow-xl rounded-xl overflow-hidden bg-[#11212b] text-white min-h-[260px] transition-all duration-200 group-hover:scale-105 group-focus-within:scale-105 group-hover:shadow-[0_8px_30px_-10px_rgba(3,80,181,0.28)] group-focus-within:shadow-[0_8px_30px_-10px_rgba(3,80,181,0.28)] group-hover:z-10 group-focus-within:z-10"
      tabIndex={-1}
    >
      <div className="relative h-40 overflow-hidden">
        <Image src={project.image} alt={project.title} fill style={{ objectFit: "cover" }} />
        <DonorTag donations={project.donations} />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-semibold text-base line-clamp-2 min-h-[2.4em]">{project.title}</h3>
        <ProgressBar value={project.raised} max={project.goal} />
        <div className="flex justify-between items-end mt-2">
          <div>
            <span className="font-bold">${project.raised.toLocaleString()}</span>
            <span className="text-xs opacity-80 font-normal ml-1">out of ${project.goal.toLocaleString()}</span>
          </div>
        </div>
        <div className="mt-3">
          <DonateButton projectId={project.id} />
        </div>
      </div>
    </div>
  );
}

export function ArrowButton({ direction, ...props }: { direction: "left" | "right"; onClick?: () => void }) {
  return (
    <button
      type="button"
      className="w-8 h-8 flex bg-[#0350B5] items-center rounded-full justify-center border-none outline-none cursor-pointer"
      {...props}
    >
      <ChevronRightIcon className={`w-5 h-5 text-white ${direction === "left" ? "rotate-180" : ""}`} />
    </button>
  );
}

export default function ProjectsPreview() {
  const cardsPerPage = 6;
  const [offset, setOffset] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const len = MOCK_PROJECTS.length;
  // Compute display window, wrapping as needed
  const displayProjects = Array.from(
    { length: Math.min(cardsPerPage, len) },
    (_, idx) => MOCK_PROJECTS[(offset + idx) % len],
  );

  const handlePrev = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setOffset(prev => (prev - cardsPerPage + len) % len);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 300);
  };

  const handleNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setOffset(prev => (prev + cardsPerPage) % len);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 300);
  };

  return (
    <section
      id="projects"
      aria-labelledby="projects-heading"
      className="relative py-16 md:py-18 px-8"
      style={{
        background: "url('/Frame 2121457992.svg') top center / 100% 100% no-repeat, #001627",
        backgroundBlendMode: "normal, normal",
        backgroundRepeat: "no-repeat, no-repeat",
        backgroundPosition: "top center, center",
        backgroundSize: "100% 100%, cover",
      }}
    >
      <div className="container mx-auto">
        <div className="mb-7 flex items-start justify-between">
          <div>
            <h2 id="projects-heading" className="text-white font-semibold text-2xl sm:text-3xl">
              The World Is Thirsty. Help It Drink
            </h2>
            <p className="text-white/70 text-xs sm:text-sm max-w-xl">
              Every project here fights for something simple: access to water. Choose a cause, fund it, and watch your
              impact ripple across continents.
            </p>
          </div>
          <div className="flex items-center justify-between w-fit gap-4 rounded-lg py-1.5">
            <ArrowButton direction="left" onClick={handlePrev} />
            <ArrowButton direction="right" onClick={handleNext} />
          </div>
        </div>

        <div className=" ">
          {/* First row: 2 cards, second one stretched */}
          <div className="grid grid-cols-5 gap-6 mb-6">
            <div
              className={`col-span-2 transition-all duration-300 ease-in-out ${isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
            >
              <FadeInSection>
                <Link
                  href={`/projects/${displayProjects[0]?.id}`}
                  className="group block outline-none focus-visible:ring-2 ring-[#E1FFFF]"
                >
                  <ProjectCard project={displayProjects[0]} />
                </Link>
              </FadeInSection>
            </div>
            <div
              className={`col-span-3 transition-all duration-300 ease-in-out ${isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
            >
              <FadeInSection>
                <Link
                  href={`/projects/${displayProjects[1]?.id}`}
                  className="group block outline-none focus-visible:ring-2 ring-[#E1FFFF]"
                >
                  <ProjectCard project={displayProjects[1]} />
                </Link>
              </FadeInSection>
            </div>
          </div>
          {/* Second row: 3 cards - evenly distributed with equal widths */}
          <div className="grid grid-cols-3 gap-6">
            <div
              className={`transition-all duration-300 ease-in-out ${isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
            >
              <FadeInSection>
                <Link
                  href={`/projects/${displayProjects[2]?.id}`}
                  className="group block w-full outline-none focus-visible:ring-2 ring-[#E1FFFF]"
                >
                  <ProjectCard project={displayProjects[2]} />
                </Link>
              </FadeInSection>
            </div>
            <div
              className={`transition-all duration-300 ease-in-out ${isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
            >
              <FadeInSection>
                <Link
                  href={`/projects/${displayProjects[3]?.id}`}
                  className="group block w-full outline-none focus-visible:ring-2 ring-[#E1FFFF]"
                >
                  <ProjectCard project={displayProjects[3]} />
                </Link>
              </FadeInSection>
            </div>
            <div
              className={`transition-all duration-300 ease-in-out ${isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
            >
              <FadeInSection>
                <Link
                  href={`/projects/${displayProjects[4]?.id}`}
                  className="group block w-full outline-none focus-visible:ring-2 ring-[#E1FFFF]"
                >
                  <ProjectCard project={displayProjects[4]} />
                </Link>
              </FadeInSection>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
