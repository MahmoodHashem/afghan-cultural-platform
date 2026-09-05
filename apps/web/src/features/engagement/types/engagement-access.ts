import type { AuthStatus, SafeUser } from "@/stores/auth-store";

type EngagementAction = "like" | "bookmark" | "comment" | "commentLike" | "report" | "correction";

type EngagementIntentInput =
  | { kind: "like"; desiredState: boolean }
  | { kind: "bookmark"; desiredState: boolean }
  | { kind: "comment"; body: string; parentId?: string };

type EngagementAccessTarget = {
  entryId: string;
  entryPath: string;
};

type PendingEngagementIntent = (
  | { kind: "like"; desiredState: boolean }
  | { kind: "bookmark"; desiredState: boolean }
  | { kind: "comment"; body: string; parentId: string | null }
) & {
  version: 1;
  entryId: string;
  returnPath: string;
  createdAt: number;
};

type EngagementAccessContextValue = {
  status: AuthStatus;
  user: SafeUser | null;
  isAuthenticated: boolean;
  canContribute: boolean;
  pendingIntent: PendingEngagementIntent | null;
  ensureVerifiedAccess: (
    action: EngagementAction,
    intent?: EngagementIntentInput,
    target?: EngagementAccessTarget,
  ) => boolean;
  takePendingToggleIntent: (
    kind: "like" | "bookmark",
  ) => Extract<PendingEngagementIntent, { kind: "like" | "bookmark" }> | null;
  getPendingComment: (
    parentId?: string,
  ) => Extract<PendingEngagementIntent, { kind: "comment" }> | null;
  clearPendingComment: (parentId?: string) => void;
};

export type {
  EngagementAccessContextValue,
  EngagementAccessTarget,
  EngagementAction,
  EngagementIntentInput,
  PendingEngagementIntent,
};
