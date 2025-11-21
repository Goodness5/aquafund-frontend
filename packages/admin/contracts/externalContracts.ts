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
      address: "0xc9620e577D0C43B5D09AE8EA406eced818402739" as `0x${string}`,
      abi: AquaFundRegistryAbi,
    },
    AquaFundFactory: {
      address: "0x5ba2d923f8b1E392997D87060E207E1BAAeA3E13" as `0x${string}`,
      abi: AquaFundFactoryAbi,
    },
    AquaFundProject: {
      address: "0x7ff31538A93950264e26723C959a9D196bfB9779" as `0x${string}`,
      abi: AquaFundProjectAbi,
    },
    AquaFundBadge: {
      address: "0x55633aFf235600374Ef58D2A5e507Aa39C9e0D37" as `0x${string}`,
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
