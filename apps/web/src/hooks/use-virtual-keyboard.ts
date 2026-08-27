"use client";

import { useEffect, useState } from "react";

type VirtualKeyboardState = {
  inset: number;
  isOpen: boolean;
};

const CLOSED_STATE: VirtualKeyboardState = { inset: 0, isOpen: false };
const KEYBOARD_THRESHOLD = 120;

/** Tracks the mobile visual viewport without assuming that the API exists. */
function useVirtualKeyboard() {
  const [state, setState] = useState<VirtualKeyboardState>(CLOSED_STATE);

  useEffect(() => {
    const viewport = window.visualViewport;

    if (!viewport) {
      return;
    }

    const update = () => {
      const inset = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
      setState({ inset, isOpen: inset >= KEYBOARD_THRESHOLD });
    };

    update();
    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);

    return () => {
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
    };
  }, []);

  return state;
}

export type { VirtualKeyboardState };
export { useVirtualKeyboard };
