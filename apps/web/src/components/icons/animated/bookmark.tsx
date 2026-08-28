"use client";

import type { Variants } from "motion/react";
import { motion, useAnimation } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef, useImperativeHandle } from "react";
import { cn } from "@/lib/utils";

export interface BookmarkIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface BookmarkIconProps extends HTMLAttributes<HTMLSpanElement> {
  size?: number;
}

const BOOKMARK_VARIANTS: Variants = {
  normal: { scaleY: 1, scaleX: 1 },
  animate: {
    scaleY: [1, 1.3, 0.9, 1.05, 1],
    scaleX: [1, 0.9, 1.1, 0.95, 1],
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const BookmarkIcon = forwardRef<BookmarkIconHandle, BookmarkIconProps>(
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
          <motion.path
            animate={controls}
            d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
            initial="normal"
            variants={BOOKMARK_VARIANTS}
          />
        </svg>
      </span>
    );
  },
);

BookmarkIcon.displayName = "BookmarkIcon";

export { BookmarkIcon };
