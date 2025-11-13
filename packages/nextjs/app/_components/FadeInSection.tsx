"use client";

import { ComponentPropsWithoutRef, ElementType, PropsWithChildren, useEffect, useRef, useState } from "react";

type FadeInSectionProps<T extends ElementType> = PropsWithChildren<{
  as?: T;
  className?: string;
  delay?: number;
  once?: boolean;
}> &
  Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

export function FadeInSection<T extends ElementType = "div">({
  as,
  children,
  className,
  delay = 0,
  once = true,
  style,
  ...rest
}: FadeInSectionProps<T>) {
  const Tag = (as || "div") as ElementType;
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setVisible(true);
            if (once) {
              observer.disconnect();
            }
          } else if (!once) {
            setVisible(false);
          }
        });
      },
      { threshold: 0.2 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [once]);

  const mergedClassName = [
    "transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:transform-none motion-reduce:opacity-100",
    visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag ref={ref} style={{ ...style, transitionDelay: `${delay}ms` }} className={mergedClassName} {...rest}>
      {children}
    </Tag>
  );
}
