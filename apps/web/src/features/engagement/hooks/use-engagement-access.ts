"use client";

import { useContext } from "react";

import { EngagementAccessContext } from "@/features/engagement/contexts/engagement-access-context";

function useEngagementAccess() {
  const context = useContext(EngagementAccessContext);

  if (!context) {
    throw new Error("useEngagementAccess must be used within EngagementAccessProvider.");
  }

  return context;
}

export { useEngagementAccess };
