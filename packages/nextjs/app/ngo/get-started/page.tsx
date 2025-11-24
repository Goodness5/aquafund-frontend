"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useAccount } from "wagmi";
import { useSearchParams, useRouter } from "next/navigation";
import { ChevronLeftIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { Button } from "../../_components/Button";
import Step1Organization from "../../accounts/_components/Step1Organization";
import Step2ContactInfo from "../../accounts/_components/Step2ContactInfo";
import Step3Documents from "../../accounts/_components/Step3Documents";
import Step4Wallet from "../../accounts/_components/Step4Wallet";
import Step5Preview from "../../accounts/_components/Step5Preview";
import { useAuthStore } from "../../../services/store/authStore";

const STORAGE_KEY = "ngo-account-progress";
const AUTH_TOKEN_KEY = "access_token";
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

function GetStartedPageContent() {
  const { address } = useAccount();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isAuthenticated, loadFromStorage } = useAuthStore();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<NGOAccountData>(initialFormData);
  const [projectTitle, setProjectTitle] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSkipOption, setShowSkipOption] = useState(false);
  const [hasCheckedUser, setHasCheckedUser] = useState(false);
  const [isCheckingUser, setIsCheckingUser] = useState(false);
  const isFormActive = useRef(false);

  // Load auth from storage on mount
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  // Fetch fresh user data from API
  const fetchUserData = async (userId: string, token: string) => {
    try {
      setIsCheckingUser(true);
      const response = await fetch(`/api/v1/users/${userId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          const userData = data.data;
          // Update auth store with fresh user data
          const { setAuth } = useAuthStore.getState();
          setAuth(userData, token);
          return userData;
        }
      }
      return null;
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      return null;
    } finally {
      setIsCheckingUser(false);
    }
  };

  // Check authentication status and ngoId - run once on mount
  useEffect(() => {
    if (typeof window !== "undefined" && !hasCheckedUser && !isCheckingUser) {
      const checkUserAndRedirect = async () => {
        // Don't redirect if form is already active (user is filling it out)
        if (isFormActive.current) {
          setHasCheckedUser(true);
          return;
        }

        // Wait for auth to load from storage
        await new Promise(resolve => setTimeout(resolve, 300));

        // Check localStorage directly as source of truth
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        const storedAuth = localStorage.getItem("auth-storage");
        
        let currentUser: typeof user = null;
        let currentIsAuthenticated = false;

        // Try to get user from auth store first
        const authState = useAuthStore.getState();
        currentUser = authState.user;
        currentIsAuthenticated = authState.isAuthenticated;

        // If auth store doesn't have user but we have stored auth, load it
        if ((!currentUser || !currentIsAuthenticated) && storedAuth) {
          try {
            const parsed = JSON.parse(storedAuth);
            if (parsed.user && parsed.token) {
              const { setAuth } = useAuthStore.getState();
              setAuth(parsed.user, parsed.token);
              currentUser = parsed.user;
              currentIsAuthenticated = true;
              // Wait a bit for state to update
              await new Promise(resolve => setTimeout(resolve, 100));
            }
          } catch (error) {
            console.error("Failed to parse stored auth:", error);
          }
        }

        // Final check - if still not authenticated, redirect
        if (!currentIsAuthenticated || !currentUser || !token) {
          console.log("Not authenticated, redirecting to sign in", {
            currentIsAuthenticated,
            hasUser: !!currentUser,
            hasToken: !!token,
          });
          router.push("/accounts/sign-in?return=" + encodeURIComponent("/ngo/get-started"));
          setHasCheckedUser(true);
          return;
        }

        // User is authenticated, check ngoId
        // Fetch fresh user data to check current ngoId status
        const freshUserData = await fetchUserData(currentUser.id, token);
        
        if (freshUserData) {
          // If user has NGO, redirect to dashboard
          if (freshUserData.ngoId !== null) {
            router.push("/dashboard");
            setHasCheckedUser(true);
            return;
          } else {
            // User doesn't have NGO, show form with skip option
            setShowSkipOption(true);
            isFormActive.current = true; // Mark form as active
          }
        } else {
          // If fetch fails, use stored user data
          if (currentUser.ngoId !== null) {
            router.push("/dashboard");
            setHasCheckedUser(true);
            return;
          } else {
            setShowSkipOption(true);
            isFormActive.current = true; // Mark form as active
          }
        }
        setHasCheckedUser(true);
      };

      checkUserAndRedirect();
    }
  }, []); // Only run once on mount

  // Mark form as active when user starts interacting with it
  useEffect(() => {
    if (showSkipOption) {
      isFormActive.current = true;
    }
  }, [showSkipOption]);

  // Check if coming from project creation
  useEffect(() => {
    const projectTitleParam = searchParams.get("project");
    if (projectTitleParam) {
      setProjectTitle(decodeURIComponent(projectTitleParam));
    }
  }, [searchParams]);

  // Auto-fill wallet address when connected
  useEffect(() => {
    if (address) {
      // Always update wallet address when address changes
      setFormData((prev) => ({ ...prev, walletAddress: address }));
    }
  }, [address]);

  // Load saved progress from localStorage - run before auth check
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.data) {
          // Merge saved data with initial form data
          // File objects can't be restored from localStorage, so we reset them to empty/undefined
          const restoredData: NGOAccountData = {
            ...initialFormData,
            ...parsed.data,
            // Reset File objects since they can't be restored from localStorage
            organizationDocuments: [],
            certificateOfRegistration: undefined,
            ngoLogo: undefined,
            adminIdentityVerification: undefined,
          };
          setFormData(restoredData);
        }
        if (parsed.step) {
          setCurrentStep(parsed.step);
        }
        if (parsed.projectTitle) {
          setProjectTitle(parsed.projectTitle);
        }
        // If we have saved progress, form is active
        if (parsed.step && parsed.step > 0) {
          isFormActive.current = true;
        }
      } catch (error) {
        console.error("Failed to load saved progress:", error);
      }
    }
  }, []); // Only run once on mount

  // Save progress to localStorage whenever formData or step changes
  useEffect(() => {
    // Don't save on initial mount before form data is loaded
    if (!hasCheckedUser) return;
    
    try {
      // Create a serializable copy of formData (exclude File objects and File arrays which can't be JSON stringified)
      const {
        certificateOfRegistration,
        ngoLogo,
        adminIdentityVerification,
        organizationDocuments,
        ...textFields
      } = formData;
      
      // Save file metadata for reference (users will need to re-upload files)
      const fileMetadata = {
        certificateOfRegistration: certificateOfRegistration ? {
          name: certificateOfRegistration.name,
          size: certificateOfRegistration.size,
          type: certificateOfRegistration.type,
        } : undefined,
        ngoLogo: ngoLogo ? {
          name: ngoLogo.name,
          size: ngoLogo.size,
          type: ngoLogo.type,
        } : undefined,
        adminIdentityVerification: adminIdentityVerification ? {
          name: adminIdentityVerification.name,
          size: adminIdentityVerification.size,
          type: adminIdentityVerification.type,
        } : undefined,
        organizationDocuments: organizationDocuments.length > 0 ? organizationDocuments.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type,
        })) : [],
      };
      
      const serializableData = {
        ...textFields,
        ...fileMetadata,
      };
      
      const progress = {
        step: currentStep,
        data: serializableData,
        projectTitle: projectTitle,
        timestamp: Date.now(), // Add timestamp to track when progress was saved
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (error) {
      console.error("Failed to save progress to localStorage:", error);
    }
  }, [currentStep, formData, projectTitle, hasCheckedUser]);

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

  const handleSkipNgoSetup = () => {
    // Skip NGO setup and go to dashboard
    router.push("/dashboard");
  };

  const handleSubmit = async () => {
    if (isSubmitting) return; // Prevent double submission

    setIsSubmitting(true);
    try {
      // Helper function to check if value is a File or Blob
      const isFileOrBlob = (value: unknown): value is File | Blob => {
        return value instanceof File || value instanceof Blob;
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
      
      // Convert files to base64 strings
      const imagePromises: Promise<string>[] = [];
      
      if (formData.ngoLogo && isFileOrBlob(formData.ngoLogo)) {
        imagePromises.push(fileToBase64(formData.ngoLogo));
      }
      if (formData.certificateOfRegistration && isFileOrBlob(formData.certificateOfRegistration)) {
        imagePromises.push(fileToBase64(formData.certificateOfRegistration));
      }
      if (formData.adminIdentityVerification && isFileOrBlob(formData.adminIdentityVerification)) {
        imagePromises.push(fileToBase64(formData.adminIdentityVerification));
      }
      
      // Wait for all images to be converted to base64
      const orgImages = await Promise.all(imagePromises);
      
      // Backend requires at least 1 image
      if (orgImages.length === 0) {
        throw new Error("At least one image is required. Please upload at least one document (NGO Logo, Certificate, or ID).");
      }

      // Get user ID from auth store
      if (!user || !user.id) {
        throw new Error("User not authenticated. Please sign in again.");
      }

      // Map form data to backend NGO schema
      const ngoData = {
        organizationName: formData.organizationName,
        yearEstablished: parseInt(formData.yearEstablished) || 0,
        countryOfOperation: formData.countryOfOperation,
        ngoIdentificationNumber: formData.ngoRegistrationNumber,
        emailAddress: formData.email || user.email,
        missionStatement: formData.missionStatement,
        websiteOrSocialLinks: formData.websiteSocialLinks,
        contactPersonName: formData.contactPersonName,
        contactPersonPosition: formData.position,
        contactPersonPhoneNumber: formData.phoneNumber,
        contactPersonResidentialAddress: formData.residentialAddress,
        contactPersonEmailAddress: formData.contactEmail,
        orgCountryOfOperation: formData.countryOfOperation,
        orgEmailAddress: formData.email || user.email,
        orgDescription: formData.missionStatement,
        orgImages: orgImages,
        connectedWallet: formData.walletAddress,
        statusVerification: "PENDING" as const,
        userId: user.id,
      };

      console.log("Submitting NGO data:", {
        ...ngoData,
        orgImages: `[${orgImages.length} image(s)]`,
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
        
        // Handle 413 Payload Too Large error specifically
        if (response.status === 413) {
          throw new Error(
            result?.error || 
            result?.details || 
            "The uploaded images are too large. Please compress or resize your images and try again."
          );
        }
        
        // Show generic message for 500 errors
        if (response.status >= 500) {
          throw new Error("Internal server error occurred. Please retry.");
        }
        
        // Extract error message from response
        const errorMessage = 
          result?.error || 
          result?.message || 
          result?.errors?.map((e: any) => e.message || e).join(", ") ||
          `Failed to submit NGO data (${response.status}: ${response.statusText})`;
        
        throw new Error(errorMessage);
      }

      console.log("NGO submitted successfully:", result);
      alert("NGO profile submitted successfully! Your profile is under review.");

      // Clear saved progress
      localStorage.removeItem(STORAGE_KEY);
      
      // Refresh user data to get updated ngoId
      if (user && token) {
        const freshUserData = await fetchUserData(user.id, token);
        if (freshUserData) {
          // User now has NGO, redirect to dashboard
          router.push("/dashboard");
        } else {
          // Redirect to account under review page
          router.push("/accounts/under-review");
        }
      } else {
        router.push("/accounts/under-review");
      }
    } catch (error) {
      console.error("Failed to submit:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to submit NGO profile. Please try again.";
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
        return (
          <Step4Wallet
            formData={formData}
            updateFormData={updateFormData}
          />
        );
      case 5:
        return <Step5Preview formData={formData} updateFormData={updateFormData} />;
      default:
        return null;
    }
  };

  // Show loading state while checking authentication
  if (!hasCheckedUser || isCheckingUser) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="text-[#475068]">Loading...</div>
      </div>
    );
  }

  // After check is complete, if still not authenticated, show nothing (redirect will happen)
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="text-[#475068]">Redirecting to sign in...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex">
      {/* Left Section - Static Content */}
      <div className="hidden lg:flex lg:w-2/5 fundraiser-form-bg-box p-8 items-center">
        <div className="max-w-md">
          <h1 style={{ fontSize: "1.8em" }} className="font-bold text-[#001627] mb-4 leading-tight">
            Complete Your NGO Profile
          </h1>
          <p style={{ fontSize: "1em" }} className="text-[#475068] leading-relaxed">
            Set up your NGO profile to start creating impactful fundraisers and receiving donations.
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

          {/* Continue Button and Skip Option */}
          <div className="flex flex-col items-end gap-3">
            {showSkipOption && currentStep === 1 && (
              <button
                onClick={handleSkipNgoSetup}
                className="text-sm text-[#475068] hover:text-[#001627] underline transition-colors"
              >
                Skip for now
              </button>
            )}
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

export default function GetStartedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="text-[#475068]">Loading...</div>
      </div>
    }>
      <GetStartedPageContent />
    </Suspense>
  );
}

