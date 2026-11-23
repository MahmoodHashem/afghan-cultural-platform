"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { EngagementAccessDialog } from "@/features/engagement/components/engagement-access-dialog";
import { EngagementAccessContext } from "@/features/engagement/contexts/engagement-access-context";
import type {
  EngagementAccessContextValue,
  EngagementAccessTarget,
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
import { useAuthStore } from "@/stores/auth-store";

function EngagementAccessProvider({
  entryId,
  entryPath,
  children,
}: {
  entryId?: string;
  entryPath?: string;
  children: ReactNode;
}) {
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);
  const [dialogAction, setDialogAction] = useState<EngagementAction | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingIntent, setPendingIntent] = useState<PendingEngagementIntent | null>(null);
  const dialogFrameRef = useRef<number | null>(null);
  const dialogCloseTimerRef = useRef<number | null>(null);
  const canContribute = status === "authenticated" && user?.status === "ACTIVE";

  useEffect(() => {
    setPendingIntent(entryId ? readPendingEngagementIntent(entryId) : null);
  }, [entryId]);

  const openAccessDialog = useCallback((action: EngagementAction) => {
    if (dialogCloseTimerRef.current !== null) {
      window.clearTimeout(dialogCloseTimerRef.current);
      dialogCloseTimerRef.current = null;
    }

    if (dialogFrameRef.current !== null) {
      window.cancelAnimationFrame(dialogFrameRef.current);
    }

    setDialogAction(action);
    setDialogOpen(false);
    dialogFrameRef.current = window.requestAnimationFrame(() => {
      setDialogOpen(true);
      dialogFrameRef.current = null;
    });
  }, []);

  const closeAccessDialog = useCallback(() => {
    if (dialogFrameRef.current !== null) {
      window.cancelAnimationFrame(dialogFrameRef.current);
      dialogFrameRef.current = null;
    }

    setDialogOpen(false);

    if (dialogCloseTimerRef.current !== null) {
      window.clearTimeout(dialogCloseTimerRef.current);
    }

    dialogCloseTimerRef.current = window.setTimeout(() => {
      setDialogAction(null);
      dialogCloseTimerRef.current = null;
    }, 500);
  }, []);

  useEffect(
    () => () => {
      if (dialogFrameRef.current !== null) {
        window.cancelAnimationFrame(dialogFrameRef.current);
      }
      if (dialogCloseTimerRef.current !== null) {
        window.clearTimeout(dialogCloseTimerRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (canContribute && dialogAction) closeAccessDialog();
  }, [canContribute, closeAccessDialog, dialogAction]);

  const saveIntent = useCallback(
    (intent: EngagementIntentInput, target?: EngagementAccessTarget) => {
      const targetEntryId = target?.entryId ?? entryId;
      const targetEntryPath = target?.entryPath ?? entryPath;

      if (!targetEntryId || !targetEntryPath) return;

      const returnPath =
        intent.kind === "comment" ? `${targetEntryPath}#entry-comments` : targetEntryPath;
      const pending = createPendingEngagementIntent({
        entryId: targetEntryId,
        returnPath,
        intent,
      });

      if (pending) {
        writePendingEngagementIntent(pending);
        setPendingIntent(pending);
      }
    },
    [entryId, entryPath],
  );

  const ensureVerifiedAccess = useCallback(
    (action: EngagementAction, intent?: EngagementIntentInput, target?: EngagementAccessTarget) => {
      if (status === "initializing") return false;

      if (status === "authenticated" && user?.status === "ACTIVE") {
        return true;
      }

      if (intent) saveIntent(intent, target);
      openAccessDialog(action);
      return false;
    },
    [openAccessDialog, saveIntent, status, user],
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
          returnPath={pendingIntent?.returnPath ?? entryPath ?? "/explore"}
          open={dialogOpen}
          onOpenChange={(open) => {
            if (open) {
              setDialogOpen(true);
            } else {
              closeAccessDialog();
            }
          }}
        />
      ) : null}
    </EngagementAccessContext.Provider>
  );
}

export { EngagementAccessProvider };
