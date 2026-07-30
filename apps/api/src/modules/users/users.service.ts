import { Inject, Injectable } from "@nestjs/common";

import { PrismaService } from "@/database/prisma.service";
import type { AuthenticatedUser } from "@/modules/auth/types/authenticated-user.type";

@Injectable()
class UsersService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async findAuthenticatedUserById(userId: string): Promise<AuthenticatedUser | null> {
    return this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        displayName: true,
        profileImageUrl: true,
        emailVerifiedAt: true,
      },
    });
  }
}

export { UsersService };
