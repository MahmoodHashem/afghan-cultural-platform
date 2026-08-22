"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

type AdminSidebarLabelProps = {
  children: ReactNode;
  className?: string;
};

function AdminSidebarLabel({ children, className }: AdminSidebarLabelProps) {
  const { isMobile, state } = useSidebar();
  const prefersReducedMotion = useReducedMotion();
  const isVisible = isMobile || state === "expanded";

  return (
    <AnimatePresence initial={false}>
      {isVisible ? (
        <motion.span
          initial={prefersReducedMotion ? false : { opacity: 0, x: 4 }}
          animate={{ opacity: 1, x: 0 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: 4 }}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.12,
            ease: [0.22, 1, 0.36, 1],
          }}
          className={cn("min-w-0", className)}
        >
          {children}
        </motion.span>
      ) : null}
    </AnimatePresence>
  );
}

export { AdminSidebarLabel };
