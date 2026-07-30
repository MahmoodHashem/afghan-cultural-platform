import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import { JWT_ACCESS_STRATEGY } from "@/modules/auth/auth.constants";

@Injectable()
class JwtAuthGuard extends AuthGuard(JWT_ACCESS_STRATEGY) {}

export { JwtAuthGuard };
