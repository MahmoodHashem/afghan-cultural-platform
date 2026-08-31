import type { UserRole, UserStatus } from "../../../generated/prisma/enums";

type SafeAuthUser = {
  id: string;
  displayName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
};

type AuthSessionResponse = {
  data: {
    accessToken: string;
    user: SafeAuthUser;
  };
};

type CurrentUserResponse = {
  data: {
    user: SafeAuthUser;
  };
};

type MessageResponse = {
  data: {
    message: string;
  };
};

type VerifyEmailResponse = {
  data: {
    message: string;
    user: SafeAuthUser;
  };
};

export type {
  AuthSessionResponse,
  CurrentUserResponse,
  MessageResponse,
  SafeAuthUser,
  VerifyEmailResponse,
};
