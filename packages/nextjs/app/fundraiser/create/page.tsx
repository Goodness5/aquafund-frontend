"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { parseEther, keccak256, stringToBytes } from "viem";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { Button } from "../../_components/Button";
import Step1Location from "../_components/Step1Location";
import Step2ProjectIdentity from "../_components/Step2ProjectIdentity";
import Step3TellUsMore from "../_components/Step3TellUsMore";
import Step4FundManagement from "../_components/Step4FundManagement";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth/useScaffoldWriteContract";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth/useScaffoldReadContract";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { useAuthStore } from "../../../services/store/authStore";

const STORAGE_KEY = "fundraiser-form-progress";
const TOTAL_STEPS = 4;

export interface FundraiserFormData {
  // Step 1: Location
  country: string;
  location: string;
  coordinates?: string;

  // Step 2: Project Identity
  campaignTitle: string;
  goalAmount: string;
  category: string;

  // Step 3: Tell us more
  images: File[];
  description: string;

  // Step 4: Fund Management
  preferredToken: string;
  walletAddress: string;
  fundUsage: "direct" | "contractors" | "aquafund";
}

const initialFormData: FundraiserFormData = {
  country: "",
  location: "",
  coordinates: "",
  campaignTitle: "",
  goalAmount: "",
  category: "",
  images: [],
  description: "",
  preferredToken: "",
  walletAddress: "",
  fundUsage: "direct",
};

