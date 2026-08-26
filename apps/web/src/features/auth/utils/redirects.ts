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
  return createAuthPath("/login", nextPath);
}

function createRegisterPath(nextPath: string) {
  return createAuthPath("/register", nextPath);
}

function createAuthPath(authPath: "/login" | "/register", nextPath: string) {
  const safePath = getSafeRedirectPath(nextPath);

  return safePath === "/" ? authPath : `${authPath}?next=${encodeURIComponent(safePath)}`;
}

export { createLoginPath, createRegisterPath, DEFAULT_AUTHENTICATED_PATH, getSafeRedirectPath };
