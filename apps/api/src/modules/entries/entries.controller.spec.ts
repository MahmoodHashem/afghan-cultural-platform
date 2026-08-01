jest.mock("@/database/prisma.service", () => ({
  PrismaService: class PrismaService {},
}));

import { REQUIRE_VERIFIED_EMAIL_KEY } from "@/modules/auth/auth.constants";
import { EntriesController } from "@/modules/entries/entries.controller";

describe("EntriesController authorization metadata", () => {
  it("requires verified email for draft routes", () => {
    expect(Reflect.getMetadata(REQUIRE_VERIFIED_EMAIL_KEY, EntriesController)).toBe(true);
  });
});
