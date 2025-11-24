"use client";

import { NGOAccountData } from "../../ngo/get-started/page";

interface Step2ContactInfoProps {
  formData: NGOAccountData;
  updateFormData: (updates: Partial<NGOAccountData>) => void;
}

export default function Step2ContactInfo({
  formData,
  updateFormData,
}: Step2ContactInfoProps) {
  return (
    <div className="space-y-3">
      <div>
        <label style={{ fontSize: "0.85em" }} className="block font-medium text-[#475068] mb-1">
          Contact Person Name
        </label>
        <input
          type="text"
          value={formData.contactPersonName}
          onChange={(e) => updateFormData({ contactPersonName: e.target.value })}
          placeholder="Enter full name"
          style={{ fontSize: "0.9em", padding: "0.5em 0.75em" }}
          className="w-full border-2 border-[#CAC4D0] rounded-lg focus:outline-none focus:border-[#0350B5] transition-colors"
        />
      </div>

      <div>
        <label style={{ fontSize: "0.85em" }} className="block font-medium text-[#475068] mb-1">
          Position / Role
        </label>
        <input
          type="text"
          value={formData.position}
          onChange={(e) => updateFormData({ position: e.target.value })}
          placeholder="Enter role"
          style={{ fontSize: "0.9em", padding: "0.5em 0.75em" }}
          className="w-full border-2 border-[#CAC4D0] rounded-lg focus:outline-none focus:border-[#0350B5] transition-colors"
        />
      </div>

      <div>
        <label style={{ fontSize: "0.85em" }} className="block font-medium text-[#475068] mb-1">
          Phone Number
        </label>
        <input
          type="tel"
          value={formData.phoneNumber}
          onChange={(e) => updateFormData({ phoneNumber: e.target.value })}
          placeholder="Enter phone number"
          style={{ fontSize: "0.9em", padding: "0.5em 0.75em" }}
          className="w-full border-2 border-[#CAC4D0] rounded-lg focus:outline-none focus:border-[#0350B5] transition-colors"
        />
      </div>

      <div>
        <label style={{ fontSize: "0.85em" }} className="block font-medium text-[#475068] mb-1">
          Address
        </label>
        <input
          type="text"
          value={formData.residentialAddress}
          onChange={(e) => updateFormData({ residentialAddress: e.target.value })}
          placeholder="Enter current residential address of contact person"
          style={{ fontSize: "0.9em", padding: "0.5em 0.75em" }}
          className="w-full border-2 border-[#CAC4D0] rounded-lg focus:outline-none focus:border-[#0350B5] transition-colors"
        />
      </div>

      <div>
        <label style={{ fontSize: "0.85em" }} className="block font-medium text-[#475068] mb-1">
          Email Address
        </label>
        <input
          type="email"
          value={formData.contactEmail}
          onChange={(e) => updateFormData({ contactEmail: e.target.value })}
          placeholder="Enter email address"
          style={{ fontSize: "0.9em", padding: "0.5em 0.75em" }}
          className="w-full border-2 border-[#CAC4D0] rounded-lg focus:outline-none focus:border-[#0350B5] transition-colors"
        />
      </div>

      <p style={{ fontSize: "0.8em" }} className="text-[#475068] text-center mt-4">
        By clicking &apos;Continue&apos;, you agree to the{" "}
        <a href="/terms" className="text-[#0350B5] hover:underline">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="/privacy" className="text-[#0350B5] hover:underline">
          Privacy Policy
        </a>
        , and confirm that your organization will use AquaFund responsibly and will not collect PII or handle sensitive data without proper authorization.
      </p>
    </div>
  );
}

