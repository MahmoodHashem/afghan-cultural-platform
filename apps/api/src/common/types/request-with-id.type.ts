import type { Request } from "express";

type RequestWithId = Request & {
  requestId?: string;
};

export type { RequestWithId };
