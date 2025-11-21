"use client";

import { useRef, useState, useEffect } from "react";
import { PhotoIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { NGOAccountData } from "../get-started/page";

interface Step3DocumentsProps {
  formData: NGOAccountData;
  updateFormData: (updates: Partial<NGOAccountData>) => void;
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

  // Helper function to check if value is a File or Blob
  const isFileOrBlob = (value: unknown): value is File | Blob => {
    return value instanceof File || value instanceof Blob;
  };

  // Load previews from existing files or base64 strings
  useEffect(() => {
    // Use base64 strings if available (from localStorage), otherwise read from File objects
    if (formData.certificateOfRegistrationBase64) {
      setCertificatePreview(formData.certificateOfRegistrationBase64);
    } else if (formData.certificateOfRegistration && isFileOrBlob(formData.certificateOfRegistration)) {
      const reader = new FileReader();
      reader.onloadend = () => setCertificatePreview(reader.result as string);
      reader.readAsDataURL(formData.certificateOfRegistration);
    }
    
    if (formData.ngoLogoBase64) {
      setLogoPreview(formData.ngoLogoBase64);
    } else if (formData.ngoLogo && isFileOrBlob(formData.ngoLogo)) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(formData.ngoLogo);
    }
    
    if (formData.adminIdentityVerificationBase64) {
      setIdPreview(formData.adminIdentityVerificationBase64);
    } else if (formData.adminIdentityVerification && isFileOrBlob(formData.adminIdentityVerification)) {
      const reader = new FileReader();
      reader.onloadend = () => setIdPreview(reader.result as string);
      reader.readAsDataURL(formData.adminIdentityVerification);
    }
  }, [
    formData.certificateOfRegistration, 
    formData.certificateOfRegistrationBase64,
    formData.ngoLogo, 
    formData.ngoLogoBase64,
    formData.adminIdentityVerification,
    formData.adminIdentityVerificationBase64
  ]);

  // Helper function to compress image
  // Using aggressive compression to reduce payload size: 800x800 max, 0.5 quality
  const compressImage = (file: File, maxWidth: number = 800, maxHeight: number = 800, quality: number = 0.5): Promise<File> => {
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
              const compressedFile = new File([blob], file.name, {
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

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "certificate" | "logo" | "id"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Compress image before storing
        const compressedFile = await compressImage(file);
        
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          if (type === "certificate") {
            setCertificatePreview(base64String);
            updateFormData({ 
              certificateOfRegistration: compressedFile,
              certificateOfRegistrationBase64: base64String 
            });
          } else if (type === "logo") {
            setLogoPreview(base64String);
            updateFormData({ 
              ngoLogo: compressedFile,
              ngoLogoBase64: base64String 
            });
          } else {
            setIdPreview(base64String);
            updateFormData({ 
              adminIdentityVerification: compressedFile,
              adminIdentityVerificationBase64: base64String 
            });
          }
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error('Failed to compress image:', error);
        // Fallback to original file if compression fails
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          if (type === "certificate") {
            setCertificatePreview(base64String);
            updateFormData({ 
              certificateOfRegistration: file,
              certificateOfRegistrationBase64: base64String 
            });
          } else if (type === "logo") {
            setLogoPreview(base64String);
            updateFormData({ 
              ngoLogo: file,
              ngoLogoBase64: base64String 
            });
          } else {
            setIdPreview(base64String);
            updateFormData({ 
              adminIdentityVerification: file,
              adminIdentityVerificationBase64: base64String 
            });
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const removeFile = (type: "certificate" | "logo" | "id") => {
    if (type === "certificate") {
      setCertificatePreview(null);
      updateFormData({ 
        certificateOfRegistration: undefined,
        certificateOfRegistrationBase64: undefined 
      });
    } else if (type === "logo") {
      setLogoPreview(null);
      updateFormData({ 
        ngoLogo: undefined,
        ngoLogoBase64: undefined 
      });
    } else {
      setIdPreview(null);
      updateFormData({ 
        adminIdentityVerification: undefined,
        adminIdentityVerificationBase64: undefined 
      });
    }
  };

  return (
    <div className="space-y-3">
      {/* Certificate of Registration */}
      <div>
        <label style={{ fontSize: "0.85em" }} className="block font-medium text-[#475068] mb-1">
          Certificate of Registration
        </label>
        {certificatePreview ? (
          <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-[#CAC4D0]">
            <Image
              src={certificatePreview}
              alt="Certificate"
              fill
              className="object-contain"
            />
            <button
              type="button"
              onClick={() => removeFile("certificate")}
              className="absolute top-1.5 right-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full p-0.5 transition-colors"
            >
              <XMarkIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => certificateInputRef.current?.click()}
            className="w-full p-4 rounded-lg border-2 border-dashed border-[#CAC4D0] hover:border-[#0350B5] transition-colors flex flex-col items-center justify-center gap-2 text-[#475068] hover:text-[#0350B5]"
          >
            <PhotoIcon className="w-6 h-6" />
            <span style={{ fontSize: "0.85em" }}>Click to upload registration certificate</span>
            <span style={{ fontSize: "0.75em" }} className="text-[#475068]">
              PDF, JPG, or PNG (Max 10MB)
            </span>
          </button>
        )}
        <input
          ref={certificateInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => handleFileUpload(e, "certificate")}
          className="hidden"
        />
      </div>

      {/* NGO Logo */}
      <div>
        <label style={{ fontSize: "0.85em" }} className="block font-medium text-[#475068] mb-1">
          NGO Logo
        </label>
        {logoPreview ? (
          <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-[#CAC4D0]">
            <Image
              src={logoPreview}
              alt="Logo"
              fill
              className="object-contain"
            />
            <button
              type="button"
              onClick={() => removeFile("logo")}
              className="absolute top-1.5 right-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full p-0.5 transition-colors"
            >
              <XMarkIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => logoInputRef.current?.click()}
            className="w-full p-4 rounded-lg border-2 border-dashed border-[#CAC4D0] hover:border-[#0350B5] transition-colors flex flex-col items-center justify-center gap-2 text-[#475068] hover:text-[#0350B5]"
          >
            <PhotoIcon className="w-6 h-6" />
            <span style={{ fontSize: "0.85em" }}>Click to upload your organization logo</span>
            <span style={{ fontSize: "0.75em" }} className="text-[#475068]">
              PDF, JPG, or PNG (Max 10MB)
            </span>
          </button>
        )}
        <input
          ref={logoInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => handleFileUpload(e, "logo")}
          className="hidden"
        />
      </div>

      {/* Admin Identity Verification */}
      <div>
        <label style={{ fontSize: "0.85em" }} className="block font-medium text-[#475068] mb-1">
          Admin Identity Verification
        </label>
        {idPreview ? (
          <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-[#CAC4D0]">
            <Image
              src={idPreview}
              alt="ID"
              fill
              className="object-contain"
            />
            <button
              type="button"
              onClick={() => removeFile("id")}
              className="absolute top-1.5 right-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full p-0.5 transition-colors"
            >
              <XMarkIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => idInputRef.current?.click()}
            className="w-full p-4 rounded-lg border-2 border-dashed border-[#CAC4D0] hover:border-[#0350B5] transition-colors flex flex-col items-center justify-center gap-2 text-[#475068] hover:text-[#0350B5]"
          >
            <PhotoIcon className="w-6 h-6" />
            <span style={{ fontSize: "0.85em" }}>Upload ID or passport of organization admin</span>
            <span style={{ fontSize: "0.75em" }} className="text-[#475068]">
              Government-issued ID required
            </span>
            <span style={{ fontSize: "0.75em" }} className="text-[#475068]">
              PDF, JPG, or PNG (Max 10MB)
            </span>
          </button>
        )}
        <input
          ref={idInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => handleFileUpload(e, "id")}
          className="hidden"
        />
      </div>
    </div>
  );
}

