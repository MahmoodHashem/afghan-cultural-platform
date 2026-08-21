const DEFAULT_AUTHENTICATED_PATH = "/";

function getSafeRedirectPath(path: string | null | undefined) {
  if (!path) {
    return DEFAULT_AUTHENTICATED_PATH;
  }

  try {
    const decodedPath = decodeURIComponent(path);

    if (
      !decodedPath.startsWith("/") ||
      decodedPath.startsWith("//") ||
      decodedPath.includes("\\") ||
      /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(decodedPath)
    ) {
      return DEFAULT_AUTHENTICATED_PATH;
    }

    return decodedPath;
  } catch {
    return DEFAULT_AUTHENTICATED_PATH;
  }
}

function createLoginPath(nextPath: string) {
  const safePath = getSafeRedirectPath(nextPath);

  return safePath === "/" ? "/login" : `/login?next=${encodeURIComponent(safePath)}`;
}

export { createLoginPath, DEFAULT_AUTHENTICATED_PATH, getSafeRedirectPath };
