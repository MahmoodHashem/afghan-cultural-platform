import { randomUUID } from "node:crypto";
import { Injectable, type NestMiddleware } from "@nestjs/common";
import type { NextFunction, Response } from "express";

import type { RequestWithId } from "../types/request-with-id.type";

const REQUEST_ID_HEADER = "x-request-id";

@Injectable()
class RequestIdMiddleware implements NestMiddleware {
  use(request: RequestWithId, response: Response, next: NextFunction): void {
    const incomingRequestId = request.header(REQUEST_ID_HEADER);
    const requestId = incomingRequestId?.trim() || randomUUID();

    request.requestId = requestId;
    response.setHeader(REQUEST_ID_HEADER, requestId);

    next();
  }
}

export { REQUEST_ID_HEADER, RequestIdMiddleware };
