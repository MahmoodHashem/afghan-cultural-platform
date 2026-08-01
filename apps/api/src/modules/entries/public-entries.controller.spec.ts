jest.mock("@/database/prisma.service", () => ({
  PrismaService: class PrismaService {},
}));

import { IS_PUBLIC_ROUTE_KEY, REQUIRE_VERIFIED_EMAIL_KEY } from "@/modules/auth/auth.constants";
import { PublicEntriesController } from "@/modules/entries/public-entries.controller";

describe("PublicEntriesController authorization metadata", () => {
  it("marks public entry routes as public without requiring verified email", () => {
    expect(Reflect.getMetadata(IS_PUBLIC_ROUTE_KEY, PublicEntriesController)).toBe(true);
    expect(
      Reflect.getMetadata(REQUIRE_VERIFIED_EMAIL_KEY, PublicEntriesController),
    ).toBeUndefined();
  });
});
