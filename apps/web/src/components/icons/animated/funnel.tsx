"use client";

import type { Variants } from "motion/react";
import { motion, useAnimation } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef, useImperativeHandle } from "react";
import { cn } from "@/lib/utils";

export interface FunnelIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface FunnelIconProps extends HTMLAttributes<HTMLSpanElement> {
  size?: number;
}

const SVG_VARIANTS: Variants = {
  normal: { scaleX: 1, scaleY: 1 },
  animate: {
    scaleX: [1, 0.9, 1],
    scaleY: [1, 1.05, 1],
    transition: {
      duration: 0.4,
      ease: "easeInOut",
    },
  },
};

const FunnelIcon = forwardRef<FunnelIconHandle, FunnelIconProps>(
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
        <motion.svg
          aria-hidden="true"
          focusable="false"
          animate={controls}
          fill="none"
          height={size}
          initial="normal"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          variants={SVG_VARIANTS}
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12.0001 3C14.7548 3 17.4552 3.23205 20.0831 3.67767C20.6159 3.76803 21 4.23355 21 4.77402V5.81802C21 6.41476 20.7629 6.98705 20.341 7.40901L14.909 12.841C14.4871 13.2629 14.25 13.8352 14.25 14.432V17.3594C14.25 18.2117 13.7685 18.9908 13.0062 19.3719L9.75 21V14.432C9.75 13.8352 9.51295 13.2629 9.09099 12.841L3.65901 7.40901C3.23705 6.98705 3 6.41476 3 5.81802V4.77404C3 4.23357 3.38408 3.76805 3.91694 3.67769C6.54479 3.23206 9.24533 3 12.0001 3Z" />
        </motion.svg>
      </span>
    );
  },
);

FunnelIcon.displayName = "FunnelIcon";

export { FunnelIcon };
