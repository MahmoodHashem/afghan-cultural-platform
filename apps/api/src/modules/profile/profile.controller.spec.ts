jest.mock("@/database/prisma.service", () => ({
  PrismaService: class PrismaService {},
}));

import { IS_PUBLIC_ROUTE_KEY, REQUIRE_VERIFIED_EMAIL_KEY } from "@/modules/auth/auth.constants";
import { ProfileController } from "@/modules/profile/profile.controller";

describe("ProfileController authorization metadata", () => {
  it("does not mark owner profile routes as public", () => {
    expect(Reflect.getMetadata(IS_PUBLIC_ROUTE_KEY, ProfileController)).toBeUndefined();
  });

  it.each(["saveBookmark", "removeBookmark"] as const)(
    "requires verified email for %s",
    (methodName) => {
      expect(
        Reflect.getMetadata(REQUIRE_VERIFIED_EMAIL_KEY, ProfileController.prototype[methodName]),
      ).toBe(true);
    },
  );
});
