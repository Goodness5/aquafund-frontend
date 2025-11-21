"use client";

import { useState, useEffect } from "react";
import { useAccount, useConnect } from "wagmi";
import { useSearchParams, useRouter } from "next/navigation";
import { ChevronLeftIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { Button } from "../../_components/Button";
import CreateAccountModal from "../_components/CreateAccountModal";
import SetPasswordModal from "../_components/SetPasswordModal";
import Step1Organization from "../_components/Step1Organization";
import Step2ContactInfo from "../_components/Step2ContactInfo";
import Step3Documents from "../_components/Step3Documents";
import Step4Wallet from "../_components/Step4Wallet";
import Step5Preview from "../_components/Step5Preview";

const STORAGE_KEY = "ngo-account-progress";
const AUTH_TOKEN_KEY = "aquafund-auth-token";
const TOTAL_STEPS = 5; // Form steps: Organization, Contact Info, Documents, Wallet, Preview

export interface NGOAccountData {
  // Email (handled in modal)
  email: string;

  // Step 1: Wallet
  walletAddress: string;

  // Step 2: Organization Info
  organizationName: string;
  yearEstablished: string;
  countryOfOperation: string;
  ngoRegistrationNumber: string;
  missionStatement: string;
  websiteSocialLinks: string;
  contactPersonName: string;
  position: string;
  phoneNumber: string;
  residentialAddress: string;
  contactEmail: string;
  organizationDocuments: File[];
  certificateOfRegistration?: File;
  ngoLogo?: File;
  adminIdentityVerification?: File;
}

const initialFormData: NGOAccountData = {
  email: "",
  walletAddress: "",
  organizationName: "",
  yearEstablished: "",
  countryOfOperation: "",
  ngoRegistrationNumber: "",
  missionStatement: "",
  websiteSocialLinks: "",
  contactPersonName: "",
  position: "",
  phoneNumber: "",
  residentialAddress: "",
  contactEmail: "",
  organizationDocuments: [],
  certificateOfRegistration: undefined,
  ngoLogo: undefined,
  adminIdentityVerification: undefined,
};

export default function GetStartedPage() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<NGOAccountData>(initialFormData);
  const [projectTitle, setProjectTitle] = useState<string | null>(null);
  const [showAccountModal, setShowAccountModal] = useState(true); // Always show modal first
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");

  // Check authentication status - only check once on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      const authenticated = !!token;
      setIsAuthenticated(authenticated);
      // Only hide modal if already authenticated, otherwise keep it open
      if (authenticated) {
        setShowAccountModal(false);
      } else {
        // Not authenticated - keep modal open
        setShowAccountModal(true);
      }
    }
  }, []);

  // Check if coming from project creation
  useEffect(() => {
    const projectTitleParam = searchParams.get("project");
    if (projectTitleParam) {
      setProjectTitle(decodeURIComponent(projectTitleParam));
    }
  }, [searchParams]);

  // Auto-fill wallet address when connected
  useEffect(() => {
    if (address && !formData.walletAddress) {
      updateFormData({ walletAddress: address });
    }
  }, [address]);

  // Load saved progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(parsed.data);
        setCurrentStep(parsed.step || 1);
        if (parsed.projectTitle) {
          setProjectTitle(parsed.projectTitle);
        }
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
      projectTitle: projectTitle,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [currentStep, formData, projectTitle]);

  const updateFormData = (updates: Partial<NGOAccountData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: // Organization Info
        return !!(
          formData.organizationName &&
          formData.yearEstablished &&
          formData.countryOfOperation &&
          formData.ngoRegistrationNumber &&
          formData.missionStatement &&
          formData.websiteSocialLinks
        );
      case 2: // Contact Information
        return !!(
          formData.contactPersonName &&
          formData.position &&
          formData.phoneNumber &&
          formData.residentialAddress &&
          formData.contactEmail
        );
      case 3: // Documents
        return !!(
          formData.certificateOfRegistration &&
          formData.ngoLogo &&
          formData.adminIdentityVerification
        ); // All three documents required
      case 4: // Wallet
        return !!formData.walletAddress;
      case 5: // Preview
        return true; // Preview step doesn't need validation
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      alert("Please fill in all required fields");
      return;
    }

    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAccountCreated = (email?: string) => {
    setShowAccountModal(false);
    // Save email if provided
    if (email) {
      setUserEmail(email);
      updateFormData({ email });
    }
    // Show password modal after account creation
    setShowPasswordModal(true);
  };

  const handlePasswordSet = () => {
    setShowPasswordModal(false);
    setIsAuthenticated(true);
    // After password is set, start the form from step 1
    setCurrentStep(1);
  };

  const handleSubmit = async () => {
    try {
      // Submit organization data via API
      const response = await fetch("/api/accounts/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: formData.walletAddress,
          organizationData: formData,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit organization data");
      }

      localStorage.removeItem(STORAGE_KEY);
      
      // Redirect to account under review page
      const reviewUrl = projectTitle
        ? `/accounts/under-review?project=${encodeURIComponent(projectTitle)}`
        : "/accounts/under-review";
      router.push(reviewUrl);
    } catch (error) {
      console.error("Failed to submit:", error);
      alert("Failed to submit organization data. Please try again.");
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Tell us about your organization";
      case 2:
        return "Contact information";
      case 3:
        return "Organization documents";
      case 4:
        return "Wallet setup";
      case 5:
        return "Preview changes";
      default:
        return "";
    }
  };

  const getStepSubtitle = () => {
    switch (currentStep) {
      case 1:
        return "";
      case 2:
        return "";
      case 3:
        return "Complete all fields to maximize donor trust";
      case 4:
        return "Your wallet will be used for receiving donations and will be visible on-chain for transparency";
      case 5:
        return "";
      default:
        return "";
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Organization formData={formData} updateFormData={updateFormData} />;
      case 2:
        return <Step2ContactInfo formData={formData} updateFormData={updateFormData} />;
      case 3:
        return <Step3Documents formData={formData} updateFormData={updateFormData} />;
      case 4:
        return <Step4Wallet formData={formData} updateFormData={updateFormData} onConnectWallet={() => connect({ connector: connectors[0] })} isConnected={isConnected} />;
      case 5:
        return <Step5Preview formData={formData} updateFormData={updateFormData} />;
      default:
        return null;
    }
  };

  // Always show account modal first if not authenticated
  if (showAccountModal) {
    return (
      <CreateAccountModal
        onClose={() => router.push("/")}
        onAccountCreated={handleAccountCreated}
      />
    );
  }

  // Show password modal after account creation
  if (showPasswordModal) {
    return (
      <SetPasswordModal
        onClose={() => router.push("/")}
        onPasswordSet={handlePasswordSet}
        email={userEmail}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex">
      {/* Left Section - Static Content */}
      <div className="hidden lg:flex lg:w-2/5 fundraiser-form-bg-box p-8 items-center">
        <div className="max-w-md">
          <h1 style={{ fontSize: "1.8em" }} className="font-bold text-[#001627] mb-4 leading-tight">
            Continue your journey
          </h1>
          <p style={{ fontSize: "1em" }} className="text-[#475068] leading-relaxed">
            You&apos;re making great progress! Complete your account setup to start creating impactful fundraisers.
          </p>
        </div>
      </div>

      {/* Right Section - Dynamic Form */}
      <div className="flex-1 bg-white overflow-y-auto">
        <div className="max-w-xl mx-auto px-3 py-4">
          {/* Navigation and Project Badge */}
          <div className="flex items-center gap-2 mb-3">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="w-8 h-8 rounded-full bg-[#E1FFFF] text-[#0350B5] flex items-center justify-center hover:bg-[#CFFED9] transition-colors flex-shrink-0"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
            )}
            {projectTitle && (
              <div className="flex items-center gap-2 bg-[#00BF3C] px-3 py-1.5 rounded-full">
                <CheckCircleIcon className="w-4 h-4 text-white flex-shrink-0" />
                <span style={{ fontSize: "0.85em" }} className="text-white font-medium">
                  Saving: {projectTitle}
                </span>
              </div>
            )}
          </div>

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
            <p style={{ fontSize: "0.9em" }} className="text-[#475068] mb-3">
              {getStepSubtitle()}
            </p>
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
              {currentStep === TOTAL_STEPS ? "Submit For Review" : "Continue"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

