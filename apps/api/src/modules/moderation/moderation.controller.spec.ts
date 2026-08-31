jest.mock("../../database/prisma.service", () => ({
  PrismaService: class PrismaService {},
}));

import { UserRole } from "../../generated/prisma/enums";
import { REQUIRE_VERIFIED_EMAIL_KEY, ROLES_KEY } from "../auth/auth.constants";
import { ModerationController } from "./moderation.controller";

describe("ModerationController authorization metadata", () => {
  it("requires verified email and moderator or admin role", () => {
    expect(Reflect.getMetadata(REQUIRE_VERIFIED_EMAIL_KEY, ModerationController)).toBe(true);
    expect(Reflect.getMetadata(ROLES_KEY, ModerationController)).toEqual([
      UserRole.MODERATOR,
      UserRole.ADMIN,
    ]);
  });
});
