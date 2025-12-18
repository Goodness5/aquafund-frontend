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
      address: "0x86e63f4c3C132AA0fEA1B2980b7E8191f4Ee4825" as `0x${string}`,
      abi: AquaFundRegistryAbi,
    },
    AquaFundFactory: {
      address: "0x4c2aFA6e54024AB86168662AeAF5b295a2FF6E4C" as `0x${string}`,
      abi: AquaFundFactoryAbi,
    },
    AquaFundProject: {
      address: "0xFed99A6362fc4bDb4776Ec61Bb7612d5bf278CbF" as `0x${string}`,
      abi: AquaFundProjectAbi,
    },
    AquaFundBadge: {
      address: "0xee508704a55e1b623aB643E6A694Dbfe8355C157" as `0x${string}`,
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
