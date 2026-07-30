import type { AuthProvider } from "@/generated/prisma/enums";

/**
 * Google and Facebook strategies will map provider profiles into this common shape.
 * Only verified provider emails may be used for automatic account linking.
 * Provider access tokens must not become platform sessions.
 * Successful OAuth login still issues the platform access and refresh tokens.
 */
type NormalizedOAuthProfile = {
  provider: AuthProvider;
  providerAccountId: string;
  email: string | null;
  emailVerified: boolean;
  displayName: string;
  avatarUrl: string | null;
};

export type { NormalizedOAuthProfile };
