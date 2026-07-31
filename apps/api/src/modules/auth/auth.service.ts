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

import { MailService } from "@/common/mail/mail.service";
import { PrismaService } from "@/database/prisma.service";
import { UserRole, UserStatus } from "@/generated/prisma/enums";
import {
  AUTH_ERROR_CODES,
  EMAIL_VERIFICATION_NEUTRAL_MESSAGE,
} from "@/modules/auth/auth.constants";
import type { LoginDto } from "@/modules/auth/dto/login.dto";
import type { RegisterDto } from "@/modules/auth/dto/register.dto";
import type { ResendVerificationDto } from "@/modules/auth/dto/resend-verification.dto";
import type { VerifyEmailDto } from "@/modules/auth/dto/verify-email.dto";
import type {
  AuthSessionResponse,
  CurrentUserResponse,
  MessageResponse,
  SafeAuthUser,
  VerifyEmailResponse,
} from "@/modules/auth/types/auth-response.type";
import type { AuthenticatedUser } from "@/modules/auth/types/authenticated-user.type";
import type {
  JwtAccessTokenPayload,
  JwtRefreshTokenPayload,
} from "@/modules/auth/types/jwt-payload.type";
import type { NormalizedOAuthProfile } from "@/modules/auth/types/oauth-profile.type";
import {
  hashPassword as createPasswordHash,
  hashRefreshToken as createRefreshTokenHash,
  verifyPassword as verifyPasswordHash,
} from "@/modules/auth/utils/password.util";
import { createSecureToken, hashToken } from "@/modules/auth/utils/token.util";
import type { UserCredentials } from "@/modules/users/users.service";
import { UsersService } from "@/modules/users/users.service";

type AuthErrorCode = (typeof AUTH_ERROR_CODES)[keyof typeof AUTH_ERROR_CODES];
type OAuthTransaction = Pick<PrismaService, "oAuthAccount" | "user">;

@Injectable()
class AuthService {
  constructor(
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(ConfigService) private readonly configService: ConfigService,
    @Inject(UsersService) private readonly usersService: UsersService,
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(MailService) private readonly mailService: MailService,
  ) {}

  async register(input: RegisterDto): Promise<AuthSessionResponse> {
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

    return this.createAuthSession(user);
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

  async login(input: LoginDto): Promise<AuthSessionResponse> {
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

    return this.createAuthSession(loggedInUser);
  }

  async authenticateOAuthUser(profile: NormalizedOAuthProfile): Promise<AuthSessionResponse> {
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

      if (!profile.email || !profile.emailVerified) {
        throw new UnauthorizedException(
          this.createAuthError(
            AUTH_ERROR_CODES.GOOGLE_EMAIL_NOT_VERIFIED,
            "Google email must be verified before authentication.",
          ),
        );
      }

      const email = this.usersService.normalizeEmail(profile.email);
      const existingUser = await transaction.user.findUnique({
        where: {
          email,
        },
        select: this.safeAuthenticatedUserSelect(),
      });

      if (existingUser) {
        this.rejectSuspendedUser(existingUser);

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
          throw this.createGoogleAccountAlreadyLinkedError();
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
            emailVerifiedAt: new Date(),
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
          throw this.createGoogleAccountAlreadyLinkedError();
        }

        throw error;
      }
    });

    return this.createAuthSession(user);
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
      throw new UnauthorizedException("Invalid access token payload");
    }

    const user = await this.usersService.findAuthenticatedUserById(payload.sub);

    if (!user) {
      throw new UnauthorizedException("Invalid or suspended user");
    }

    this.rejectSuspendedUser(user);

    return user;
  }

  private getTokenLifetime(configKey: string): NonNullable<JwtSignOptions["expiresIn"]> {
    return this.configService.getOrThrow<NonNullable<JwtSignOptions["expiresIn"]>>(configKey);
  }

  private async createAuthSession(user: AuthenticatedUser): Promise<AuthSessionResponse> {
    return {
      data: {
        accessToken: await this.signAccessToken(user, randomUUID()),
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

    verificationUrl.searchParams.set("token", token);

    await this.mailService.sendMail({
      to: user.email,
      subject: "Verify your email address",
      text: `Please verify your email address: ${verificationUrl.toString()}`,
      html: `<p>Please verify your email address:</p><p><a href="${verificationUrl.toString()}">Verify email</a></p>`,
    });
  }

  private createNeutralVerificationResponse(): MessageResponse {
    return {
      data: {
        message: EMAIL_VERIFICATION_NEUTRAL_MESSAGE,
      },
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
        throw this.createGoogleAccountAlreadyLinkedError();
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

  private createGoogleAccountAlreadyLinkedError(): ConflictException {
    return new ConflictException(
      this.createAuthError(
        AUTH_ERROR_CODES.GOOGLE_ACCOUNT_ALREADY_LINKED,
        "Google account is already linked.",
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
