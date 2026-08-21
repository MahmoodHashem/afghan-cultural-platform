jest.mock("@/database/prisma.service", () => ({
  PrismaService: class PrismaService {},
}));

import { IS_PUBLIC_ROUTE_KEY } from "@/modules/auth/auth.constants";
import { ProfileController } from "@/modules/profile/profile.controller";

describe("ProfileController authorization metadata", () => {
  it("does not mark owner profile routes as public", () => {
    expect(Reflect.getMetadata(IS_PUBLIC_ROUTE_KEY, ProfileController)).toBeUndefined();
  });
});
