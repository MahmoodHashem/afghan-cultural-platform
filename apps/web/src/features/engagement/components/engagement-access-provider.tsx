"use client";

import { useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { getCurrentUser } from "@/features/auth/api/auth-api";
import { subscribeToAuthEvents } from "@/features/auth/utils/auth-events";
import { EngagementAccessDialog } from "@/features/engagement/components/engagement-access-dialog";
import { EngagementAccessContext } from "@/features/engagement/contexts/engagement-access-context";
import type {
  EngagementAccessContextValue,
  EngagementAction,
  EngagementIntentInput,
  PendingEngagementIntent,
} from "@/features/engagement/types/engagement-access";
import {
  clearPendingEngagementIntent,
  createPendingEngagementIntent,
  readPendingEngagementIntent,
  writePendingEngagementIntent,
} from "@/features/engagement/utils/pending-engagement-intent";
import { setCurrentUserQuery } from "@/lib/auth/auth-query";
import { useAuthStore } from "@/stores/auth-store";

const USER_SYNC_THROTTLE_MS = 15_000;

function EngagementAccessProvider({
  entryId,
  entryPath,
  children,
}: {
  entryId: string;
  entryPath: string;
  children: ReactNode;
}) {
  const queryClient = useQueryClient();
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const [dialogAction, setDialogAction] = useState<EngagementAction | null>(null);
  const [pendingIntent, setPendingIntent] = useState<PendingEngagementIntent | null>(null);
  const syncInFlightRef = useRef(false);
  const lastSyncAtRef = useRef(0);
  const canContribute =
    status === "authenticated" && user?.status === "ACTIVE" && Boolean(user.emailVerified);

  useEffect(() => {
    setPendingIntent(readPendingEngagementIntent(entryId));
  }, [entryId]);

  useEffect(() => {
    if (status === "authenticated" && user && !user.emailVerified && pendingIntent) {
      setDialogAction(pendingIntent.kind === "comment" ? "comment" : pendingIntent.kind);
    }
  }, [pendingIntent, status, user]);

  useEffect(() => {
    if (canContribute) setDialogAction(null);
  }, [canContribute]);

  const syncCurrentUser = useCallback(async () => {
    if (
      status !== "authenticated" ||
      !user ||
      user.emailVerified ||
      !pendingIntent ||
      syncInFlightRef.current ||
      Date.now() - lastSyncAtRef.current < USER_SYNC_THROTTLE_MS
    ) {
      return;
    }

    syncInFlightRef.current = true;
    lastSyncAtRef.current = Date.now();

    try {
      const currentUser = await getCurrentUser();
      updateUser(currentUser);
      setCurrentUserQuery(queryClient, currentUser);
    } catch {
      // Existing auth/error handling remains authoritative; retry on a later focus event.
    } finally {
      syncInFlightRef.current = false;
    }
  }, [pendingIntent, queryClient, status, updateUser, user]);

  useEffect(() => {
    const unsubscribe = subscribeToAuthEvents((event) => {
      if (event.type === "email-verified" && event.userId === user?.id) {
        lastSyncAtRef.current = 0;
        void syncCurrentUser();
      }
    });

    function syncWhenVisible() {
      if (document.visibilityState === "visible") void syncCurrentUser();
    }

    document.addEventListener("visibilitychange", syncWhenVisible);
    window.addEventListener("focus", syncWhenVisible);

    return () => {
      unsubscribe();
      document.removeEventListener("visibilitychange", syncWhenVisible);
      window.removeEventListener("focus", syncWhenVisible);
    };
  }, [syncCurrentUser, user?.id]);

  const saveIntent = useCallback(
    (intent: EngagementIntentInput) => {
      const returnPath = intent.kind === "comment" ? `${entryPath}#entry-comments` : entryPath;
      const pending = createPendingEngagementIntent({ entryId, returnPath, intent });

      if (pending) {
        writePendingEngagementIntent(pending);
        setPendingIntent(pending);
      }
    },
    [entryId, entryPath],
  );

  const ensureVerifiedAccess = useCallback(
    (action: EngagementAction, intent?: EngagementIntentInput) => {
      if (status === "initializing") return false;

      if (status === "authenticated" && user?.status === "ACTIVE" && user.emailVerified) {
        return true;
      }

      if (intent) saveIntent(intent);
      setDialogAction(action);
      return false;
    },
    [saveIntent, status, user],
  );

  const clearIntent = useCallback(() => {
    clearPendingEngagementIntent();
    setPendingIntent(null);
  }, []);

  const takePendingToggleIntent = useCallback(
    (kind: "like" | "bookmark") => {
      if (!pendingIntent || pendingIntent.kind !== kind) return null;
      const intent = pendingIntent;
      clearIntent();
      return intent;
    },
    [clearIntent, pendingIntent],
  );

  const getPendingComment = useCallback(
    (parentId?: string) => {
      if (pendingIntent?.kind !== "comment" || pendingIntent.parentId !== (parentId ?? null)) {
        return null;
      }

      return pendingIntent;
    },
    [pendingIntent],
  );

  const clearPendingComment = useCallback(
    (parentId?: string) => {
      if (getPendingComment(parentId)) clearIntent();
    },
    [clearIntent, getPendingComment],
  );

  const contextValue = useMemo<EngagementAccessContextValue>(
    () => ({
      status,
      user,
      isAuthenticated: status === "authenticated" && Boolean(user),
      canContribute,
      pendingIntent,
      ensureVerifiedAccess,
      takePendingToggleIntent,
      getPendingComment,
      clearPendingComment,
    }),
    [
      canContribute,
      clearPendingComment,
      ensureVerifiedAccess,
      getPendingComment,
      pendingIntent,
      status,
      takePendingToggleIntent,
      user,
    ],
  );

  const accessReason =
    status !== "authenticated" || !user
      ? "unauthenticated"
      : user.status === "SUSPENDED"
        ? "suspended"
        : "unverified";

  return (
    <EngagementAccessContext.Provider value={contextValue}>
      {children}
      {dialogAction ? (
        <EngagementAccessDialog
          action={dialogAction}
          reason={accessReason}
          user={user}
          returnPath={pendingIntent?.returnPath ?? entryPath}
          open
          onOpenChange={(open) => {
            if (!open) setDialogAction(null);
          }}
        />
      ) : null}
    </EngagementAccessContext.Provider>
  );
}

export { EngagementAccessProvider };
