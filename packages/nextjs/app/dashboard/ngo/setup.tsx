"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useAccount } from "wagmi";
import { useSearchParams, useRouter } from "next/navigation";
import { ChevronLeftIcon, CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { Button } from "../../../_components/Button";
import Step1Organization from "../../../accounts/_components/Step1Organization";
import Step2ContactInfo from "../../../accounts/_components/Step2ContactInfo";
import Step3Documents from "../../../accounts/_components/Step3Documents";
import Step4Wallet from "../../../accounts/_components/Step4Wallet";
import Step5Preview from "../../../accounts/_components/Step5Preview";
import { useAuthStore } from "../../../../services/store/authStore";

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
  // Cloudinary URLs (set after successful upload)
  orgImageUrls?: string[];
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
  orgImageUrls: [],
};

function GetStartedPageContent() {
  const { address } = useAccount();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, ngo, isAuthenticated, loadFromStorage, hasApprovedNGO } = useAuthStore();
  
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
  }, []); // Empty deps - only run once on mount

  // Fetch fresh user data from API (including NGO status)
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
        // Handle response format: { success: true, data: { id, email, ..., ngo: {...} } }
        // NGO is nested inside the user data object
        if (data.success && data.data) {
          const userData = data.data;
          const ngoData = userData.ngo || null;
          
          // Map statusVerification to status for consistency
          if (ngoData && ngoData.statusVerification) {
            ngoData.status = ngoData.statusVerification;
          }
          
          // Update auth store with fresh user data and NGO
          const { setAuth } = useAuthStore.getState();
          setAuth(userData, token, ngoData);
          return { user: userData, ngo: ngoData };
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

        // User is authenticated - ALWAYS refetch from backend to get latest NGO status
        // This ensures we have the most up-to-date information
        const freshData = await fetchUserData(currentUser.id, token);
        
        if (freshData) {
          const { user: freshUser, ngo: freshNGO } = freshData;
          
          // Check NGO status with fresh data from backend
          // Handle both statusVerification (from backend) and status (mapped)
          const ngoStatus = freshNGO?.status || freshNGO?.statusVerification;
          
          if (ngoStatus === "APPROVED") {
            // User has approved NGO, redirect to dashboard
            setHasCheckedUser(true);
            router.replace("/dashboard");
            return;
          } else if (ngoStatus === "PENDING") {
            // NGO is pending, redirect to under review
            setHasCheckedUser(true);
            router.replace("/accounts/under-review");
            return;
          } else if (ngoStatus === "REJECTED") {
            // NGO was rejected, stay on page to allow resubmission
            setShowSkipOption(true);
            isFormActive.current = true;
            setHasCheckedUser(true);
            return;
          }
        }
        
        // No NGO or unknown status - show form to create/update NGO
        setShowSkipOption(true);
        isFormActive.current = true; // Mark form as active
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

  // Check if coming from project creation or rejection
  useEffect(() => {
    const projectTitleParam = searchParams.get("project");
    if (projectTitleParam) {
      setProjectTitle(decodeURIComponent(projectTitleParam));
    }
  }, [searchParams]);

  const isRejected = searchParams.get("rejected") === "true";

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
        // Check that all 3 images are uploaded and have Cloudinary URLs
        return !!(
          formData.orgImageUrls &&
          formData.orgImageUrls.length >= 3 &&
          formData.certificateOfRegistration &&
          formData.ngoLogo &&
          formData.adminIdentityVerification
        ); // All three documents required with Cloudinary URLs
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
    // Skip NGO setup - check NGO status first
    const authState = useAuthStore.getState();
    const currentNGO = authState.ngo;
    
    if (currentNGO && currentNGO.status === "APPROVED") {
      router.push("/dashboard");
    } else if (currentNGO && currentNGO.status === "PENDING") {
      router.push("/accounts/under-review");
    } else {
      // No NGO or rejected - stay on page or go to dashboard (they'll be redirected back by NGOGuard)
      router.push("/dashboard");
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return; // Prevent double submission

    setIsSubmitting(true);
    try {
      // Use Cloudinary URLs from formData
      const orgImages = formData.orgImageUrls || [];
      
      // Backend requires at least 1 image
      if (orgImages.length === 0) {
        throw new Error("At least one image is required. Please upload at least one document (NGO Logo, Certificate, or ID).");
      }
      
      // Ensure all 3 images are uploaded
      if (orgImages.length < 3) {
        throw new Error("Please ensure all three images (Certificate, Logo, and Admin ID) are uploaded successfully.");
      }

      // Get user ID from auth store
      if (!user || !user.id) {
        throw new Error("User not authenticated. Please sign in again.");
      }

      // Validate and parse yearEstablished
      const yearEstablished = parseInt(formData.yearEstablished);
      if (isNaN(yearEstablished) || yearEstablished < 1800) {
        throw new Error("Year established must be a valid year (1800 or later).");
      }

      // Map form data to backend NGO schema
      // Note: userId is removed as backend gets it from auth token
      const ngoData = {
        organizationName: formData.organizationName,
        yearEstablished: yearEstablished,
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
        // If JSON parsing fails, try to get text response
        const text = await response.text().catch(() => "Unable to read response");
        console.error("Failed to parse response as JSON:", text);
        
        // Check if it's the "Backend returned non-JSON response" error from our API route
        try {
          const parsedError = JSON.parse(text);
          if (parsedError.error === "Backend returned non-JSON response") {
            const backendError = `Backend error (${parsedError.status}): ${parsedError.statusText || "Unknown error"}. ${parsedError.responsePreview ? `Response: ${parsedError.responsePreview}` : ""}`;
            console.error("Backend returned non-JSON response:", parsedError);
            throw new Error(backendError);
          }
        } catch {
          // If we can't parse the error JSON either, just show the text
        }
        
        throw new Error(`Server returned invalid response: ${text.substring(0, 200)}`);
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
          // Check if we have more details about the backend error
          if (result?.error === "Backend returned non-JSON response") {
            throw new Error(
              `Backend server error (${result.status || response.status}): ${result.statusText || response.statusText}. Please check your backend server or try again later.`
            );
          }
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
      
      // After submitting, NGO will be PENDING, so always redirect to under-review
      router.push("/accounts/under-review");
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
    <div className="w-full max-w-full min-w-0">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-[#001627] mb-2">NGO Profile Setup</h1>
        <p className="text-sm lg:text-base text-[#475068]">Complete your NGO profile to start fundraising</p>
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="max-w-3xl mx-auto">
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

          {/* Rejection Banner */}
          {isRejected && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-900 mb-1">NGO Profile Rejected</h3>
                  <p className="text-sm text-red-700">
                    Your previous NGO profile submission was rejected. Please review and update your information before resubmitting.
                  </p>
                </div>
              </div>
            </div>
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

export default function NGOSetupPage() {
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

