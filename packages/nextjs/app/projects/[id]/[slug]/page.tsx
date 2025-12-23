"use client";

import { useMemo, useState, useEffect } from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import { formatEther, parseEther } from "viem";
import Image from "next/image";
import Link from "next/link";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth/useScaffoldWriteContract";
import { useProjectData } from "~~/contexts/ProjectDataContext";
import { createSlug } from "~~/utils/slug";
import DonationModal from "~~/app/_components/DonationModal";
import { Address } from "@scaffold-ui/components";
import { useCopyToClipboard } from "~~/hooks/scaffold-eth/useCopyToClipboard";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowUpRightIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

interface Donation {
  donor: string;
  amount: string;
  currency: string;
  // Note: timestamp, transactionHash, and blockNumber are not available
  // when using contract functions instead of events
}

// Component to render rich text content from text editors
function RichTextContent({ content }: { content: string }) {
  return (
    <div 
      className="rich-text-content prose prose-sm max-w-none"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}

export default function ProjectDetail() {
  const params = useParams();
  const router = useRouter();
  const idParam = params?.id as string;
  const slugParam = params?.slug as string;
  
  const projectId = useMemo(() => {
    const n = Number(idParam);
    return Number.isFinite(n) ? n.toString() : null;
  }, [idParam]);

  const { fetchProject, getProject } = useProjectData();
  const { writeContractAsync: writeProject } = useScaffoldWriteContract({ contractName: "AquaFundProject" });
  const { copyToClipboard, isCopiedToClipboard } = useCopyToClipboard();
  
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [recentDonations, setRecentDonations] = useState<Donation[]>([]);
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [donating, setDonating] = useState(false);
  const [projectData, setProjectData] = useState<ReturnType<typeof getProject>>(undefined);

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    const loadProject = async () => {
      // Check cache first
      let data = getProject(projectId);
      
      if (!data) {
        // Fetch from API
        const fetched = await fetchProject(projectId);
        data = fetched || undefined; // Convert null to undefined
      }

      if (data) {
        // Verify slug matches - redirect if it doesn't
        const expectedSlug = createSlug(data.title);
        if (slugParam !== expectedSlug) {
          router.replace(`/projects/${projectId}/${expectedSlug}`);
          return;
        }
        setProjectData(data);
      } else {
        // Project not found
        notFound();
      }
      
      setLoading(false);
    };

    loadProject();
  }, [projectId, slugParam, fetchProject, getProject, router]);

  // Fetch recent donations from API
  useEffect(() => {
    if (!projectData || !projectId) {
      return;
    }

    const fetchDonations = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}/donations`);
        if (!response.ok) {
          console.warn("Failed to fetch donations:", response.statusText);
          setRecentDonations([]);
          return;
        }

        const data = await response.json();
        if (data.donations && Array.isArray(data.donations)) {
          // Transform API response to Donation interface
          const formattedDonations: Donation[] = data.donations.map((donation: any) => ({
            donor: donation.donor,
            amount: donation.amount,
            currency: donation.currency,
          }));
          setRecentDonations(formattedDonations);
        } else {
          setRecentDonations([]);
        }
      } catch (error) {
        console.error("Error fetching donations:", error);
        setRecentDonations([]);
      }
    };

    fetchDonations();
  }, [projectData, projectId]);

  if (projectId === null) return notFound();
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-[#475068]">Loading project details...</div>
      </div>
    );
  }

  if (!projectData) {
    return notFound();
  }

  const goal = BigInt(projectData.fundingGoal || "0");
  const raised = BigInt(projectData.fundsRaised || "0");
  const progressPercentage = goal > 0n ? Number((raised * 10000n) / goal) / 100 : 0;
  const donationCount = projectData.donationCount || 0;

  const images = projectData.images && projectData.images.length > 0 
    ? projectData.images 
    : [];
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

  const handleShare = async () => {
    const currentUrl = window.location.href;
    const shareData = {
      title: projectData?.title || "Check out this project",
      text: projectData?.description || `Check out this project: ${projectData?.title}`,
      url: currentUrl,
    };

    try {
      // Try using Web Share API if available (mobile devices)
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback to clipboard
        await copyToClipboard(currentUrl);
      }
    } catch (error: any) {
      // If user cancels share, don't show error
      if (error.name !== "AbortError") {
        // Fallback to clipboard if share fails
        await copyToClipboard(currentUrl);
      }
    }
  };

  const handleDonateContinue = async (amount: string, token: string, aquafundTip: number) => {
    if (!projectData?.projectAddress) {
      console.error("Project address not available");
      alert("Unable to donate: Project address not found");
      return;
    }
    
    setDonating(true);
    try {
      // For now, only handle BNB donations (native token)
      // Token donations would require ERC20 token approval and transfer
      if (token !== "BNB") {
        alert(`${token} donations coming soon! For now, please use BNB.`);
        setDonating(false);
        return;
      }

      // The wallet extension will handle the transaction signing
      await (writeProject as any)({
        address: projectData.projectAddress as `0x${string}`,
        functionName: "donate",
        args: [], // donate() takes no parameters - it's just payable
        value: parseEther(amount || "0"),
      });
      
      setShowDonateModal(false);
      // Refresh project data after donation
      const updated = await fetchProject(projectId);
      if (updated) {
        setProjectData(updated);
      }
      // Refresh donations list (with a small delay to allow transaction to be mined)
      setTimeout(async () => {
        try {
          const response = await fetch(`/api/projects/${projectId}/donations?refresh=true`);
          if (response.ok) {
            const data = await response.json();
            if (data.donations && Array.isArray(data.donations)) {
              const formattedDonations: Donation[] = data.donations.map((donation: any) => ({
                donor: donation.donor,
                amount: donation.amount,
                currency: donation.currency,
              }));
              setRecentDonations(formattedDonations);
            }
          }
        } catch (error) {
          console.error("Error refreshing donations:", error);
        }
      }, 3000); // Wait 3 seconds for transaction to be mined
    } catch (error) {
      console.error("Donation failed:", error);
      // Don't close modal on error - let user retry
    } finally {
      setDonating(false);
    }
  };

  // For rich text, we'll show full content or truncate HTML
  const description = projectData.description || "";
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
                  alt={projectData.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
                {hasMultipleImages && (
                  <>
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
                  </>
                )}
              </div>
            ) : (
              <div className="w-full h-[500px] bg-[#001627] rounded-xl flex items-center justify-center">
                <span className="text-[#E1FFFF]">No image available</span>
              </div>
            )}

            {/* Project Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-[#001627] leading-tight">
              {projectData.title}
            </h1>

            {/* Location & Category */}
            <div className="flex items-center gap-4 text-sm text-[#475068]">
              {projectData.location && projectData.location !== "N/A" && (
                <span>{projectData.location}</span>
              )}
              {projectData.category && projectData.category !== "N/A" && (
                <>
                  <span className="text-[#CAC4D0]">•</span>
                  <span>{projectData.category}</span>
                </>
              )}
            </div>

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
                  <div className="text-sm text-[#475068] mt-1">{projectData.donorCount} donors</div>
                </div>
              </div>

              {/* Buttons */}
              <div className="space-y-3 mb-6">
                <button 
                  onClick={handleShare}
                  className="w-full px-4 py-2 border border-[#CAC4D0] rounded-full text-[#001627] hover:bg-[#E1FFFF] transition-colors font-medium"
                >
                  {isCopiedToClipboard ? "Link Copied!" : "Share"}
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
                <h3 className="font-semibold text-lg text-[#001627]">Top Donors</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {recentDonations.length > 0 ? (
                    recentDonations.map((donation, index) => {
                      const formattedAmount = Number(donation.amount).toFixed(4);

                      return (
                        <div key={donation.donor || index} className="flex items-start gap-3 text-sm pb-3 border-b border-[#E5E7EB] last:border-0">
                          <UserCircleIcon className="w-5 h-5 text-[#475068] flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <a
                                href={`https://testnet.bscscan.com/address/${donation.donor}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#001627] hover:underline font-medium"
                              >
                                {donation.donor.slice(0, 6)}...{donation.donor.slice(-4)}
                              </a>
                              <span className="text-[#475068]">donated</span>
                              <span className="font-semibold text-[#001627]">
                                {formattedAmount} {donation.currency}
                              </span>
                            </div>
                            <div className="text-xs text-[#475068] mt-1">
                              Total contribution
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-sm text-[#475068] text-center py-4">
                      No donations yet. Be the first!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Donation Modal */}
      <DonationModal
        isOpen={showDonateModal}
        onClose={() => setShowDonateModal(false)}
        projectTitle={projectData?.title || "Project"}
        organizerName={projectData?.creator || "Organizer"}
        projectImage={images.length > 0 ? images[0] : undefined}
        onContinue={handleDonateContinue}
      />
    </>
  );
}

