import type { Request } from "express";

import type { NormalizedOAuthProfile } from "@/modules/auth/types/oauth-profile.type";

type OAuthAuthenticatedRequest = Request & {
  user: NormalizedOAuthProfile;
};

export type { OAuthAuthenticatedRequest };
