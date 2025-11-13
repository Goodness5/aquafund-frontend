import { useEffect, useState } from "react";
import { rainbowkitBurnerWallet } from "burner-connector";
import { ShieldExclamationIcon } from "@heroicons/react/24/outline";
import { useCopyToClipboard } from "~~/hooks/scaffold-eth";
import { getParsedError, notification } from "~~/utils/scaffold-eth";

const BURNER_WALLET_PK_KEY = "burnerWallet.pk";

type RevealBurnerPKModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const RevealBurnerPKModal = ({ isOpen, onClose }: RevealBurnerPKModalProps) => {
  const { copyToClipboard, isCopiedToClipboard } = useCopyToClipboard();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyPK = async () => {
    try {
      const storage = rainbowkitBurnerWallet.useSessionStorage ? sessionStorage : localStorage;
      const burnerPK = storage?.getItem(BURNER_WALLET_PK_KEY);
      if (!burnerPK) throw new Error("Burner wallet private key not found");
      await copyToClipboard(burnerPK);
      notification.success("Burner wallet private key copied to clipboard");
      onClose();
    } catch (e) {
      const parsedError = getParsedError(e);
      notification.error(parsedError);
      setError(parsedError);
    }
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Reveal burner private key">
      <div className="modal-backdrop-overlay" aria-hidden="true" onClick={onClose} />
      <div className="modal-panel max-w-lg">
        <button className="btn btn-ghost btn-circle absolute right-4 top-4" type="button" onClick={onClose}>
          ✕
        </button>
        <div className="space-y-5 pt-4">
          <h3 className="text-lg font-semibold">Copy Burner Wallet Private Key</h3>
          <div role="alert" className="alert alert-warning">
            <ShieldExclamationIcon className="h-5 w-5 shrink-0" />
            <p className="m-0 text-sm">
              Burner wallets are intended for local development only and are not safe for storing real funds.
            </p>
          </div>
          <p className="text-sm text-[color:var(--color-base-content)]/80">
            Your private key provides <strong>full access</strong> to your entire wallet and funds. This is currently
            stored <strong>temporarily</strong> in your browser.
          </p>
          {error ? <p className="text-sm text-[#ff5a5f]">{error}</p> : null}
          <button className="btn btn-outline btn-error" onClick={handleCopyPK} disabled={isCopiedToClipboard}>
            Copy Private Key To Clipboard
          </button>
        </div>
      </div>
    </div>
  );
};
