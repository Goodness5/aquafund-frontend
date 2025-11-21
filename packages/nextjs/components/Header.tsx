"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRightIcon, Bars3Icon } from "@heroicons/react/24/outline";
import { useOutsideClick } from "~~/hooks/scaffold-eth";

const AUTH_TOKEN_KEY = "access_token";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

export const menuLinks: HeaderMenuLink[] = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Projects",
    href: "/projects",
  },
  {
    label: "Start a Fundraiser",
    href: "/accounts/get-started",
  },
  {
    label: "About Us",
    href: "/dashboard",
  },
  {
    label: "Docs",
    href: "/ngo",
  },
  {
    label: "Contact Us",
    href: "/admin",
  },
];

export const HeaderMenuLinks = () => {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        setIsAuthenticated(!!token);
      }
    };

    // Check on mount
    checkAuth();

    // Listen for storage changes (e.g., when user logs in/out in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === AUTH_TOKEN_KEY) {
        checkAuth();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Also listen for custom events (for same-tab auth changes)
    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener("auth-changed", handleAuthChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("auth-changed", handleAuthChange);
    };
  }, []);

  return (
    <>
      {menuLinks.map(({ label, href, icon }) => {
        const isActive = pathname === href;
        // If "Start a Fundraiser" and user is authenticated, link to dashboard instead
        const finalHref = label === "Start a Fundraiser" && isAuthenticated ? "/dashboard" : href;
        return (
          <li key={href}>
            <Link
              href={finalHref}
              passHref
              className={`${
                isActive ? "bg-primary text-white shadow-md" : ""
              } hover:bg-primary hover:shadow-md hover:text-white focus:!bg-primary active:!text-neutral py-1.5 px-3 text-sm rounded-full gap-2 grid grid-flow-col`}
            >
              {icon}
              <span>{label}</span>
            </Link>
          </li>
        );
      })}
    </>
  );
};

/**
 * Site header
 */
export const Header = () => {
  const burgerMenuRef = useRef<HTMLDetailsElement>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useOutsideClick(burgerMenuRef, () => {
    burgerMenuRef?.current?.removeAttribute("open");
  });

  useEffect(() => {
    const checkAuth = () => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        setIsAuthenticated(!!token);
      }
    };

    // Check on mount
    checkAuth();

    // Listen for storage changes (e.g., when user logs in/out in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === AUTH_TOKEN_KEY) {
        checkAuth();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Also listen for custom events (for same-tab auth changes)
    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener("auth-changed", handleAuthChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("auth-changed", handleAuthChange);
    };
  }, []);

  const getStartedHref = isAuthenticated ? "/dashboard" : "/accounts/get-started";

  return (
    <div className="sticky top-0 navbar bg-base-100 min-h-0 shrink-0 justify-between z-20 px-0 sm:px-2">
      <Link href="/" passHref className="hidden lg:flex items-center gap-2 ml-4 mr-6 shrink-0">
        <div className="flex flex-col">
          <Image src={"/logo.svg"} alt="logo" width={150} height={150} className=" " />
        </div>
      </Link>
      <div className="navbar-end grow mr-4">
        <div className="w-auto lg:w-1/2">
          <details className="dropdown" ref={burgerMenuRef}>
            <summary className="ml-1 btn btn-ghost lg:hidden hover:bg-transparent">
              <Bars3Icon className="h-1/2" />
            </summary>
            <ul
              className="menu menu-compact dropdown-content mt-3 p-2 shadow-sm bg-base-100 rounded-box w-52"
              onClick={() => {
                burgerMenuRef?.current?.removeAttribute("open");
              }}
            >
              <HeaderMenuLinks />
            </ul>
          </details>
          <ul className="hidden lg:flex lg:flex-nowrap menu menu-horizontal px-1 gap-2">
            <HeaderMenuLinks />
          </ul>
        </div>
        <div className="flex items-center gap-2">
          <Link href={getStartedHref} className="btn btn-outline btn-sm">
            {isAuthenticated ? "Dashboard" : "Get Started"}
          </Link>
          <Link href="/projects" className="btn btn-primary btn-wide gap-2 text-sm">
            Donate to Projects
            <ArrowUpRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
