import { createParamDecorator, type ExecutionContext } from "@nestjs/common";

import type { AuthenticatedRequest } from "@/modules/auth/types/authenticated-request.type";
import type { AuthenticatedUser } from "@/modules/auth/types/authenticated-user.type";

function selectCurrentUserField(
  user: AuthenticatedUser | undefined,
  field?: keyof AuthenticatedUser,
) {
  return field ? user?.[field] : user;
}

const CurrentUser = createParamDecorator(
  (field: keyof AuthenticatedUser | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    return selectCurrentUserField(request.user, field);
  },
);

export { CurrentUser, selectCurrentUserField };
