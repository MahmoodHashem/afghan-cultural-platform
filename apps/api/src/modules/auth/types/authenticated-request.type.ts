import type { Request } from "express";

import type { AuthenticatedUser } from "./authenticated-user.type";

type AuthenticatedRequest = Request & {
  user?: AuthenticatedUser;
};

export type { AuthenticatedRequest };
