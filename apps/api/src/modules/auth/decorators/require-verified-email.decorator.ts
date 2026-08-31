import { SetMetadata } from "@nestjs/common";

import { REQUIRE_VERIFIED_EMAIL_KEY } from "../auth.constants";

const RequireVerifiedEmail = () => SetMetadata(REQUIRE_VERIFIED_EMAIL_KEY, true);

export { RequireVerifiedEmail };
