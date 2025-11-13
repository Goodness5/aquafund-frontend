"use client";

import { formatEther } from "viem";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth/useScaffoldReadContract";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";

export function StatsBand() {
  const { targetNetwork } = useTargetNetwork();
  const { data: stats } = (useScaffoldReadContract as any)({
    contractName: "AquaFundRegistry",
    functionName: "getPlatformStats",
    chainId: targetNetwork.id,
  });
  const s: any = stats;
  return (
    <section
      aria-label="Platform statistics"
      className="w-full border-y border-[#CAC4D099] bg-[#CFFED914] text-[color:var(--color-base-content)]"
    >
      <div className="container mx-auto grid gap-6 px-4 py-10 text-center sm:grid-cols-3">
        <Stat
          label="Raised in BNB"
          value={s ? `${formatEther(s.totalFundsRaised as bigint)}` : null}
          prefix="₿"
          description="Total value streamed to AquaFund projects"
        />
        <Stat
          label="Donations Made"
          value={s?.totalDonations}
          description="On-chain contributions recorded transparently"
        />
        <Stat
          label="People Helped"
          value={s?.totalDonors}
          description="Supporters powering long-term water access"
        />
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  prefix,
  description,
}: {
  label: string;
  value?: string | number | null;
  prefix?: string;
  description?: string;
}) {
  const isLoading = value === undefined || value === null;
  return (
    <div className="space-y-2 rounded-3xl border border-[#CAC4D0] bg-[color:var(--af-surface)] px-6 py-6 shadow-sm">
      <div className="text-3xl font-extrabold text-[color:var(--af-accent)] md:text-4xl">
        {isLoading ? (
          <span className="inline-block h-6 w-24 animate-pulse rounded-full bg-base-300/70" aria-hidden />
        ) : (
          <>
            {prefix}
            {value}
          </>
        )}
      </div>
      <div className="text-sm font-medium uppercase tracking-wide text-[#0350b5]">{label}</div>
      {description ? <p className="text-xs text-[#001627b3]">{description}</p> : null}
    </div>
  );
}
