import { createParamDecorator, type ExecutionContext } from "@nestjs/common";

import type { AuthenticatedRequest } from "@/modules/auth/types/authenticated-request.type";
import type { AuthenticatedUser } from "@/modules/auth/types/authenticated-user.type";

const CurrentUser = createParamDecorator(
  (field: keyof AuthenticatedUser | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    return field ? user?.[field] : user;
  },
);

export { CurrentUser };
