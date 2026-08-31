import type { Request } from "express";

import type { NormalizedOAuthProfile } from "./oauth-profile.type";

type OAuthAuthenticatedRequest = Request & {
  user: NormalizedOAuthProfile;
};

export type { OAuthAuthenticatedRequest };
