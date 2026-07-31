import { createParamDecorator, type ExecutionContext } from "@nestjs/common";

import type { OAuthAuthenticatedRequest } from "@/modules/auth/types/oauth-authenticated-request.type";
import type { NormalizedOAuthProfile } from "@/modules/auth/types/oauth-profile.type";

const OAuthProfile = createParamDecorator(
  (_data: unknown, context: ExecutionContext): NormalizedOAuthProfile => {
    const request = context.switchToHttp().getRequest<OAuthAuthenticatedRequest>();

    return request.user;
  },
);

export { OAuthProfile };
