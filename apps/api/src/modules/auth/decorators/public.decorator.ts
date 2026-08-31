import { SetMetadata } from "@nestjs/common";

import { IS_PUBLIC_ROUTE_KEY } from "../auth.constants";

const Public = () => SetMetadata(IS_PUBLIC_ROUTE_KEY, true);

export { Public };
