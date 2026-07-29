"use client";

import {
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from "@heroicons/react/20/solid";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { resolvedTheme = "light" } = useTheme();

  return (
    <Sonner
      theme={resolvedTheme as ToasterProps["theme"]}
      dir="rtl"
      className="toaster group"
      icons={{
        success: <CheckCircleIcon className="size-4 text-success" />,
        info: <InformationCircleIcon className="size-4 text-info" />,
        warning: <ExclamationTriangleIcon className="size-4 text-warning" />,
        error: <XCircleIcon className="size-4 text-destructive" />,
        loading: <ArrowPathIcon className="size-4 animate-spin text-primary" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
          fontFamily: "var(--font-sans)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast font-sans",
          title: "font-sans",
          description: "font-sans",
          actionButton: "font-sans",
          cancelButton: "font-sans",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
