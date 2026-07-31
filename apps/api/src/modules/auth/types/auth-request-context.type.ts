import type { CookieOptions } from "express";

type RefreshCookie = {
  name: string;
  value: string;
  options: CookieOptions;
};

type AuthRequestContext = {
  ipAddress?: string;
  userAgent?: string;
  setRefreshCookie?: (cookie: RefreshCookie) => void;
  clearRefreshCookie?: (cookie: Omit<RefreshCookie, "value">) => void;
};

export type { AuthRequestContext, RefreshCookie };
