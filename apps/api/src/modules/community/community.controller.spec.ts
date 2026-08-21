jest.mock("@/database/prisma.service", () => ({
  PrismaService: class PrismaService {},
}));

import { IS_PUBLIC_ROUTE_KEY, REQUIRE_VERIFIED_EMAIL_KEY } from "@/modules/auth/auth.constants";
import { CommunityController } from "@/modules/community/community.controller";

describe("CommunityController like authorization metadata", () => {
  it("requires authentication for personal like state", () => {
    expect(
      Reflect.getMetadata(IS_PUBLIC_ROUTE_KEY, CommunityController.prototype.getLikeState),
    ).toBeUndefined();
    expect(
      Reflect.getMetadata(REQUIRE_VERIFIED_EMAIL_KEY, CommunityController.prototype.getLikeState),
    ).toBeUndefined();
  });

  it.each(["likeEntry", "unlikeEntry"] as const)(
    "requires authentication and verified email for %s",
    (methodName) => {
      const handler = CommunityController.prototype[methodName];

      expect(Reflect.getMetadata(IS_PUBLIC_ROUTE_KEY, handler)).toBeUndefined();
      expect(Reflect.getMetadata(REQUIRE_VERIFIED_EMAIL_KEY, handler)).toBe(true);
    },
  );
});
