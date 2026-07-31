jest.mock("@/database/prisma.service", () => ({
  PrismaService: class PrismaService {},
}));

import { HttpException } from "@nestjs/common";
import { ConfigModule, type ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Test, type TestingModule } from "@nestjs/testing";

import { MailService } from "@/common/mail/mail.service";
import { PrismaService } from "@/database/prisma.service";
import { AuthProvider, UserRole, UserStatus } from "@/generated/prisma/enums";
import {
  AUTH_ERROR_CODES,
  EMAIL_VERIFICATION_NEUTRAL_MESSAGE,
  PASSWORD_RESET_NEUTRAL_MESSAGE,
} from "@/modules/auth/auth.constants";
import { AuthController } from "@/modules/auth/auth.controller";
import { AuthModule } from "@/modules/auth/auth.module";
import { AuthService } from "@/modules/auth/auth.service";
import type {
  AuthRequestContext,
  RefreshCookie,
} from "@/modules/auth/types/auth-request-context.type";
import type { AuthSessionResponse } from "@/modules/auth/types/auth-response.type";
import type { AuthenticatedUser } from "@/modules/auth/types/authenticated-user.type";
import type { JwtAccessTokenPayload } from "@/modules/auth/types/jwt-payload.type";
import type { NormalizedOAuthProfile } from "@/modules/auth/types/oauth-profile.type";
import { hashToken } from "@/modules/auth/utils/token.util";
import type { UsersService } from "@/modules/users/users.service";

type PrismaMock = {
  emailVerificationToken: {
    create: jest.Mock;
    findUnique: jest.Mock;
    update: jest.Mock;
    updateMany: jest.Mock;
  };
  oAuthAccount: {
    create: jest.Mock;
    findUnique: jest.Mock;
  };
  passwordResetToken: {
    create: jest.Mock;
    findUnique: jest.Mock;
    update: jest.Mock;
    updateMany: jest.Mock;
  };
  refreshSession: {
    create: jest.Mock;
    findMany: jest.Mock;
    findUnique: jest.Mock;
    update: jest.Mock;
    updateMany: jest.Mock;
  };
  user: {
    create: jest.Mock;
    update: jest.Mock;
    findUnique: jest.Mock;
  };
  $transaction: jest.Mock;
};

type UsersServiceMock = jest.Mocked<
  Pick<
    UsersService,
    | "createEmailPasswordUser"
    | "findAuthenticatedUserById"
    | "findUserByEmail"
    | "findUserCredentialsByEmail"
    | "isSuspended"
    | "normalizeEmail"
    | "updateLastLoginAt"
  >
>;

type MailServiceMock = jest.Mocked<Pick<MailService, "sendMail" | "sendPasswordResetEmail">>;

const JWT_ACCESS_SECRET = "test-access-secret-with-at-least-32-characters";
const JWT_REFRESH_SECRET = "test-refresh-secret-with-at-least-32-characters";
const USER_ID = "90fc7cb5-984d-4ac7-83e6-81ebf63a5c63";
const REFRESH_SESSION_ID = "57c8704b-3ae5-4e22-b8e6-01615f857df9";

const unverifiedUser: AuthenticatedUser = {
  id: USER_ID,
  email: "mahmood@example.com",
  role: UserRole.USER,
  status: UserStatus.ACTIVE,
  displayName: "Mahmood",
  profileImageUrl: null,
  emailVerifiedAt: null,
};

const verifiedUser: AuthenticatedUser = {
  ...unverifiedUser,
  emailVerifiedAt: new Date("2026-01-01T00:00:00.000Z"),
};

const googleProfile: NormalizedOAuthProfile = {
  provider: AuthProvider.GOOGLE,
  providerAccountId: "google-account-id",
  email: "Mahmood@Example.COM",
  emailVerified: true,
  displayName: "Mahmood Google",
  avatarUrl: "https://example.com/avatar.png",
};

const facebookProfile: NormalizedOAuthProfile = {
  provider: AuthProvider.FACEBOOK,
  providerAccountId: "facebook-account-id",
  email: "Mahmood@Example.COM",
  emailVerified: false,
  displayName: "Mahmood Facebook",
  avatarUrl: "https://example.com/facebook-avatar.png",
};

