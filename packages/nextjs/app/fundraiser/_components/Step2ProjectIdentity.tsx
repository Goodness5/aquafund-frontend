"use client";

import { FundraiserFormData } from "../create/page";

interface Step2ProjectIdentityProps {
  formData: FundraiserFormData;
  updateFormData: (updates: Partial<FundraiserFormData>) => void;
}

const categories = [
  { id: "water-wells", label: "Water Wells" },
  { id: "borehole-drilling", label: "Borehole Drilling" },
  { id: "hand-pump", label: "Hand pump installations" },
  { id: "water-filters", label: "Water Filters" },
  { id: "pipeline-repair", label: "Pipeline Repair" },
  { id: "water-tanks", label: "Water Tanks" },
  { id: "purification", label: "Purification" },
  { id: "rehydration", label: "Rehydration Station" },
  { id: "greywater", label: "Greywater Recycling" },
  { id: "water-recycling", label: "Water Recycling" },
];

export default function Step2ProjectIdentity({
  formData,
  updateFormData,
}: Step2ProjectIdentityProps) {
  return (
    <div className="space-y-3">
      {/* Campaign Title */}
      <div>
        <label style={{ fontSize: "0.85em" }} className="block font-medium text-[#475068] mb-1">
          Campaign Title
        </label>
        <input
          type="text"
          value={formData.campaignTitle}
          onChange={(e) => updateFormData({ campaignTitle: e.target.value })}
          placeholder="E.g., 'Clean Water for Ibadan's Children'"
          style={{ fontSize: "0.9em", padding: "0.5em 0.75em" }}
          className="w-full border-2 border-[#CAC4D0] rounded-lg focus:outline-none focus:border-[#0350B5] transition-colors"
        />
      </div>

      {/* Goal Amount */}
      <div>
        <label style={{ fontSize: "0.85em" }} className="block font-medium text-[#475068] mb-1">
          Goal Amount
        </label>
        <div className="relative">
          <span style={{ fontSize: "0.9em" }} className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-[#475068] font-medium">
            $
          </span>
          <input
            type="number"
            value={formData.goalAmount}
            onChange={(e) => updateFormData({ goalAmount: e.target.value })}
            placeholder="0.00"
            min="0"
            step="0.01"
            style={{ fontSize: "0.9em", padding: "0.5em 0.75em 0.5em 1.5em" }}
            className="w-full border-2 border-[#CAC4D0] rounded-lg focus:outline-none focus:border-[#0350B5] transition-colors"
          />
        </div>
      </div>

      {/* Category Selection */}
      <div>
        <label style={{ fontSize: "0.85em" }} className="block font-medium text-[#475068] mb-1.5">
          Select Category
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => updateFormData({ category: category.id })}
              style={{ fontSize: "0.8em", padding: "0.45em 0.65em" }}
              className={`rounded-full border-2 transition-all font-medium ${
                formData.category === category.id
                  ? "bg-[#E1FFFF] text-[#0350B5] border-[#0350B5]"
                  : "bg-white text-[#475068] border-[#CAC4D0] hover:border-[#0350B5]"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

