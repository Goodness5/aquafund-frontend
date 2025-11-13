import dynamic from "next/dynamic";
import type { Metadata } from "next";
import { FeaturesGrid } from "./_components/FeaturesGrid";
import { Hero } from "./_components/Hero";
import { HowItWorks } from "./_components/HowItWorks";
import  ProjectsPreview  from "./_components/ProjectsPreview";
import { StatsBand } from "./_components/StatsBand";
import { CallToAction } from "./_components/CallToAction";

const LoadingPlaceholder = () => <div className="container mx-auto px-4 py-20" aria-hidden />;

const ImpactInsights = dynamic(
  () => import("./_components/ImpactInsights").then(mod => mod.ImpactInsights),
  { loading: LoadingPlaceholder }
);

const StorySpotlight = dynamic(
  () => import("./_components/StorySpotlight").then(mod => mod.StorySpotlight),
  { loading: LoadingPlaceholder }
);

const CommunitySpotlight = dynamic(
  () => import("./_components/CommunitySpotlight").then(mod => mod.CommunitySpotlight),
  { loading: LoadingPlaceholder }
);

export const metadata: Metadata = {
  title: "AquaFund | Transparent Web3 Fundraising for Water Impact",
  description:
    "Launch transparent, auditable water impact projects with AquaFund. Raise funds via smart contracts, track donations on-chain, and engage supporters globally.",
  openGraph: {
    title: "AquaFund – Water fundraising, reimagined",
    description:
      "Empower communities with transparent water impact projects. Track donations live and celebrate global change.",
    url: "https://aquafund.xyz/",
    images: [
      {
        url: "/thumbnail.jpg",
        width: 1200,
        height: 630,
        alt: "AquaFund fundraising platform preview",
      },
    ],
  },
};

export default function Home() {
  return (
    <main>
      <Hero />
      {/* <StatsBand /> */}
      <ProjectsPreview />
      <ImpactInsights />
      <StorySpotlight />
      <HowItWorks />
      <FeaturesGrid />
      <CommunitySpotlight />
      <CallToAction />
    </main>
  );
}
