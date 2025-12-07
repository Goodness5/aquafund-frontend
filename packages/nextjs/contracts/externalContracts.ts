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
			address: "0xf171582a2FaFC0cb8d6436Eae9240920d511998a",
			abi: AquaFundRegistryAbi,
		},
		AquaFundFactory: {
			address: "0x485B3c7C328bb9b62C1e5ce2906BC9Be7d589280",
			abi: AquaFundFactoryAbi,
		},
		AquaFundProject: {
			address: "0xc9620e577D0C43B5D09AE8EA406eced818402739",
			abi: AquaFundProjectAbi,
		},
		AquaFundBadge: {
			address: "0x1aF8c0651d1724EDf62410cb0B3C7cD459Ed9d2D",
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
