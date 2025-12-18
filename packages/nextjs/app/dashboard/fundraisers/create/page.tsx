"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { parseEther } from "viem";
// Removed stringToBytes32 import - ABIs now use strings directly
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { Button } from "../../../_components/Button";
import Step1Location from "../_components/Step1Location";
import Step2ProjectIdentity from "../_components/Step2ProjectIdentity";
import Step3TellUsMore from "../_components/Step3TellUsMore";
import Step4FundManagement from "../_components/Step4FundManagement";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth/useScaffoldWriteContract";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth/useScaffoldReadContract";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { useAuthStore } from "../../../../services/store/authStore";

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

  // Upload images to Cloudinary and extract publicId
  const uploadImagesToCloudinary = async (images: File[]): Promise<string[]> => {
    const publicIds: string[] = [];
    
    console.log(`📤 [Create] Starting upload of ${images.length} image(s) to Cloudinary...`);
    
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      console.log(`📤 [Create] Uploading image ${i + 1}/${images.length}:`, {
        fileName: image.name,
        fileSize: `${(image.size / 1024 / 1024).toFixed(2)} MB`,
        fileType: image.type,
      });
      
      // Validate file size (5MB limit)
      if (image.size > 5 * 1024 * 1024) {
        throw new Error(`Image "${image.name}" exceeds 5MB limit. Please compress or resize the image.`);
      }
      
      const formData = new FormData();
      formData.append("file", image);
      formData.append("folder", "fund"); // Use shorter folder name to reduce publicId length
      
      const response = await fetch("/api/upload/cloudinary", {
        method: "POST",
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success || !data.publicId) {
        console.error(`❌ [Create] Failed to upload image ${i + 1}:`, {
          fileName: image.name,
          responseStatus: response.status,
          error: data.error,
        });
        throw new Error(data.error || "Failed to upload image");
      }
      
      // Store the full publicId (e.g., "fund/px1bki0zxgw2vmcse7rw")
      // We'll reconstruct the URL when displaying: https://res.cloudinary.com/{cloud_name}/image/upload/{publicId}.jpg
      const publicId = data.publicId as string;
      
      console.log(`✅ [Create] Image ${i + 1} uploaded successfully:`, {
        fileName: image.name,
        url: data.url,
        publicId: publicId,
        publicIdLength: publicId.length,
      });
      
      publicIds.push(publicId);
    }
    
    console.log(`✅ [Create] All ${publicIds.length} image(s) uploaded successfully`);
    return publicIds;
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    console.log("🚀 [Create] Starting fundraiser creation process...");
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Validate required fields
      console.log("📋 [Create] Step 1: Validating form data...", {
        campaignTitle: formData.campaignTitle,
        goalAmount: formData.goalAmount,
        description: formData.description ? `${formData.description.substring(0, 50)}...` : null,
        hasImages: formData.images?.length > 0,
        imageCount: formData.images?.length || 0,
        location: formData.location,
        country: formData.country,
        category: formData.category,
      });

      if (!formData.campaignTitle || !formData.goalAmount || !formData.description) {
        throw new Error("Please fill in all required fields");
      }
      
      if (!address) {
        throw new Error("Please connect your wallet");
      }
      
      if (!user || !user.id) {
        throw new Error("Please sign in to create a fundraiser");
      }
      
      console.log("✅ [Create] Form validation passed");
      console.log("👤 [Create] User info:", {
        userId: user.id,
        userEmail: user.email,
        walletAddress: address,
      });
      
      // Check if user has PROJECT_CREATOR_ROLE
      console.log("🔐 [Create] Checking PROJECT_CREATOR_ROLE...", {
        isCreator,
        creatorRole: creatorRole?.toString(),
        address,
      });

      if (isCreator === false) {
        throw new Error("You don't have permission to create projects. Your wallet address needs to be granted the PROJECT_CREATOR_ROLE. Please contact an administrator.");
      }
      
      if (isCreator === undefined) {
        throw new Error("Checking permissions... Please wait a moment and try again.");
      }

      console.log("✅ [Create] User has PROJECT_CREATOR_ROLE");
      
      // Step 1: Upload images to Cloudinary and get publicIds
      let imagePublicIds: string[] = [];
      if (formData.images && formData.images.length > 0) {
        console.log(`📤 [Create] Step 2: Uploading ${formData.images.length} image(s) to Cloudinary...`);
        imagePublicIds = await uploadImagesToCloudinary(formData.images);
        console.log("✅ [Create] Images uploaded successfully:", {
          imageCount: imagePublicIds.length,
          publicIds: imagePublicIds,
        });
      } else {
        console.log("⏭️ [Create] Step 2: No images to upload");
      }
      
      // Step 2: Use strings directly (no bytes32 conversion needed)
      console.log("📝 [Create] Step 3: Preparing metadata as strings...");
      
      // All metadata fields are now strings - use directly
      const title = formData.campaignTitle || "";
      const description = formData.description || "";
      const location = formData.location || "";
      const category = formData.category || "";
      
      // Images are string array
      const images = imagePublicIds;
      
      console.log("📦 [Create] Metadata prepared:", {
        title,
        description,
        descriptionLength: description.length,
        location,
        category,
        imageCount: images.length,
        imagePublicIds: images,
      });
      
      // Step 3: Convert goal amount to wei
      console.log("💰 [Create] Step 4: Converting goal amount to wei...", {
        goalAmount: formData.goalAmount,
        goalAmountWei: parseEther(formData.goalAmount || "0").toString(),
      });
      const goalAmountWei = parseEther(formData.goalAmount || "0");
      
      // Step 4: Call smart contract to create project
      console.log("📞 [Create] Step 5: Calling Factory contract createProject function...");
      console.log("📋 [Create] Contract call details:", {
        contractName: "AquaFundFactory",
        functionName: "createProject",
        functionSignature: "createProject(address admin, address creator, uint256 fundingGoal, string title, string description, string[] images, string location, string category)",
        args: {
          admin: address,
          creator: address, // Same as admin for now
          fundingGoal: goalAmountWei.toString(),
          title,
          description,
          images,
          location,
          category,
        },
        network: targetNetwork.name,
        chainId: targetNetwork.id,
        expectedReturn: "address projectAddress",
      });

      const txHash = await (writeFactory as any)({
        functionName: "createProject",
        args: [
          address as `0x${string}`, // admin address
          address as `0x${string}`, // creator address
          goalAmountWei, // funding goal in wei
          title, // title as string
          description, // description as string
          images, // images as string[]
          location, // location as string
          category, // category as string
        ],
      });
      
      console.log("✅ [Create] Project created successfully!", {
        transactionHash: txHash,
        admin: address,
        creator: address,
        fundingGoal: goalAmountWei.toString(),
        title: formData.campaignTitle,
        description: formData.description,
        imagePublicIds: imagePublicIds,
        location: formData.location,
        category: formData.category,
        timestamp: new Date().toISOString(),
      });
      
      // Clear localStorage after successful submission
      localStorage.removeItem(STORAGE_KEY);
      console.log("🧹 [Create] Cleared localStorage");
      
      // Show success message and redirect to dashboard
      alert("Fundraiser created successfully on the blockchain! Transaction: " + txHash);
      console.log("🔄 [Create] Redirecting to dashboard...");
      router.push("/dashboard/fundraisers");
      
    } catch (error: any) {
      console.error("❌ [Create] Error creating fundraiser:", {
        error,
        message: error?.message,
        stack: error?.stack,
        cause: error?.cause,
        name: error?.name,
        code: error?.code,
        data: error?.data,
      });
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
    <div className="w-full max-w-full min-w-0">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-[#001627] mb-2">Create Fundraiser</h1>
        <p className="text-sm lg:text-base text-[#475068]">Start a new fundraising campaign</p>
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="max-w-3xl mx-auto">
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

          {/* Role Warning */}
          {isCreator === false && (
            <div className="mb-3 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
              <p className="text-yellow-800 font-semibold mb-1">Permission Required</p>
              <p className="text-yellow-700 text-sm">
                Your wallet address needs to be granted the PROJECT_CREATOR_ROLE to create fundraisers. 
                Please contact an administrator to get this role assigned to your address: <span className="font-mono text-xs break-all">{address}</span>
              </p>
            </div>
          )}
          
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

