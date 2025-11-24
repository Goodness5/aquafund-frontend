"use client";

import { useRef, useState, useEffect } from "react";
import { PhotoIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { NGOAccountData } from "../../ngo/get-started/page";

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

  // Load previews from existing files
  useEffect(() => {
    if (formData.certificateOfRegistration) {
      const reader = new FileReader();
      reader.onloadend = () => setCertificatePreview(reader.result as string);
      reader.readAsDataURL(formData.certificateOfRegistration);
    }
    if (formData.ngoLogo) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(formData.ngoLogo);
    }
    if (formData.adminIdentityVerification) {
      const reader = new FileReader();
      reader.onloadend = () => setIdPreview(reader.result as string);
      reader.readAsDataURL(formData.adminIdentityVerification);
    }
  }, [formData.certificateOfRegistration, formData.ngoLogo, formData.adminIdentityVerification]);

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "certificate" | "logo" | "id"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
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
    }
  };

  const removeFile = (type: "certificate" | "logo" | "id") => {
    if (type === "certificate") {
      setCertificatePreview(null);
      updateFormData({ certificateOfRegistration: undefined });
    } else if (type === "logo") {
      setLogoPreview(null);
      updateFormData({ ngoLogo: undefined });
    } else {
      setIdPreview(null);
      updateFormData({ adminIdentityVerification: undefined });
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

