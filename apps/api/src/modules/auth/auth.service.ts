import { randomUUID } from "node:crypto";
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService, type JwtSignOptions } from "@nestjs/jwt";

import { MailService } from "../../common/mail/mail.service";
import { createEmailVerificationMessage } from "../../common/mail/templates/email-verification.template";
import { PrismaService } from "../../database/prisma.service";
import { AuthProvider, UserRole, UserStatus } from "../../generated/prisma/enums";
import type { UserCredentials } from "../users/users.service";
import { UsersService } from "../users/users.service";
import {
  AUTH_ERROR_CODES,
  EMAIL_VERIFICATION_NEUTRAL_MESSAGE,
  PASSWORD_RESET_NEUTRAL_MESSAGE,
} from "./auth.constants";
import type { ForgotPasswordDto } from "./dto/forgot-password.dto";
import type { LoginDto } from "./dto/login.dto";
import type { RegisterDto } from "./dto/register.dto";
import type { ResendVerificationDto } from "./dto/resend-verification.dto";
import type { ResetPasswordDto } from "./dto/reset-password.dto";
import type { SetupPasswordDto } from "./dto/setup-password.dto";
import type { VerifyEmailDto } from "./dto/verify-email.dto";
import type { AuthRequestContext } from "./types/auth-request-context.type";
import type {
  AuthSessionResponse,
  CurrentUserResponse,
  MessageResponse,
  SafeAuthUser,
  VerifyEmailResponse,
} from "./types/auth-response.type";
import type { AuthenticatedUser } from "./types/authenticated-user.type";
import type { JwtAccessTokenPayload, JwtRefreshTokenPayload } from "./types/jwt-payload.type";
import type { NormalizedOAuthProfile } from "./types/oauth-profile.type";
import {
  hashPassword as createPasswordHash,
  hashRefreshToken as createRefreshTokenHash,
  verifyPassword as verifyPasswordHash,
} from "./utils/password.util";
import { createSecureToken, hashToken } from "./utils/token.util";

type AuthErrorCode = (typeof AUTH_ERROR_CODES)[keyof typeof AUTH_ERROR_CODES];
type OAuthTransaction = Pick<PrismaService, "oAuthAccount" | "user">;
type RefreshSessionTransaction = Pick<PrismaService, "refreshSession">;

@Injectable()
class AuthService {
  constructor(
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(ConfigService) private readonly configService: ConfigService,
    @Inject(UsersService) private readonly usersService: UsersService,
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(MailService) private readonly mailService: MailService,
  ) {}

  async register(
    input: RegisterDto,
    context: AuthRequestContext = {},
  ): Promise<AuthSessionResponse> {
    const email = this.usersService.normalizeEmail(input.email);
    const existingUser = await this.usersService.findUserByEmail(email);

    if (existingUser) {
      throw new ConflictException(
        this.createAuthError(
          AUTH_ERROR_CODES.EMAIL_ALREADY_REGISTERED,
          "This email is already registered.",
        ),
      );
    }

    const passwordHash = await this.hashPassword(input.password);
    const user = await this.usersService.createEmailPasswordUser({
      displayName: input.displayName,
      email,
      passwordHash,
    });

    const verificationToken = await this.createEmailVerificationToken(user.id);
    await this.sendVerificationEmail(user, verificationToken);

    return this.createAuthSession(user, context);
  }

