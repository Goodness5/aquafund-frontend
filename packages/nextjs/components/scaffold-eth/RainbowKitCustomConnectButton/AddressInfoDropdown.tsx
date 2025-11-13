import { useRef, useState } from "react";
import { NetworkOptions } from "./NetworkOptions";
import { getAddress } from "viem";
import { Address } from "viem";
import { useAccount, useDisconnect } from "wagmi";
import {
  ArrowLeftOnRectangleIcon,
  ArrowTopRightOnSquareIcon,
  ArrowsRightLeftIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  QrCodeIcon,
} from "@heroicons/react/24/outline";
import { BlockieAvatar } from "~~/components/scaffold-eth";
import { useCopyToClipboard, useOutsideClick } from "~~/hooks/scaffold-eth";
import { getTargetNetworks } from "~~/utils/scaffold-eth";
import { isENS } from "~~/utils/scaffold-eth/common";

const BURNER_WALLET_ID = "burnerWallet";

const allowedNetworks = getTargetNetworks();

type AddressInfoDropdownProps = {
  address: Address;
  blockExplorerAddressLink: string | undefined;
  displayName: string;
  ensAvatar?: string;
  onOpenQrModal: () => void;
  onRevealBurnerPk: () => void;
};

export const AddressInfoDropdown = ({
  address,
  ensAvatar,
  displayName,
  blockExplorerAddressLink,
  onOpenQrModal,
  onRevealBurnerPk,
}: AddressInfoDropdownProps) => {
  const { disconnect } = useDisconnect();
  const { connector } = useAccount();
  const checkSumAddress = getAddress(address);

  const { copyToClipboard: copyAddressToClipboard, isCopiedToClipboard: isAddressCopiedToClipboard } =
    useCopyToClipboard();
  const [selectingNetwork, setSelectingNetwork] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const closeDropdown = () => {
    setIsOpen(false);
    setSelectingNetwork(false);
  };

  useOutsideClick(dropdownRef, closeDropdown);

  return (
    <>
      <div ref={dropdownRef} className="relative leading-3">
        <button
          type="button"
          className="btn btn-secondary btn-sm pl-0 pr-2 gap-1"
          onClick={() => {
            if (isOpen) {
              closeDropdown();
            } else {
              setSelectingNetwork(false);
              setIsOpen(true);
            }
          }}
        >
          <BlockieAvatar address={checkSumAddress} size={30} ensImage={ensAvatar} />
          <span className="ml-2 mr-1">
            {isENS(displayName) ? displayName : checkSumAddress?.slice(0, 6) + "..." + checkSumAddress?.slice(-4)}
          </span>
          <ChevronDownIcon className="h-6 w-4 ml-2 sm:ml-0" />
        </button>
        {isOpen ? (
          <div className="dropdown-content dropdown-panel right-0 z-50 mt-2 min-w-[16rem]">
            <ul className="menu gap-1">
              <NetworkOptions
                hidden={!selectingNetwork}
                onSelect={() => {
                  closeDropdown();
                }}
              />
              {!selectingNetwork && (
                <>
                  <li>
                    <button
                      className="menu-item flex items-center gap-3 px-3 py-2 text-sm"
                      type="button"
                      onClick={() => copyAddressToClipboard(checkSumAddress)}
                    >
                      {isAddressCopiedToClipboard ? (
                        <>
                          <CheckCircleIcon className="h-5 w-5" aria-hidden="true" />
                          <span className="whitespace-nowrap">Copied!</span>
                        </>
                      ) : (
                        <>
                          <DocumentDuplicateIcon className="h-5 w-5" aria-hidden="true" />
                          <span className="whitespace-nowrap">Copy address</span>
                        </>
                      )}
                    </button>
                  </li>
                  <li>
                    <button
                      className="menu-item flex items-center gap-3 px-3 py-2 text-sm"
                      type="button"
                      onClick={() => {
                        onOpenQrModal();
                        closeDropdown();
                      }}
                    >
                      <QrCodeIcon className="h-5 w-5" />
                      <span className="whitespace-nowrap">View QR Code</span>
                    </button>
                  </li>
                  <li>
                    <a
                      className="menu-item flex items-center gap-3 px-3 py-2 text-sm"
                      target="_blank"
                      href={blockExplorerAddressLink}
                      rel="noopener noreferrer"
                    >
                      <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                      <span className="whitespace-nowrap">View on Block Explorer</span>
                    </a>
                  </li>
                  {allowedNetworks.length > 1 ? (
                    <li>
                      <button
                        className="menu-item flex items-center gap-3 px-3 py-2 text-sm"
                        type="button"
                        onClick={() => setSelectingNetwork(true)}
                      >
                        <ArrowsRightLeftIcon className="h-5 w-5" /> <span>Switch Network</span>
                      </button>
                    </li>
                  ) : null}
                  {connector?.id === BURNER_WALLET_ID ? (
                    <li>
                      <button
                        className="menu-item flex items-center gap-3 px-3 py-2 text-sm text-[#d97706]"
                        type="button"
                        onClick={() => {
                          onRevealBurnerPk();
                          closeDropdown();
                        }}
                      >
                        <EyeIcon className="h-5 w-5" />
                        <span>Reveal Private Key</span>
                      </button>
                    </li>
                  ) : null}
                  <li>
                    <button
                      className="menu-item flex items-center gap-3 px-3 py-2 text-sm text-[#ff5a5f]"
                      type="button"
                      onClick={() => {
                        disconnect();
                        closeDropdown();
                      }}
                    >
                      <ArrowLeftOnRectangleIcon className="h-5 w-5" /> <span>Disconnect</span>
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>
        ) : null}
      </div>
    </>
  );
};
