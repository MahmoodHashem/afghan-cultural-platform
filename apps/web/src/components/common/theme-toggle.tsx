"use client";

import { MoonIcon, SunIcon } from "@heroicons/react/20/solid";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      aria-label={isDark ? "تغییر به حالت روشن" : "تغییر به حالت تاریک"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? (
        <SunIcon data-icon="inline-start" className="size-4" />
      ) : (
        <MoonIcon data-icon="inline-start" className="size-4" />
      )}
      {isDark ? "روشن" : "تاریک"}
    </Button>
  );
}

export { ThemeToggle };
