"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { Button } from "../../_components/Button";
import Step1Location from "../_components/Step1Location";
import Step2ProjectIdentity from "../_components/Step2ProjectIdentity";
import Step3TellUsMore from "../_components/Step3TellUsMore";
import Step4FundManagement from "../_components/Step4FundManagement";

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
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FundraiserFormData>(initialFormData);

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

  const handleSubmit = () => {
    // TODO: Submit form data to API
    console.log("Submitting form:", formData);
    // Clear localStorage after successful submission
    localStorage.removeItem(STORAGE_KEY);
    // Redirect to success page or dashboard
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

          {/* Continue Button */}
          <div className="flex justify-end">
            <Button
              size="lg"
              rounded="full"
              style={{ fontSize: "0.9em", padding: "0.5em 1.2em" }}
              className="bg-[#0350B5] text-white hover:bg-[#034093] min-w-[100px]"
              onClick={handleNext}
            >
              {currentStep === TOTAL_STEPS ? "Submit" : "Continue"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