export default function CreateFundraiserPage() {
  const { address } = useAccount();
  const router = useRouter();
  const { user } = useAuthStore();
  const { targetNetwork } = useTargetNetwork();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FundraiserFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { writeContractAsync: writeFactory } = useScaffoldWriteContract({ contractName: "AquaFundFactory" });
  
  // Check if user has PROJECT_CREATOR_ROLE
  const { data: creatorRole } = (useScaffoldReadContract as any)({
    contractName: "AquaFundFactory",
    functionName: "PROJECT_CREATOR_ROLE",
    chainId: targetNetwork.id,
  } as any);
  
  const { data: isCreator } = (useScaffoldReadContract as any)({
    contractName: "AquaFundFactory",
    functionName: "hasRole",
    args: [creatorRole, address],
    chainId: targetNetwork.id,
  } as any);

  // Load saved progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(parsed.data);
        setCurrentStep(parsed.step || 1);
      } catch (error) {
        console.error("Failed to load saved progress:", error);
      }
    }
  }, []);

  // Save progress to localStorage whenever formData or step changes
  useEffect(() => {
    const progress = {
      step: currentStep,
      data: formData,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [currentStep, formData]);

  const updateFormData = (updates: Partial<FundraiserFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.country && formData.location);
      case 2:
        return !!(formData.campaignTitle && formData.goalAmount && formData.category);
      case 3:
        return !!formData.description;
      case 4:
        return !!(formData.preferredToken && formData.walletAddress && formData.fundUsage);
      default:
        return true;
    }
  };

  const handleNext = () => {
    // Validate current step
    if (!validateStep(currentStep)) {
      // TODO: Show validation error message
      alert("Please fill in all required fields");
      return;
    }

    // AuthGuard will handle authentication, so we can proceed if we reach here
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    } else {
      // Submit form
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Upload images to Cloudinary
  const uploadImagesToCloudinary = async (images: File[]): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    
    for (const image of images) {
      // Validate file size (5MB limit)
      if (image.size > 5 * 1024 * 1024) {
        throw new Error(`Image "${image.name}" exceeds 5MB limit. Please compress or resize the image.`);
      }
      
      const formData = new FormData();
      formData.append("file", image);
      formData.append("folder", "aquafund/fundraiser-images"); // Specify folder for fundraiser images
      
      const response = await fetch("/api/upload/cloudinary", {
        method: "POST",
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success || !data.url) {
        throw new Error(data.error || "Failed to upload image");
      }
      
      uploadedUrls.push(data.url);
    }
    
    return uploadedUrls;
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Validate required fields
      if (!formData.campaignTitle || !formData.goalAmount || !formData.description) {
        throw new Error("Please fill in all required fields");
      }
      
      if (!address) {
        throw new Error("Please connect your wallet");
      }
      
      if (!user || !user.id) {
        throw new Error("Please sign in to create a fundraiser");
      }
      
      // Check if user has PROJECT_CREATOR_ROLE
      if (isCreator === false) {
        throw new Error("You don't have permission to create projects. Your wallet address needs to be granted the PROJECT_CREATOR_ROLE. Please contact an administrator.");
      }
      
      if (isCreator === undefined) {
        throw new Error("Checking permissions... Please wait a moment and try again.");
      }
      
      // Step 1: Upload images to Cloudinary
      let imageUrls: string[] = [];
      if (formData.images && formData.images.length > 0) {
        imageUrls = await uploadImagesToCloudinary(formData.images);
      }
      
      // Step 2: Create metadata URI (use a simple hash of the title + description for now)
      // In production, you might want to upload to IPFS
      const metadataString = JSON.stringify({
        title: formData.campaignTitle,
        description: formData.description,
        images: imageUrls,
        location: formData.location,
        country: formData.country,
        category: formData.category,
      });
      
      // Create bytes32 hash of metadata
      const metadataHash = keccak256(stringToBytes(metadataString)) as `0x${string}`;
      
      // Step 3: Convert goal amount to wei
      const goalAmountWei = parseEther(formData.goalAmount || "0");
      
      // Step 4: Call smart contract to create project
      const txHash = await (writeFactory as any)({
        functionName: "createProject",
        args: [
          address as `0x${string}`, // admin address
          goalAmountWei, // funding goal in wei
          metadataHash, // metadata URI as bytes32
        ],
      });
      
      // Step 5: Wait for transaction receipt to get project address
      // Note: We'll need to parse the event logs to get the project address
      // For now, we'll submit to backend with the tx hash
      
      // Step 6: Submit project data to backend
      const projectData = {
        title: formData.campaignTitle,
        description: formData.description,
        images: imageUrls,
        fundingGoal: parseFloat(formData.goalAmount),
        creatorId: user.id,
        location: formData.location,
        country: formData.country,
        category: formData.category,
        preferredToken: formData.preferredToken,
        walletAddress: formData.walletAddress || address,
        fundUsage: formData.fundUsage,
        transactionHash: txHash,
        metadataHash: metadataHash,
      };
      
      const response = await fetch("/api/v1/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projectData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to create project" }));
        throw new Error(errorData.error || "Failed to create project in backend");
      }
      
      // Clear localStorage after successful submission
      localStorage.removeItem(STORAGE_KEY);
      
      // Redirect to dashboard or project page
      router.push("/dashboard");
      
    } catch (error: any) {
      console.error("Error creating fundraiser:", error);
      setSubmitError(error.message || "Failed to create fundraiser. Please try again.");
      setIsSubmitting(false);
    }
  };


  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1Location
            formData={formData}
            updateFormData={updateFormData}
          />
        );
      case 2:
        return (
          <Step2ProjectIdentity
            formData={formData}
            updateFormData={updateFormData}
          />
        );
      case 3:
        return (
          <Step3TellUsMore
            formData={formData}
            updateFormData={updateFormData}
          />
        );
      case 4:
        return (
          <Step4FundManagement
            formData={formData}
            updateFormData={updateFormData}
            walletAddress={address}
          />
        );
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Which country will the funds go?";
      case 2:
        return "Define your project's identity";
      case 3:
        return "Tell us more...";
      case 4:
        return "How will you receive and manage the funds?";
      default:
        return "";
    }
  };

  const getStepSubtitle = () => {
    switch (currentStep) {
      case 1:
        return "Choose the location where you plan to create a borehole or wells of water.";
      case 2:
        return "Let's get to understand your goals";
      case 3:
        return "Let's get to understand your goals";
      case 4:
        return "";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex">
      {/* Left Section - Static Content */}
      <div className="hidden lg:flex lg:w-2/5 fundraiser-form-bg-box p-8 items-center">
        <div className="max-w-md">
          <h1 style={{ fontSize: "1.8em" }} className="font-bold text-[#001627] mb-4 leading-tight">
            Let&apos;s start your fundraising goals
          </h1>
          <p style={{ fontSize: "1em" }} className="text-[#475068] leading-relaxed">
            Every drop counts. AquaFund connects you directly to water crowdfunding projects around the world.
          </p>
        </div>
      </div>

      {/* Right Section - Dynamic Form */}
      <div className="flex-1 bg-white overflow-y-auto">
        <div className="max-w-xl mx-auto px-3 py-4">
          {/* Navigation */}
          {currentStep > 1 && (
            <button
              onClick={handleBack}
              className="mb-4 w-8 h-8 rounded-full bg-[#E1FFFF] text-[#0350B5] flex items-center justify-center hover:bg-[#CFFED9] transition-colors"
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </button>
          )}

          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-1.5">
              <span style={{ fontSize: "0.85em" }} className="text-[#475068]">
                Step {currentStep} of {TOTAL_STEPS}
              </span>
            </div>
            <div className="w-full h-1.5 bg-[#E0E7EF] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#0350B5] transition-all duration-300"
                style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
              />
            </div>
          </div>

          {/* Step Title */}
          <h2 style={{ fontSize: "1.5em" }} className="font-bold text-[#001627] mb-1.5">
            {getStepTitle()}
          </h2>
          {getStepSubtitle() && (
            <p style={{ fontSize: "0.9em" }} className="text-[#475068] mb-3">{getStepSubtitle()}</p>
          )}

          {/* Step Content */}
          <div className="mb-3">{renderStep()}</div>

          {/* Error Message */}
          {submitError && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {submitError}
            </div>
          )}

          {/* Continue Button */}
          <div className="flex justify-end">
            <Button
              size="lg"
              rounded="full"
              style={{ fontSize: "0.9em", padding: "0.5em 1.2em" }}
              className="bg-[#0350B5] text-white hover:bg-[#034093] min-w-[100px] disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleNext}
              disabled={isSubmitting}
            >
              {isSubmitting 
                ? "Processing..." 
                : currentStep === TOTAL_STEPS 
                ? "Submit" 
                : "Continue"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

