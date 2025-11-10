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
			address: "0xc9620e577D0C43B5D09AE8EA406eced818402739",
			abi: AquaFundRegistryAbi,
		},
		AquaFundFactory: {
			address: "0x5ba2d923f8b1E392997D87060E207E1BAAeA3E13",
			abi: AquaFundFactoryAbi,
		},
		AquaFundProject: {
			address: "0x0000000000000000000000000000000000000000",
			abi: AquaFundProjectAbi,
		},
		AquaFundBadge: {
			address: "0x55633aFf235600374Ef58D2A5e507Aa39C9e0D37",
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
