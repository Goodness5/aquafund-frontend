"use client";

import { useState, useEffect } from "react";
import { useParams, notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FadeInSection } from "../../_components/FadeInSection";
import { ProjectCard, Project } from "../../_components/ProjectCard";
import { Button } from "../../_components/Button";
import { ArrowUpRightIcon, HeartIcon, CheckBadgeIcon } from "@heroicons/react/24/outline";

interface NGOData {
  username: string;
  name: string;
  description: string;
  heroImage: string;
  profileImage: string;
  location?: string;
  verified: boolean;
  totalRaised: number;
  totalDonors: number;
  totalProjects: number;
  walletAddress?: string;
}

// Mock data generator
const getMockNGOData = (username: string): NGOData => {
  const mockData: Record<string, NGOData> = {
    "the-faithful-carers": {
      username: "the-faithful-carers",
      name: "The Faithful Carers",
      description:
        "We design, equip, and implement sustainable solar powered water infrastructure and systems aiming to improve livelihoods and combat rural poverty across Africa.",
      heroImage: "/Home.png",
      profileImage: "/thumbnail.jpg",
      location: "Lagos, Nigeria",
      verified: true,
      totalRaised: 4576,
      totalDonors: 56,
      totalProjects: 12,
      walletAddress: "0x742d3e4v97hd734123190jc8335f0b",
    },
    "water-for-all": {
      username: "water-for-all",
      name: "Water For All",
      description:
        "Dedicated to providing clean water access to underserved communities through innovative water purification systems and well construction projects.",
      heroImage: "/Home.png",
      profileImage: "/thumbnail.jpg",
      location: "Nairobi, Kenya",
      verified: true,
      totalRaised: 12350,
      totalDonors: 89,
      totalProjects: 8,
    },
  };

  return (
    mockData[username] || {
      username,
      name: username.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
      description:
        "A dedicated organization working to improve water access and quality in communities across Africa through sustainable infrastructure projects.",
      heroImage: "/Home.png",
      profileImage: "/thumbnail.jpg",
      verified: false,
      totalRaised: 0,
      totalDonors: 0,
      totalProjects: 0,
    }
  );
};

// Mock projects for this NGO
const getMockProjects = (username: string): Project[] => {
  return [
    {
      id: 1,
      title: "Clean Water Initiative - Lagos",
      description: "Building sustainable water wells in Lagos communities",
      image: "/Home.png",
      raised: 3500,
      goal: 10000,
      donations: 23,
    },
    {
      id: 2,
      title: "Solar Water Pump Installation",
      description: "Installing solar-powered water pumps in rural areas",
      image: "/thumbnail.jpg",
      raised: 1200,
      goal: 5000,
      donations: 15,
    },
    {
      id: 3,
      title: "Water Purification System",
      description: "Deploying water purification systems in schools",
      image: "/Home.png",
      raised: 2800,
      goal: 8000,
      donations: 18,
    },
  ];
};

export default function NGOProfile() {
  const params = useParams();
  const username = params?.username as string;
  const [ngoData, setNgoData] = useState<NGOData | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username) {
      setLoading(false);
      return;
    }

    // Simulate API call
    const fetchData = async () => {
      try {
        // In production, fetch from API: `/api/ngo/${username}`
        const data = getMockNGOData(username);
        setNgoData(data);
        setProjects(getMockProjects(username));
      } catch (error) {
        console.error("Failed to fetch NGO data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username]);

  if (!username || (!loading && !ngoData)) {
    return notFound();
  }

  if (loading || !ngoData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0350B5]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] px-8">
      {/* Hero Section */}
      <FadeInSection delay={0}>
        <div className="relative w-full h-[30vh] md:h-[40vh] mt-16 overflow-clip items-center justify-center ">
          {/* Main Hero Image */}
          <div className=" m-auto items-center justify-center w-2/3  h-full">
            <img
              src={ngoData.heroImage}
              alt={ngoData.name}
              className="object-cover w-full h-full"
            />
          </div>

          {/* Overlay Profile Image (Circular) */}


        </div>
          <div className="flex  md:-mt-[7%] -mt-[15%]  m-auto w-full">
            <div className="relative flex rounded-full h-[20vh] w-[20vh] overflow-clip shadow-xl bg-white m-auto">
              <img
                src={ngoData.profileImage}
                alt={`${ngoData.name} profile`}
                className="object-cover "
              />
            </div>
          </div>
      </FadeInSection>

      {/* Content Section */}
      <div className="container mx-auto px-4 lg:px-8 pt-20 pb-12">
        {/* NGO Info */}
        <FadeInSection delay={100}>
          <div className="text-center mb-8">
            <h1 className="text-[3em] font-[400] text-[#001627] ">{ngoData.name}</h1>
            {ngoData.location && (
              <p className="text-lg text-[#475068] mb-6">{ngoData.location}</p>
            )}
            <p className="text-base lg:text-lg text-[#475068] max-w-3xl mx-auto leading-relaxed">
              {ngoData.description}
            </p>
          </div>
        </FadeInSection>

        {/* Stats Section */}
        <FadeInSection delay={200}>
          <div className="flex flex-col items-center justify-center gap-6 mb-12">
            <div className="bg-[#E1FFFF] px-4 py-2 rounded-full text-[#0350B5] text-center flex items-center justify-center border border-[#0350B5]">
              {ngoData.totalDonors} People donated to this NGO
            </div>
            <div className="">

              <p className="text-3xl lg:text-4xl font-bold text-[#001627]">
                ${ngoData.totalRaised.toLocaleString()} raised
              </p>
            </div>
          </div>
        </FadeInSection>

        {/* Action Buttons */}
        {/* <FadeInSection delay={300}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button
              size="lg"
              rounded="full"
              className="bg-[#0350B5] text-white hover:bg-[#034093] px-8 py-3 flex items-center gap-2"
            >
              <HeartIcon className="w-5 h-5" />
              Donate to NGO
            </Button>
            {ngoData.walletAddress && (
              <Link
                href={`https://etherscan.io/address/${ngoData.walletAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 border-2 border-[#0350B5] text-[#0350B5] rounded-full hover:bg-[#E1FFFF] transition-colors font-medium"
              >
                View on Blockchain
                <ArrowUpRightIcon className="w-5 h-5" />
              </Link>
            )}
          </div>
        </FadeInSection> */}

        {/* Projects Section */}
        {projects.length > 0 && (
          <FadeInSection delay={400} className="mt-16">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl lg:text-3xl font-bold text-[#001627]">
                  Projects by {ngoData.name}
                </h2>
                <Link
                  href="/projects"
                  className="text-[#0350B5] hover:underline font-medium flex items-center gap-1"
                >
                  View All
                  <ArrowUpRightIcon className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {projects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="group block"
                  >
                    <ProjectCard project={project} variant="light" />
                  </Link>
                ))}
              </div>
            </div>
          </FadeInSection>
        )}
      </div>
    </div>
  );
}

