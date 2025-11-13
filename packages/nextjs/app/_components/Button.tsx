import React, { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "link";
  size?: "default" | "lg";
};

export function Button({ children, variant = "default", size = "default", className, ...props }: ButtonProps) {
  const base =
    "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

  const variants = {
    default: "bg-[#4A90E2] text-white hover:bg-[#3a7bc8] focus-visible:ring-[#4A90E2]",
    link: "text-[#4A90E2] hover:underline focus-visible:ring-[#4A90E2]",
  };

  const sizes = {
    default: "h-10 px-4 py-2 rounded-md text-sm",
    lg: "h-12 px-6 py-3 rounded-lg text-base",
  };

  return (
    <button className={clsx(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}
