"use client";

import { useEffect } from "react";

import { type HeaderContext, PUBLIC_HEADER_CONTEXT_EVENT } from "@/components/layout/public-header";

type EntryDetailHeaderContextProps = {
  title: string;
  backHref: string;
};

function EntryDetailHeaderContext({ title, backHref }: EntryDetailHeaderContextProps) {
  useEffect(() => {
    let animationFrameId = 0;

    const dispatchContext = (visible: boolean) => {
      const detail: HeaderContext = {
        title,
        backHref,
        backLabel: "بازگشت به کاوش محتوا",
        visible,
      };

      window.dispatchEvent(new CustomEvent(PUBLIC_HEADER_CONTEXT_EVENT, { detail }));
    };

    const updateContext = () => {
      window.cancelAnimationFrame(animationFrameId);
      animationFrameId = window.requestAnimationFrame(() => {
        dispatchContext(window.scrollY > 420);
      });
    };

    updateContext();
    window.addEventListener("scroll", updateContext, { passive: true });

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener("scroll", updateContext);
      dispatchContext(false);
    };
  }, [backHref, title]);

  return null;
}

export { EntryDetailHeaderContext };
