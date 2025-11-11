"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth/useScaffoldReadContract";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth/useScaffoldWriteContract";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";

export default function AdminConsole() {
  const { address } = useAccount();
  const { targetNetwork } = useTargetNetwork();

  const { data: defaultAdminRole } = (useScaffoldReadContract as any)({
    contractName: "AquaFundFactory",
    functionName: "DEFAULT_ADMIN_ROLE",
    chainId: targetNetwork.id,
  } as any);
  const { data: factoryAdminRole } = (useScaffoldReadContract as any)({
    contractName: "AquaFundFactory",
    functionName: "ADMIN_ROLE",
    chainId: targetNetwork.id,
  } as any);
  const { data: isDefaultAdmin } = (useScaffoldReadContract as any)({
    contractName: "AquaFundFactory",
    functionName: "hasRole",
    args: [defaultAdminRole, address],
    chainId: targetNetwork.id,
  } as any);
  const { data: isFactoryAdmin } = (useScaffoldReadContract as any)({
    contractName: "AquaFundFactory",
    functionName: "hasRole",
    args: [factoryAdminRole, address],
    chainId: targetNetwork.id,
  } as any);
  const { data: isAdminFlag } = (useScaffoldReadContract as any)({
    contractName: "AquaFundFactory",
    functionName: "isAdmin",
    args: [address],
    chainId: targetNetwork.id,
  } as any);
  const isAdmin = Boolean(isDefaultAdmin || isFactoryAdmin || isAdminFlag);

  const { writeContractAsync: writeFactory } = useScaffoldWriteContract({ contractName: "AquaFundFactory" });
  const [allowAll, setAllowAll] = useState(false);
  const [token, setToken] = useState("");
  const [newFee, setNewFee] = useState("");
  const [newTreasury, setNewTreasury] = useState("");
  const [newBadge, setNewBadge] = useState("");
  const [newRegistry, setNewRegistry] = useState("");
  const [adminAddr, setAdminAddr] = useState("");
  const [adminStatus, setAdminStatus] = useState(false);

  if (!isAdmin) {
    return <div className="container mx-auto px-4 py-8">You are not an Admin.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Platform Admin Console</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-base-100 rounded-xl p-5 shadow-md">
          <h2 className="text-lg font-semibold mb-3">Token Allowlist</h2>
          <div className="flex gap-2 items-center">
            <input
              className="input input-bordered flex-1"
              placeholder="Token address (0x...)"
              value={token}
              onChange={e => setToken(e.target.value)}
            />
            <button
              className="btn"
              onClick={() => (writeFactory as any)({ functionName: "addAllowedToken", args: [token] })}
            >
              Add
            </button>
          </div>
          <div className="form-control mt-3">
            <label className="label cursor-pointer justify-start gap-3">
              <input
                type="checkbox"
                className="checkbox"
                checked={allowAll}
                onChange={e => setAllowAll(e.target.checked)}
              />
              <span className="label-text">Allow all tokens</span>
            </label>
            <button
              className="btn btn-primary mt-2"
              onClick={() => (writeFactory as any)({ functionName: "setAllowAllTokens", args: [allowAll] })}
            >
              Save
            </button>
          </div>
        </section>

        <section className="bg-base-100 rounded-xl p-5 shadow-md">
          <h2 className="text-lg font-semibold mb-3">Treasury & Fee</h2>
          <div className="flex gap-2">
            <input
              className="input input-bordered flex-1"
              placeholder="New treasury (0x...)"
              value={newTreasury}
              onChange={e => setNewTreasury(e.target.value)}
            />
            <button
              className="btn"
              onClick={() => (writeFactory as any)({ functionName: "updateTreasury", args: [newTreasury] })}
            >
              Update
            </button>
          </div>
          <div className="flex gap-2 mt-3">
            <input
              className="input input-bordered flex-1"
              placeholder="New fee (wei)"
              value={newFee}
              onChange={e => setNewFee(e.target.value)}
            />
            <button
              className="btn"
              onClick={() => (writeFactory as any)({ functionName: "updateServiceFee", args: [BigInt(newFee || "0")] })}
            >
              Update
            </button>
          </div>
        </section>

        <section className="bg-base-100 rounded-xl p-5 shadow-md">
          <h2 className="text-lg font-semibold mb-3">Contracts</h2>
          <div className="flex gap-2">
            <input
              className="input input-bordered flex-1"
              placeholder="Badge contract (0x...)"
              value={newBadge}
              onChange={e => setNewBadge(e.target.value)}
            />
            <button
              className="btn"
              onClick={() => (writeFactory as any)({ functionName: "setBadgeContract", args: [newBadge] })}
            >
              Set Badge
            </button>
          </div>
          <div className="flex gap-2 mt-3">
            <input
              className="input input-bordered flex-1"
              placeholder="Registry contract (0x...)"
              value={newRegistry}
              onChange={e => setNewRegistry(e.target.value)}
            />
            <button
              className="btn"
              onClick={() => (writeFactory as any)({ functionName: "setRegistry", args: [newRegistry] })}
            >
              Set Registry
            </button>
          </div>
        </section>

        <section className="bg-base-100 rounded-xl p-5 shadow-md">
          <h2 className="text-lg font-semibold mb-3">Admins</h2>
          <div className="flex gap-2 items-center">
            <input
              className="input input-bordered flex-1"
              placeholder="Admin address"
              value={adminAddr}
              onChange={e => setAdminAddr(e.target.value)}
            />
            <label className="label cursor-pointer gap-2">
              <span className="label-text">Active</span>
              <input
                type="checkbox"
                className="checkbox"
                checked={adminStatus}
                onChange={e => setAdminStatus(e.target.checked)}
              />
            </label>
            <button
              className="btn"
              onClick={() =>
                (writeFactory as any)({ functionName: "updateAdminStatus", args: [adminAddr, adminStatus] })
              }
            >
              Save
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
