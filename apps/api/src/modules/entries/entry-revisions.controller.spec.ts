jest.mock("../../database/prisma.service", () => ({ PrismaService: class PrismaService {} }));

import { REQUIRE_VERIFIED_EMAIL_KEY } from "../auth/auth.constants";
import { UpdateEntryDraftDto } from "./dto/create-entry-draft.dto";
import { ReplaceRevisionTagsDto } from "./dto/entry-revision.dto";
import { EntryRevisionsController } from "./entry-revisions.controller";

describe("EntryRevisionsController authorization metadata", () => {
  it("requires a verified account for every author revision route", () => {
    expect(Reflect.getMetadata(REQUIRE_VERIFIED_EMAIL_KEY, EntryRevisionsController)).toBe(true);
  });

  it("keeps request DTO classes available to runtime validation", () => {
    const updateTypes = Reflect.getMetadata(
      "design:paramtypes",
      EntryRevisionsController.prototype,
      "update",
    );
    const tagTypes = Reflect.getMetadata(
      "design:paramtypes",
      EntryRevisionsController.prototype,
      "replaceTags",
    );

    expect(updateTypes[2]).toBe(UpdateEntryDraftDto);
    expect(tagTypes[2]).toBe(ReplaceRevisionTagsDto);
  });
});
