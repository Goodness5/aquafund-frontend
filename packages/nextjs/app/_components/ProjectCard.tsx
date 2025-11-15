"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export type Project = {
  id: number;
  title: string;
  description: string;
  image: string;
  raised: number;
  goal: number;
  donations: number;
};

export function DonorTag({ donations }: { donations: number }) {
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

export function ProgressBar({ value, max }: { value: number; max: number }) {
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

export function DonateButton({ projectId, variant = "dark" }: { projectId: number; variant?: "dark" | "light" }) {
  const router = useRouter();
  const buttonColor = variant === "light" ? "#0350B5" : "#E1FFFF";
  const iconSrc = variant === "light" ? "/donate-blue.svg" : "/bx_donate-heart.svg";

  return (
    <button
      onClick={e => {
        e.stopPropagation();
        router.push(`/projects/${projectId}`);
      }}
      className="flex items-center gap-1 mt-2 text-[1em] font-semibold hover:opacity-80 transition-opacity cursor-pointer"
      style={{ color: buttonColor, background: "transparent", border: "none" }}
    >
      <Image
        src={iconSrc}
        width={20}
        height={20}
        alt="Donate icon"
        style={{ marginRight: 4, opacity: 1 }}
      />
      Donate
    </button>
  );
}

interface ProjectCardProps {
  project: Project;
  variant?: "dark" | "light";
  className?: string;
  style?: React.CSSProperties;
}

export function ProjectCard({ project, variant = "dark", className = "", style }: ProjectCardProps) {
  const isLight = variant === "light";
  const cardBg = isLight ? "bg-transparent" : "bg-[#001627]";
  const textColor = isLight ? "text-[#001627]" : "text-white";
  
  return (
    <div
      className={`relative flex flex-col shadow-xl rounded-xl overflow-hidden ${cardBg} ${textColor} min-h-[260px] transition-all duration-200 group-hover:scale-105 group-focus-within:scale-105 group-hover:shadow-[0_8px_30px_-10px_rgba(3,80,181,0.28)] group-focus-within:shadow-[0_8px_30px_-10px_rgba(3,80,181,0.28)] group-hover:z-10 group-focus-within:z-10 ${className}`}
      style={style}
      tabIndex={-1}
    >
      <div className="relative h-40 overflow-hidden">
        <Image src={project.image} alt={project.title} fill style={{ objectFit: "cover", background: "#11212b" }} />
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
          <DonateButton projectId={project.id} variant={variant} />
        </div>
      </div>
    </div>
  );
}

