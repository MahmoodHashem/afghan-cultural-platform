import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import { AUTH_ERROR_CODES, FACEBOOK_AUTH_STRATEGY } from "@/modules/auth/auth.constants";
import type { NormalizedOAuthProfile } from "@/modules/auth/types/oauth-profile.type";

@Injectable()
class FacebookAuthGuard extends AuthGuard(FACEBOOK_AUTH_STRATEGY) {
  handleRequest<TUser = NormalizedOAuthProfile>(error: unknown, user: TUser | false): TUser {
    if (error || !user) {
      throw new UnauthorizedException({
        error: AUTH_ERROR_CODES.FACEBOOK_AUTH_FAILED,
        message: "Facebook authentication failed.",
      });
    }

    return user;
  }
}

export { FacebookAuthGuard };
