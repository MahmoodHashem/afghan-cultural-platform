import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService, type JwtSignOptions } from "@nestjs/jwt";

import { UserStatus } from "@/generated/prisma/enums";
import type { AuthenticatedUser } from "@/modules/auth/types/authenticated-user.type";
import type {
  JwtAccessTokenPayload,
  JwtRefreshTokenPayload,
} from "@/modules/auth/types/jwt-payload.type";
import {
  hashPassword as createPasswordHash,
  hashRefreshToken as createRefreshTokenHash,
  verifyPassword as verifyPasswordHash,
} from "@/modules/auth/utils/password.util";
import { UsersService } from "@/modules/users/users.service";

@Injectable()
class AuthService {
  constructor(
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(ConfigService) private readonly configService: ConfigService,
    @Inject(UsersService) private readonly usersService: UsersService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    return createPasswordHash(password);
  }

  async verifyPassword(passwordHash: string, password: string): Promise<boolean> {
    return verifyPasswordHash(passwordHash, password);
  }

  async hashRefreshToken(refreshToken: string): Promise<string> {
    return createRefreshTokenHash(refreshToken);
  }

  async signAccessToken(user: AuthenticatedUser, sessionId: string): Promise<string> {
    const payload: JwtAccessTokenPayload = {
      sub: user.id,
      role: user.role,
      sessionId,
    };

    return this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>("JWT_ACCESS_SECRET"),
      expiresIn: this.getTokenLifetime("JWT_ACCESS_EXPIRES_IN"),
    });
  }

  async signRefreshToken(userId: string, sessionId: string): Promise<string> {
    const payload: JwtRefreshTokenPayload = {
      sub: userId,
      sessionId,
    };

    return this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>("JWT_REFRESH_SECRET"),
      expiresIn: this.getTokenLifetime("JWT_REFRESH_EXPIRES_IN"),
    });
  }

  async validateUserForAccess(payload: JwtAccessTokenPayload): Promise<AuthenticatedUser> {
    if (!payload.sub || !payload.sessionId || !payload.role) {
      throw new UnauthorizedException("Invalid access token payload");
    }

    const user = await this.usersService.findAuthenticatedUserById(payload.sub);

    if (!user || user.status === UserStatus.SUSPENDED) {
      throw new UnauthorizedException("Invalid or suspended user");
    }

    return user;
  }

  private getTokenLifetime(configKey: string): NonNullable<JwtSignOptions["expiresIn"]> {
    return this.configService.getOrThrow<NonNullable<JwtSignOptions["expiresIn"]>>(configKey);
  }
}

export { AuthService };
