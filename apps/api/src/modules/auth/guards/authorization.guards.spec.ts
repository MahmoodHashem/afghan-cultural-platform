jest.mock("../../../database/prisma.service", () => ({
  PrismaService: class PrismaService {},
}));

import { ForbiddenException, HttpException } from "@nestjs/common";
import { APP_GUARD, type Reflector } from "@nestjs/core";

import { UserRole, UserStatus } from "../../../generated/prisma/enums";
import {
  AUTH_ERROR_CODES,
  IS_PUBLIC_ROUTE_KEY,
  REQUIRE_VERIFIED_EMAIL_KEY,
  ROLES_KEY,
} from "../auth.constants";
import { selectCurrentUserField } from "../decorators/current-user.decorator";
import type { AuthenticatedUser } from "../types/authenticated-user.type";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { RolesGuard } from "./roles.guard";
import { VerifiedEmailGuard } from "./verified-email.guard";

const verifiedUser: AuthenticatedUser = {
  id: "90fc7cb5-984d-4ac7-83e6-81ebf63a5c63",
  email: "mahmood@example.com",
  displayName: "Mahmood",
  role: UserRole.USER,
  status: UserStatus.ACTIVE,
  profileImageUrl: null,
  emailVerifiedAt: new Date("2026-01-01T00:00:00.000Z"),
};

const unverifiedUser: AuthenticatedUser = {
  ...verifiedUser,
  emailVerifiedAt: null,
};

describe("authorization guards", () => {
  it("bypasses JWT authentication for public routes", () => {
    const guard = new JwtAuthGuard(createReflectorMock(true));

    expect(guard.canActivate(createExecutionContext())).toBe(true);
  });

  it("rejects protected routes when the token is missing", () => {
    const guard = new JwtAuthGuard(createReflectorMock(false));

    expectAuthCode(() => guard.handleRequest(null, false), AUTH_ERROR_CODES.UNAUTHORIZED);
  });

  it("allows a valid authenticated user", () => {
    const guard = new JwtAuthGuard(createReflectorMock(false));

    expect(guard.handleRequest(null, verifiedUser)).toBe(verifiedUser);
  });

  it("preserves suspended-user rejection from the JWT strategy", () => {
    const guard = new JwtAuthGuard(createReflectorMock(false));

    expectAuthCode(
      () =>
        guard.handleRequest(
          new ForbiddenException({
            error: AUTH_ERROR_CODES.ACCOUNT_SUSPENDED,
            message: "Account is suspended.",
          }),
          false,
        ),
      AUTH_ERROR_CODES.ACCOUNT_SUSPENDED,
    );
  });

  it("allows normal authenticated routes without role metadata", () => {
    const guard = new RolesGuard(createReflectorMock(undefined));

    expect(guard.canActivate(createExecutionContext(verifiedUser))).toBe(true);
  });

  it("rejects USER access to a MODERATOR route", () => {
    const guard = new RolesGuard(createReflectorMock([UserRole.MODERATOR]));

    expectAuthCode(
      () => guard.canActivate(createExecutionContext(verifiedUser)),
      AUTH_ERROR_CODES.INSUFFICIENT_ROLE,
    );
  });

  it("allows MODERATOR access to a MODERATOR route", () => {
    const guard = new RolesGuard(createReflectorMock([UserRole.MODERATOR]));

    expect(
      guard.canActivate(
        createExecutionContext({
          ...verifiedUser,
          role: UserRole.MODERATOR,
        }),
      ),
    ).toBe(true);
  });

  it("allows ADMIN access to an ADMIN route", () => {
    const guard = new RolesGuard(createReflectorMock([UserRole.ADMIN]));

    expect(
      guard.canActivate(
        createExecutionContext({
          ...verifiedUser,
          role: UserRole.ADMIN,
        }),
      ),
    ).toBe(true);
  });

  it("allows ADMIN access to a route allowing MODERATOR or ADMIN", () => {
    const guard = new RolesGuard(createReflectorMock([UserRole.MODERATOR, UserRole.ADMIN]));

    expect(
      guard.canActivate(
        createExecutionContext({
          ...verifiedUser,
          role: UserRole.ADMIN,
        }),
      ),
    ).toBe(true);
  });

  it("allows unverified users on normal authenticated routes", () => {
    const guard = new VerifiedEmailGuard(createReflectorMock(false));

    expect(guard.canActivate(createExecutionContext(unverifiedUser))).toBe(true);
  });

  it("rejects unverified users only on verified-email routes", () => {
    const guard = new VerifiedEmailGuard(createReflectorMock(true));

    expectAuthCode(
      () => guard.canActivate(createExecutionContext(unverifiedUser)),
      AUTH_ERROR_CODES.EMAIL_VERIFICATION_REQUIRED,
    );
  });

  it("allows verified users on verified-email routes", () => {
    const guard = new VerifiedEmailGuard(createReflectorMock(true));

    expect(guard.canActivate(createExecutionContext(verifiedUser))).toBe(true);
  });

  it("returns safe current user data", () => {
    expect(selectCurrentUserField(verifiedUser)).toEqual(verifiedUser);
  });

  it('returns a requested current-user field such as @CurrentUser("id")', () => {
    expect(selectCurrentUserField(verifiedUser, "id")).toBe(verifiedUser.id);
  });

  it("configures global auth guard order before throttling", () => {
    process.env.CLOUDINARY_CLOUD_NAME ??= "test-cloud";
    process.env.CLOUDINARY_API_KEY ??= "test-key";
    process.env.CLOUDINARY_API_SECRET ??= "test-secret";
    process.env.YOUTUBE_API_KEY ??= "test-youtube-key";
    process.env.CACHE_REVALIDATION_SECRET ??= "test-cache-revalidation-secret-123456";
    const { AppModule } = jest.requireActual(
      "../../../app.module",
    ) as typeof import("../../../app.module");
    const providers = Reflect.getMetadata("providers", AppModule) as Array<{
      provide?: unknown;
      useClass?: { name: string };
    }>;
    const globalGuardOrder = providers
      .filter((provider) => provider.provide === APP_GUARD)
      .map((provider) => provider.useClass?.name);

    expect(globalGuardOrder).toEqual([
      "JwtAuthGuard",
      "RolesGuard",
      "VerifiedEmailGuard",
      "ThrottlerGuard",
    ]);
  });
});

function createReflectorMock<T>(value: T): Reflector {
  return {
    getAllAndOverride: jest.fn((key: string) => {
      if (key === IS_PUBLIC_ROUTE_KEY || key === ROLES_KEY || key === REQUIRE_VERIFIED_EMAIL_KEY) {
        return value;
      }

      return undefined;
    }),
  } as unknown as Reflector;
}

function createExecutionContext(user?: AuthenticatedUser) {
  return {
    getClass: jest.fn(),
    getHandler: jest.fn(),
    switchToHttp: jest.fn(() => ({
      getRequest: jest.fn(() => ({
        user,
      })),
    })),
  } as never;
}

function expectAuthCode(action: () => unknown, expectedCode: string): void {
  try {
    action();
    throw new Error("Expected auth error was not thrown");
  } catch (error) {
    expect(error).toBeInstanceOf(HttpException);
    expect((error as HttpException).getResponse()).toMatchObject({
      error: expectedCode,
    });
  }
}