describe("AuthService", () => {
  let authService: AuthService;
  let jwtService: JwtService;
  let usersService: UsersServiceMock;
  let prisma: PrismaMock;
  let mailService: MailServiceMock;

  beforeEach(() => {
    jwtService = new JwtService();
    usersService = createUsersServiceMock();
    prisma = createPrismaMock();
    mailService = {
      sendMail: jest.fn().mockResolvedValue(undefined),
      sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
    };

    authService = new AuthService(
      jwtService,
      createConfigService(),
      usersService as unknown as UsersService,
      prisma as unknown as PrismaService,
      mailService as unknown as MailService,
    );
  });

  it("registers a user, sends verification email, and returns an access token", async () => {
    usersService.findUserByEmail.mockResolvedValue(null);
    usersService.createEmailPasswordUser.mockResolvedValue(unverifiedUser);

    const response = await authService.register({
      displayName: "Mahmood",
      email: "mahmood@example.com",
      password: "StrongPass123",
    });

    expect(response.data.accessToken).toEqual(expect.any(String));
    expect(response.data.user).toEqual({
      id: USER_ID,
      displayName: "Mahmood",
      email: "mahmood@example.com",
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      emailVerified: false,
    });
    expect(prisma.emailVerificationToken.create).toHaveBeenCalledTimes(1);
    expect(prisma.refreshSession.create).toHaveBeenCalledTimes(1);
    expect(mailService.sendMail).toHaveBeenCalledTimes(1);
    expectSensitiveFieldsToBeAbsent(response);
  });

  it("sets an HTTP-only refresh cookie during registration", async () => {
    usersService.findUserByEmail.mockResolvedValue(null);
    usersService.createEmailPasswordUser.mockResolvedValue(unverifiedUser);
    const context = createAuthRequestContext();

    const response = await authService.register(
      {
        displayName: "Mahmood",
        email: "mahmood@example.com",
        password: "StrongPass123",
      },
      context,
    );

    expect(context.setRefreshCookie).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "refresh_token",
        value: expect.any(String),
        options: expect.objectContaining({
          httpOnly: true,
          path: "/api/v1/auth",
          sameSite: "lax",
          secure: false,
        }),
      }),
    );
    expectSensitiveFieldsToBeAbsent(response);
  });

  it("rejects duplicate email registration", async () => {
    usersService.findUserByEmail.mockResolvedValue(unverifiedUser);

    await expectAuthCode(
      () =>
        authService.register({
          displayName: "Mahmood",
          email: "mahmood@example.com",
          password: "StrongPass123",
        }),
      AUTH_ERROR_CODES.EMAIL_ALREADY_REGISTERED,
    );
  });

  it("normalizes registration email before lookup and creation", async () => {
    usersService.findUserByEmail.mockResolvedValue(null);
    usersService.createEmailPasswordUser.mockResolvedValue(unverifiedUser);

    await authService.register({
      displayName: "Mahmood",
      email: " Mahmood@Example.COM ",
      password: "StrongPass123",
    });

    expect(usersService.findUserByEmail).toHaveBeenCalledWith("mahmood@example.com");
    expect(usersService.createEmailPasswordUser).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "mahmood@example.com",
      }),
    );
  });

  it("hashes the password before storing a registered user", async () => {
    usersService.findUserByEmail.mockResolvedValue(null);
    usersService.createEmailPasswordUser.mockResolvedValue(unverifiedUser);

    await authService.register({
      displayName: "Mahmood",
      email: "mahmood@example.com",
      password: "StrongPass123",
    });

    const [{ passwordHash }] = usersService.createEmailPasswordUser.mock.calls[0];

    expect(passwordHash).not.toBe("StrongPass123");
    expect(await authService.verifyPassword(passwordHash, "StrongPass123")).toBe(true);
  });

  it("generates and stores only a hashed verification token", async () => {
    usersService.findUserByEmail.mockResolvedValue(null);
    usersService.createEmailPasswordUser.mockResolvedValue(unverifiedUser);

    await authService.register({
      displayName: "Mahmood",
      email: "mahmood@example.com",
      password: "StrongPass123",
    });

    const token = extractVerificationTokenFromMail();
    const [{ data }] = prisma.emailVerificationToken.create.mock.calls[0];

    expect(data.tokenHash).toBe(hashToken(token));
    expect(data.tokenHash).not.toBe(token);
    expect(data).not.toHaveProperty("token");
  });

  it("verifies a valid email token in one transaction", async () => {
    const token = "valid-token";
    const expiresAt = new Date(Date.now() + 60_000);

    prisma.emailVerificationToken.findUnique.mockResolvedValue({
      id: "verification-token-id",
      userId: USER_ID,
      expiresAt,
      usedAt: null,
    });
    prisma.user.update.mockResolvedValue(verifiedUser);

    const response = await authService.verifyEmail({ token });

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(prisma.emailVerificationToken.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          tokenHash: hashToken(token),
        },
      }),
    );
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: USER_ID,
        },
        data: {
          emailVerifiedAt: expect.any(Date),
        },
      }),
    );
    expect(prisma.emailVerificationToken.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: "verification-token-id",
        },
        data: {
          usedAt: expect.any(Date),
        },
      }),
    );
    expect(response.data.user.emailVerified).toBe(true);
  });

  it("rejects an expired verification token", async () => {
    prisma.emailVerificationToken.findUnique.mockResolvedValue({
      id: "verification-token-id",
      userId: USER_ID,
      expiresAt: new Date(Date.now() - 60_000),
      usedAt: null,
    });

    await expectAuthCode(
      () => authService.verifyEmail({ token: "expired-token" }),
      AUTH_ERROR_CODES.VERIFICATION_TOKEN_EXPIRED,
    );
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it("rejects an invalid verification token", async () => {
    prisma.emailVerificationToken.findUnique.mockResolvedValue(null);

    await expectAuthCode(
      () => authService.verifyEmail({ token: "invalid-token" }),
      AUTH_ERROR_CODES.VERIFICATION_TOKEN_INVALID,
    );
  });

  it("resends verification with a neutral response", async () => {
    usersService.findUserByEmail.mockResolvedValue(unverifiedUser);

    const response = await authService.resendVerification({
      email: "mahmood@example.com",
    });

    expect(response).toEqual({
      data: {
        message: EMAIL_VERIFICATION_NEUTRAL_MESSAGE,
      },
    });
    expect(prisma.emailVerificationToken.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId: USER_ID,
          usedAt: null,
        },
      }),
    );
    expect(prisma.emailVerificationToken.create).toHaveBeenCalledTimes(1);
    expect(mailService.sendMail).toHaveBeenCalledTimes(1);
  });

  it("does not resend verification for an already verified account", async () => {
    usersService.findUserByEmail.mockResolvedValue(verifiedUser);

    const response = await authService.resendVerification({
      email: "mahmood@example.com",
    });

    expect(response.data.message).toBe(EMAIL_VERIFICATION_NEUTRAL_MESSAGE);
    expect(prisma.emailVerificationToken.create).not.toHaveBeenCalled();
    expect(mailService.sendMail).not.toHaveBeenCalled();
  });

  it("returns a neutral forgot-password response for an existing email", async () => {
    usersService.findUserByEmail.mockResolvedValue(unverifiedUser);

    const response = await authService.forgotPassword({
      email: " Mahmood@Example.COM ",
    });

    expect(response).toEqual({
      data: {
        message: PASSWORD_RESET_NEUTRAL_MESSAGE,
      },
    });
    expect(usersService.findUserByEmail).toHaveBeenCalledWith("mahmood@example.com");
    expect(prisma.passwordResetToken.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId: USER_ID,
          usedAt: null,
        },
      }),
    );
    expect(prisma.passwordResetToken.create).toHaveBeenCalledTimes(1);
    expect(mailService.sendPasswordResetEmail).toHaveBeenCalledTimes(1);
  });

  it("returns a neutral forgot-password response for a missing email", async () => {
    usersService.findUserByEmail.mockResolvedValue(null);

    const response = await authService.forgotPassword({
      email: "missing@example.com",
    });

    expect(response.data.message).toBe(PASSWORD_RESET_NEUTRAL_MESSAGE);
    expect(prisma.passwordResetToken.create).not.toHaveBeenCalled();
    expect(mailService.sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it("creates only a hashed password reset token and emails the raw token in the reset URL", async () => {
    usersService.findUserByEmail.mockResolvedValue(unverifiedUser);

    await authService.forgotPassword({
      email: "mahmood@example.com",
    });

    const [{ data }] = prisma.passwordResetToken.create.mock.calls[0];
    const [{ resetUrl }] = mailService.sendPasswordResetEmail.mock.calls[0];
    const token = new URL(resetUrl).searchParams.get("token") ?? "";

    expect(data.tokenHash).toBe(hashToken(token));
    expect(data.tokenHash).not.toBe(token);
    expect(data).not.toHaveProperty("token");
  });

  it("invalidates previous unused reset tokens before creating a new one", async () => {
    usersService.findUserByEmail.mockResolvedValue(unverifiedUser);

    await authService.forgotPassword({
      email: "mahmood@example.com",
    });

    expect(prisma.passwordResetToken.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId: USER_ID,
          usedAt: null,
        },
        data: {
          usedAt: expect.any(Date),
        },
      }),
    );
  });

  it("resets a password, marks the token used, revokes refresh sessions, and clears the cookie", async () => {
    const context = createAuthRequestContext();
    const token = "valid-password-reset-token";

    prisma.passwordResetToken.findUnique.mockResolvedValue({
      id: "password-reset-token-id",
      expiresAt: new Date(Date.now() + 60_000),
      usedAt: null,
      user: {
        ...unverifiedUser,
        passwordHash: null,
      },
    });

    const response = await authService.resetPassword(
      {
        token,
        newPassword: "NewStrongPass123",
      },
      context,
    );

    expect(response.data.message).toBe("Password reset successfully.");
    expect(prisma.passwordResetToken.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          tokenHash: hashToken(token),
        },
      }),
    );
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: USER_ID,
        },
        data: {
          passwordHash: expect.any(String),
        },
      }),
    );
    expect(prisma.passwordResetToken.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: "password-reset-token-id",
        },
        data: {
          usedAt: expect.any(Date),
        },
      }),
    );
    expect(prisma.refreshSession.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId: USER_ID,
          revokedAt: null,
        },
      }),
    );
    expect(context.clearRefreshCookie).toHaveBeenCalledTimes(1);
    expectSensitiveMessageFieldsToBeAbsent(response);
  });

  it("rejects an invalid password reset token", async () => {
    prisma.passwordResetToken.findUnique.mockResolvedValue(null);

    await expectAuthCode(
      () =>
        authService.resetPassword({
          token: "invalid-token",
          newPassword: "NewStrongPass123",
        }),
      AUTH_ERROR_CODES.PASSWORD_RESET_TOKEN_INVALID,
    );
  });

  it("rejects an expired password reset token", async () => {
    prisma.passwordResetToken.findUnique.mockResolvedValue({
      id: "password-reset-token-id",
      expiresAt: new Date(Date.now() - 60_000),
      usedAt: null,
      user: {
        ...unverifiedUser,
        passwordHash: null,
      },
    });

    await expectAuthCode(
      () =>
        authService.resetPassword({
          token: "expired-token",
          newPassword: "NewStrongPass123",
        }),
      AUTH_ERROR_CODES.PASSWORD_RESET_TOKEN_EXPIRED,
    );
  });

  it("rejects a used password reset token", async () => {
    prisma.passwordResetToken.findUnique.mockResolvedValue({
      id: "password-reset-token-id",
      expiresAt: new Date(Date.now() + 60_000),
      usedAt: new Date(),
      user: {
        ...unverifiedUser,
        passwordHash: null,
      },
    });

    await expectAuthCode(
      () =>
        authService.resetPassword({
          token: "used-token",
          newPassword: "NewStrongPass123",
        }),
      AUTH_ERROR_CODES.PASSWORD_RESET_TOKEN_USED,
    );
  });

  it("rejects password reset for suspended users", async () => {
    prisma.passwordResetToken.findUnique.mockResolvedValue({
      id: "password-reset-token-id",
      expiresAt: new Date(Date.now() + 60_000),
      usedAt: null,
      user: {
        ...unverifiedUser,
        status: UserStatus.SUSPENDED,
        passwordHash: null,
      },
    });

    await expectAuthCode(
      () =>
        authService.resetPassword({
          token: "valid-token",
          newPassword: "NewStrongPass123",
        }),
      AUTH_ERROR_CODES.ACCOUNT_SUSPENDED,
    );
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it("rejects weak reset passwords with a stable error code", async () => {
    await expectAuthCode(
      () =>
        authService.resetPassword({
          token: "valid-token",
          newPassword: "weak",
        }),
      AUTH_ERROR_CODES.PASSWORD_TOO_WEAK,
    );
    expect(prisma.passwordResetToken.findUnique).not.toHaveBeenCalled();
  });

  it("logs in an unverified email/password user", async () => {
    const passwordHash = await authService.hashPassword("StrongPass123");

    usersService.findUserCredentialsByEmail.mockResolvedValue({
      ...unverifiedUser,
      passwordHash,
    });
    usersService.updateLastLoginAt.mockResolvedValue(unverifiedUser);

    const response = await authService.login({
      email: "mahmood@example.com",
      password: "StrongPass123",
    });

    const payload = await jwtService.verifyAsync<JwtAccessTokenPayload>(response.data.accessToken, {
      secret: JWT_ACCESS_SECRET,
    });

    expect(payload).toMatchObject({
      sub: USER_ID,
      role: UserRole.USER,
    });
    expect(response.data.user.emailVerified).toBe(false);
    expect(usersService.updateLastLoginAt).toHaveBeenCalledWith(USER_ID, expect.any(Date));
    expectSensitiveFieldsToBeAbsent(response);
  });

  it("sets an HTTP-only refresh cookie during email login", async () => {
    const passwordHash = await authService.hashPassword("StrongPass123");
    const context = createAuthRequestContext();

    usersService.findUserCredentialsByEmail.mockResolvedValue({
      ...unverifiedUser,
      passwordHash,
    });
    usersService.updateLastLoginAt.mockResolvedValue(unverifiedUser);

    const response = await authService.login(
      {
        email: "mahmood@example.com",
        password: "StrongPass123",
      },
      context,
    );

    expect(context.setRefreshCookie).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "refresh_token",
        options: expect.objectContaining({
          httpOnly: true,
        }),
      }),
    );
    expect(JSON.stringify(response)).not.toContain(extractRefreshCookieValue(context));
  });

  it("uses a generic error for invalid credentials", async () => {
    usersService.findUserCredentialsByEmail.mockResolvedValue(null);

    await expectAuthCode(
      () =>
        authService.login({
          email: "mahmood@example.com",
          password: "WrongPass123",
        }),
      AUTH_ERROR_CODES.INVALID_CREDENTIALS,
    );
  });

  it("rejects suspended users during login", async () => {
    usersService.findUserCredentialsByEmail.mockResolvedValue({
      ...unverifiedUser,
      status: UserStatus.SUSPENDED,
      passwordHash: await authService.hashPassword("StrongPass123"),
    });

    await expectAuthCode(
      () =>
        authService.login({
          email: "mahmood@example.com",
          password: "StrongPass123",
        }),
      AUTH_ERROR_CODES.ACCOUNT_SUSPENDED,
    );
  });

  it("rejects OAuth-only accounts without configured passwords", async () => {
    usersService.findUserCredentialsByEmail.mockResolvedValue({
      ...unverifiedUser,
      passwordHash: null,
    });

    await expectAuthCode(
      () =>
        authService.login({
          email: "mahmood@example.com",
          password: "StrongPass123",
        }),
      AUTH_ERROR_CODES.PASSWORD_NOT_CONFIGURED,
    );
  });

  it("signs an access token with the expected payload shape", async () => {
    const token = await authService.signAccessToken(verifiedUser, "session-id");
    const payload = await jwtService.verifyAsync<JwtAccessTokenPayload>(token, {
      secret: JWT_ACCESS_SECRET,
    });

    expect(payload).toMatchObject({
      sub: USER_ID,
      role: UserRole.USER,
      sessionId: "session-id",
    });
    expect(payload).not.toHaveProperty("passwordHash");
    expect(payload).not.toHaveProperty("email");
  });

  it("rejects a suspended user during access-token validation", async () => {
    usersService.findAuthenticatedUserById.mockResolvedValue({
      ...verifiedUser,
      status: UserStatus.SUSPENDED,
    });

    await expect(
      authService.validateUserForAccess({
        sub: USER_ID,
        role: UserRole.USER,
        sessionId: "session-id",
      }),
    ).rejects.toBeInstanceOf(HttpException);
  });

  it("returns the current user response shape used by the endpoint", () => {
    const controller = new AuthController(authService, createConfigService());

    expect(controller.getCurrentUser(unverifiedUser)).toEqual({
      data: {
        user: {
          id: USER_ID,
          displayName: "Mahmood",
          email: "mahmood@example.com",
          role: UserRole.USER,
          status: UserStatus.ACTIVE,
          emailVerified: false,
        },
      },
    });
  });

  it("authenticates an existing linked Google account", async () => {
    const context = createAuthRequestContext();

    prisma.oAuthAccount.findUnique.mockResolvedValueOnce({
      user: verifiedUser,
    });
    prisma.user.update.mockResolvedValue(verifiedUser);

    const response = await authService.authenticateOAuthUser(googleProfile, context);
    const payload = await jwtService.verifyAsync<JwtAccessTokenPayload>(response.data.accessToken, {
      secret: JWT_ACCESS_SECRET,
    });

    expect(payload.sub).toBe(USER_ID);
    expect(response.data.user.emailVerified).toBe(true);
    expect(context.setRefreshCookie).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          httpOnly: true,
        }),
      }),
    );
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: USER_ID,
        },
        data: {
          lastLoginAt: expect.any(Date),
        },
      }),
    );
    expect(prisma.oAuthAccount.create).not.toHaveBeenCalled();
  });

  it("links Google to an existing email account when the provider email is verified", async () => {
    prisma.oAuthAccount.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
    prisma.user.findUnique.mockResolvedValue(unverifiedUser);
    prisma.user.update.mockResolvedValue(verifiedUser);

    const response = await authService.authenticateOAuthUser(googleProfile);

    expect(response.data.user.emailVerified).toBe(true);
    expect(prisma.user.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          email: "mahmood@example.com",
        },
      }),
    );
    expect(prisma.oAuthAccount.create).toHaveBeenCalledWith({
      data: {
        userId: USER_ID,
        provider: AuthProvider.GOOGLE,
        providerAccountId: "google-account-id",
        providerEmail: "mahmood@example.com",
      },
    });
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          emailVerifiedAt: expect.any(Date),
          lastLoginAt: expect.any(Date),
        },
      }),
    );
  });

  it("creates a new Google user and OAuth account for a verified provider email", async () => {
    prisma.oAuthAccount.findUnique.mockResolvedValueOnce(null);
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue(verifiedUser);

    const response = await authService.authenticateOAuthUser(googleProfile);

    expect(response.data.user.emailVerified).toBe(true);
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: "mahmood@example.com",
          passwordHash: null,
          role: UserRole.USER,
          status: UserStatus.ACTIVE,
          profileImageUrl: "https://example.com/avatar.png",
          emailVerifiedAt: expect.any(Date),
          oauthAccounts: {
            create: {
              provider: AuthProvider.GOOGLE,
              providerAccountId: "google-account-id",
              providerEmail: "mahmood@example.com",
            },
          },
        }),
      }),
    );
    expect(JSON.stringify(prisma.user.create.mock.calls[0])).not.toContain("accessToken");
    expect(JSON.stringify(prisma.user.create.mock.calls[0])).not.toContain("refreshToken");
  });

  it("rejects Google authentication when the provider email is not verified", async () => {
    prisma.oAuthAccount.findUnique.mockResolvedValueOnce(null);

    await expectAuthCode(
      () =>
        authService.authenticateOAuthUser({
          ...googleProfile,
          emailVerified: false,
        }),
      AUTH_ERROR_CODES.GOOGLE_EMAIL_NOT_VERIFIED,
    );
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it("rejects suspended users during Google authentication", async () => {
    prisma.oAuthAccount.findUnique.mockResolvedValueOnce({
      user: {
        ...verifiedUser,
        status: UserStatus.SUSPENDED,
      },
    });

    await expectAuthCode(
      () => authService.authenticateOAuthUser(googleProfile),
      AUTH_ERROR_CODES.ACCOUNT_SUSPENDED,
    );
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it("prevents linking a second Google account to the same user", async () => {
    prisma.oAuthAccount.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: "existing-google-link-id" });
    prisma.user.findUnique.mockResolvedValue(verifiedUser);

    await expectAuthCode(
      () => authService.authenticateOAuthUser(googleProfile),
      AUTH_ERROR_CODES.GOOGLE_ACCOUNT_ALREADY_LINKED,
    );
    expect(prisma.oAuthAccount.create).not.toHaveBeenCalled();
  });

  it("authenticates an existing linked Facebook account", async () => {
    const context = createAuthRequestContext();

    prisma.oAuthAccount.findUnique.mockResolvedValueOnce({
      user: {
        ...verifiedUser,
        emailVerifiedAt: null,
      },
    });
    prisma.user.update.mockResolvedValue({
      ...verifiedUser,
      emailVerifiedAt: null,
    });

    const response = await authService.authenticateOAuthUser(facebookProfile, context);
    const payload = await jwtService.verifyAsync<JwtAccessTokenPayload>(response.data.accessToken, {
      secret: JWT_ACCESS_SECRET,
    });

    expect(payload).toMatchObject({
      sub: USER_ID,
      role: UserRole.USER,
    });
    expect(response.data.user.emailVerified).toBe(false);
    expect(context.setRefreshCookie).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          httpOnly: true,
        }),
      }),
    );
    expect(prisma.oAuthAccount.create).not.toHaveBeenCalled();
  });

  it("creates a new Facebook user with an unverified platform email", async () => {
    prisma.oAuthAccount.findUnique.mockResolvedValueOnce(null);
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      ...unverifiedUser,
      displayName: "Mahmood Facebook",
      profileImageUrl: "https://example.com/facebook-avatar.png",
    });

    const response = await authService.authenticateOAuthUser(facebookProfile);

    expect(response.data.user.emailVerified).toBe(false);
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: "mahmood@example.com",
          passwordHash: null,
          role: UserRole.USER,
          status: UserStatus.ACTIVE,
          profileImageUrl: "https://example.com/facebook-avatar.png",
          emailVerifiedAt: null,
          oauthAccounts: {
            create: {
              provider: AuthProvider.FACEBOOK,
              providerAccountId: "facebook-account-id",
              providerEmail: "mahmood@example.com",
            },
          },
        }),
      }),
    );
    expect(JSON.stringify(prisma.user.create.mock.calls[0])).not.toContain("accessToken");
    expect(JSON.stringify(prisma.user.create.mock.calls[0])).not.toContain("refreshToken");
  });

  it("rejects Facebook authentication when no provider email is returned", async () => {
    prisma.oAuthAccount.findUnique.mockResolvedValueOnce(null);

    await expectAuthCode(
      () =>
        authService.authenticateOAuthUser({
          ...facebookProfile,
          email: null,
        }),
      AUTH_ERROR_CODES.FACEBOOK_EMAIL_REQUIRED,
    );
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it("prevents unsafe Facebook email auto-linking to an existing account", async () => {
    prisma.oAuthAccount.findUnique.mockResolvedValueOnce(null);
    prisma.user.findUnique.mockResolvedValue(unverifiedUser);

    await expectAuthCode(
      () => authService.authenticateOAuthUser(facebookProfile),
      AUTH_ERROR_CODES.FACEBOOK_EMAIL_LINKING_NOT_ALLOWED,
    );
    expect(prisma.oAuthAccount.create).not.toHaveBeenCalled();
  });

  it("rejects suspended users during Facebook authentication", async () => {
    prisma.oAuthAccount.findUnique.mockResolvedValueOnce({
      user: {
        ...unverifiedUser,
        status: UserStatus.SUSPENDED,
      },
    });

    await expectAuthCode(
      () => authService.authenticateOAuthUser(facebookProfile),
      AUTH_ERROR_CODES.ACCOUNT_SUSPENDED,
    );
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it("reports duplicate Facebook provider accounts with a stable error code", async () => {
    prisma.oAuthAccount.findUnique.mockResolvedValueOnce(null);
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockRejectedValue({ code: "P2002" });

    await expectAuthCode(
      () => authService.authenticateOAuthUser(facebookProfile),
      AUTH_ERROR_CODES.FACEBOOK_ACCOUNT_ALREADY_LINKED,
    );
  });

  it("refreshes access tokens from the cookie and rotates the refresh session", async () => {
    const context = createAuthRequestContext();
    const refreshToken = await authService.signRefreshToken(USER_ID, REFRESH_SESSION_ID);
    const tokenHash = await authService.hashRefreshToken(refreshToken);

    prisma.refreshSession.findUnique.mockResolvedValue({
      id: REFRESH_SESSION_ID,
      userId: USER_ID,
      tokenHash,
      expiresAt: new Date(Date.now() + 60_000),
      revokedAt: null,
      user: verifiedUser,
    });

    const response = await authService.refresh(refreshToken, context);
    const payload = await jwtService.verifyAsync<JwtAccessTokenPayload>(response.data.accessToken, {
      secret: JWT_ACCESS_SECRET,
    });

    expect(payload.sub).toBe(USER_ID);
    expect(payload.sessionId).not.toBe(REFRESH_SESSION_ID);
    expect(prisma.refreshSession.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          id: expect.any(String),
          userId: USER_ID,
          tokenHash: expect.any(String),
          userAgent: "Jest Test Browser",
          ipAddress: "127.0.0.1",
        }),
      }),
    );
    expect(prisma.refreshSession.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: REFRESH_SESSION_ID,
        },
        data: {
          revokedAt: expect.any(Date),
          replacedById: expect.any(String),
        },
      }),
    );
    expect(context.setRefreshCookie).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(response)).not.toContain(extractRefreshCookieValue(context));
  });

  it("rejects refresh without a cookie and clears the refresh cookie", async () => {
    const context = createAuthRequestContext();

    await expectAuthCode(
      () => authService.refresh(undefined, context),
      AUTH_ERROR_CODES.REFRESH_TOKEN_MISSING,
    );
    expect(context.clearRefreshCookie).toHaveBeenCalledTimes(1);
  });

  it("rejects a previously rotated refresh token", async () => {
    const refreshToken = await authService.signRefreshToken(USER_ID, REFRESH_SESSION_ID);
    const tokenHash = await authService.hashRefreshToken(refreshToken);

    prisma.refreshSession.findUnique.mockResolvedValue({
      id: REFRESH_SESSION_ID,
      userId: USER_ID,
      tokenHash,
      expiresAt: new Date(Date.now() + 60_000),
      revokedAt: new Date(),
      user: verifiedUser,
    });

    await expectAuthCode(
      () => authService.refresh(refreshToken, createAuthRequestContext()),
      AUTH_ERROR_CODES.REFRESH_TOKEN_REVOKED,
    );
    expect(prisma.refreshSession.create).not.toHaveBeenCalled();
  });

  it("rejects expired refresh sessions", async () => {
    const refreshToken = await authService.signRefreshToken(USER_ID, REFRESH_SESSION_ID);
    const tokenHash = await authService.hashRefreshToken(refreshToken);

    prisma.refreshSession.findUnique.mockResolvedValue({
      id: REFRESH_SESSION_ID,
      userId: USER_ID,
      tokenHash,
      expiresAt: new Date(Date.now() - 60_000),
      revokedAt: null,
      user: verifiedUser,
    });

    await expectAuthCode(
      () => authService.refresh(refreshToken, createAuthRequestContext()),
      AUTH_ERROR_CODES.REFRESH_TOKEN_EXPIRED,
    );
    expect(prisma.refreshSession.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          revokedAt: expect.any(Date),
        },
      }),
    );
  });

  it("rejects revoked refresh sessions", async () => {
    const refreshToken = await authService.signRefreshToken(USER_ID, REFRESH_SESSION_ID);
    const tokenHash = await authService.hashRefreshToken(refreshToken);

    prisma.refreshSession.findUnique.mockResolvedValue({
      id: REFRESH_SESSION_ID,
      userId: USER_ID,
      tokenHash,
      expiresAt: new Date(Date.now() + 60_000),
      revokedAt: new Date(),
      user: verifiedUser,
    });

    await expectAuthCode(
      () => authService.refresh(refreshToken, createAuthRequestContext()),
      AUTH_ERROR_CODES.REFRESH_TOKEN_REVOKED,
    );
  });

  it("rejects missing refresh sessions", async () => {
    const refreshToken = await authService.signRefreshToken(USER_ID, REFRESH_SESSION_ID);

    prisma.refreshSession.findUnique.mockResolvedValue(null);

    await expectAuthCode(
      () => authService.refresh(refreshToken, createAuthRequestContext()),
      AUTH_ERROR_CODES.SESSION_NOT_FOUND,
    );
  });

  it("rejects refresh when the presented token does not match the stored hash", async () => {
    const refreshToken = await authService.signRefreshToken(USER_ID, REFRESH_SESSION_ID);
    const differentTokenHash = await authService.hashRefreshToken("different-token");

    prisma.refreshSession.findUnique.mockResolvedValue({
      id: REFRESH_SESSION_ID,
      userId: USER_ID,
      tokenHash: differentTokenHash,
      expiresAt: new Date(Date.now() + 60_000),
      revokedAt: null,
      user: verifiedUser,
    });

    await expectAuthCode(
      () => authService.refresh(refreshToken, createAuthRequestContext()),
      AUTH_ERROR_CODES.REFRESH_TOKEN_INVALID,
    );
  });

  it("revokes sessions belonging to suspended users during refresh", async () => {
    const refreshToken = await authService.signRefreshToken(USER_ID, REFRESH_SESSION_ID);
    const tokenHash = await authService.hashRefreshToken(refreshToken);

    prisma.refreshSession.findUnique.mockResolvedValue({
      id: REFRESH_SESSION_ID,
      userId: USER_ID,
      tokenHash,
      expiresAt: new Date(Date.now() + 60_000),
      revokedAt: null,
      user: {
        ...verifiedUser,
        status: UserStatus.SUSPENDED,
      },
    });

    await expectAuthCode(
      () => authService.refresh(refreshToken, createAuthRequestContext()),
      AUTH_ERROR_CODES.ACCOUNT_SUSPENDED,
    );
    expect(prisma.refreshSession.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId: USER_ID,
          revokedAt: null,
        },
      }),
    );
  });

  it("logs out by revoking the current refresh session and clearing the cookie", async () => {
    const context = createAuthRequestContext();
    const refreshToken = await authService.signRefreshToken(USER_ID, REFRESH_SESSION_ID);

    const response = await authService.logout(refreshToken, context);

    expect(response.data.message).toBe("Logged out successfully.");
    expect(prisma.refreshSession.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: REFRESH_SESSION_ID,
          revokedAt: null,
        },
        data: {
          revokedAt: expect.any(Date),
        },
      }),
    );
    expect(context.clearRefreshCookie).toHaveBeenCalledTimes(1);
  });

  it("keeps logout idempotent without a refresh cookie", async () => {
    const context = createAuthRequestContext();

    const response = await authService.logout(undefined, context);

    expect(response.data.message).toBe("Logged out successfully.");
    expect(prisma.refreshSession.updateMany).not.toHaveBeenCalled();
    expect(context.clearRefreshCookie).toHaveBeenCalledTimes(1);
  });

  it("revokes every active refresh session during logout-all", async () => {
    const context = createAuthRequestContext();

    const response = await authService.logoutAll(verifiedUser, context);

    expect(response.data.message).toBe("Logged out from all devices successfully.");
    expect(prisma.refreshSession.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId: USER_ID,
          revokedAt: null,
        },
      }),
    );
    expect(context.clearRefreshCookie).toHaveBeenCalledTimes(1);
  });

  it("sets up a password for an authenticated OAuth-only user", async () => {
    const context = createAuthRequestContext();

    prisma.user.findUnique.mockResolvedValue({
      id: USER_ID,
      status: UserStatus.ACTIVE,
      passwordHash: null,
    });

    const response = await authService.setupPassword(
      unverifiedUser,
      {
        newPassword: "NewStrongPass123",
      },
      context,
    );

    expect(response.data.message).toBe("Password configured successfully. Please log in again.");
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: USER_ID,
        },
        data: {
          passwordHash: expect.any(String),
        },
      }),
    );
    expect(prisma.refreshSession.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId: USER_ID,
          revokedAt: null,
        },
      }),
    );
    expect(context.clearRefreshCookie).toHaveBeenCalledTimes(1);
    expectSensitiveMessageFieldsToBeAbsent(response);
  });

  it("rejects setup-password when a password is already configured", async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: USER_ID,
      status: UserStatus.ACTIVE,
      passwordHash: await authService.hashPassword("StrongPass123"),
    });

    await expectAuthCode(
      () =>
        authService.setupPassword(unverifiedUser, {
          newPassword: "NewStrongPass123",
        }),
      AUTH_ERROR_CODES.PASSWORD_ALREADY_CONFIGURED,
    );
    expect(prisma.refreshSession.updateMany).not.toHaveBeenCalled();
  });

  it("rejects weak setup-password values with a stable error code", async () => {
    await expectAuthCode(
      () =>
        authService.setupPassword(unverifiedUser, {
          newPassword: "weak",
        }),
      AUTH_ERROR_CODES.PASSWORD_TOO_WEAK,
    );
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it("loads the auth module with JWT and SMTP configuration from environment values", async () => {
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
              SMTP_HOST: "localhost",
              SMTP_PORT: 587,
              SMTP_USER: "smtp-user",
              SMTP_PASSWORD: "smtp-password",
              SMTP_FROM: "noreply@example.com",
              SMTP_FROM_NAME: "Afghan Culture Platform",
              EMAIL_VERIFICATION_URL: "http://localhost:3000/verify-email",
              EMAIL_VERIFICATION_EXPIRES_IN_HOURS: 24,
              PASSWORD_RESET_URL: "http://localhost:3000/reset-password",
              PASSWORD_RESET_EXPIRES_IN_MINUTES: 15,
              GOOGLE_CLIENT_ID: "google-client-id",
              GOOGLE_CLIENT_SECRET: "google-client-secret",
              GOOGLE_CALLBACK_URL: "http://localhost:4000/api/v1/auth/google/callback",
              FACEBOOK_APP_ID: "facebook-app-id",
              FACEBOOK_APP_SECRET: "facebook-app-secret",
              FACEBOOK_CALLBACK_URL: "http://localhost:4000/api/v1/auth/facebook/callback",
            }),
          ],
        }),
        AuthModule,
      ],
    })
      .overrideProvider(PrismaService)
      .useValue(createPrismaMock())
      .overrideProvider(MailService)
      .useValue({ sendMail: jest.fn(), sendPasswordResetEmail: jest.fn() })
      .compile();

    expect(module.get(AuthService)).toBeDefined();
  });

  function extractVerificationTokenFromMail(): string {
    const [{ text }] = mailService.sendMail.mock.calls[0];
    const verificationUrl = text.match(/https?:\/\/\S+/)?.[0];

    if (!verificationUrl) {
      throw new Error("Verification URL was not sent");
    }

    return new URL(verificationUrl).searchParams.get("token") ?? "";
  }
});

