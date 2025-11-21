import type { Abi } from "viem";
import Ownable from "./Ownable.json";
import AquaFundBadge from "./AquaFundBadge.json";
import AquaFundRegistry from "./AquaFundRegistry.json";
import AquaFundFactory from "./AquaFundFactory.json";
import AquaFundProject from "./AquaFundProject.json";

export const OwnableAbi = Ownable as Abi;
export const AquaFundBadgeAbi = AquaFundBadge as Abi;
export const AquaFundRegistryAbi = AquaFundRegistry as Abi;
export const AquaFundFactoryAbi = AquaFundFactory as Abi;
export const AquaFundProjectAbi = AquaFundProject as Abi;

export const externalAbis: Record<string, Abi> = {
	Ownable: OwnableAbi,
	AquaFundBadge: AquaFundBadgeAbi,
	AquaFundRegistry: AquaFundRegistryAbi,
	AquaFundFactory: AquaFundFactoryAbi,
	AquaFundProject: AquaFundProjectAbi,
};

export type ExternalAbiNames = keyof typeof externalAbis;


