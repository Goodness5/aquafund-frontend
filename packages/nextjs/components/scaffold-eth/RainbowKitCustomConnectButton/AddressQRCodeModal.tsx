import { Address } from "@scaffold-ui/components";
import { QRCodeSVG } from "qrcode.react";
import { Address as AddressType } from "viem";
import { hardhat } from "viem/chains";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";

type AddressQRCodeModalProps = {
  address: AddressType;
  isOpen: boolean;
  onClose: () => void;
};

export const AddressQRCodeModal = ({ address, isOpen, onClose }: AddressQRCodeModalProps) => {
  const { targetNetwork } = useTargetNetwork();

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Wallet QR code">
      <div className="modal-backdrop-overlay" aria-hidden="true" onClick={onClose} />
      <div className="modal-panel">
        <button className="btn btn-ghost btn-circle absolute right-4 top-4" type="button" onClick={onClose}>
          ✕
        </button>
        <div className="space-y-5 pt-4">
          <h3 className="text-lg font-semibold text-center">Wallet QR Code</h3>
          <div className="flex flex-col items-center gap-6">
            <QRCodeSVG value={address} size={220} />
            <Address
              address={address}
              format="long"
              disableAddressLink
              onlyEnsOrAddress
              blockExplorerAddressLink={
                targetNetwork.id === hardhat.id ? `/blockexplorer/address/${address}` : undefined
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};
