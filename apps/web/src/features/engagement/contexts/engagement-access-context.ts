"use client";

import { createContext } from "react";

import type { EngagementAccessContextValue } from "@/features/engagement/types/engagement-access";

const EngagementAccessContext = createContext<EngagementAccessContextValue | null>(null);

export { EngagementAccessContext };
