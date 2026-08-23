jest.mock("@/database/prisma.service", () => ({
  PrismaService: class PrismaService {},
}));

import { ValidationPipe } from "@nestjs/common";

import { IS_PUBLIC_ROUTE_KEY, REQUIRE_VERIFIED_EMAIL_KEY } from "@/modules/auth/auth.constants";
import { CommunityController } from "@/modules/community/community.controller";
import {
  CreateEntryCommentDto,
  UpdateEntryCommentDto,
} from "@/modules/community/dto/community-feedback.dto";

describe("CommunityController like authorization metadata", () => {
  it("requires authentication for personal like state", () => {
    expect(
      Reflect.getMetadata(IS_PUBLIC_ROUTE_KEY, CommunityController.prototype.getLikeState),
    ).toBeUndefined();
    expect(
      Reflect.getMetadata(REQUIRE_VERIFIED_EMAIL_KEY, CommunityController.prototype.getLikeState),
    ).toBeUndefined();
  });

  it.each([
    "likeEntry",
    "unlikeEntry",
    "createComment",
    "updateComment",
    "deleteComment",
    "likeComment",
    "unlikeComment",
    "getCommentInteractions",
  ] as const)("requires authentication and verified email for %s", (methodName) => {
    const handler = CommunityController.prototype[methodName];

    expect(Reflect.getMetadata(IS_PUBLIC_ROUTE_KEY, handler)).toBeUndefined();
    expect(Reflect.getMetadata(REQUIRE_VERIFIED_EMAIL_KEY, handler)).toBe(true);
  });
});

describe("CommunityController request DTO validation", () => {
  const validationPipe = new ValidationPipe({
    forbidNonWhitelisted: true,
    transform: true,
    whitelist: true,
  });

  it.each([
    ["create comment", CreateEntryCommentDto, { body: "A useful comment." }],
    [
      "create reply",
      CreateEntryCommentDto,
      { body: "A useful reply.", parentId: "11111111-1111-4111-8111-111111111111" },
    ],
    ["update comment", UpdateEntryCommentDto, { body: "An updated comment." }],
  ] as const)("accepts the documented body for %s", async (_name, metatype, body) => {
    await expect(
      validationPipe.transform(body, {
        metatype,
        type: "body",
      }),
    ).resolves.toMatchObject(body);
  });
});

describe("CommunityController engagement surface", () => {
  it("does not expose removed rating actions", () => {
    expect(CommunityController.prototype).not.toHaveProperty("upsertRating");
    expect(CommunityController.prototype).not.toHaveProperty("removeRating");
  });
});
