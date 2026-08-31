import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { AUTH_ERROR_CODES, REQUIRE_VERIFIED_EMAIL_KEY } from "../auth.constants";
import type { AuthenticatedRequest } from "../types/authenticated-request.type";

@Injectable()
class VerifiedEmailGuard implements CanActivate {
  constructor(@Inject(Reflector) private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiresVerifiedEmail = this.reflector.getAllAndOverride<boolean>(
      REQUIRE_VERIFIED_EMAIL_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiresVerifiedEmail) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (request.user?.emailVerifiedAt) {
      return true;
    }

    throw new ForbiddenException({
      error: AUTH_ERROR_CODES.EMAIL_VERIFICATION_REQUIRED,
      message: "Verified email is required for this action.",
    });
  }
}

export { VerifiedEmailGuard };
