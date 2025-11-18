import React, { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "link";
  size?: "default" | "lg";
  rounded?: "full" | "lg" | "md" | "none";
};

export function Button({ children, variant = "default", size = "default", className, rounded, ...props }: ButtonProps) {
  const base =
    "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

  const variants = {
    default: "bg-[#4A90E2]  hover:bg-[#3a7bc8] focus-visible:ring-[#4A90E2]",
    link: "text-[#4A90E2] hover:underline focus-visible:ring-[#4A90E2]",
  };

  const sizes = {
    default: "h-10 px-4 py-2 text-sm",
    lg: "h-12 px-6 py-3 text-base",
  };

  // Determine rounded class
  const roundedClass =
    rounded === "full"
      ? "rounded-full"
      : rounded === "lg"
      ? "rounded-lg"
      : rounded === "md"
      ? "rounded-md"
      : rounded === "none"
      ? ""
      : "rounded-md"; // default if not specified

  return (
    <button className={clsx(base, variants[variant], sizes[size], roundedClass, className)} {...props}>
      {children}
    </button>
  );
}
