"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";

export const SwitchTheme = ({ className }: { className?: string }) => {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDarkMode = resolvedTheme === "dark";

  const handleToggle = () => {
    setTheme(isDarkMode ? "light" : "dark");
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`inline-flex items-center gap-2 rounded-full border border-[#cac4d0] bg-[color:var(--af-surface)] px-3 py-1.5 text-xs font-medium text-[color:var(--color-base-content)] shadow-sm transition-colors hover:bg-[color:var(--af-surface-soft)] ${className}`}
    >
      {isDarkMode ? <MoonIcon className="h-4 w-4" /> : <SunIcon className="h-4 w-4" />}
      <span>{isDarkMode ? "Dark" : "Light"}</span>
    </button>
  );
};
