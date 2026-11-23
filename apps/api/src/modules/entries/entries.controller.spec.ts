jest.mock("../../database/prisma.service", () => ({
  PrismaService: class PrismaService {},
}));

import { REQUIRE_VERIFIED_EMAIL_KEY } from "../auth/auth.constants";
import { EntriesController } from "./entries.controller";

describe("EntriesController authorization metadata", () => {
  it("allows authenticated exhibition users to contribute without verified email", () => {
    expect(Reflect.getMetadata(REQUIRE_VERIFIED_EMAIL_KEY, EntriesController)).toBeUndefined();
  });
});
