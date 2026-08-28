"use client";

import type { Variants } from "motion/react";
import { motion, useAnimation } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef, useImperativeHandle } from "react";
import { cn } from "@/lib/utils";

export interface ArrowRightStartOnRectangleIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface ArrowRightStartOnRectangleIconProps extends HTMLAttributes<HTMLSpanElement> {
  size?: number;
}

const ARROW_VARIANTS: Variants = {
  normal: { translateX: 0 },
  animate: {
    translateX: [0, 2, 0],
    transition: {
      duration: 0.5,
      times: [0, 0.4, 1],
    },
  },
};

const ArrowRightStartOnRectangleIcon = forwardRef<
  ArrowRightStartOnRectangleIconHandle,
  ArrowRightStartOnRectangleIconProps
>(({ className, size = 28, ...props }, ref) => {
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
        <path d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15" />
        <motion.g animate={controls} variants={ARROW_VARIANTS}>
          <path d="M18 15l3-3m0 0-3-3m3 3H9" />
        </motion.g>
      </svg>
    </span>
  );
});

ArrowRightStartOnRectangleIcon.displayName = "ArrowRightStartOnRectangleIcon";

export { ArrowRightStartOnRectangleIcon };
