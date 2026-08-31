import type { UserRole, UserStatus } from "../../../generated/prisma/enums";

type AuthenticatedUser = {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  displayName: string;
  profileImageUrl: string | null;
  emailVerifiedAt: Date | null;
};

export type { AuthenticatedUser };
