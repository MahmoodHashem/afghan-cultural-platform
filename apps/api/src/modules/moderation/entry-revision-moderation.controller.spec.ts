jest.mock("../../database/prisma.service", () => ({ PrismaService: class PrismaService {} }));

import { UserRole } from "../../generated/prisma/enums";
import { REQUIRE_VERIFIED_EMAIL_KEY, ROLES_KEY } from "../auth/auth.constants";
import { RevisionReasonDto } from "../entries/dto/entry-revision.dto";
import { EntryRevisionModerationController } from "./entry-revision-moderation.controller";

describe("EntryRevisionModerationController authorization metadata", () => {
  it("requires a verified moderator or admin", () => {
    expect(Reflect.getMetadata(REQUIRE_VERIFIED_EMAIL_KEY, EntryRevisionModerationController)).toBe(
      true,
    );
    expect(Reflect.getMetadata(ROLES_KEY, EntryRevisionModerationController)).toEqual([
      UserRole.MODERATOR,
      UserRole.ADMIN,
    ]);
  });

  it("keeps the reason DTO available to runtime validation", () => {
    const parameterTypes = Reflect.getMetadata(
      "design:paramtypes",
      EntryRevisionModerationController.prototype,
      "requestRevision",
    );

    expect(parameterTypes[2]).toBe(RevisionReasonDto);
  });
});
