import type { UserRole } from "../../../generated/prisma/enums";

type JwtAccessTokenPayload = {
  sub: string;
  role: UserRole;
  sessionId: string;
  iat?: number;
  exp?: number;
};

type JwtRefreshTokenPayload = {
  sub: string;
  sessionId: string;
  iat?: number;
  exp?: number;
};

export type { JwtAccessTokenPayload, JwtRefreshTokenPayload };
