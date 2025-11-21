"use client";

import { useState, useEffect } from "react";
import { useAccount, useConnect } from "wagmi";
import { useSearchParams, useRouter } from "next/navigation";
import { ChevronLeftIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { Button } from "../../_components/Button";
import CreateAccountModal from "../_components/CreateAccountModal";
import Step1Organization from "../_components/Step1Organization";
import Step2ContactInfo from "../_components/Step2ContactInfo";
import Step3Documents from "../_components/Step3Documents";
import Step4Wallet from "../_components/Step4Wallet";
import Step5Preview from "../_components/Step5Preview";

const STORAGE_KEY = "ngo-account-progress";
const AUTH_TOKEN_KEY = "aquafund-auth-token";
const TOTAL_STEPS = 5; // Form steps: Organization, Contact Info, Documents, Wallet, Preview

export interface NGOAccountData {
  fundingGoal: number;
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
  // Base64 strings for persistence and submission
  certificateOfRegistrationBase64?: string;
  ngoLogoBase64?: string;
  adminIdentityVerificationBase64?: string;
}

const initialFormData: NGOAccountData = {
  // fundingGoal: 0,
  email: "",
  walletAddress: "",
  organizationName: "",
  fundingGoal: 0,
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check authentication status and load user email - only check once on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      const authenticated = !!token;
      
      setIsAuthenticated(authenticated);
      setShowAccountModal(!authenticated); // Show modal only if NOT authenticated
      
      // Load user email from localStorage if available (from login)
      const storedEmail = localStorage.getItem("aquafund-user-email");
      if (storedEmail) {
        updateFormData({ email: storedEmail });
      }
    }
  }, []); // Only run once on mount - no unnecessary re-checks

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
  }, [address, formData.walletAddress]);

  // Load saved progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Clear File object references since they can't be serialized/deserialized
        // Only keep base64 strings which are the actual data we need
        const loadedData = {
          ...parsed.data,
          // Remove File object metadata (they're not real File objects after JSON.parse)
          certificateOfRegistration: parsed.data.certificateOfRegistrationBase64 ? undefined : parsed.data.certificateOfRegistration,
          ngoLogo: parsed.data.ngoLogoBase64 ? undefined : parsed.data.ngoLogo,
          adminIdentityVerification: parsed.data.adminIdentityVerificationBase64 ? undefined : parsed.data.adminIdentityVerification,
        };
        setFormData(loadedData);
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
    try {
      // Create a serializable copy of formData (exclude File objects which can't be JSON stringified)
      const serializableData = {
        ...formData,
        // File objects cannot be serialized, so we only save metadata
        certificateOfRegistration: formData.certificateOfRegistration ? {
          name: formData.certificateOfRegistration.name,
          size: formData.certificateOfRegistration.size,
          type: formData.certificateOfRegistration.type,
        } : undefined,
        ngoLogo: formData.ngoLogo ? {
          name: formData.ngoLogo.name,
          size: formData.ngoLogo.size,
          type: formData.ngoLogo.type,
        } : undefined,
        adminIdentityVerification: formData.adminIdentityVerification ? {
          name: formData.adminIdentityVerification.name,
          size: formData.adminIdentityVerification.size,
          type: formData.adminIdentityVerification.type,
        } : undefined,
      };
      
      const progress = {
        step: currentStep,
        data: serializableData,
        projectTitle: projectTitle,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (error) {
      console.error("Failed to save progress to localStorage:", error);
      // Still try to save without File objects
      const { certificateOfRegistration, ngoLogo, adminIdentityVerification, ...dataWithoutFiles } = formData;
      const progress = {
        step: currentStep,
        data: dataWithoutFiles,
        projectTitle: projectTitle,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    }
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
    setIsAuthenticated(true);
    setShowAccountModal(false);
    // Save email if provided
    if (email) {
      updateFormData({ email });
    }
    // After account creation, start the form from step 1 (wallet)
    setCurrentStep(1);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return; // Prevent double submission

    setIsSubmitting(true);
    try {
      // Helper function to check if value is a File or Blob
      const isFileOrBlob = (value: unknown): value is File | Blob => {
        return value instanceof File || value instanceof Blob;
      };
      
      // Helper function to compress image before converting to base64
      // Using aggressive compression to reduce payload size: 800x800 max, 0.5 quality
      const compressImage = (file: File | Blob, maxWidth: number = 800, maxHeight: number = 800, quality: number = 0.5): Promise<File> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const img = document.createElement('img') as HTMLImageElement;
            img.onload = () => {
              const canvas = document.createElement('canvas');
              let width = img.width;
              let height = img.height;

              // Calculate new dimensions
              if (width > height) {
                if (width > maxWidth) {
                  height = (height * maxWidth) / width;
                  width = maxWidth;
                }
              } else {
                if (height > maxHeight) {
                  width = (width * maxHeight) / height;
                  height = maxHeight;
                }
              }

              canvas.width = width;
              canvas.height = height;

              const ctx = canvas.getContext('2d');
              if (!ctx) {
                reject(new Error('Failed to get canvas context'));
                return;
              }

              ctx.drawImage(img, 0, 0, width, height);

              canvas.toBlob(
                (blob) => {
                  if (!blob) {
                    reject(new Error('Failed to compress image'));
                    return;
                  }
                  const compressedFile = new File([blob], file instanceof File ? file.name : 'image.jpg', {
                    type: 'image/jpeg',
                    lastModified: Date.now(),
                  });
                  resolve(compressedFile);
                },
                'image/jpeg',
                quality
              );
            };
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = e.target?.result as string;
          };
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsDataURL(file);
        });
      };
      
      // Helper function to convert file to base64
      const fileToBase64 = (file: File | Blob): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error("Failed to read file"));
          reader.readAsDataURL(file);
        });
      };
      
      // Collect base64 images - compress and convert to base64
      const imagePromises: Promise<string>[] = [];
      
      // Process each image: compress if it's a File, then convert to base64
      if (formData.ngoLogo) {
        if (isFileOrBlob(formData.ngoLogo)) {
          // Compress and convert File to base64
          const compressed = await compressImage(formData.ngoLogo);
          imagePromises.push(fileToBase64(compressed));
        } else if (formData.ngoLogoBase64) {
          // Use existing base64 string (already compressed)
          imagePromises.push(Promise.resolve(formData.ngoLogoBase64));
        }
      }
      
      if (formData.certificateOfRegistration) {
        if (isFileOrBlob(formData.certificateOfRegistration)) {
          // Compress and convert File to base64
          const compressed = await compressImage(formData.certificateOfRegistration);
          imagePromises.push(fileToBase64(compressed));
        } else if (formData.certificateOfRegistrationBase64) {
          // Use existing base64 string (already compressed)
          imagePromises.push(Promise.resolve(formData.certificateOfRegistrationBase64));
        }
      }
      
      if (formData.adminIdentityVerification) {
        if (isFileOrBlob(formData.adminIdentityVerification)) {
          // Compress and convert File to base64
          const compressed = await compressImage(formData.adminIdentityVerification);
          imagePromises.push(fileToBase64(compressed));
        } else if (formData.adminIdentityVerificationBase64) {
          // Use existing base64 string (already compressed)
          imagePromises.push(Promise.resolve(formData.adminIdentityVerificationBase64));
        }
      }
      
      // Wait for all images to be converted to base64
      const allImages = await Promise.all(imagePromises);
      
      // Backend requires at least 1 image
      if (allImages.length === 0) {
        throw new Error("At least one image is required. Please upload at least one document (NGO Logo, Certificate, or ID).");
      }
      
      // Limit to 2 images maximum to avoid 413 Payload Too Large errors
      // Base64 encoding increases size by ~33%, so we limit to prevent payload size issues
      const orgImages = allImages.slice(0, 2);
      
      // Calculate approximate payload size (base64 strings are ~33% larger than original)
      const totalSize = orgImages.reduce((sum, img) => sum + img.length, 0);
      const sizeInMB = (totalSize / 1024 / 1024).toFixed(2);
      console.log(`Sending ${orgImages.length} images, total size: ~${sizeInMB}MB`);
      
      if (totalSize > 5 * 1024 * 1024) { // 5MB warning
        console.warn("Payload size is large, may cause 413 error. Consider reducing image count or size.");
      }

      // Get userId from localStorage (stored during account creation/login)
      const storedUserId = typeof window !== "undefined" ? localStorage.getItem("aquafund-user-id") : null;
      const userId = storedUserId || "";

      // Get email from formData or localStorage (stored during login)
      const storedEmail = typeof window !== "undefined" ? localStorage.getItem("aquafund-user-email") : null;
      const emailAddress = formData.email || storedEmail || "";
      
      if (!emailAddress) {
        throw new Error("Email address is required. Please ensure you are logged in.");
      }

      // Convert yearEstablished to number
      const yearEstablished = parseInt(formData.yearEstablished, 10);
      if (isNaN(yearEstablished) || yearEstablished < 1800 || yearEstablished > new Date().getFullYear()) {
        throw new Error("Please enter a valid year established.");
      }

      // Prepare NGO data according to API requirements
      const ngoData = {
        organizationName: formData.organizationName,
        yearEstablished: yearEstablished,
        countryOfOperation: formData.countryOfOperation,
        ngoIdentificationNumber: formData.ngoRegistrationNumber,
        emailAddress: emailAddress,
        missionStatement: formData.missionStatement,
        websiteOrSocialLinks: formData.websiteSocialLinks,
        contactPersonName: formData.contactPersonName,
        contactPersonPosition: formData.position,
        contactPersonPhoneNumber: formData.phoneNumber,
        contactPersonResidentialAddress: formData.residentialAddress,
        contactPersonEmailAddress: formData.contactEmail,
        orgImages: orgImages,
        connectedWallet: formData.walletAddress,
        userId: userId,
      };

      console.log("Submitting NGO data:", {
        ...ngoData,
        orgImages: orgImages.map(img => `[base64 string - ${img.substring(0, 50)}...]`),
      });
      
      // Get auth token for authentication
      const token = typeof window !== "undefined" ? localStorage.getItem(AUTH_TOKEN_KEY) : null;
      
      // Submit NGO data via API
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const response = await fetch("/api/v1/ngos", {
        method: "POST",
        headers,
        body: JSON.stringify(ngoData),
      });

      // Parse response
      let result;
      try {
        result = await response.json();
      } catch (error) {
        const text = await response.text();
        console.error("Failed to parse response:", text);
        throw new Error(`Server returned invalid response: ${text}`);
      }

      if (!response.ok) {
        // Log detailed error for debugging
        console.error("Submission failed:", {
          status: response.status,
          statusText: response.statusText,
          error: result,
        });
        
        // Extract error message from response
        const errorMessage = 
          result?.error || 
          result?.message || 
          result?.errors?.map((e: any) => e.message || e).join(", ") ||
          `Failed to submit organization data (${response.status}: ${response.statusText})`;
        
        throw new Error(errorMessage);
      }

      console.log("Account submitted successfully:", result);
      alert("NGO Information submitted successfully, please wait for review.");

      // Clear saved progress
      localStorage.removeItem(STORAGE_KEY);
      
      // Redirect to account under review page
      const reviewUrl = projectTitle
        ? `/accounts/under-review?project=${encodeURIComponent(projectTitle)}`
        : "/accounts/under-review";
      router.push(reviewUrl);
    } catch (error) {
      console.error("Failed to submit:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to submit organization data. Please try again.";
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
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

  // Show modal only if user is not authenticated
  if (showAccountModal) {
    return (
      <CreateAccountModal
        onClose={() => {
          // User closed modal without logging in - redirect to home
          router.push("/");
        }}
        onAccountCreated={handleAccountCreated}
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
              className="bg-[#0350B5] text-white hover:bg-[#034093] min-w-[100px] disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleNext}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Submitting..."
                : currentStep === TOTAL_STEPS
                ? "Submit For Review"
                : "Continue"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

