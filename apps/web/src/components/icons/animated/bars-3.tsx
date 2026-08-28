"use client";

import type { Transition, Variants } from "motion/react";
import { motion, useAnimation } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef, useImperativeHandle } from "react";
import { cn } from "@/lib/utils";

export interface Bars3IconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface Bars3IconProps extends HTMLAttributes<HTMLSpanElement> {
  size?: number;
}

const TRANSITION: Transition = {
  duration: 0.3,
  ease: "easeInOut",
};

const CREATE_BAR_VARIANTS = (delay: number): Variants => ({
  normal: {
    scaleX: 1,
    transition: TRANSITION,
  },
  animate: {
    scaleX: [1, 0.6, 1],
    transition: {
      ...TRANSITION,
      delay,
    },
  },
});

const BARS = [
  { d: "M3.75 6.75h16.5", delay: 0 },
  { d: "M3.75 12h16.5", delay: 0.1 },
  { d: "M3.75 17.25h16.5", delay: 0.2 },
];

const Bars3Icon = forwardRef<Bars3IconHandle, Bars3IconProps>(
  ({ className, size = 28, ...props }, ref) => {
    const controls = useAnimation();

    useImperativeHandle(ref, () => {
      return {
        startAnimation: () => controls.start("animate"),
        stopAnimation: () => controls.start("normal"),
      };
    });

    return (
      <span className={cn(className)} {...props}>
        <svg
          aria-hidden="true"
          focusable="false"
          fill="none"
          height={size}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          {BARS.map((bar) => (
            <motion.path
              animate={controls}
              d={bar.d}
              initial="normal"
              key={bar.d}
              style={{ transformOrigin: "center" }}
              variants={CREATE_BAR_VARIANTS(bar.delay)}
            />
          ))}
        </svg>
      </span>
    );
  },
);

Bars3Icon.displayName = "Bars3Icon";

export { Bars3Icon };
