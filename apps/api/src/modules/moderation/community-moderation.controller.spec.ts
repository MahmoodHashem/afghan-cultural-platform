jest.mock("../../database/prisma.service", () => ({
  PrismaService: class PrismaService {},
}));

import { IS_PUBLIC_ROUTE_KEY, REQUIRE_VERIFIED_EMAIL_KEY } from "../auth/auth.constants";
import { CommunityModerationController } from "./community-moderation.controller";

describe("CommunityModerationController authorization metadata", () => {
  it("keeps reports and corrections authenticated without requiring verified email", () => {
    expect(Reflect.getMetadata(IS_PUBLIC_ROUTE_KEY, CommunityModerationController)).toBeUndefined();
    expect(
      Reflect.getMetadata(REQUIRE_VERIFIED_EMAIL_KEY, CommunityModerationController),
    ).toBeUndefined();
  });
});
