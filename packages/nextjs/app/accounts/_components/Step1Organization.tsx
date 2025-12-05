"use client";

import { NGOAccountData } from "../../../dashboard/ngo/setup";
import { useCountries } from "../../../hooks/useCountries";

interface Step1OrganizationProps {
  formData: NGOAccountData;
  updateFormData: (updates: Partial<NGOAccountData>) => void;
}

export default function Step1Organization({
  formData,
  updateFormData,
}: Step1OrganizationProps) {
  const { countries, loading } = useCountries();

  return (
    <div className="space-y-3">
      <div>
        <label style={{ fontSize: "0.85em" }} className="block font-medium text-[#475068] mb-1">
          Organization Name
        </label>
        <input
          type="text"
          value={formData.organizationName}
          onChange={(e) => updateFormData({ organizationName: e.target.value })}
          placeholder="Enter NGO name"
          style={{ fontSize: "0.9em", padding: "0.5em 0.75em" }}
          className="w-full border-2 border-[#CAC4D0] rounded-lg focus:outline-none focus:border-[#0350B5] transition-colors"
        />
      </div>

      <div>
        <label style={{ fontSize: "0.85em" }} className="block font-medium text-[#475068] mb-1">
          Year Established
        </label>
        <input
          type="number"
          value={formData.yearEstablished}
          onChange={(e) => updateFormData({ yearEstablished: e.target.value })}
          placeholder="Enter year (e.g., 2020)"
          min="1800"
          max={new Date().getFullYear()}
          style={{ fontSize: "0.9em", padding: "0.5em 0.75em" }}
          className="w-full border-2 border-[#CAC4D0] rounded-lg focus:outline-none focus:border-[#0350B5] transition-colors"
        />
        <p style={{ fontSize: "0.75em" }} className="text-[#475068] mt-1">
          Must be between 1800 and {new Date().getFullYear()}
        </p>
      </div>

      <div>
        <label style={{ fontSize: "0.85em" }} className="block font-medium text-[#475068] mb-1">
          Country of Operation
        </label>
        <div className="relative">
          <select
            value={formData.countryOfOperation}
            onChange={(e) => updateFormData({ countryOfOperation: e.target.value })}
            disabled={loading}
            style={{ fontSize: "0.9em", padding: "0.5em 0.75em" }}
            className="w-full border-2 border-[#CAC4D0] rounded-lg focus:outline-none focus:border-[#0350B5] transition-colors appearance-none bg-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {countries.map((country) => (
              <option key={country} value={country === "Select country" ? "" : country}>
                {loading && country === "Select country" ? "Loading countries..." : country}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg
              className="w-4 h-4 text-[#475068]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>

      <div>
        <label style={{ fontSize: "0.85em" }} className="block font-medium text-[#475068] mb-1">
          NGO Identification/Registration Number
        </label>
        <input
          type="text"
          value={formData.ngoRegistrationNumber}
          onChange={(e) => updateFormData({ ngoRegistrationNumber: e.target.value })}
          placeholder="Enter your official NGO registration number"
          style={{ fontSize: "0.9em", padding: "0.5em 0.75em" }}
          className="w-full border-2 border-[#CAC4D0] rounded-lg focus:outline-none focus:border-[#0350B5] transition-colors"
        />
      </div>

      <div>
        <label style={{ fontSize: "0.85em" }} className="block font-medium text-[#475068] mb-1">
          Mission Statement
        </label>
        <textarea
          value={formData.missionStatement}
          onChange={(e) => updateFormData({ missionStatement: e.target.value })}
          placeholder="A short paragraph about what you intend to achieve"
          rows={3}
          style={{ fontSize: "0.9em", padding: "0.5em 0.75em" }}
          className="w-full border-2 border-[#CAC4D0] rounded-lg focus:outline-none focus:border-[#0350B5] transition-colors resize-none"
        />
      </div>

      <div>
        <label style={{ fontSize: "0.85em" }} className="block font-medium text-[#475068] mb-1">
          Website / Social Links
        </label>
        <input
          type="text"
          value={formData.websiteSocialLinks}
          onChange={(e) => updateFormData({ websiteSocialLinks: e.target.value })}
          placeholder="Enter link"
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

