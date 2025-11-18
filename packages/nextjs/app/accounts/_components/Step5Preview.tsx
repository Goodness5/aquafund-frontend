"use client";

import { PencilIcon } from "@heroicons/react/24/outline";
import { NGOAccountData } from "../get-started/page";

interface Step5PreviewProps {
  formData: NGOAccountData;
  updateFormData: (updates: Partial<NGOAccountData>) => void;
}

export default function Step5Preview({ formData }: Step5PreviewProps) {
  const InfoCard = ({
    title,
    data,
    onEdit,
  }: {
    title: string;
    data: Record<string, string>;
    onEdit: () => void;
  }) => {
    return (
      <div className="border-2 border-[#CAC4D0] rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <h4 style={{ fontSize: "1em" }} className="font-semibold text-[#001627]">
            {title}
          </h4>
          <button
            onClick={onEdit}
            className="flex items-center gap-1 text-[#0350B5] hover:underline"
            style={{ fontSize: "0.85em" }}
          >
            <PencilIcon className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
        </div>
        <div className="space-y-1.5">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} style={{ fontSize: "0.85em" }} className="text-[#475068]">
              <span className="font-medium">{key}:</span> {value || "Not provided"}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <div className="w-full h-px bg-[#0350B5] mb-3"></div>

      <InfoCard
        title="NGO Information"
        data={{
          "Organization Name": formData.organizationName,
          "Year Established": formData.yearEstablished,
          "Country of Operation": formData.countryOfOperation,
          "NGO Identification/Registration Number": formData.ngoRegistrationNumber,
          "Email Address": formData.email,
          "Mission Statement": formData.missionStatement,
          "Website/Social Links": formData.websiteSocialLinks,
        }}
        onEdit={() => {}}
      />

      <InfoCard
        title="Contact Person Information"
        data={{
          "Contact Person Name": formData.contactPersonName,
          Position: formData.position,
          "Phone Number": formData.phoneNumber,
          "Residential Address": formData.residentialAddress,
          "Email Address": formData.contactEmail,
        }}
        onEdit={() => {}}
      />

      <InfoCard
        title="Organization Documents"
        data={{
          "Organization Name": formData.organizationName,
          "Country of Operation": formData.countryOfOperation,
          "Email Address": formData.email,
        }}
        onEdit={() => {}}
      />

      <InfoCard
        title="Wallet Setup"
        data={{
          "Connected Wallet": formData.walletAddress ? "Metamask" : "Not connected",
        }}
        onEdit={() => {}}
      />

      <p style={{ fontSize: "0.8em" }} className="text-[#475068] text-center mt-4">
        By clicking &apos;Submit for Review&apos;, you agree to AquaFund&apos;s{" "}
        <a href="/terms" className="text-[#0350B5] hover:underline">
          Terms
        </a>{" "}
        and{" "}
        <a href="/privacy" className="text-[#0350B5] hover:underline">
          Privacy Policy
        </a>
        .
      </p>
    </div>
  );
}

