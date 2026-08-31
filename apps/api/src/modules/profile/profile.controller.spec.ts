jest.mock("../../database/prisma.service", () => ({
  PrismaService: class PrismaService {},
}));

import { ValidationPipe } from "@nestjs/common";

import { IS_PUBLIC_ROUTE_KEY, REQUIRE_VERIFIED_EMAIL_KEY } from "../auth/auth.constants";
import { ProfileBookmarksQueryDto, ProfileCommentsQueryDto } from "./dto/profile-query.dto";
import { ProfileController } from "./profile.controller";

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

describe("ProfileController query DTO validation", () => {
  const validationPipe = new ValidationPipe({
    forbidNonWhitelisted: true,
    transform: true,
    whitelist: true,
  });

  it.each([
    ["comments", ProfileCommentsQueryDto],
    ["bookmarks", ProfileBookmarksQueryDto],
  ] as const)("accepts and transforms pagination for %s", async (_name, metatype) => {
    await expect(
      validationPipe.transform(
        { page: "2", limit: "8" },
        {
          metatype,
          type: "query",
        },
      ),
    ).resolves.toMatchObject({ page: 2, limit: 8 });
  });
});
