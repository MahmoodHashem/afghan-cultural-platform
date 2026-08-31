import { type ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import type { Request } from "express";

import { AUTH_ERROR_CODES, FACEBOOK_AUTH_STRATEGY } from "../auth.constants";
import type { NormalizedOAuthProfile } from "../types/oauth-profile.type";
import { createOAuthState } from "../utils/oauth-state";

@Injectable()
class FacebookAuthGuard extends AuthGuard(FACEBOOK_AUTH_STRATEGY) {
  getAuthenticateOptions(context: ExecutionContext): { state?: string } {
    const request = context.switchToHttp().getRequest<Request>();
    const next = typeof request.query.next === "string" ? request.query.next : undefined;

    return {
      state: createOAuthState(next),
    };
  }

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
