jest.mock("../../database/prisma.service", () => ({ PrismaService: class PrismaService {} }));

import { REQUIRE_VERIFIED_EMAIL_KEY } from "../auth/auth.constants";
import { EntryRevisionsController } from "./entry-revisions.controller";

describe("EntryRevisionsController authorization metadata", () => {
  it("requires a verified account for every author revision route", () => {
    expect(Reflect.getMetadata(REQUIRE_VERIFIED_EMAIL_KEY, EntryRevisionsController)).toBe(true);
  });
});
