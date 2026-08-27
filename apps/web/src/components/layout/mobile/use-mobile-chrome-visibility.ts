import { useMotionValueEvent, useScroll } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

const ALWAYS_VISIBLE_OFFSET = 120;
const HIDE_AFTER_DISTANCE = 52;
const SHOW_AFTER_DISTANCE = 32;
const MIN_SCROLL_DELTA = 0.75;
const MAX_ACCUMULATED_STEP = 24;

/**
 * Converts noisy touch-scroll direction into a stable show/hide intent.
 * Direction changes reset the travelled distance, preventing mobile momentum
 * and rubber-band scrolling from rapidly toggling the application chrome.
 */
function useMobileChromeVisibility(enabled: boolean) {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const hiddenRef = useRef(false);
  const directionRef = useRef<-1 | 0 | 1>(0);
  const distanceRef = useRef(0);

  const updateHidden = useCallback((nextHidden: boolean) => {
    if (hiddenRef.current === nextHidden) return;
    hiddenRef.current = nextHidden;
    setHidden(nextHidden);
  }, []);

  const resetIntent = useCallback(() => {
    directionRef.current = 0;
    distanceRef.current = 0;
  }, []);

  useEffect(() => {
    resetIntent();
    if (!enabled) updateHidden(false);
  }, [enabled, resetIntent, updateHidden]);

  useMotionValueEvent(scrollY, "change", (currentScrollY) => {
    if (!enabled) return;

    if (currentScrollY <= ALWAYS_VISIBLE_OFFSET) {
      resetIntent();
      updateHidden(false);
      return;
    }

    const previousScrollY = scrollY.getPrevious() ?? currentScrollY;
    const delta = currentScrollY - previousScrollY;
    if (Math.abs(delta) < MIN_SCROLL_DELTA) return;

    const direction: -1 | 1 = delta > 0 ? 1 : -1;
    if (directionRef.current !== direction) {
      directionRef.current = direction;
      distanceRef.current = 0;
    }

    distanceRef.current += Math.min(Math.abs(delta), MAX_ACCUMULATED_STEP);
    const threshold = direction === 1 ? HIDE_AFTER_DISTANCE : SHOW_AFTER_DISTANCE;
    if (distanceRef.current < threshold) return;

    updateHidden(direction === 1);
    distanceRef.current = 0;
  });

  return hidden;
}

export { useMobileChromeVisibility };
