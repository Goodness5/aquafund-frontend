"use client";

import { useMemo, useState, useEffect } from "react";
import { notFound, useParams } from "next/navigation";
import { formatEther, parseEther } from "viem";
import Image from "next/image";
import Link from "next/link";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth/useScaffoldReadContract";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth/useScaffoldWriteContract";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowUpRightIcon,
  XMarkIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

interface ProjectData {
  id: string;
  title: string;
  description: string;
  images: string[];
  location?: string;
  organizer?: {
    name: string;
    profilePicture?: string;
    address?: string;
  };
  updates?: Array<{
    id: string;
    date: string;
    author: string;
    content: string;
  }>;
  reactions?: number;
}

// Component to render rich text content from text editors
function RichTextContent({ content }: { content: string }) {
  return (
    <div 
      className="rich-text-content"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}

interface Donation {
  donor: string;
  amount: string;
  currency: string;
}

export default function ProjectDetail() {
  const params = useParams();
  const idParam = params?.id;
  const projectId = useMemo(() => {
    const n = Number(idParam);
    return Number.isFinite(n) ? BigInt(n) : null;
  }, [idParam]);

  const { targetNetwork } = useTargetNetwork();
  const { writeContractAsync: writeProject } = useScaffoldWriteContract({ contractName: "AquaFundProject" });
  const [donation, setDonation] = useState("0.1");
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [recentDonations, setRecentDonations] = useState<Donation[]>([]);
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [donating, setDonating] = useState(false);

  const { data: contractInfo } = (useScaffoldReadContract as any)({
    contractName: "AquaFundRegistry",
    functionName: "getProjectDetails",
    args: projectId !== null ? [projectId] : undefined,
    chainId: targetNetwork.id,
    query: {
      enabled: projectId !== null,
    },
  });

  // Mock project data with rich text content
  const getMockProjectData = (id: string | number): ProjectData => ({
    id: id.toString(),
    title: "Build Five Wells in Orile Owu",
    description: `
      <h2>Orile-Owu</h2>
      <p>Orile Owu is a quiet town in Osun State, Nigeria, that lacks water. Children and mothers walk miles for muddy water, and the community relies on dried-up hand-dug wells.</p>
      <p>The impact on education and farming is severe. Clean water has become a luxury, and we want to change this.</p>
      <p>With your support, we can build five sustainable wells that will provide clean, safe drinking water to over 2,000 people in the community. This project will transform lives, improve health outcomes, and enable children to focus on their education instead of spending hours fetching water.</p>
      <p>Every donation brings us closer to making clean water accessible to everyone in Orile Owu. Together, we can make a lasting impact.</p>
    `,
    images: ["/Home.png", "/thumbnail.jpg", "/impact-map.svg"],
    location: "Orile-Owu, Osun State, Nigeria",
    organizer: {
      name: "The Faithful Carers",
      profilePicture: "/avatar1.svg",
      address: "0x1234567890123456789012345678901234567890",
    },
    updates: [
      {
        id: "1",
        date: "31st July, 2026",
        author: "The Faithful Carers",
        content: `
          <p>In just a few weeks, your generosity has brought us to 60% of our goal! Together, we've raised enough to start drilling the first three wells.</p>
          <p>Our team has been working closely with the community to identify the best locations for the wells. We've completed the geological surveys and received all necessary permits.</p>
          <p><strong>Next Steps:</strong></p>
          <ul>
            <li>Begin drilling operations for the first well this week</li>
            <li>Install water testing equipment</li>
            <li>Train community members on well maintenance</li>
          </ul>
          <p>Thank you for your continued support. Every donation makes a difference!</p>
        `,
      },
      {
        id: "2",
        date: "15th July, 2026",
        author: "The Faithful Carers",
        content: `
          <p>We're excited to share that we've reached 40% of our funding goal! The community is thrilled about the progress.</p>
          <p>Last week, we held a community meeting where over 200 residents gathered to learn about the project. The enthusiasm was incredible.</p>
          <p>We've also partnered with local engineers who will oversee the construction process, ensuring quality and sustainability.</p>
        `,
      },
      {
        id: "3",
        date: "1st July, 2026",
        author: "The Faithful Carers",
        content: `
          <p>Project launch! We're starting this journey to bring clean water to Orile Owu.</p>
          <p>Our initial assessment shows that five strategically placed wells will serve the entire community. Each well will be equipped with a hand pump and will be maintained by trained community members.</p>
          <p>We're grateful for every contribution and look forward to sharing updates as we progress.</p>
        `,
      },
    ],
    reactions: 213,
  });

  useEffect(() => {
    if (projectId === null) {
      setLoading(false);
      return;
    }

    const fetchProjectData = async () => {
      try {
        const res = await fetch(`/api/v1/projects/${projectId}`);
        if (res.ok) {
          const data = await res.json();
          setProjectData(data);
        } else {
          // Use mock data if API fails
          setProjectData(getMockProjectData(projectId.toString()));
        }
      } catch (error) {
        console.error("Failed to fetch project data:", error);
        // Use mock data on error
        setProjectData(getMockProjectData(projectId.toString()));
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId]);

  // Mock recent donations - replace with actual API call
  useEffect(() => {
    setRecentDonations([
      { donor: "Janet David", amount: "1000", currency: "USDT" },
      { donor: "Janet David", amount: "1765", currency: "STRK" },
      { donor: "Daniel Egorp", amount: "576", currency: "DAI" },
      { donor: "Daniel Egorp", amount: "0.01", currency: "BTC" },
      { donor: "Daniel Egorp", amount: "56", currency: "USDC" },
    ]);
  }, []);

  if (projectId === null) return notFound();

  // Use mock contract data if not available
  const goal = contractInfo?.fundingGoal ?? parseEther("15000");
  const raised = contractInfo?.fundsRaised ?? parseEther("4679");
  const progressPercentage = goal > 0n ? Number((raised * 10000n) / goal) / 100 : 0;
  const donationCount = 220; // This should come from contract or API

  const images = projectData?.images && projectData.images.length > 0 
    ? projectData.images 
    : ["/Home.png", "/thumbnail.jpg", "/impact-map.svg"];
  const hasMultipleImages = images.length > 1;

  const nextImage = () => {
    if (hasMultipleImages) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (hasMultipleImages) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const handleDonate = async () => {
    if (!donation || parseFloat(donation) <= 0) {
      return;
    }
    setDonating(true);
    try {
      await (writeProject as any)({
        functionName: "donate",
        args: [projectId],
        value: parseEther(donation || "0"),
      });
      setShowDonateModal(false);
      setDonation("0.1");
    } catch (error) {
      console.error("Donation failed:", error);
    } finally {
      setDonating(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-[#475068]">Loading project details...</div>
      </div>
    );
  }

  // For rich text, we'll show full content or truncate HTML
  const description = projectData?.description || "";
  const isDescriptionLong = description.length > 500;
  const displayDescription = showFullDescription || !isDescriptionLong
    ? description
    : description.substring(0, 500) + "...";

  return (
    <>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Carousel */}
            {images.length > 0 ? (
              <div className="relative w-full h-[500px] rounded-xl overflow-hidden bg-[#001627]">
                <Image
                  src={images[currentImageIndex]}
                  alt={projectData?.title || "Project image"}
                  fill
                  className="object-cover"
                />
                {hasMultipleImages && (
                  <div className=" bg-red-500 ">
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-colors z-10"
                      aria-label="Previous image"
                    >
                      <ChevronLeftIcon className="w-6 h-6 text-[#001627]" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-colors z-10"
                      aria-label="Next image"
                    >
                      <ChevronRightIcon className="w-6 h-6 text-[#001627]" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-[500px] bg-[#001627] rounded-xl flex items-center justify-center">
                <span className="text-[#E1FFFF]">No image available</span>
              </div>
            )}

            {/* Project Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-[#001627] leading-tight">
              {projectData?.title || `Project #${projectId.toString()}`}
            </h1>

            {/* Organizer Info */}
            {projectData?.organizer && (
              <div className="flex items-center gap-3">
                {projectData.organizer.profilePicture ? (
                  <Image
                    src={projectData.organizer.profilePicture}
                    alt={projectData.organizer.name}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#0350B5] flex items-center justify-center text-white font-semibold">
                    {projectData.organizer.name.charAt(0)}
                  </div>
                )}
                <Link href="#" className="text-[#0350B5] hover:underline font-medium text-base">
                  {projectData.organizer.name}
                </Link>
              </div>
            )}

            {/* Location */}
            {projectData?.location && (
              <h2 className="text-2xl font-semibold text-[#001627]">{projectData.location}</h2>
            )}

            {/* Description */}
            <div className="space-y-4">
              <RichTextContent content={displayDescription} />
              {isDescriptionLong && (
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="text-[#0350B5] hover:underline font-medium"
                >
                  {showFullDescription ? "Read Less" : "Read More"}
                </button>
              )}
            </div>

            {/* Reactions */}
            <div className="flex items-center gap-4 py-4 border-t border-[#CAC4D0]">
              <button className="font-medium text-[#001627] hover:text-[#0350B5] transition-colors">
                React
              </button>
              <div className="flex items-center gap-2">
                <button className="text-2xl hover:scale-110 transition-transform" title="Smile">😊</button>
                <button className="text-2xl hover:scale-110 transition-transform" title="Raise hands">🙌</button>
                <button className="text-2xl hover:scale-110 transition-transform" title="Heart">💗</button>
                <button className="text-2xl hover:scale-110 transition-transform" title="Sparkle">✨</button>
                <button className="text-2xl hover:scale-110 transition-transform" title="Star">⭐</button>
                <span className="ml-2 font-semibold text-[#001627]">{projectData?.reactions || 213}</span>
              </div>
            </div>

            {/* Updates Section */}
            {projectData?.updates && projectData.updates.length > 0 && (
              <div className="space-y-6 pt-4">
                <h2 className="text-2xl font-bold text-[#001627]">Updates {projectData.updates.length}</h2>
                {projectData.updates.map((update) => (
                  <div key={update.id} className="bg-white border border-[#CAC4D0] rounded-xl p-6 space-y-4">
                    <div className="text-sm text-[#475068]">
                      {update.date} by <span className="font-semibold text-[#001627]">{update.author}</span>
                    </div>
                    <RichTextContent content={update.content} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Fundraising Widget */}
          <div className="space-y-6">
            <div className="bg-white border border-[#CAC4D0] rounded-xl p-6 shadow-lg sticky top-24">
              {/* Progress Section */}
              <div className="space-y-6 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#001627]">
                    ${Number(formatEther(raised)).toLocaleString()}
                  </div>
                  <div className="text-sm text-[#475068] mt-1">raised</div>
                </div>

                {/* Circular Progress */}
                <div className="relative w-32 h-32 mx-auto">
                  <svg className="transform -rotate-90 w-32 h-32">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#E0E7EF"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#00BF3C"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      strokeDashoffset={`${2 * Math.PI * 56 * (1 - progressPercentage / 100)}`}
                      className="transition-all duration-300"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-[#001627]">{Math.round(progressPercentage)}%</span>
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-lg font-semibold text-[#001627]">
                    ${Number(formatEther(goal)).toLocaleString()} goal
                  </div>
                  <div className="text-sm text-[#475068] mt-1">{donationCount} donations</div>
                </div>
              </div>

              {/* Buttons */}
              <div className="space-y-3 mb-6">
                <button className="w-full px-4 py-2 border border-[#CAC4D0] rounded-full text-[#001627] hover:bg-[#E1FFFF] transition-colors font-medium">
                  Share
                </button>
                <button
                  onClick={() => setShowDonateModal(true)}
                  className="w-full px-4 py-2 bg-[#0350B5] text-white rounded-full hover:bg-[#034093] transition-colors font-medium flex items-center justify-center gap-2"
                >
                  Donate Now
                  <ArrowUpRightIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Recent Donations */}
              <div className="space-y-4 pt-4 border-t border-[#CAC4D0]">
                <h3 className="font-semibold text-lg text-[#001627]">Recent Donations</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {recentDonations.map((donation, index) => (
                    <div key={index} className="flex items-center gap-3 text-sm">
                      <UserCircleIcon className="w-5 h-5 text-[#475068] flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-[#001627]">{donation.donor}</span> donated{" "}
                        <span className="font-semibold text-[#001627]">
                          {donation.amount} {donation.currency}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 pt-2">
                  <button className="flex-1 text-xs text-[#0350B5] hover:underline font-medium text-center py-1">
                    See all
                  </button>
                  <button className="flex-1 text-xs text-[#0350B5] hover:underline font-medium text-center py-1">
                    Top Donators
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Donation Modal */}
      {showDonateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-base-100 rounded-xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Make a Donation</h2>
              <button
                onClick={() => setShowDonateModal(false)}
                className="btn btn-ghost btn-sm btn-circle"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">
                  <span className="label-text">Amount (BNB)</span>
                </label>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  className="input input-bordered w-full"
                  placeholder="0.1"
                  value={donation}
                  onChange={(e) => setDonation(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDonateModal(false)}
                  className="btn btn-outline flex-1"
                  disabled={donating}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDonate}
                  className="btn btn-primary flex-1 gap-2"
                  disabled={donating || !donation || parseFloat(donation) <= 0}
                >
                  {donating ? "Processing..." : "Donate"}
                  {!donating && <ArrowUpRightIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
