"use client";

import { useState } from "react";
import { parseEther, zeroHash } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth/useScaffoldWriteContract";

export default function StartFundraiserPage() {
  const { address } = useAccount();
  const { writeContractAsync: writeFactory } = useScaffoldWriteContract({ contractName: "AquaFundFactory" });
  const [goal, setGoal] = useState("10");
  const [meta, setMeta] = useState("");
  const [admin, setAdmin] = useState<string>("");

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Start a Fundraiser</h1>
      <div className="bg-base-100 rounded-xl p-6 shadow-md max-w-xl">
        <div className="form-control gap-4">
          <label className="label">
            <span className="label-text">Admin Address</span>
          </label>
          <input
            className="input input-bordered"
            placeholder="0x..."
            value={admin}
            onChange={e => setAdmin(e.target.value)}
          />

          <label className="label">
            <span className="label-text">Funding Goal (BNB)</span>
          </label>
          <input
            className="input input-bordered"
            placeholder="10"
            value={goal}
            onChange={e => setGoal(e.target.value)}
          />

          <label className="label">
            <span className="label-text">Metadata Hash (bytes32 hex)</span>
          </label>
          <input
            className="input input-bordered"
            placeholder={zeroHash}
            value={meta}
            onChange={e => setMeta(e.target.value)}
          />

          <button
            className="btn btn-primary mt-2"
            onClick={async () => {
              await (writeFactory as any)({
                functionName: "createProject",
                args: [admin || address, parseEther(goal || "0"), meta as `0x${string}`],
              });
            }}
          >
            Create Project
          </button>
        </div>
      </div>
    </div>
  );
}
