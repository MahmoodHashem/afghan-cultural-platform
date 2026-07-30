import { Inject, Injectable } from "@nestjs/common";

import { PrismaService } from "@/database/prisma.service";
import { UserRole, UserStatus } from "@/generated/prisma/enums";
import type { AuthenticatedUser } from "@/modules/auth/types/authenticated-user.type";

type CreateEmailPasswordUserInput = {
  displayName: string;
  email: string;
  passwordHash: string;
};

type UserCredentials = AuthenticatedUser & {
  passwordHash: string | null;
};

@Injectable()
class UsersService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  async findUserByEmail(email: string): Promise<AuthenticatedUser | null> {
    return this.prisma.user.findUnique({
      where: {
        email: this.normalizeEmail(email),
      },
      select: this.safeUserSelect(),
    });
  }

  async findUserCredentialsByEmail(email: string): Promise<UserCredentials | null> {
    return this.prisma.user.findUnique({
      where: {
        email: this.normalizeEmail(email),
      },
      select: {
        ...this.safeUserSelect(),
        passwordHash: true,
      },
    });
  }

  async findSafeUserById(userId: string): Promise<AuthenticatedUser | null> {
    return this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: this.safeUserSelect(),
    });
  }

  async findAuthenticatedUserById(userId: string): Promise<AuthenticatedUser | null> {
    return this.findSafeUserById(userId);
  }

  async createEmailPasswordUser(input: CreateEmailPasswordUserInput): Promise<AuthenticatedUser> {
    return this.prisma.user.create({
      data: {
        displayName: input.displayName.trim(),
        email: this.normalizeEmail(input.email),
        passwordHash: input.passwordHash,
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: null,
      },
      select: this.safeUserSelect(),
    });
  }

  async updateEmailVerifiedAt(userId: string, verifiedAt: Date): Promise<AuthenticatedUser> {
    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        emailVerifiedAt: verifiedAt,
      },
      select: this.safeUserSelect(),
    });
  }

  async updateLastLoginAt(userId: string, lastLoginAt: Date): Promise<AuthenticatedUser> {
    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        lastLoginAt,
      },
      select: this.safeUserSelect(),
    });
  }

  isSuspended(user: Pick<AuthenticatedUser, "status">): boolean {
    return user.status === UserStatus.SUSPENDED;
  }

  private safeUserSelect() {
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

export type { UserCredentials };
export { UsersService };
