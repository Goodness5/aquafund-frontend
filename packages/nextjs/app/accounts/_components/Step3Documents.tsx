"use client";

import { useRef, useState, useEffect } from "react";
import { PhotoIcon, XMarkIcon, CheckCircleIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { NGOAccountData } from "../../ngo/get-started/page";

interface Step3DocumentsProps {
  formData: NGOAccountData;
  updateFormData: (updates: Partial<NGOAccountData>) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

type ImageType = "certificate" | "logo" | "id";

interface UploadState {
  uploading: boolean;
  uploaded: boolean;
  error: string | null;
  url: string | null;
}

export default function Step3Documents({
  formData,
  updateFormData,
}: Step3DocumentsProps) {
  const certificateInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const idInputRef = useRef<HTMLInputElement>(null);
  
  const [certificatePreview, setCertificatePreview] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [idPreview, setIdPreview] = useState<string | null>(null);
  
  const [certificateUpload, setCertificateUpload] = useState<UploadState>({
    uploading: false,
    uploaded: false,
    error: null,
    url: null,
  });
  const [logoUpload, setLogoUpload] = useState<UploadState>({
    uploading: false,
    uploaded: false,
    error: null,
    url: null,
  });
  const [idUpload, setIdUpload] = useState<UploadState>({
    uploading: false,
    uploaded: false,
    error: null,
    url: null,
  });

  // Load previews from existing files or Cloudinary URLs
  useEffect(() => {
    if (formData.certificateOfRegistration) {
      const reader = new FileReader();
      reader.onloadend = () => setCertificatePreview(reader.result as string);
      reader.readAsDataURL(formData.certificateOfRegistration);
    } else if (certificateUpload.url) {
      setCertificatePreview(certificateUpload.url);
    }
    
    if (formData.ngoLogo) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(formData.ngoLogo);
    } else if (logoUpload.url) {
      setLogoPreview(logoUpload.url);
    }
    
    if (formData.adminIdentityVerification) {
      const reader = new FileReader();
      reader.onloadend = () => setIdPreview(reader.result as string);
      reader.readAsDataURL(formData.adminIdentityVerification);
    } else if (idUpload.url) {
      setIdPreview(idUpload.url);
    }
  }, [formData.certificateOfRegistration, formData.ngoLogo, formData.adminIdentityVerification, certificateUpload.url, logoUpload.url, idUpload.url]);

  // Update orgImageUrls when all uploads are complete
  useEffect(() => {
    const urls: string[] = [];
    if (certificateUpload.url) urls.push(certificateUpload.url);
    if (logoUpload.url) urls.push(logoUpload.url);
    if (idUpload.url) urls.push(idUpload.url);
    
    if (urls.length > 0) {
      updateFormData({ orgImageUrls: urls });
    }
  }, [certificateUpload.url, logoUpload.url, idUpload.url, updateFormData]);

  const uploadToCloudinary = async (file: File, type: ImageType): Promise<string> => {
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds 5MB limit. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB. Please compress or resize the image.`);
    }

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload/cloudinary", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to upload image");
    }

    if (!data.success || !data.url) {
      throw new Error("Invalid response from upload server");
    }

    return data.url;
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: ImageType
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Set preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === "certificate") {
        setCertificatePreview(reader.result as string);
        updateFormData({ certificateOfRegistration: file });
      } else if (type === "logo") {
        setLogoPreview(reader.result as string);
        updateFormData({ ngoLogo: file });
      } else {
        setIdPreview(reader.result as string);
        updateFormData({ adminIdentityVerification: file });
      }
    };
    reader.readAsDataURL(file);

    // Set uploading state
    if (type === "certificate") {
      setCertificateUpload({ uploading: true, uploaded: false, error: null, url: null });
    } else if (type === "logo") {
      setLogoUpload({ uploading: true, uploaded: false, error: null, url: null });
    } else {
      setIdUpload({ uploading: true, uploaded: false, error: null, url: null });
    }

    try {
      // Upload to Cloudinary
      const cloudinaryUrl = await uploadToCloudinary(file, type);

      // Update state with success
      if (type === "certificate") {
        setCertificateUpload({ uploading: false, uploaded: true, error: null, url: cloudinaryUrl });
      } else if (type === "logo") {
        setLogoUpload({ uploading: false, uploaded: true, error: null, url: cloudinaryUrl });
      } else {
        setIdUpload({ uploading: false, uploaded: true, error: null, url: cloudinaryUrl });
      }
    } catch (error) {
      console.error(`Failed to upload ${type}:`, error);
      const errorMessage = error instanceof Error ? error.message : "Failed to upload image";
      
      // Update state with error
      if (type === "certificate") {
        setCertificateUpload({ uploading: false, uploaded: false, error: errorMessage, url: null });
        setCertificatePreview(null);
        updateFormData({ certificateOfRegistration: undefined });
      } else if (type === "logo") {
        setLogoUpload({ uploading: false, uploaded: false, error: errorMessage, url: null });
        setLogoPreview(null);
        updateFormData({ ngoLogo: undefined });
      } else {
        setIdUpload({ uploading: false, uploaded: false, error: errorMessage, url: null });
        setIdPreview(null);
        updateFormData({ adminIdentityVerification: undefined });
      }
    }
  };

  const removeFile = (type: ImageType) => {
    if (type === "certificate") {
      setCertificatePreview(null);
      setCertificateUpload({ uploading: false, uploaded: false, error: null, url: null });
      updateFormData({ certificateOfRegistration: undefined });
    } else if (type === "logo") {
      setLogoPreview(null);
      setLogoUpload({ uploading: false, uploaded: false, error: null, url: null });
      updateFormData({ ngoLogo: undefined });
    } else {
      setIdPreview(null);
      setIdUpload({ uploading: false, uploaded: false, error: null, url: null });
      updateFormData({ adminIdentityVerification: undefined });
    }
    
    // Clear the input
    if (type === "certificate") {
      if (certificateInputRef.current) certificateInputRef.current.value = "";
    } else if (type === "logo") {
      if (logoInputRef.current) logoInputRef.current.value = "";
    } else {
      if (idInputRef.current) idInputRef.current.value = "";
    }
  };

  const getUploadState = (type: ImageType): UploadState => {
    if (type === "certificate") return certificateUpload;
    if (type === "logo") return logoUpload;
    return idUpload;
  };

  const renderFileUpload = (
    type: ImageType,
    label: string,
    description: string,
    inputRef: React.RefObject<HTMLInputElement>,
    preview: string | null
  ) => {
    const uploadState = getUploadState(type);

    return (
      <div>
        <label style={{ fontSize: "0.85em" }} className="block font-medium text-[#475068] mb-1">
          {label}
        </label>
        
        {/* Upload Status Messages */}
        {uploadState.uploading && (
          <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span style={{ fontSize: "0.8em" }} className="text-blue-700">
              Uploading image to our server... Please wait
            </span>
          </div>
        )}
        
        {uploadState.uploaded && uploadState.url && (
          <div className="mb-2 p-2 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircleIcon className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span style={{ fontSize: "0.8em" }} className="text-green-700">
              Image uploaded successfully
            </span>
          </div>
        )}
        
        {uploadState.error && (
          <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <ExclamationCircleIcon className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span style={{ fontSize: "0.8em" }} className="text-red-700 block">
                {uploadState.error}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (type === "certificate") certificateInputRef.current?.click();
                  else if (type === "logo") logoInputRef.current?.click();
                  else idInputRef.current?.click();
                }}
                style={{ fontSize: "0.75em" }}
                className="text-red-600 hover:text-red-800 underline mt-1"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {preview ? (
          <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-[#CAC4D0]">
            <Image
              src={preview}
              alt={label}
              fill
              className="object-contain"
            />
            {!uploadState.uploading && (
              <button
                type="button"
                onClick={() => removeFile(type)}
                className="absolute top-1.5 right-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full p-0.5 transition-colors"
              >
                <XMarkIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploadState.uploading}
            className="w-full p-4 rounded-lg border-2 border-dashed border-[#CAC4D0] hover:border-[#0350B5] transition-colors flex flex-col items-center justify-center gap-2 text-[#475068] hover:text-[#0350B5] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PhotoIcon className="w-6 h-6" />
            <span style={{ fontSize: "0.85em" }}>{description}</span>
            <span style={{ fontSize: "0.75em" }} className="text-[#475068]">
              PDF, JPG, or PNG (Max 5MB)
            </span>
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {renderFileUpload(
        "certificate",
        "Certificate of Registration",
        "Click to upload registration certificate",
        certificateInputRef,
        certificatePreview
      )}
      <input
        ref={certificateInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={(e) => handleFileUpload(e, "certificate")}
        className="hidden"
      />

      {renderFileUpload(
        "logo",
        "NGO Logo",
        "Click to upload your organization logo",
        logoInputRef,
        logoPreview
      )}
      <input
        ref={logoInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={(e) => handleFileUpload(e, "logo")}
        className="hidden"
      />

      {renderFileUpload(
        "id",
        "Admin Identity Verification",
        "Upload ID or passport of organization admin",
        idInputRef,
        idPreview
      )}
      <input
        ref={idInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={(e) => handleFileUpload(e, "id")}
        className="hidden"
      />
      
      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p style={{ fontSize: "0.75em" }} className="text-yellow-800">
          <strong>Note:</strong> Government-issued ID required. All images must be under 5MB.
        </p>
      </div>
    </div>
  );
}
