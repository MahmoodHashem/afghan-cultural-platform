import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

import { AuthService } from "../auth.service";
import type { AuthenticatedUser } from "../types/authenticated-user.type";
import type { JwtAccessTokenPayload } from "../types/jwt-payload.type";

@Injectable()
class JwtAccessStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(ConfigService) configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.getOrThrow<string>("JWT_ACCESS_SECRET"),
    });
  }

  async validate(payload: JwtAccessTokenPayload): Promise<AuthenticatedUser> {
    return this.authService.validateUserForAccess(payload);
  }
}

export { JwtAccessStrategy };
