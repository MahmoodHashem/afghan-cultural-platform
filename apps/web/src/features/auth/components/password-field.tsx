"use client";

import { EyeIcon, EyeSlashIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/features/auth/components/field-error";
import { cn } from "@/lib/utils";

type PasswordFieldProps = {
  id: string;
  label: string;
  placeholder: string;
  registration: UseFormRegisterReturn;
  error?: string;
  autoComplete: "current-password" | "new-password";
};

function PasswordField({
  id,
  label,
  placeholder,
  registration,
  error,
  autoComplete,
}: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);
  const errorId = `${id}-error`;
  const toggleLabel = isVisible ? "پنهان کردن رمز عبور" : "نمایش رمز عبور";

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-form-label">
        {label}
      </Label>
      <div className="relative">
        <LockClosedIcon
          className="pointer-events-none absolute top-1/2 inset-e-3 size-5 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          id={id}
          type={isVisible ? "text" : "password"}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={cn("h-11 pe-10 ps-12", error && "border-destructive")}
          {...registration}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={toggleLabel}
          onClick={() => setIsVisible((current) => !current)}
          className="absolute top-1/2 inset-s-1.5 size-8 -translate-y-1/2 text-muted-foreground hover:text-primary"
        >
          {isVisible ? (
            <EyeSlashIcon className="size-5" aria-hidden="true" />
          ) : (
            <EyeIcon className="size-5" aria-hidden="true" />
          )}
        </Button>
      </div>
      <FieldError id={errorId} message={error} />
    </div>
  );
}

export { PasswordField };
