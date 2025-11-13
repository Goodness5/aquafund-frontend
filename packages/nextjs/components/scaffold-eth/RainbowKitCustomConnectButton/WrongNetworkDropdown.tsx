import { useRef, useState } from "react";
import { NetworkOptions } from "./NetworkOptions";
import { useDisconnect } from "wagmi";
import { ArrowLeftOnRectangleIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { useOutsideClick } from "~~/hooks/scaffold-eth";

export const WrongNetworkDropdown = () => {
  const { disconnect } = useDisconnect();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useOutsideClick(dropdownRef, () => setIsOpen(false));

  return (
    <div className="relative mr-2" ref={dropdownRef}>
      <button
        className="btn btn-error btn-sm gap-2"
        type="button"
        onClick={() => setIsOpen(open => !open)}
        aria-expanded={isOpen}
      >
        <span>Wrong network</span>
        <ChevronDownIcon className="h-6 w-4 ml-2 sm:ml-0" />
      </button>
      {isOpen ? (
        <div className="dropdown-content dropdown-panel right-0 mt-2 min-w-[15rem]">
          <ul className="menu gap-1">
            <NetworkOptions
              onSelect={() => {
                setIsOpen(false);
              }}
            />
            <li>
              <button
                className="menu-item flex items-center gap-3 px-3 py-2 text-sm text-[#ff5a5f]"
                type="button"
                onClick={() => {
                  disconnect();
                  setIsOpen(false);
                }}
              >
                <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                <span>Disconnect</span>
              </button>
            </li>
          </ul>
        </div>
      ) : null}
    </div>
  );
};