  async verifyEmail(input: VerifyEmailDto): Promise<VerifyEmailResponse> {
    const tokenHash = hashToken(input.token);
    const now = new Date();

    return this.prisma.$transaction(async (transaction) => {
      const verificationToken = await transaction.emailVerificationToken.findUnique({
        where: {
          tokenHash,
        },
        select: {
          id: true,
          userId: true,
          expiresAt: true,
          usedAt: true,
        },
      });

      if (!verificationToken || verificationToken.usedAt) {
        throw new BadRequestException(
          this.createAuthError(
            AUTH_ERROR_CODES.VERIFICATION_TOKEN_INVALID,
            "Verification token is invalid.",
          ),
        );
      }

      if (verificationToken.expiresAt <= now) {
        throw new BadRequestException(
          this.createAuthError(
            AUTH_ERROR_CODES.VERIFICATION_TOKEN_EXPIRED,
            "Verification token has expired.",
          ),
        );
      }

      const user = await transaction.user.update({
        where: {
          id: verificationToken.userId,
        },
        data: {
          emailVerifiedAt: now,
        },
        select: this.safeAuthenticatedUserSelect(),
      });

      await transaction.emailVerificationToken.update({
        where: {
          id: verificationToken.id,
        },
        data: {
          usedAt: now,
        },
      });

      return {
        data: {
          message: "Email verified successfully.",
          user: this.toSafeAuthUser(user),
        },
      };
    });
  }

