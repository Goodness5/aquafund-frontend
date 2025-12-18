import { GenericContractsDeclaration } from "~~/utils/scaffold-eth/contract";
import {
	externalAbis,
	AquaFundBadgeAbi,
	AquaFundFactoryAbi,
	AquaFundProjectAbi,
	AquaFundRegistryAbi,
	OwnableAbi,
} from "./abis";

/**
 * @example
 * const externalContracts = {
 *   1: {
 *     DAI: {
 *       address: "0x...",
 *       abi: [...],
 *     },
 *   },
 * } as const;
 */
const externalContracts = {
	97: {
		AquaFundRegistry: {
			address: "0x86e63f4c3C132AA0fEA1B2980b7E8191f4Ee4825",
			abi: AquaFundRegistryAbi,
		},
		AquaFundFactory: {
			address: "0x4c2aFA6e54024AB86168662AeAF5b295a2FF6E4C",
			abi: AquaFundFactoryAbi,
		},
		AquaFundProject: {
			address: "0xFed99A6362fc4bDb4776Ec61Bb7612d5bf278CbF",
			abi: AquaFundProjectAbi,
		},
		AquaFundBadge: {
			address: "0xee508704a55e1b623aB643E6A694Dbfe8355C157",
			abi: AquaFundBadgeAbi,
		},
	},
} as const;

export default externalContracts satisfies GenericContractsDeclaration;
export {
	externalAbis,
	AquaFundBadgeAbi,
	AquaFundFactoryAbi,
	AquaFundProjectAbi,
	AquaFundRegistryAbi,
	OwnableAbi,
};
