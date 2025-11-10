"use client";

import { ContractUI } from "../debug/_components/ContractUI";

export default function AquaFundContractsPage() {
	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="text-3xl font-bold mb-6">AquaFund Contracts (BNB Testnet)</h1>

			<div className="space-y-12">
				<section>
					<h2 className="text-xl font-semibold mb-3">AquaFundRegistry</h2>
					<ContractUI contractName={"AquaFundRegistry"} />
				</section>

				<section>
					<h2 className="text-xl font-semibold mb-3">AquaFundFactory</h2>
					<ContractUI contractName={"AquaFundFactory"} />
				</section>

				<section>
					<h2 className="text-xl font-semibold mb-3">AquaFundBadge</h2>
					<ContractUI contractName={"AquaFundBadge"} />
				</section>

				<section>
					<h2 className="text-xl font-semibold mb-3">AquaFundProject</h2>
					<ContractUI contractName={"AquaFundProject"} />
				</section>
			</div>
		</div>
	);
}


