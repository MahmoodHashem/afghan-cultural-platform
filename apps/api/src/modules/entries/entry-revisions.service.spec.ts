jest.mock("../../database/prisma.service", () => ({
  PrismaService: class PrismaService {},
}));

import { ConflictException, ForbiddenException } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";

import type { PublicEntryCacheService } from "../../common/cache/public-entry-cache.service";
import type { PrismaService } from "../../database/prisma.service";
import {
  EntryRevisionStatus,
  EntryStatus,
  GeographicScope,
  UserRole,
  UserStatus,
} from "../../generated/prisma/enums";
import type { AuditService } from "../audit/audit.service";
import type { AuthenticatedUser } from "../auth/types/authenticated-user.type";
import type { CloudinaryMediaService } from "../media/cloudinary-media.service";
import { ENTRY_ERROR_CODES } from "./entries.constants";
import { EntryRevisionsService } from "./entry-revisions.service";

type DelegateMock = Record<
  | "aggregate"
  | "count"
  | "create"
  | "createMany"
  | "deleteMany"
  | "findFirst"
  | "findMany"
  | "update"
  | "updateMany",
  jest.Mock
>;

type PrismaMock = {
  auditLog: DelegateMock;
  category: DelegateMock;
  contentType: DelegateMock;
  contentVersion: DelegateMock;
  culturalEntry: DelegateMock;
  district: DelegateMock;
  entryReference: DelegateMock;
  entryRevision: DelegateMock;
  entryTag: DelegateMock;
  image: DelegateMock;
  moderationReview: DelegateMock;
  province: DelegateMock;
  source: DelegateMock;
  tag: DelegateMock;
  youTubeVideo: DelegateMock;
  $transaction: jest.Mock;
};

const author: AuthenticatedUser = {
  id: "11111111-1111-4111-8111-111111111111",
  email: "author@example.com",
  role: UserRole.USER,
  status: UserStatus.ACTIVE,
  displayName: "Author",
  profileImageUrl: null,
  emailVerifiedAt: new Date("2026-01-01T00:00:00.000Z"),
};

const moderator: AuthenticatedUser = {
  ...author,
  id: "22222222-2222-4222-8222-222222222222",
  email: "moderator@example.com",
  role: UserRole.MODERATOR,
  displayName: "Moderator",
};

const ids = {
  entry: "33333333-3333-4333-8333-333333333333",
  revision: "44444444-4444-4444-8444-444444444444",
  baseVersion: "55555555-5555-4555-8555-555555555555",
  submittedVersion: "66666666-6666-4666-8666-666666666666",
  category: "77777777-7777-4777-8777-777777777777",
  contentType: "88888888-8888-4888-8888-888888888888",
};

describe("EntryRevisionsService", () => {
  let prisma: PrismaMock;
  let auditService: { createWithClient: jest.Mock };
  let cacheService: { revalidatePublishedEntries: jest.Mock };
  let service: EntryRevisionsService;

  beforeEach(() => {
    prisma = createPrismaMock();
    auditService = { createWithClient: jest.fn().mockResolvedValue(undefined) };
    cacheService = { revalidatePublishedEntries: jest.fn().mockResolvedValue(undefined) };
    const mediaService = {
      uploadEntryImage: jest.fn(),
      deleteImage: jest.fn().mockResolvedValue(undefined),
    };
    const configService = {
      get: jest.fn((_key: string, fallback: unknown) => fallback),
    };

    service = new EntryRevisionsService(
      prisma as unknown as PrismaService,
      auditService as unknown as AuditService,
      mediaService as unknown as CloudinaryMediaService,
      configService as unknown as ConfigService,
      cacheService as unknown as PublicEntryCacheService,
    );
  });

  it("resumes an existing active revision without creating another workspace", async () => {
    prisma.entryRevision.findFirst.mockResolvedValue(createRevisionPayload());

    const response = await service.startOwnRevision(author, ids.entry);

    expect(response.data.revisionId).toBe(ids.revision);
    expect(prisma.entryRevision.create).not.toHaveBeenCalled();
  });

  it("attaches moderator feedback without replacing existing author work", async () => {
    const existing = createRevisionPayload({
      status: EntryRevisionStatus.DRAFT,
      workingSnapshot: createSnapshot({ title: "Author's unsaved revision" }),
    });
    prisma.entryRevision.findFirst.mockResolvedValue(existing);
    prisma.entryRevision.update.mockResolvedValue({
      ...existing,
      status: EntryRevisionStatus.CHANGES_REQUESTED,
      requestedById: moderator.id,
      requestedBy: { id: moderator.id, displayName: moderator.displayName },
      requestFeedback: "Please verify the historical date.",
    });

    const response = await service.requestRevision(
      moderator,
      ids.entry,
      "Please verify the historical date.",
    );

    expect(prisma.entryRevision.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: ids.revision },
        data: expect.not.objectContaining({ workingSnapshot: expect.anything() }),
      }),
    );
    expect(response.data.title).toBe("Author's unsaved revision");
  });

  it("prevents a moderator from approving their own published revision", async () => {
    prisma.entryRevision.findFirst.mockResolvedValue(
      createRevisionPayload({ authorId: moderator.id }),
    );

    await expect(service.approveRevision(moderator, ids.revision)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(prisma.culturalEntry.update).not.toHaveBeenCalled();
    expect(cacheService.revalidatePublishedEntries).not.toHaveBeenCalled();
  });

  it("rejects approval when the public base version has changed", async () => {
    prisma.entryRevision.findFirst.mockResolvedValue(
      createRevisionPayload({ publishedVersionId: "99999999-9999-4999-8999-999999999999" }),
    );

    await expectErrorCode(
      () => service.approveRevision(moderator, ids.revision),
      ENTRY_ERROR_CODES.REVISION_STALE,
      ConflictException,
    );
    expect(prisma.culturalEntry.update).not.toHaveBeenCalled();
    expect(cacheService.revalidatePublishedEntries).not.toHaveBeenCalled();
  });

  it("atomically applies an approved snapshot and revalidates after commit", async () => {
    prisma.entryRevision.findFirst.mockResolvedValue(createRevisionPayload());
    prisma.category.findFirst.mockResolvedValue({
      id: ids.category,
      name: "History",
      slug: "history",
    });
    prisma.contentType.findFirst.mockResolvedValue({
      id: ids.contentType,
      name: "Article",
      slug: "article",
    });
    prisma.tag.count.mockResolvedValue(0);
    prisma.moderationReview.create.mockResolvedValue({ id: "review-id" });

    await service.approveRevision(moderator, ids.revision);

    expect(prisma.culturalEntry.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: ids.entry },
        data: expect.objectContaining({
          title: "Revised title",
          publishedVersionId: ids.submittedVersion,
        }),
      }),
    );
    expect(prisma.entryRevision.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: EntryRevisionStatus.APPROVED }),
      }),
    );
    expect(cacheService.revalidatePublishedEntries).toHaveBeenCalledTimes(1);
  });
});

