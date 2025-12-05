"use client";

import { useRef, useState } from "react";
import { PhotoIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { FundraiserFormData } from "../create/page";

interface Step3TellUsMoreProps {
  formData: FundraiserFormData;
  updateFormData: (updates: Partial<FundraiserFormData>) => void;
}

export default function Step3TellUsMore({
  formData,
  updateFormData,
}: Step3TellUsMoreProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newFiles = [...formData.images, ...files];
      updateFormData({ images: newFiles });

      // Create previews
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    updateFormData({ images: newImages });
    setImagePreviews(newPreviews);
  };

  return (
    <div className="space-y-3">
      {/* Image Upload Section */}
      <div>
        <p style={{ fontSize: "0.85em" }} className="text-[#475068] mb-2">
          Images tell stories better, upload images here and tell your story.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {/* Existing Images */}
          {imagePreviews.map((preview, index) => (
            <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 border-[#CAC4D0]">
              <Image
                src={preview}
                alt={`Upload ${index + 1}`}
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1.5 right-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full p-0.5 transition-colors"
              >
                <XMarkIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {/* Upload Button */}
          {imagePreviews.length < 6 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-lg border-2 border-dashed border-[#CAC4D0] hover:border-[#0350B5] transition-colors flex flex-col items-center justify-center gap-1 text-[#475068] hover:text-[#0350B5]"
            >
              <PhotoIcon className="w-5 h-5" />
              <span style={{ fontSize: "0.8em" }}>Add Image</span>
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>

      {/* Description */}
      <div>
        <label style={{ fontSize: "0.85em" }} className="block font-medium text-[#475068] mb-1">
          Fundraiser Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => updateFormData({ description: e.target.value })}
          placeholder="Tell donors why this project matters"
          rows={3}
          style={{ fontSize: "0.9em", padding: "0.5em 0.75em" }}
          className="w-full border-2 border-[#CAC4D0] rounded-lg focus:outline-none focus:border-[#0350B5] transition-colors resize-none"
        />
      </div>
    </div>
  );
}