  async resendVerification(input: ResendVerificationDto): Promise<MessageResponse> {
    const email = this.usersService.normalizeEmail(input.email);
    const user = await this.usersService.findUserByEmail(email);

    if (!user || user.emailVerifiedAt) {
      return this.createNeutralVerificationResponse();
    }

    const verificationToken = createSecureToken();
    const tokenHash = hashToken(verificationToken);
    const now = new Date();

    await this.prisma.$transaction(async (transaction) => {
      await transaction.emailVerificationToken.updateMany({
        where: {
          userId: user.id,
          usedAt: null,
        },
        data: {
          usedAt: now,
        },
      });

      await transaction.emailVerificationToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt: this.createVerificationExpiry(now),
        },
      });
    });

    await this.sendVerificationEmail(user, verificationToken);

    return this.createNeutralVerificationResponse();
  }

  async forgotPassword(input: ForgotPasswordDto): Promise<MessageResponse> {
    const email = this.usersService.normalizeEmail(input.email);
    const user = await this.usersService.findUserByEmail(email);

    if (!user || this.usersService.isSuspended(user)) {
      return this.createNeutralPasswordResetResponse();
    }

    const resetToken = createSecureToken();
    const tokenHash = hashToken(resetToken);
    const now = new Date();

    await this.prisma.$transaction(async (transaction) => {
      await transaction.passwordResetToken.updateMany({
        where: {
          userId: user.id,
          usedAt: null,
        },
        data: {
          usedAt: now,
        },
      });

      await transaction.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt: this.createPasswordResetExpiry(now),
        },
      });
    });

    await this.sendPasswordResetEmail(user.email, resetToken);

    return this.createNeutralPasswordResetResponse();
  }

  async resetPassword(
    input: ResetPasswordDto,
    context: AuthRequestContext = {},
  ): Promise<MessageResponse> {
    this.assertStrongPassword(input.newPassword);
    const tokenHash = hashToken(input.token);
    const passwordHash = await this.hashPassword(input.newPassword);
    const now = new Date();

    await this.prisma.$transaction(async (transaction) => {
      const resetToken = await transaction.passwordResetToken.findUnique({
        where: {
          tokenHash,
        },
        select: {
          id: true,
          expiresAt: true,
          usedAt: true,
          user: {
            select: {
              ...this.safeAuthenticatedUserSelect(),
              passwordHash: true,
            },
          },
        },
      });

      if (!resetToken) {
        throw new BadRequestException(
          this.createAuthError(
            AUTH_ERROR_CODES.PASSWORD_RESET_TOKEN_INVALID,
            "Password reset token is invalid.",
          ),
        );
      }

      if (resetToken.usedAt) {
        throw new BadRequestException(
          this.createAuthError(
            AUTH_ERROR_CODES.PASSWORD_RESET_TOKEN_USED,
            "Password reset token has already been used.",
          ),
        );
      }

      if (resetToken.expiresAt <= now) {
        throw new BadRequestException(
          this.createAuthError(
            AUTH_ERROR_CODES.PASSWORD_RESET_TOKEN_EXPIRED,
            "Password reset token has expired.",
          ),
        );
      }

      this.rejectSuspendedUser(resetToken.user);

      await transaction.user.update({
        where: {
          id: resetToken.user.id,
        },
        data: {
          passwordHash,
        },
      });
      await transaction.passwordResetToken.update({
        where: {
          id: resetToken.id,
        },
        data: {
          usedAt: now,
        },
      });
      await this.revokeActiveSessionsForUser(transaction, resetToken.user.id, now);
    });

    this.clearRefreshCookie(context);

    return {
      data: {
        message: "Password reset successfully.",
      },
    };
  }

  async setupPassword(
    user: AuthenticatedUser,
    input: SetupPasswordDto,
    context: AuthRequestContext = {},
  ): Promise<MessageResponse> {
    this.rejectSuspendedUser(user);
    this.assertStrongPassword(input.newPassword);
    const passwordHash = await this.hashPassword(input.newPassword);

    await this.prisma.$transaction(async (transaction) => {
      const credentialUser = await transaction.user.findUnique({
        where: {
          id: user.id,
        },
        select: {
          id: true,
          passwordHash: true,
          status: true,
        },
      });

      if (!credentialUser) {
        throw new UnauthorizedException("Invalid or suspended user");
      }

      this.rejectSuspendedUser(credentialUser);

      if (credentialUser.passwordHash) {
        throw new ConflictException(
          this.createAuthError(
            AUTH_ERROR_CODES.PASSWORD_ALREADY_CONFIGURED,
            "Password is already configured for this account.",
          ),
        );
      }

      await transaction.user.update({
        where: {
          id: user.id,
        },
        data: {
          passwordHash,
        },
      });
      await this.revokeActiveSessionsForUser(transaction, user.id, new Date());
    });

    this.clearRefreshCookie(context);

    return {
      data: {
        message: "Password configured successfully. Please log in again.",
      },
    };
  }

  async login(input: LoginDto, context: AuthRequestContext = {}): Promise<AuthSessionResponse> {
    const email = this.usersService.normalizeEmail(input.email);
    const user = await this.usersService.findUserCredentialsByEmail(email);

    if (!user) {
      throw this.createInvalidCredentialsError();
    }

    this.rejectSuspendedUser(user);

    if (!user.passwordHash) {
      throw new UnauthorizedException(
        this.createAuthError(
          AUTH_ERROR_CODES.PASSWORD_NOT_CONFIGURED,
          "Password login is not configured for this account.",
        ),
      );
    }

    const passwordIsValid = await this.verifyPassword(user.passwordHash, input.password);

    if (!passwordIsValid) {
      throw this.createInvalidCredentialsError();
    }

    const loggedInUser = await this.usersService.updateLastLoginAt(user.id, new Date());

    return this.createAuthSession(loggedInUser, context);
  }

  async authenticateOAuthUser(
    profile: NormalizedOAuthProfile,
    context: AuthRequestContext = {},
  ): Promise<AuthSessionResponse> {
    const user = await this.prisma.$transaction(async (transaction) => {
      const existingAccount = await transaction.oAuthAccount.findUnique({
        where: {
          provider_providerAccountId: {
            provider: profile.provider,
            providerAccountId: profile.providerAccountId,
          },
        },
        select: {
          user: {
            select: this.safeAuthenticatedUserSelect(),
          },
        },
      });

      if (existingAccount) {
        this.rejectSuspendedUser(existingAccount.user);

        return transaction.user.update({
          where: {
            id: existingAccount.user.id,
          },
          data: {
            lastLoginAt: new Date(),
          },
          select: this.safeAuthenticatedUserSelect(),
        });
      }

      const email = this.getRequiredOAuthEmail(profile);

      if (profile.provider === AuthProvider.GOOGLE && !profile.emailVerified) {
        throw this.createGoogleEmailNotVerifiedError();
      }

      const existingUser = await transaction.user.findUnique({
        where: {
          email,
        },
        select: this.safeAuthenticatedUserSelect(),
      });

      if (existingUser) {
        this.rejectSuspendedUser(existingUser);

        if (!profile.emailVerified) {
          throw this.createOAuthEmailLinkingNotAllowedError(profile.provider);
        }

        const existingProviderForUser = await transaction.oAuthAccount.findUnique({
          where: {
            userId_provider: {
              userId: existingUser.id,
              provider: profile.provider,
            },
          },
          select: {
            id: true,
          },
        });

        if (existingProviderForUser) {
          throw this.createOAuthAccountAlreadyLinkedError(profile.provider);
        }

        await this.createOAuthAccountForUser(transaction, existingUser.id, profile, email);

        return transaction.user.update({
          where: {
            id: existingUser.id,
          },
          data: {
            emailVerifiedAt: existingUser.emailVerifiedAt ?? new Date(),
            lastLoginAt: new Date(),
          },
          select: this.safeAuthenticatedUserSelect(),
        });
      }

      try {
        return await transaction.user.create({
          data: {
            displayName: profile.displayName.trim(),
            email,
            passwordHash: null,
            role: UserRole.USER,
            status: UserStatus.ACTIVE,
            profileImageUrl: profile.avatarUrl,
            emailVerifiedAt: profile.emailVerified ? new Date() : null,
            lastLoginAt: new Date(),
            oauthAccounts: {
              create: {
                provider: profile.provider,
                providerAccountId: profile.providerAccountId,
                providerEmail: email,
              },
            },
          },
          select: this.safeAuthenticatedUserSelect(),
        });
      } catch (error) {
        if (this.isUniqueConstraintError(error)) {
          throw this.createOAuthAccountAlreadyLinkedError(profile.provider);
        }

        throw error;
      }
    });

    return this.createAuthSession(user, context);
  }

  async refresh(
    refreshToken: string | undefined,
    context: AuthRequestContext = {},
  ): Promise<AuthSessionResponse> {
    if (!refreshToken) {
      this.clearRefreshCookie(context);
      throw this.createRefreshError(
        AUTH_ERROR_CODES.REFRESH_TOKEN_MISSING,
        "Refresh token cookie is missing.",
      );
    }

    const payload = await this.verifyRefreshToken(refreshToken, context);
    const now = new Date();

    return this.prisma.$transaction(async (transaction) => {
      const session = await transaction.refreshSession.findUnique({
        where: {
          id: payload.sessionId,
        },
        select: {
          id: true,
          userId: true,
          tokenHash: true,
          expiresAt: true,
          revokedAt: true,
          user: {
            select: this.safeAuthenticatedUserSelect(),
          },
        },
      });

      if (!session) {
        this.clearRefreshCookie(context);
        throw this.createRefreshError(
          AUTH_ERROR_CODES.SESSION_NOT_FOUND,
          "Refresh session was not found.",
        );
      }

      if (session.revokedAt) {
        this.clearRefreshCookie(context);
        throw this.createRefreshError(
          AUTH_ERROR_CODES.REFRESH_TOKEN_REVOKED,
          "Refresh token session has been revoked.",
        );
      }

      if (session.expiresAt <= now) {
        await transaction.refreshSession.update({
          where: {
            id: session.id,
          },
          data: {
            revokedAt: now,
          },
        });
        this.clearRefreshCookie(context);
        throw this.createRefreshError(
          AUTH_ERROR_CODES.REFRESH_TOKEN_EXPIRED,
          "Refresh token has expired.",
        );
      }

      if (this.usersService.isSuspended(session.user)) {
        await this.revokeActiveSessionsForUser(transaction, session.userId, now);
        this.clearRefreshCookie(context);
        throw new ForbiddenException(
          this.createAuthError(AUTH_ERROR_CODES.ACCOUNT_SUSPENDED, "Account is suspended."),
        );
      }

      const tokenIsValid = await this.verifyPassword(session.tokenHash, refreshToken);

      if (!tokenIsValid) {
        this.clearRefreshCookie(context);
        throw this.createRefreshError(
          AUTH_ERROR_CODES.REFRESH_TOKEN_INVALID,
          "Refresh token is invalid.",
        );
      }

      const rotatedSession = await this.createRefreshSessionRecord(
        transaction,
        session.user,
        context,
      );

      await transaction.refreshSession.update({
        where: {
          id: session.id,
        },
        data: {
          revokedAt: now,
          replacedById: rotatedSession.sessionId,
        },
      });
      await this.enforceActiveSessionLimit(transaction, session.userId, now);
      this.setRefreshCookie(context, rotatedSession.refreshToken, rotatedSession.expiresAt);

      return {
        data: {
          accessToken: await this.signAccessToken(session.user, rotatedSession.sessionId),
          user: this.toSafeAuthUser(session.user),
        },
      };
    });
  }

  async logout(
    refreshToken: string | undefined,
    context: AuthRequestContext = {},
  ): Promise<MessageResponse> {
    if (refreshToken) {
      const payload = await this.tryVerifyRefreshToken(refreshToken);

      if (payload?.sessionId) {
        await this.prisma.refreshSession.updateMany({
          where: {
            id: payload.sessionId,
            revokedAt: null,
          },
          data: {
            revokedAt: new Date(),
          },
        });
      }
    }

    this.clearRefreshCookie(context);

    return {
      data: {
        message: "Logged out successfully.",
      },
    };
  }

  async logoutAll(
    user: AuthenticatedUser,
    context: AuthRequestContext = {},
  ): Promise<MessageResponse> {
    await this.revokeActiveSessionsForUser(this.prisma, user.id, new Date());
    this.clearRefreshCookie(context);

    return {
      data: {
        message: "Logged out from all devices successfully.",
      },
    };
  }

  getCurrentUser(user: AuthenticatedUser): CurrentUserResponse {
    return {
      data: {
        user: this.toSafeAuthUser(user),
      },
    };
  }

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
      throw new UnauthorizedException(
        this.createAuthError(AUTH_ERROR_CODES.UNAUTHORIZED, "Invalid access token payload."),
      );
    }

    const user = await this.usersService.findAuthenticatedUserById(payload.sub);

    if (!user) {
      throw new UnauthorizedException(
        this.createAuthError(AUTH_ERROR_CODES.UNAUTHORIZED, "Invalid access token user."),
      );
    }

    this.rejectSuspendedUser(user);

    return user;
  }

  private getTokenLifetime(configKey: string): NonNullable<JwtSignOptions["expiresIn"]> {
    return this.configService.getOrThrow<NonNullable<JwtSignOptions["expiresIn"]>>(configKey);
  }

  getRefreshCookieName(): string {
    return this.configService.get<string>("REFRESH_COOKIE_NAME", "refresh_token");
  }

  private async createAuthSession(
    user: AuthenticatedUser,
    context: AuthRequestContext,
  ): Promise<AuthSessionResponse> {
    const session = await this.createRefreshSessionRecord(this.prisma, user, context);
    await this.enforceActiveSessionLimit(this.prisma, user.id, new Date());
    this.setRefreshCookie(context, session.refreshToken, session.expiresAt);

    return {
      data: {
        accessToken: await this.signAccessToken(user, session.sessionId),
        user: this.toSafeAuthUser(user),
      },
    };
  }

  private toSafeAuthUser(user: AuthenticatedUser): SafeAuthUser {
    return {
      id: user.id,
      displayName: user.displayName,
      email: user.email,
      role: user.role,
      status: user.status,
      profileImageUrl: user.profileImageUrl,
      emailVerified: Boolean(user.emailVerifiedAt),
    };
  }

  private async createEmailVerificationToken(userId: string): Promise<string> {
    const token = createSecureToken();

    await this.prisma.emailVerificationToken.create({
      data: {
        userId,
        tokenHash: hashToken(token),
        expiresAt: this.createVerificationExpiry(new Date()),
      },
    });

    return token;
  }

  private createVerificationExpiry(from: Date): Date {
    const expiresInHours = this.configService.getOrThrow<number>(
      "EMAIL_VERIFICATION_EXPIRES_IN_HOURS",
    );

    return new Date(from.getTime() + expiresInHours * 60 * 60 * 1000);
  }

  private async sendVerificationEmail(user: AuthenticatedUser, token: string): Promise<void> {
    const verificationUrl = new URL(
      this.configService.getOrThrow<string>("EMAIL_VERIFICATION_URL"),
    );
    const frontendUrl = this.configService.getOrThrow<string>("FRONTEND_URL");
    const expiresInHours = this.configService.getOrThrow<number>(
      "EMAIL_VERIFICATION_EXPIRES_IN_HOURS",
    );

    verificationUrl.searchParams.set("token", token);
    const message = createEmailVerificationMessage({
      displayName: user.displayName,
      verificationUrl: verificationUrl.toString(),
      expiresInHours,
      logoUrl: new URL("/images/small-logo.png", frontendUrl).toString(),
    });

    await this.mailService.sendMail({
      to: user.email,
      ...message,
    });
  }

  private createNeutralVerificationResponse(): MessageResponse {
    return {
      data: {
        message: EMAIL_VERIFICATION_NEUTRAL_MESSAGE,
      },
    };
  }

  private createNeutralPasswordResetResponse(): MessageResponse {
    return {
      data: {
        message: PASSWORD_RESET_NEUTRAL_MESSAGE,
      },
    };
  }

  private createPasswordResetExpiry(from: Date): Date {
    const expiresInMinutes = this.configService.getOrThrow<number>(
      "PASSWORD_RESET_EXPIRES_IN_MINUTES",
    );

    return new Date(from.getTime() + expiresInMinutes * 60 * 1000);
  }

  private async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = new URL(this.configService.getOrThrow<string>("PASSWORD_RESET_URL"));
    const expiresInMinutes = this.configService.getOrThrow<number>(
      "PASSWORD_RESET_EXPIRES_IN_MINUTES",
    );

    resetUrl.searchParams.set("token", token);

    await this.mailService.sendPasswordResetEmail({
      to: email,
      resetUrl: resetUrl.toString(),
      expiresInMinutes,
    });
  }

  private assertStrongPassword(password: string): void {
    const passwordIsStrong =
      password.length >= 10 &&
      password.length <= 128 &&
      /[a-z]/.test(password) &&
      /[A-Z]/.test(password) &&
      /\d/.test(password);

    if (passwordIsStrong) {
      return;
    }

    throw new BadRequestException(
      this.createAuthError(
        AUTH_ERROR_CODES.PASSWORD_TOO_WEAK,
        "Password must be 10-128 characters and include uppercase, lowercase, and number characters.",
      ),
    );
  }

  private async createRefreshSessionRecord(
    transaction: RefreshSessionTransaction,
    user: AuthenticatedUser,
    context: AuthRequestContext,
  ): Promise<{ expiresAt: Date; refreshToken: string; sessionId: string }> {
    const sessionId = randomUUID();
    const expiresAt = this.createRefreshExpiry(new Date());
    const refreshToken = await this.signRefreshToken(user.id, sessionId);
    const tokenHash = await this.hashRefreshToken(refreshToken);

    await transaction.refreshSession.create({
      data: {
        id: sessionId,
        userId: user.id,
        tokenHash,
        expiresAt,
        userAgent: context.userAgent,
        ipAddress: context.ipAddress,
      },
    });

    return {
      expiresAt,
      refreshToken,
      sessionId,
    };
  }

  private async enforceActiveSessionLimit(
    transaction: RefreshSessionTransaction,
    userId: string,
    now: Date,
  ): Promise<void> {
    const maxActiveSessions = this.configService.get<number>("MAX_ACTIVE_SESSIONS", 10);
    const activeSessions = await transaction.refreshSession.findMany({
      where: {
        userId,
        revokedAt: null,
        expiresAt: {
          gt: now,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      select: {
        id: true,
      },
    });
    const sessionsToRevoke = activeSessions.slice(
      0,
      Math.max(0, activeSessions.length - maxActiveSessions),
    );

    if (sessionsToRevoke.length === 0) {
      return;
    }

    await transaction.refreshSession.updateMany({
      where: {
        id: {
          in: sessionsToRevoke.map((session) => session.id),
        },
      },
      data: {
        revokedAt: now,
      },
    });
  }

  private async revokeActiveSessionsForUser(
    transaction: RefreshSessionTransaction,
    userId: string,
    revokedAt: Date,
  ): Promise<void> {
    await transaction.refreshSession.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt,
      },
    });
  }

  private async verifyRefreshToken(
    refreshToken: string,
    context: AuthRequestContext,
  ): Promise<JwtRefreshTokenPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<JwtRefreshTokenPayload>(refreshToken, {
        secret: this.configService.getOrThrow<string>("JWT_REFRESH_SECRET"),
      });

      if (!payload.sub || !payload.sessionId) {
        throw this.createRefreshError(
          AUTH_ERROR_CODES.REFRESH_TOKEN_INVALID,
          "Refresh token payload is invalid.",
        );
      }

      return payload;
    } catch (error) {
      this.clearRefreshCookie(context);

      if (this.isJwtExpiredError(error)) {
        throw this.createRefreshError(
          AUTH_ERROR_CODES.REFRESH_TOKEN_EXPIRED,
          "Refresh token has expired.",
        );
      }

      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw this.createRefreshError(
        AUTH_ERROR_CODES.REFRESH_TOKEN_INVALID,
        "Refresh token is invalid.",
      );
    }
  }

  private async tryVerifyRefreshToken(
    refreshToken: string,
  ): Promise<JwtRefreshTokenPayload | null> {
    try {
      return await this.jwtService.verifyAsync<JwtRefreshTokenPayload>(refreshToken, {
        secret: this.configService.getOrThrow<string>("JWT_REFRESH_SECRET"),
      });
    } catch {
      return null;
    }
  }

  private createRefreshExpiry(from: Date): Date {
    return new Date(from.getTime() + this.getTokenLifetimeMilliseconds("JWT_REFRESH_EXPIRES_IN"));
  }

  private getTokenLifetimeMilliseconds(configKey: string): number {
    const lifetime = this.configService.getOrThrow<string>(configKey).trim();
    const match = lifetime.match(/^(\d+)([smhd])$/i);

    if (!match) {
      const seconds = Number(lifetime);

      if (Number.isFinite(seconds) && seconds > 0) {
        return seconds * 1000;
      }

      throw new Error(`Invalid token lifetime for ${configKey}`);
    }

    const value = Number(match[1]);
    const unit = match[2].toLowerCase();
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return value * multipliers[unit];
  }

  private setRefreshCookie(
    context: AuthRequestContext,
    refreshToken: string,
    expiresAt: Date,
  ): void {
    context.setRefreshCookie?.({
      name: this.getRefreshCookieName(),
      value: refreshToken,
      options: this.createRefreshCookieOptions(expiresAt),
    });
  }

  private clearRefreshCookie(context: AuthRequestContext): void {
    context.clearRefreshCookie?.({
      name: this.getRefreshCookieName(),
      options: this.createRefreshCookieOptions(new Date(0)),
    });
  }

  private createRefreshCookieOptions(expiresAt: Date) {
    const cookieDomain = this.configService.get<string>("REFRESH_COOKIE_DOMAIN", "").trim();
    const sameSite = this.configService.get<"lax" | "none">("REFRESH_COOKIE_SAME_SITE", "lax");

    return {
      httpOnly: true,
      secure: this.configService.get<string>("NODE_ENV", "development") === "production",
      sameSite,
      path: "/api/v1/auth",
      expires: expiresAt,
      ...(cookieDomain ? { domain: cookieDomain } : {}),
    };
  }

  private async createOAuthAccountForUser(
    transaction: OAuthTransaction,
    userId: string,
    profile: NormalizedOAuthProfile,
    providerEmail: string,
  ): Promise<void> {
    try {
      await transaction.oAuthAccount.create({
        data: {
          userId,
          provider: profile.provider,
          providerAccountId: profile.providerAccountId,
          providerEmail,
        },
      });
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw this.createOAuthAccountAlreadyLinkedError(profile.provider);
      }

      throw error;
    }
  }

  private rejectSuspendedUser(user: Pick<UserCredentials, "status">): void {
    if (!this.usersService.isSuspended(user)) {
      return;
    }

    throw new ForbiddenException(
      this.createAuthError(AUTH_ERROR_CODES.ACCOUNT_SUSPENDED, "Account is suspended."),
    );
  }

  private createInvalidCredentialsError(): UnauthorizedException {
    return new UnauthorizedException(
      this.createAuthError(AUTH_ERROR_CODES.INVALID_CREDENTIALS, "Invalid email or password."),
    );
  }

  private getRequiredOAuthEmail(profile: NormalizedOAuthProfile): string {
    if (profile.email) {
      return this.usersService.normalizeEmail(profile.email);
    }

    if (profile.provider === AuthProvider.FACEBOOK) {
      throw new UnauthorizedException(
        this.createAuthError(
          AUTH_ERROR_CODES.FACEBOOK_EMAIL_REQUIRED,
          "Facebook did not provide an email address.",
        ),
      );
    }

    throw this.createGoogleEmailNotVerifiedError();
  }

  private createOAuthEmailLinkingNotAllowedError(provider: AuthProvider): ConflictException {
    if (provider === AuthProvider.FACEBOOK) {
      return new ConflictException(
        this.createAuthError(
          AUTH_ERROR_CODES.FACEBOOK_EMAIL_LINKING_NOT_ALLOWED,
          "Facebook email cannot be safely used for automatic account linking.",
        ),
      );
    }

    return new ConflictException(
      this.createAuthError(
        AUTH_ERROR_CODES.GOOGLE_EMAIL_NOT_VERIFIED,
        "Provider email must be verified before account linking.",
      ),
    );
  }

  private createOAuthAccountAlreadyLinkedError(provider: AuthProvider): ConflictException {
    const errorCode =
      provider === AuthProvider.FACEBOOK
        ? AUTH_ERROR_CODES.FACEBOOK_ACCOUNT_ALREADY_LINKED
        : AUTH_ERROR_CODES.GOOGLE_ACCOUNT_ALREADY_LINKED;
    const providerName = provider === AuthProvider.FACEBOOK ? "Facebook" : "Google";

    return new ConflictException(
      this.createAuthError(errorCode, `${providerName} account is already linked.`),
    );
  }

  private createGoogleEmailNotVerifiedError(): UnauthorizedException {
    return new UnauthorizedException(
      this.createAuthError(
        AUTH_ERROR_CODES.GOOGLE_EMAIL_NOT_VERIFIED,
        "Google email must be verified before authentication.",
      ),
    );
  }

  private isUniqueConstraintError(error: unknown): boolean {
    return (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: unknown }).code === "P2002"
    );
  }

  private isJwtExpiredError(error: unknown): boolean {
    return (
      typeof error === "object" &&
      error !== null &&
      "name" in error &&
      (error as { name?: unknown }).name === "TokenExpiredError"
    );
  }

  private createRefreshError(code: AuthErrorCode, message: string): UnauthorizedException {
    return new UnauthorizedException(this.createAuthError(code, message));
  }

  private createAuthError(code: AuthErrorCode, message: string) {
    return {
      error: code,
      message,
    };
  }

  private safeAuthenticatedUserSelect() {
    return {
      id: true,
      email: true,
      role: true,
      status: true,
      displayName: true,
      profileImageUrl: true,
      emailVerifiedAt: true,
    } as const;
  }
}

export { AuthService };
