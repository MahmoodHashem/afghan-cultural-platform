"use client";

import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

const EDGE_THRESHOLD = 8;

function EntryScrollControls() {
  const [atTop, setAtTop] = useState(true);
  const [atBottom, setAtBottom] = useState(false);

  useEffect(() => {
    let animationFrameId = 0;

    const updatePosition = () => {
      window.cancelAnimationFrame(animationFrameId);
      animationFrameId = window.requestAnimationFrame(() => {
        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;

        setAtTop(window.scrollY <= EDGE_THRESHOLD);
        setAtBottom(scrollableHeight <= 0 || window.scrollY >= scrollableHeight - EDGE_THRESHOLD);
      });
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, { passive: true });
    window.addEventListener("resize", updatePosition);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
    };
  }, []);

  function scrollTo(top: number) {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    window.scrollTo({
      top,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }

  return (
    <nav
      className="fixed bottom-5 right-4 z-40 hidden flex-col overflow-hidden rounded-full shadow-[0_2px_10px_rgba(0,0,0,.08)] backdrop-blur-sm lg:flex lg:bottom-6 lg:right-6"
      aria-label="پیمایش سریع مطلب"
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-lg"
        className="rounded-none "
        disabled={atTop}
        aria-label="رفتن به ابتدای مطلب"
        title="ابتدای مطلب"
        onClick={() => scrollTo(0)}
      >
        <ArrowUpIcon aria-hidden="true" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-lg"
        className="rounded-none"
        disabled={atBottom}
        aria-label="رفتن به انتهای مطلب"
        title="انتهای مطلب"
        onClick={() => scrollTo(document.documentElement.scrollHeight)}
      >
        <ArrowDownIcon aria-hidden="true" />
      </Button>
    </nav>
  );
}

export { EntryScrollControls };
