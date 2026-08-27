import { useEffect, useState } from "react";
import { MOBILE_CHROME_VISIBILITY_EVENT } from "@/components/layout/mobile/mobile-shell-events";

/** Returns the shared mobile shell visibility state for coordinated sticky UI. */
function useMobileChromeHidden() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const updateVisibility = (event: Event) => {
      if (!(event instanceof CustomEvent)) return;
      const detail = event.detail as { hidden?: unknown };
      if (typeof detail.hidden === "boolean") setHidden(detail.hidden);
    };

    window.addEventListener(MOBILE_CHROME_VISIBILITY_EVENT, updateVisibility);
    return () => window.removeEventListener(MOBILE_CHROME_VISIBILITY_EVENT, updateVisibility);
  }, []);

  return hidden;
}

export { useMobileChromeHidden };
