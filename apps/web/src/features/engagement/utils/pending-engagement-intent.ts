import { getSafeRedirectPath } from "@/features/auth/utils/redirects";
import type {
  EngagementIntentInput,
  PendingEngagementIntent,
} from "@/features/engagement/types/engagement-access";

const PENDING_ENGAGEMENT_INTENT_KEY = "afghan-culture:engagement-intent:v1";
const PENDING_ENGAGEMENT_INTENT_TTL_MS = 30 * 60 * 1000;
const MAX_RETURN_PATH_LENGTH = 1200;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function createPendingEngagementIntent({
  entryId,
  returnPath,
  intent,
  now = Date.now(),
}: {
  entryId: string;
  returnPath: string;
  intent: EngagementIntentInput;
  now?: number;
}): PendingEngagementIntent | null {
  if (!UUID_PATTERN.test(entryId) || !isSafeEntryReturnPath(returnPath)) {
    return null;
  }

  const base = { version: 1 as const, entryId, returnPath, createdAt: now };

  if (intent.kind === "comment") {
    const body = normalizePendingCommentBody(intent.body);
    const parentId = intent.parentId ?? null;

    if (body.length < 5 || body.length > 1000 || (parentId && !UUID_PATTERN.test(parentId))) {
      return null;
    }

    return { ...base, kind: "comment", body, parentId };
  }

  return { ...base, kind: intent.kind, desiredState: intent.desiredState };
}

function parsePendingEngagementIntent(
  value: string | null,
  { entryId, now = Date.now() }: { entryId: string; now?: number },
): PendingEngagementIntent | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;

    if (
      parsed.version !== 1 ||
      parsed.entryId !== entryId ||
      !UUID_PATTERN.test(entryId) ||
      typeof parsed.createdAt !== "number" ||
      parsed.createdAt > now ||
      now - parsed.createdAt > PENDING_ENGAGEMENT_INTENT_TTL_MS ||
      typeof parsed.returnPath !== "string" ||
      !isSafeEntryReturnPath(parsed.returnPath)
    ) {
      return null;
    }

    const base = {
      version: 1 as const,
      entryId,
      returnPath: parsed.returnPath,
      createdAt: parsed.createdAt,
    };

    if (
      (parsed.kind === "like" || parsed.kind === "bookmark") &&
      typeof parsed.desiredState === "boolean"
    ) {
      return { ...base, kind: parsed.kind, desiredState: parsed.desiredState };
    }

    if (
      parsed.kind === "comment" &&
      typeof parsed.body === "string" &&
      parsed.body.length >= 5 &&
      parsed.body.length <= 1000 &&
      (parsed.parentId === null ||
        (typeof parsed.parentId === "string" && UUID_PATTERN.test(parsed.parentId)))
    ) {
      return { ...base, kind: "comment", body: parsed.body, parentId: parsed.parentId };
    }
  } catch {
    return null;
  }

  return null;
}

function readPendingEngagementIntent(entryId: string): PendingEngagementIntent | null {
  try {
    const storedValue = window.sessionStorage.getItem(PENDING_ENGAGEMENT_INTENT_KEY);
    const intent = parsePendingEngagementIntent(storedValue, { entryId });

    if (!intent && storedValue) {
      window.sessionStorage.removeItem(PENDING_ENGAGEMENT_INTENT_KEY);
    }

    return intent;
  } catch {
    return null;
  }
}

function writePendingEngagementIntent(intent: PendingEngagementIntent): void {
  try {
    window.sessionStorage.setItem(PENDING_ENGAGEMENT_INTENT_KEY, JSON.stringify(intent));
  } catch {
    // Access gating still works when storage is unavailable.
  }
}

function clearPendingEngagementIntent(): void {
  try {
    window.sessionStorage.removeItem(PENDING_ENGAGEMENT_INTENT_KEY);
  } catch {
    // The in-memory intent is cleared by the caller.
  }
}

function isSafeEntryReturnPath(path: string): boolean {
  if (path.length === 0 || path.length > MAX_RETURN_PATH_LENGTH || !path.startsWith("/entries/")) {
    return false;
  }

  return getSafeRedirectPath(path).startsWith("/entries/");
}

function normalizePendingCommentBody(body: string): string {
  return body.trim().replace(/\s+/g, " ");
}

export {
  clearPendingEngagementIntent,
  createPendingEngagementIntent,
  PENDING_ENGAGEMENT_INTENT_KEY,
  PENDING_ENGAGEMENT_INTENT_TTL_MS,
  parsePendingEngagementIntent,
  readPendingEngagementIntent,
  writePendingEngagementIntent,
};
