import { createParamDecorator, type ExecutionContext } from "@nestjs/common";

import type { OAuthAuthenticatedRequest } from "../types/oauth-authenticated-request.type";
import type { NormalizedOAuthProfile } from "../types/oauth-profile.type";

const OAuthProfile = createParamDecorator(
  (_data: unknown, context: ExecutionContext): NormalizedOAuthProfile => {
    const request = context.switchToHttp().getRequest<OAuthAuthenticatedRequest>();

    return request.user;
  },
);

export { OAuthProfile };
