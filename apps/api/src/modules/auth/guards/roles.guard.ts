import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import type { UserRole } from "../../../generated/prisma/enums";
import { AUTH_ERROR_CODES, ROLES_KEY } from "../auth.constants";
import type { AuthenticatedRequest } from "../types/authenticated-request.type";

@Injectable()
class RolesGuard implements CanActivate {
  constructor(@Inject(Reflector) private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const allowedRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!allowedRoles || allowedRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userRole = request.user?.role;

    if (userRole && allowedRoles.includes(userRole)) {
      return true;
    }

    throw new ForbiddenException({
      error: AUTH_ERROR_CODES.INSUFFICIENT_ROLE,
      message: "This route requires a different role.",
    });
  }
}

export { RolesGuard };
