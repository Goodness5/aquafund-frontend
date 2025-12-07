import AquaFundBadgeAbi from "./abis/AquaFundBadge.json";
import AquaFundFactoryAbi from "./abis/AquaFundFactory.json";
import AquaFundProjectAbi from "./abis/AquaFundProject.json";
import AquaFundRegistryAbi from "./abis/AquaFundRegistry.json";
import OwnableAbi from "./abis/Ownable.json";

export type GenericContract = {
  address: `0x${string}`;
  abi: readonly unknown[];
};

export type GenericContractsDeclaration = {
  [chainId: number]: {
    [contractName: string]: GenericContract;
  };
};

const externalContracts = {
  97: {
    AquaFundRegistry: {
      address: "0xf171582a2FaFC0cb8d6436Eae9240920d511998a" as `0x${string}`,
      abi: AquaFundRegistryAbi,
    },
    AquaFundFactory: {
      address: "0x485B3c7C328bb9b62C1e5ce2906BC9Be7d589280" as `0x${string}`,
      abi: AquaFundFactoryAbi,
    },
    AquaFundProject: {
      address: "0xc9620e577D0C43B5D09AE8EA406eced818402739" as `0x${string}`,
      abi: AquaFundProjectAbi,
    },
    AquaFundBadge: {
      address: "0x1aF8c0651d1724EDf62410cb0B3C7cD459Ed9d2D" as `0x${string}`,
      abi: AquaFundBadgeAbi,
    },
  },
} as const satisfies GenericContractsDeclaration;

export default externalContracts;
export {
  AquaFundBadgeAbi,
  AquaFundFactoryAbi,
  AquaFundProjectAbi,
  AquaFundRegistryAbi,
  OwnableAbi,
};
