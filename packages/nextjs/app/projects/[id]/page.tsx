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
        }
      } catch (error) {
        console.error("Failed to fetch project data:", error);
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

  const goal = contractInfo?.fundingGoal ?? 0n;
  const raised = contractInfo?.fundsRaised ?? 0n;
  const progressPercentage = goal > 0n ? Number((raised * 10000n) / goal) / 100 : 0;
  const donationCount = 220; // This should come from contract or API

  const images = projectData?.images || [];
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
        <div className="text-center">Loading project details...</div>
      </div>
    );
  }

  const displayDescription = showFullDescription
    ? projectData?.description || ""
    : (projectData?.description || "").substring(0, 500);

  return (
    <>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-6">Project details</div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Carousel */}
            {images.length > 0 ? (
              <div className="relative w-full h-[400px] rounded-xl overflow-hidden">
                <Image
                  src={images[currentImageIndex]}
                  alt={projectData?.title || "Project image"}
                  fill
                  className="object-cover"
                />
                {hasMultipleImages && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-colors"
                    >
                      <ChevronLeftIcon className="w-6 h-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-colors"
                    >
                      <ChevronRightIcon className="w-6 h-6" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/30 px-3 py-1.5 rounded-full">
                      {images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            index === currentImageIndex ? "bg-white" : "bg-white/50"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="w-full h-[400px] bg-base-200 rounded-xl flex items-center justify-center">
                <span className="text-gray-400">No image available</span>
              </div>
            )}

            {/* Project Title */}
            <h1 className="text-4xl font-bold text-gray-900">
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
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
                    {projectData.organizer.name.charAt(0)}
                  </div>
                )}
                <Link href="#" className="text-primary hover:underline font-medium">
                  {projectData.organizer.name}
                </Link>
              </div>
            )}

            {/* Location */}
            {projectData?.location && (
              <h2 className="text-2xl font-semibold text-gray-800">{projectData.location}</h2>
            )}

            {/* Description */}
            <div className="space-y-4">
              <div className="text-gray-700 leading-relaxed space-y-4">
                {displayDescription.split("\n\n").map((paragraph, idx) => (
                  <p key={idx} className="whitespace-pre-line">
                    {paragraph}
                  </p>
                ))}
              </div>
              {projectData?.description && projectData.description.length > 500 && (
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="text-primary hover:underline font-medium"
                >
                  {showFullDescription ? "Read Less" : "Read More"}
                </button>
              )}
            </div>

            {/* Reactions */}
            <div className="flex items-center gap-4 py-2">
              <button className="font-medium text-gray-700 hover:text-primary transition-colors">
                React
              </button>
              <div className="flex items-center gap-3">
                <button className="hover:scale-110 transition-transform">🙌</button>
                <button className="hover:scale-110 transition-transform">💗</button>
                <button className="hover:scale-110 transition-transform">✨</button>
                <button className="hover:scale-110 transition-transform">🌿</button>
                <button className="hover:scale-110 transition-transform">⭐</button>
                <span className="ml-1 font-semibold text-gray-700">{projectData?.reactions || 213}</span>
              </div>
            </div>

            {/* Updates Section */}
            {projectData?.updates && projectData.updates.length > 0 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Updates {projectData.updates.length}</h2>
                {projectData.updates.map((update) => (
                  <div key={update.id} className="bg-base-200 rounded-xl p-6 space-y-4">
                    <div className="text-sm text-gray-600">
                      {update.date} by <span className="font-semibold">{update.author}</span>
                    </div>
                    <div className="text-gray-700 leading-relaxed space-y-3">
                      {update.content.split("\n\n").map((paragraph, idx) => (
                        <p key={idx} className="whitespace-pre-line">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Fundraising Widget */}
          <div className="space-y-6">
            <div className="bg-base-100 rounded-xl p-6 shadow-lg border border-base-300 sticky top-24">
              {/* Progress Section */}
              <div className="space-y-6 mb-6">
                <div>
                  <div className="text-3xl font-bold text-gray-900">
                    ${Number(formatEther(raised)).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">raised</div>
                </div>

                {/* Circular Progress */}
                <div className="relative w-32 h-32 mx-auto">
                  <svg className="transform -rotate-90 w-32 h-32">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-base-300"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      strokeDashoffset={`${2 * Math.PI * 56 * (1 - progressPercentage / 100)}`}
                      className="text-primary transition-all duration-300"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900">{Math.round(progressPercentage)}%</span>
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">
                    ${Number(formatEther(goal)).toLocaleString()} goal
                  </div>
                  <div className="text-sm text-gray-500 mt-1">{donationCount} donations</div>
                </div>
              </div>

              {/* Buttons */}
              <div className="space-y-3 mb-6">
                <button className="btn btn-outline w-full">Share</button>
                <button
                  onClick={() => setShowDonateModal(true)}
                  className="btn btn-primary w-full gap-2"
                >
                  Donate Now
                  <ArrowUpRightIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Recent Donations */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg text-gray-900">Recent Donations</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {recentDonations.map((donation, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <UserCircleIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-gray-900">{donation.donor}</span> donated{" "}
                        <span className="font-semibold text-gray-900">
                          {donation.amount} {donation.currency}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 pt-2">
                  <button className="btn btn-ghost btn-sm flex-1 text-xs">See all</button>
                  <button className="btn btn-ghost btn-sm flex-1 text-xs">Top Donators</button>
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
