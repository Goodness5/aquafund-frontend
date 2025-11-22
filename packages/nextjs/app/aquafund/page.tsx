"use client";

import Link from "next/link";

export default function AquaFundContractsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">AquaFund</h1>
      <p className="opacity-80">Use the dedicated pages below to interact with the protocol.</p>
      <ul className="mt-6 space-y-3">
        <li>
          <Link className="link" href="/projects">
            Browse Projects
          </Link>
        </li>
        <li>
          <Link className="link" href="/start">
            Start a Fundraiser
          </Link>
        </li>
        <li>
          <Link className="link" href="/ngo">
            NGO Console
          </Link>
        </li>
        <li>
          <Link className="link" href="/admin">
            Admin Console
          </Link>
        </li>
      </ul>
    </div>
  );
}