function createDelegateMock(): DelegateMock {
  return {
    aggregate: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    createMany: jest.fn(),
    deleteMany: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn().mockResolvedValue({ count: 1 }),
  };
}

function createPrismaMock(): PrismaMock {
  const delegates = {
    auditLog: createDelegateMock(),
    category: createDelegateMock(),
    contentType: createDelegateMock(),
    contentVersion: createDelegateMock(),
    culturalEntry: createDelegateMock(),
    district: createDelegateMock(),
    entryReference: createDelegateMock(),
    entryRevision: createDelegateMock(),
    entryTag: createDelegateMock(),
    image: createDelegateMock(),
    moderationReview: createDelegateMock(),
    province: createDelegateMock(),
    source: createDelegateMock(),
    tag: createDelegateMock(),
    youTubeVideo: createDelegateMock(),
  };

  return {
    ...delegates,
    $transaction: jest.fn(async (input: unknown) => {
      if (typeof input === "function") {
        return input(delegates);
      }
      return Promise.all(input as Promise<unknown>[]);
    }),
  };
}

function createSnapshot(overrides: Record<string, unknown> = {}) {
  return {
    schemaVersion: 1,
    entryId: ids.entry,
    key: `entry-${ids.entry}`,
    slug: "revised-entry",
    title: "Revised title",
    summary: "A complete revised summary.",
    contentJson: {
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: "Revised body" }] }],
    },
    plainTextContent: "Revised body",
    normalizedSearchText: "revised entry",
    geographicScope: GeographicScope.NONE,
    province: null,
    district: null,
    category: { id: ids.category, name: "History", slug: "history" },
    contentType: { id: ids.contentType, name: "Article", slug: "article" },
    villageOrLocation: null,
    tags: [],
    sources: [],
    images: [],
    youtubeVideo: null,
    internalReferences: [],
    versionReason: "PUBLISHED_REVISION",
    creatorId: author.id,
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function createRevisionPayload({
  authorId = author.id,
  publishedVersionId = ids.baseVersion,
  status = EntryRevisionStatus.PENDING_REVIEW,
  workingSnapshot = createSnapshot(),
}: {
  authorId?: string;
  publishedVersionId?: string;
  status?: EntryRevisionStatus;
  workingSnapshot?: ReturnType<typeof createSnapshot>;
} = {}) {
  const now = new Date("2026-01-02T00:00:00.000Z");
  return {
    id: ids.revision,
    entryId: ids.entry,
    status,
    baseVersionId: ids.baseVersion,
    workingSnapshot,
    plainTextContent: "Revised body",
    createdById: authorId,
    requestedById: null,
    requestFeedback: null,
    submittedAt: now,
    decidedAt: null,
    createdAt: now,
    updatedAt: now,
    entry: {
      id: ids.entry,
      key: `entry-${ids.entry}`,
      slug: "revised-entry",
      authorId,
      publishedAt: new Date("2025-01-01T00:00:00.000Z"),
      status: EntryStatus.PUBLISHED,
      publishedVersionId,
      author: { id: authorId, displayName: "Author" },
    },
    createdBy: { id: authorId, displayName: "Author" },
    requestedBy: null,
    moderationReviews: [],
    contentVersions: [
      {
        id: ids.submittedVersion,
        versionNumber: 2,
        createdAt: now,
      },
    ],
  };
}

async function expectErrorCode(
  action: () => Promise<unknown>,
  code: string,
  exceptionType: new (...args: never[]) => Error,
) {
  try {
    await action();
    throw new Error("Expected action to throw");
  } catch (error) {
    expect(error).toBeInstanceOf(exceptionType);
    expect((error as { getResponse(): unknown }).getResponse()).toMatchObject({ error: code });
  }
}
