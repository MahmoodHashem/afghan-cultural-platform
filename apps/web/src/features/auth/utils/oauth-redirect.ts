import { createOAuthStartUrl } from "@/features/auth/api/auth-api";
import { getSafeRedirectPath } from "@/features/auth/utils/redirects";

type OAuthProvider = "google" | "facebook";

function redirectToOAuthProvider(provider: OAuthProvider, nextPath: string | null) {
  window.location.assign(createOAuthStartUrl(provider, getSafeRedirectPath(nextPath)));
}

export { redirectToOAuthProvider };
