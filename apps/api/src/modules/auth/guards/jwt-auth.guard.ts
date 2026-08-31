import {
  type ExecutionContext,
  HttpException,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";

import { AUTH_ERROR_CODES, IS_PUBLIC_ROUTE_KEY, JWT_ACCESS_STRATEGY } from "../auth.constants";
import type { AuthenticatedUser } from "../types/authenticated-user.type";

@Injectable()
class JwtAuthGuard extends AuthGuard(JWT_ACCESS_STRATEGY) {
  constructor(@Inject(Reflector) private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const isPublicRoute = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_ROUTE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublicRoute) {
      return true;
    }

    return super.canActivate(context) as boolean | Promise<boolean>;
  }

  handleRequest<TUser = AuthenticatedUser>(error: unknown, user: TUser | false): TUser {
    if (error instanceof HttpException) {
      throw error;
    }

    if (error || !user) {
      throw new UnauthorizedException({
        error: AUTH_ERROR_CODES.UNAUTHORIZED,
        message: "Authentication is required.",
      });
    }

    return user;
  }
}

export { JwtAuthGuard };
