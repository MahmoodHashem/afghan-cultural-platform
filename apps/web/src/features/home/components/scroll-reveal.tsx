"use client";

import { motion, useReducedMotion } from "motion/react";
import { type ReactNode, useEffect, useState } from "react";

import { cn } from "@/lib/utils";

const revealElements = {
  article: motion.article,
  div: motion.div,
  section: motion.section,
} as const;

type RevealElement = keyof typeof revealElements;

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  amount?: number;
  as?: RevealElement;
};

function ScrollReveal({
  children,
  className,
  delay = 0,
  amount = 0.18,
  as = "div",
}: ScrollRevealProps) {
  const prefersReducedMotion = useReducedMotion();
  const [animationReady, setAnimationReady] = useState(false);
  const MotionElement = revealElements[as];

  useEffect(() => {
    setAnimationReady(true);
  }, []);

  if (!animationReady || prefersReducedMotion) {
    return <MotionElement className={className}>{children}</MotionElement>;
  }

  return (
    <MotionElement
      className={cn("will-change-transform", className)}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.52, delay, ease: "easeOut" }}
    >
      {children}
    </MotionElement>
  );
}

export { ScrollReveal };
