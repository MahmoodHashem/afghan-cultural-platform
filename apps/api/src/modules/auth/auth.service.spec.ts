jest.mock("@/database/prisma.service", () => ({
  PrismaService: class PrismaService {},
}));

import { UnauthorizedException } from "@nestjs/common";
import { ConfigModule, type ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Test, type TestingModule } from "@nestjs/testing";
import { PrismaService } from "@/database/prisma.service";
import { UserRole, UserStatus } from "@/generated/prisma/enums";
import { AuthModule } from "@/modules/auth/auth.module";
import { AuthService } from "@/modules/auth/auth.service";
import type { AuthenticatedUser } from "@/modules/auth/types/authenticated-user.type";
import type { JwtAccessTokenPayload } from "@/modules/auth/types/jwt-payload.type";
import type { UsersService } from "@/modules/users/users.service";

const JWT_ACCESS_SECRET = "test-access-secret-with-at-least-32-characters";
const JWT_REFRESH_SECRET = "test-refresh-secret-with-at-least-32-characters";

const activeUser: AuthenticatedUser = {
  id: "90fc7cb5-984d-4ac7-83e6-81ebf63a5c63",
  email: "mahmood@example.com",
  role: UserRole.USER,
  status: UserStatus.ACTIVE,
  displayName: "Mahmood",
  profileImageUrl: null,
  emailVerifiedAt: new Date("2026-01-01T00:00:00.000Z"),
};

describe("AuthService", () => {
  let authService: AuthService;
  let jwtService: JwtService;
  let usersService: jest.Mocked<Pick<UsersService, "findAuthenticatedUserById">>;

  beforeEach(() => {
    jwtService = new JwtService();
    usersService = {
      findAuthenticatedUserById: jest.fn(),
    };

    const configService = {
      getOrThrow: jest.fn((key: string) => {
        const values: Record<string, string> = {
          JWT_ACCESS_SECRET,
          JWT_REFRESH_SECRET,
          JWT_ACCESS_EXPIRES_IN: "15m",
          JWT_REFRESH_EXPIRES_IN: "7d",
        };

        return values[key];
      }),
    } as unknown as ConfigService;

    authService = new AuthService(
      jwtService,
      configService,
      usersService as unknown as UsersService,
    );
  });

  it("signs an access token with the expected payload shape", async () => {
    const token = await authService.signAccessToken(activeUser, "session-id");
    const payload = await jwtService.verifyAsync<JwtAccessTokenPayload>(token, {
      secret: JWT_ACCESS_SECRET,
    });

    expect(payload).toMatchObject({
      sub: activeUser.id,
      role: UserRole.USER,
      sessionId: "session-id",
    });
    expect(payload).not.toHaveProperty("passwordHash");
    expect(payload).not.toHaveProperty("email");
  });

  it("rejects a suspended user during access-token validation", async () => {
    usersService.findAuthenticatedUserById.mockResolvedValue({
      ...activeUser,
      status: UserStatus.SUSPENDED,
    });

    await expect(
      authService.validateUserForAccess({
        sub: activeUser.id,
        role: UserRole.USER,
        sessionId: "session-id",
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("loads the auth module with JWT configuration from environment values", async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          load: [
            () => ({
              JWT_ACCESS_SECRET,
              JWT_REFRESH_SECRET,
              JWT_ACCESS_EXPIRES_IN: "15m",
              JWT_REFRESH_EXPIRES_IN: "7d",
              DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/test?schema=public",
            }),
          ],
        }),
        AuthModule,
      ],
    })
      .overrideProvider(PrismaService)
      .useValue({
        user: {
          findUnique: jest.fn(),
        },
      })
      .compile();

    expect(module.get(AuthService)).toBeDefined();
  });
});
