import React from "react";
import clsx from "clsx";

type BadgeProps = {
  children: React.ReactNode;
  className?: string;
};

export function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800",
        className,
      )}
    >
      {children}
    </span>
  );
}
