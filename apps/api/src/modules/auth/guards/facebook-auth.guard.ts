import { type ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import type { Request } from "express";

import { AUTH_ERROR_CODES, FACEBOOK_AUTH_STRATEGY } from "@/modules/auth/auth.constants";
import type { NormalizedOAuthProfile } from "@/modules/auth/types/oauth-profile.type";

@Injectable()
class FacebookAuthGuard extends AuthGuard(FACEBOOK_AUTH_STRATEGY) {
  getAuthenticateOptions(context: ExecutionContext): { state?: string } {
    const request = context.switchToHttp().getRequest<Request>();
    const next = typeof request.query.next === "string" ? request.query.next : undefined;

    return {
      state: getSafeOAuthState(next),
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

function getSafeOAuthState(next: string | undefined) {
  if (!next) {
    return undefined;
  }

  try {
    const decodedNext = decodeURIComponent(next);

    if (
      !decodedNext.startsWith("/") ||
      decodedNext.startsWith("//") ||
      decodedNext.includes("\\") ||
      /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(decodedNext)
    ) {
      return undefined;
    }

    return decodedNext;
  } catch {
    return undefined;
  }
}

export { FacebookAuthGuard };
