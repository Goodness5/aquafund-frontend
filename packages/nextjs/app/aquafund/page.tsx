"use client";

import Link from "next/link";

export default function AquaFundContractsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">AquaFund Console</h1>
      <div className="space-y-5">
        <Link href="/projects" className="btn btn-primary">
          Browse Projects
        </Link>
        <Link href="/start" className="btn">
          Start a Fundraiser
        </Link>
        <Link href="/dashboard" className="btn">
          Dashboard
        </Link>
        <Link href="/ngo" className="btn">
          NGO Console
        </Link>
        <Link href="/admin" className="btn">
          Admin Console
        </Link>
      </div>
    </div>
  );
}
