const OAUTH_STATE_PREFIX = "next.";
const MAX_OAUTH_STATE_LENGTH = 4096;

function createOAuthState(next: string | undefined): string | undefined {
  const safeNext = getSafeInternalPath(next);

  if (!safeNext) {
    return undefined;
  }

  return `${OAUTH_STATE_PREFIX}${Buffer.from(safeNext, "utf8").toString("base64url")}`;
}

function readOAuthState(state: string | undefined): string | undefined {
  if (!state || state.length > MAX_OAUTH_STATE_LENGTH) {
    return undefined;
  }

  if (!state.startsWith(OAUTH_STATE_PREFIX)) {
    return getSafeInternalPath(state);
  }

  const encodedPath = state.slice(OAUTH_STATE_PREFIX.length);

  if (!encodedPath || !/^[A-Za-z0-9_-]+$/.test(encodedPath)) {
    return undefined;
  }

  try {
    return getSafeInternalPath(Buffer.from(encodedPath, "base64url").toString("utf8"));
  } catch {
    return undefined;
  }
}

function getSafeInternalPath(path: string | undefined): string | undefined {
  if (!path) {
    return undefined;
  }

  try {
    const decodedPath = decodeURIComponent(path);

    if (
      !decodedPath.startsWith("/") ||
      decodedPath.startsWith("//") ||
      decodedPath.includes("\\") ||
      /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(decodedPath)
    ) {
      return undefined;
    }

    return decodedPath;
  } catch {
    return undefined;
  }
}

export { createOAuthState, readOAuthState };
