import { SetMetadata } from "@nestjs/common";

import type { UserRole } from "@/generated/prisma/enums";
import { ROLES_KEY } from "@/modules/auth/auth.constants";

const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

export { Roles };
