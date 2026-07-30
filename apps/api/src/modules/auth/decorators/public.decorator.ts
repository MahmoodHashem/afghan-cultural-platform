import { SetMetadata } from "@nestjs/common";

import { IS_PUBLIC_ROUTE_KEY } from "@/modules/auth/auth.constants";

const Public = () => SetMetadata(IS_PUBLIC_ROUTE_KEY, true);

export { Public };
