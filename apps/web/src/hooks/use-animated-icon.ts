"use client";

import { useReducedMotion } from "motion/react";
import { useCallback, useMemo, useRef } from "react";

type AnimatedIconHandle = {
  startAnimation: () => void;
  stopAnimation: () => void;
};

type AnimatedIconTriggerProps = {
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onFocus: () => void;
  onBlur: () => void;
};

/** Coordinates an animated icon with its complete interactive parent. */
function useAnimatedIcon() {
  const iconRef = useRef<AnimatedIconHandle>(null);
  const hoveredRef = useRef(false);
  const focusedRef = useRef(false);
  const prefersReducedMotion = Boolean(useReducedMotion());

  const canAnimateHover = useCallback(
    () =>
      !prefersReducedMotion &&
      typeof window !== "undefined" &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches,
    [prefersReducedMotion],
  );

  const startHoverAnimation = useCallback(() => {
    if (canAnimateHover()) iconRef.current?.startAnimation();
  }, [canAnimateHover]);

  const stopHoverAnimation = useCallback(() => {
    if (canAnimateHover() && !hoveredRef.current && !focusedRef.current) {
      iconRef.current?.stopAnimation();
    }
  }, [canAnimateHover]);

  const triggerProps = useMemo<AnimatedIconTriggerProps>(
    () => ({
      onMouseEnter: () => {
        hoveredRef.current = true;
        startHoverAnimation();
      },
      onMouseLeave: () => {
        hoveredRef.current = false;
        stopHoverAnimation();
      },
      onFocus: () => {
        focusedRef.current = true;
        startHoverAnimation();
      },
      onBlur: () => {
        focusedRef.current = false;
        stopHoverAnimation();
      },
    }),
    [startHoverAnimation, stopHoverAnimation],
  );

  const playStateChange = useCallback(() => {
    if (!prefersReducedMotion) iconRef.current?.startAnimation();
  }, [prefersReducedMotion]);

  return { iconRef, playStateChange, triggerProps };
}

export type { AnimatedIconHandle, AnimatedIconTriggerProps };
export { useAnimatedIcon };