function createUsersServiceMock(): UsersServiceMock {
  return {
    createEmailPasswordUser: jest.fn(),
    findAuthenticatedUserById: jest.fn(),
    findUserByEmail: jest.fn(),
    findUserCredentialsByEmail: jest.fn(),
    isSuspended: jest.fn((user: Pick<AuthenticatedUser, "status">) => {
      return user.status === UserStatus.SUSPENDED;
    }),
    normalizeEmail: jest.fn((email: string) => email.trim().toLowerCase()),
    updateLastLoginAt: jest.fn(),
  };
}

function createPrismaMock(): PrismaMock {
  const prisma: PrismaMock = {
    emailVerificationToken: {
      create: jest.fn().mockResolvedValue({}),
      findUnique: jest.fn(),
      update: jest.fn().mockResolvedValue({}),
      updateMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
    oAuthAccount: {
      create: jest.fn().mockResolvedValue({}),
      findUnique: jest.fn(),
    },
    passwordResetToken: {
      create: jest.fn().mockResolvedValue({}),
      findUnique: jest.fn(),
      update: jest.fn().mockResolvedValue({}),
      updateMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
    refreshSession: {
      create: jest.fn().mockResolvedValue({}),
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn(),
      update: jest.fn().mockResolvedValue({}),
      updateMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  prisma.$transaction.mockImplementation(<T>(callback: (transaction: PrismaMock) => Promise<T>) => {
    return callback(prisma);
  });

  return prisma;
}

function createConfigService(): ConfigService {
  const values: Record<string, number | string> = {
    JWT_ACCESS_SECRET,
    JWT_REFRESH_SECRET,
    JWT_ACCESS_EXPIRES_IN: "15m",
    JWT_REFRESH_EXPIRES_IN: "7d",
    REFRESH_COOKIE_NAME: "refresh_token",
    REFRESH_COOKIE_DOMAIN: "",
    MAX_ACTIVE_SESSIONS: 10,
    SMTP_HOST: "localhost",
    SMTP_PORT: 587,
    SMTP_USER: "smtp-user",
    SMTP_PASSWORD: "smtp-password",
    SMTP_FROM: "noreply@example.com",
    SMTP_FROM_NAME: "Afghan Culture Platform",
    EMAIL_VERIFICATION_URL: "http://localhost:3000/verify-email",
    EMAIL_VERIFICATION_EXPIRES_IN_HOURS: 24,
    PASSWORD_RESET_URL: "http://localhost:3000/reset-password",
    PASSWORD_RESET_EXPIRES_IN_MINUTES: 15,
    GOOGLE_CLIENT_ID: "google-client-id",
    GOOGLE_CLIENT_SECRET: "google-client-secret",
    GOOGLE_CALLBACK_URL: "http://localhost:4000/api/v1/auth/google/callback",
    FACEBOOK_APP_ID: "facebook-app-id",
    FACEBOOK_APP_SECRET: "facebook-app-secret",
    FACEBOOK_CALLBACK_URL: "http://localhost:4000/api/v1/auth/facebook/callback",
  };

  return {
    get: jest.fn((key: string, defaultValue?: number | string) => values[key] ?? defaultValue),
    getOrThrow: jest.fn((key: string) => values[key]),
  } as unknown as ConfigService;
}

function createAuthRequestContext(): AuthRequestContext & {
  clearRefreshCookie: jest.Mock;
  setRefreshCookie: jest.Mock;
} {
  return {
    ipAddress: "127.0.0.1",
    userAgent: "Jest Test Browser",
    clearRefreshCookie: jest.fn(),
    setRefreshCookie: jest.fn(),
  };
}

function extractRefreshCookieValue(context: AuthRequestContext): string {
  const setRefreshCookie = context.setRefreshCookie as jest.Mock | undefined;
  const [[cookie]] = setRefreshCookie?.mock.calls ?? [];

  return (cookie as RefreshCookie | undefined)?.value ?? "";
}

async function expectAuthCode(action: () => Promise<unknown>, expectedCode: string): Promise<void> {
  try {
    await action();
    throw new Error("Expected auth error was not thrown");
  } catch (error) {
    expect(error).toBeInstanceOf(HttpException);
    expect((error as HttpException).getResponse()).toMatchObject({
      error: expectedCode,
    });
  }
}

function expectSensitiveFieldsToBeAbsent(response: AuthSessionResponse): void {
  const serializedResponse = JSON.stringify(response);

  expect(serializedResponse).not.toContain("passwordHash");
  expect(serializedResponse).not.toContain("tokenHash");
  expect(serializedResponse).not.toContain("refresh");
  expect(serializedResponse).not.toContain("emailVerifiedAt");
}

function expectSensitiveMessageFieldsToBeAbsent(response: unknown): void {
  const serializedResponse = JSON.stringify(response);

  expect(serializedResponse).not.toContain("passwordHash");
  expect(serializedResponse).not.toContain("tokenHash");
  expect(serializedResponse).not.toContain("reset-token");
  expect(serializedResponse).not.toContain("NewStrongPass123");
}
