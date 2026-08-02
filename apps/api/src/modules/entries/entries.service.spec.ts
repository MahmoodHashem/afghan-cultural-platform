jest.mock("@/database/prisma.service", () => ({
  PrismaService: class PrismaService {},
}));

import {
  BadRequestException,
  ForbiddenException,
  type HttpException,
  NotFoundException,
} from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

import type { PrismaService } from "@/database/prisma.service";
import {
  EntryStatus,
  GeographicScope,
  SourceType,
  UserRole,
  UserStatus,
} from "@/generated/prisma/enums";
import type { AuditService } from "@/modules/audit/audit.service";
import type { AuthenticatedUser } from "@/modules/auth/types/authenticated-user.type";
import { CreateEntryDraftDto } from "@/modules/entries/dto/create-entry-draft.dto";
import { ENTRY_ERROR_CODES } from "@/modules/entries/entries.constants";
import { EntriesService } from "@/modules/entries/entries.service";
import type { CloudinaryMediaService } from "@/modules/media/cloudinary-media.service";

type DelegateMock = {
  aggregate: jest.Mock;
  count: jest.Mock;
  create: jest.Mock;
  createMany: jest.Mock;
  delete: jest.Mock;
  deleteMany: jest.Mock;
  findFirst: jest.Mock;
  findMany: jest.Mock;
  findUnique: jest.Mock;
  update: jest.Mock;
  updateMany: jest.Mock;
};

type TaxonomyDelegateMock = {
  findFirst: jest.Mock;
};

type PrismaMock = {
  culturalEntry: DelegateMock;
  contentVersion: DelegateMock;
  province: TaxonomyDelegateMock;
  district: TaxonomyDelegateMock;
  category: TaxonomyDelegateMock;
  contentType: TaxonomyDelegateMock;
  tag: DelegateMock;
  entryTag: DelegateMock;
  entryReference: DelegateMock;
  source: DelegateMock;
  image: DelegateMock;
  youTubeVideo: DelegateMock;
  $transaction: jest.Mock;
};

type MediaServiceMock = {
  uploadEntryImage: jest.Mock;
  deleteImage: jest.Mock;
};

type AuditServiceMock = {
  createWithClient: jest.Mock;
};

type ConfigServiceMock = {
  get: jest.Mock;
};

const user: AuthenticatedUser = {
  id: "11111111-1111-1111-1111-111111111111",
  email: "user@example.com",
  role: UserRole.USER,
  status: UserStatus.ACTIVE,
  displayName: "Mahmood",
  profileImageUrl: null,
  emailVerifiedAt: new Date("2026-01-01T00:00:00.000Z"),
};

const ids = {
  entry: "22222222-2222-4222-8222-222222222222",
  province: "33333333-3333-3333-3333-333333333333",
  district: "44444444-4444-4444-4444-444444444444",
  category: "55555555-5555-5555-5555-555555555555",
  contentType: "66666666-6666-6666-6666-666666666666",
  tagOne: "77777777-7777-7777-7777-777777777777",
  tagTwo: "88888888-8888-8888-8888-888888888888",
  sourceOne: "99999999-9999-9999-9999-999999999999",
  sourceTwo: "aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa",
  imageOne: "bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb",
  imageTwo: "cccccccc-cccc-4ccc-cccc-cccccccccccc",
  youtubeVideo: "dddddddd-dddd-4ddd-dddd-dddddddddddd",
  publishedTarget: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
  reference: "ffffffff-ffff-4fff-8fff-ffffffffffff",
};

const publicIds = {
  author: "11111111-1111-4111-8111-111111111111",
  province: "33333333-3333-4333-8333-333333333333",
  otherProvince: "12121212-1212-4212-8212-121212121212",
  district: "44444444-4444-4444-8444-444444444444",
  category: "55555555-5555-4555-8555-555555555555",
  contentType: "66666666-6666-4666-8666-666666666666",
  tag: "77777777-7777-4777-8777-777777777777",
};

const validContentJson = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      attrs: { textDirection: "rtl" },
      content: [{ type: "text", text: "متن فرهنگی معتبر" }],
    },
  ],
};

const internalReferenceContentJson = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      attrs: { textDirection: "rtl" },
      content: [
        { type: "text", text: "در کابل " },
        {
          type: "text",
          text: "نوروز کابل",
          marks: [
            {
              type: "internalEntryLink",
              attrs: {
                targetEntryId: ids.publishedTarget,
                targetSlug: "نوروز-کابل",
              },
            },
          ],
        },
        { type: "text", text: " برگزار می‌شود." },
      ],
    },
  ],
};

const createDraftInput = {
  title: "فرهنگ کابل",
  summary: "این خلاصه معتبر برای پیش‌نویس فرهنگی است.",
  contentJson: validContentJson,
  geographicScope: GeographicScope.PROVINCE,
  provinceId: ids.province,
  categoryId: ids.category,
  contentTypeId: ids.contentType,
  villageOrLocation: "شهر کابل",
};

describe("EntriesService", () => {
  let prisma: PrismaMock;
  let auditService: AuditServiceMock;
  let mediaService: MediaServiceMock;
  let configService: ConfigServiceMock;
  let service: EntriesService;

  beforeEach(() => {
    prisma = createPrismaMock();
    auditService = createAuditServiceMock();
    mediaService = createMediaServiceMock();
    configService = createConfigServiceMock();
    service = new EntriesService(
      prisma as unknown as PrismaService,
      auditService as unknown as AuditService,
      mediaService as unknown as CloudinaryMediaService,
      configService as unknown as ConfigService,
    );
  });

  it("creates a draft with the authenticated user as author", async () => {
    mockActiveTaxonomy(prisma);
    prisma.culturalEntry.findFirst.mockResolvedValueOnce(null);
    prisma.culturalEntry.create.mockResolvedValue(createEntryPayload());

    const response = await service.createDraft(user, createDraftInput);

    expect(prisma.culturalEntry.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          authorId: user.id,
          status: EntryStatus.DRAFT,
          key: expect.stringMatching(/^entry-/),
          slug: "فرهنگ-کابل",
          plainTextContent: "متن فرهنگی معتبر",
        }),
      }),
    );
    expect(response.data.authorId).toBe(user.id);
  });

  it("creates a national draft without province or district", async () => {
    mockActiveTaxonomy(prisma);
    prisma.culturalEntry.findFirst.mockResolvedValueOnce(null);
    prisma.culturalEntry.create.mockResolvedValue(
      createEntryPayload({
        geographicScope: GeographicScope.NATIONAL,
        provinceId: null,
        province: null,
      }),
    );

    await service.createDraft(user, {
      ...createDraftInput,
      geographicScope: GeographicScope.NATIONAL,
      provinceId: null,
      districtId: null,
    });

    expect(prisma.culturalEntry.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          geographicScope: GeographicScope.NATIONAL,
          provinceId: null,
          districtId: null,
        }),
      }),
    );
    expect(prisma.province.findFirst).not.toHaveBeenCalled();
  });

  it("rejects a provincial draft without a province", async () => {
    mockActiveTaxonomy(prisma);

    await expectErrorCode(
      () =>
        service.createDraft(user, {
          ...createDraftInput,
          provinceId: null,
        }),
      ENTRY_ERROR_CODES.GEOGRAPHY_INVALID,
      BadRequestException,
    );
  });

  it("rejects national and non-geographic drafts with province or district data", async () => {
    mockActiveTaxonomy(prisma);

    await expectErrorCode(
      () =>
        service.createDraft(user, {
          ...createDraftInput,
          geographicScope: GeographicScope.NATIONAL,
          districtId: null,
        }),
      ENTRY_ERROR_CODES.GEOGRAPHY_INVALID,
      BadRequestException,
    );

    await expectErrorCode(
      () =>
        service.createDraft(user, {
          ...createDraftInput,
          geographicScope: GeographicScope.NONE,
          provinceId: null,
          districtId: ids.district,
        }),
      ENTRY_ERROR_CODES.GEOGRAPHY_INVALID,
      BadRequestException,
    );
  });

  it("allows an optional district when it belongs to the selected province", async () => {
    mockActiveTaxonomy(prisma, {
      district: createDistrictReference(ids.province),
    });
    prisma.culturalEntry.findFirst.mockResolvedValueOnce(null);
    prisma.culturalEntry.create.mockResolvedValue({
      ...createEntryPayload(),
      districtId: ids.district,
      district: createTaxonomyReference(ids.district, "مرکز", "markaz"),
    });

    await service.createDraft(user, {
      ...createDraftInput,
      districtId: ids.district,
    });

    expect(prisma.culturalEntry.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          geographicScope: GeographicScope.PROVINCE,
          provinceId: ids.province,
          districtId: ids.district,
        }),
      }),
    );
  });

  it("rejects inactive taxonomy records", async () => {
    mockActiveTaxonomy(prisma);
    prisma.province.findFirst.mockResolvedValueOnce(null);

    await expectErrorCode(
      () => service.createDraft(user, createDraftInput),
      ENTRY_ERROR_CODES.TAXONOMY_INVALID,
      BadRequestException,
    );
  });

  it("rejects a district that does not belong to the selected province", async () => {
    mockActiveTaxonomy(prisma, {
      district: {
        id: ids.district,
        name: "مرکز",
        slug: "markaz",
        provinceId: "77777777-7777-7777-7777-777777777777",
      },
    });

    await expectErrorCode(
      () =>
        service.createDraft(user, {
          ...createDraftInput,
          districtId: ids.district,
        }),
      ENTRY_ERROR_CODES.DISTRICT_PROVINCE_MISMATCH,
      BadRequestException,
    );
  });

  it("maps invalid Tiptap content to a stable entry error", async () => {
    mockActiveTaxonomy(prisma);

    await expectErrorCode(
      () =>
        service.createDraft(user, {
          ...createDraftInput,
          contentJson: {
            type: "doc",
            content: [{ type: "image", attrs: { src: "https://example.com/image.jpg" } }],
          },
        }),
      ENTRY_ERROR_CODES.CONTENT_INVALID,
      BadRequestException,
    );
  });

  it("lets the owner read and update a draft", async () => {
    prisma.culturalEntry.findFirst.mockResolvedValueOnce(createEntryPayload());
    prisma.culturalEntry.findFirst.mockResolvedValueOnce(createEntryForChange());
    mockActiveTaxonomy(prisma);
    prisma.culturalEntry.update.mockResolvedValue({
      ...createEntryPayload(),
      summary: "خلاصه تازه برای ویرایش پیش‌نویس.",
    });

    await expect(service.getOwnEntry(user, ids.entry)).resolves.toMatchObject({
      data: { id: ids.entry },
    });
    const response = await service.updateOwnEntry(user, ids.entry, {
      summary: "خلاصه تازه برای ویرایش پیش‌نویس.",
    });

    expect(prisma.culturalEntry.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: ids.entry },
        data: expect.objectContaining({
          summary: "خلاصه تازه برای ویرایش پیش‌نویس.",
        }),
      }),
    );
    expect(response.data.summary).toBe("خلاصه تازه برای ویرایش پیش‌نویس.");
  });

  it("clears province and district when an editable draft changes to national scope", async () => {
    prisma.culturalEntry.findFirst.mockResolvedValue(createEntryForChange());
    mockActiveTaxonomy(prisma);
    prisma.culturalEntry.update.mockResolvedValue(
      createEntryPayload({
        geographicScope: GeographicScope.NATIONAL,
        provinceId: null,
        province: null,
      }),
    );

    await service.updateOwnEntry(user, ids.entry, {
      geographicScope: GeographicScope.NATIONAL,
    });

    expect(prisma.culturalEntry.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          geographicScope: GeographicScope.NATIONAL,
          provinceId: null,
          districtId: null,
        }),
      }),
    );
    expect(prisma.province.findFirst).not.toHaveBeenCalled();
  });

  it("does not reveal another user's draft", async () => {
    prisma.culturalEntry.findFirst.mockResolvedValue(null);

    await expectErrorCode(
      () => service.getOwnEntry(user, ids.entry),
      ENTRY_ERROR_CODES.NOT_FOUND,
      NotFoundException,
    );
  });

  it("rejects edits when the entry status is not editable", async () => {
    prisma.culturalEntry.findFirst.mockResolvedValue({
      ...createEntryForChange(),
      status: EntryStatus.PENDING_REVIEW,
    });

    await expectErrorCode(
      () => service.updateOwnEntry(user, ids.entry, { title: "عنوان تازه" }),
      ENTRY_ERROR_CODES.INVALID_STATUS,
      ForbiddenException,
    );
  });

  it("lists only entries belonging to the current user", async () => {
    prisma.culturalEntry.findMany.mockResolvedValue([createEntryPayload()]);
    prisma.culturalEntry.count.mockResolvedValue(1);

    const response = await service.listOwnEntries(user, {
      status: EntryStatus.DRAFT,
      categoryId: ids.category,
      contentTypeId: ids.contentType,
    });

    expect(prisma.culturalEntry.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          authorId: user.id,
          status: EntryStatus.DRAFT,
          categoryId: ids.category,
          contentTypeId: ids.contentType,
        },
        skip: 0,
        take: 20,
      }),
    );
    expect(response.meta.total).toBe(1);
  });

  it("lists only published entries for public browsing without full content JSON", async () => {
    prisma.culturalEntry.findMany.mockResolvedValue([createPublicEntryCardPayload()]);
    prisma.culturalEntry.count.mockResolvedValue(1);

    const response = await service.listPublishedEntries({ page: 2, limit: 10 });

    expect(prisma.culturalEntry.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          status: EntryStatus.PUBLISHED,
          publishedAt: { not: null },
        },
        skip: 10,
        take: 10,
      }),
    );
    const listSelect = prisma.culturalEntry.findMany.mock.calls[0]?.[0]?.select;

    expect(listSelect).not.toHaveProperty("contentJson");
    expect(listSelect).not.toHaveProperty("plainTextContent");
    expect(response.data[0]).toMatchObject({
      id: ids.entry,
      slug: "فرهنگ-کابل",
      coverImage: {
        thumbnailUrl: "https://res.cloudinary.com/demo/image/upload/thumb/entries/sample.jpg",
      },
    });
    expect(response.data[0]).not.toHaveProperty("contentJson");
    expect(response.data[0]).not.toHaveProperty("plainTextContent");
  });

  it("applies public province, category, content-type, tag, and author filters", async () => {
    prisma.culturalEntry.findMany.mockResolvedValue([createPublicEntryCardPayload()]);
    prisma.culturalEntry.count.mockResolvedValue(1);

    await service.listPublishedEntries({
      provinceId: publicIds.province,
      categorySlug: "traditions",
      contentTypeId: publicIds.contentType,
      tagSlug: "nowruz",
      authorId: publicIds.author,
      sort: "recentlyUpdated",
    });

    expect(prisma.culturalEntry.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: EntryStatus.PUBLISHED,
          geographicScope: GeographicScope.PROVINCE,
          provinceId: publicIds.province,
          category: { slug: "traditions" },
          contentTypeId: publicIds.contentType,
          authorId: publicIds.author,
          tags: {
            some: {
              tag: {
                slug: "nowruz",
              },
            },
          },
        }),
        orderBy: [{ updatedAt: "desc" }, { publishedAt: "desc" }, { id: "asc" }],
      }),
    );
  });

  it("filters national public entries separately from provincial entries", async () => {
    prisma.culturalEntry.findMany.mockResolvedValue([
      {
        ...createPublicEntryCardPayload(),
        geographicScope: GeographicScope.NATIONAL,
        province: null,
      },
    ]);
    prisma.culturalEntry.count.mockResolvedValue(1);

    const response = await service.listPublishedEntries({
      geographicScope: GeographicScope.NATIONAL,
    });

    expect(prisma.culturalEntry.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          geographicScope: GeographicScope.NATIONAL,
        }),
      }),
    );
    expect(response.data[0]).toMatchObject({
      geographicScope: GeographicScope.NATIONAL,
      province: null,
    });
  });

  it("rejects province filters with national or non-geographic public scope", async () => {
    await expectErrorCode(
      () =>
        service.listPublishedEntries({
          geographicScope: GeographicScope.NATIONAL,
          provinceSlug: "kabul",
        }),
      ENTRY_ERROR_CODES.FILTER_INVALID,
      BadRequestException,
    );
    expect(prisma.culturalEntry.findMany).not.toHaveBeenCalled();
  });

  it("supports public oldest sorting", async () => {
    prisma.culturalEntry.findMany.mockResolvedValue([createPublicEntryCardPayload()]);
    prisma.culturalEntry.count.mockResolvedValue(1);

    await service.listPublishedEntries({ sort: "oldest" });

    expect(prisma.culturalEntry.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ publishedAt: "asc" }, { createdAt: "asc" }, { id: "asc" }],
      }),
    );
  });

  it("rejects unsupported public entry sort values with a stable code", async () => {
    await expectErrorCode(
      () => service.listPublishedEntries({ sort: "popular" as never }),
      ENTRY_ERROR_CODES.QUERY_INVALID,
      BadRequestException,
    );
    expect(prisma.culturalEntry.findMany).not.toHaveBeenCalled();
  });

  it("rejects inconsistent public district and province filters", async () => {
    prisma.district.findFirst.mockResolvedValue({
      provinceId: publicIds.otherProvince,
      province: {
        slug: "herat",
      },
    });

    await expectErrorCode(
      () =>
        service.listPublishedEntries({
          provinceId: publicIds.province,
          districtId: publicIds.district,
        }),
      ENTRY_ERROR_CODES.FILTER_INVALID,
      BadRequestException,
    );
    expect(prisma.culturalEntry.findMany).not.toHaveBeenCalled();
  });

  it("returns public detail by a published slug", async () => {
    prisma.culturalEntry.findFirst.mockResolvedValue(createPublicEntryDetailPayload());

    const response = await service.getPublishedEntryBySlug(encodeURIComponent("فرهنگ-کابل"));

    expect(prisma.culturalEntry.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          slug: "فرهنگ-کابل",
          status: EntryStatus.PUBLISHED,
          publishedAt: { not: null },
        },
      }),
    );
    const detailSelect = prisma.culturalEntry.findFirst.mock.calls[0]?.[0]?.select;

    expect(detailSelect.images.orderBy).toEqual([{ displayOrder: "asc" }, { createdAt: "asc" }]);
    expect(detailSelect.sources.orderBy).toEqual([{ displayOrder: "asc" }, { createdAt: "asc" }]);
    expect(detailSelect.outgoingReferences.where).toEqual({
      targetEntry: {
        status: EntryStatus.PUBLISHED,
        publishedAt: {
          not: null,
        },
      },
    });
    expect(detailSelect.incomingReferences.where).toEqual({
      sourceEntry: {
        status: EntryStatus.PUBLISHED,
        publishedAt: {
          not: null,
        },
      },
    });
    expect(response.data).toMatchObject({
      slug: "فرهنگ-کابل",
      contentJson: validContentJson,
      district: {
        slug: "markaz",
      },
      images: [
        { id: ids.imageOne, displayOrder: 0 },
        { id: ids.imageTwo, displayOrder: 1 },
      ],
      sources: [
        { id: ids.sourceOne, displayOrder: 0 },
        { id: ids.sourceTwo, displayOrder: 1 },
      ],
      outgoingReferences: [
        {
          targetEntryId: ids.publishedTarget,
          anchorText: "نوروز کابل",
          targetEntry: {
            slug: "نوروز-کابل",
          },
        },
      ],
      incomingReferences: [
        {
          sourceEntryId: ids.publishedTarget,
          sourceEntry: {
            slug: "نوشته-منتشرشده",
          },
        },
      ],
      seo: {
        canonicalSlug: "فرهنگ-کابل",
        image: "https://res.cloudinary.com/demo/image/upload/thumb/entries/sample.jpg",
      },
    });
    expect(response.data).not.toHaveProperty("authorId");
    expect(response.data.author).not.toHaveProperty("email");
    expect(prisma.source.findMany).not.toHaveBeenCalled();
    expect(prisma.image.findMany).not.toHaveBeenCalled();
  });

  it("returns 404 for unpublished or unavailable slugs", async () => {
    prisma.culturalEntry.findFirst.mockResolvedValue(null);

    await expectErrorCode(
      () => service.getPublishedEntryBySlug("draft-entry"),
      ENTRY_ERROR_CODES.NOT_FOUND,
      NotFoundException,
    );
  });

  it("hard-deletes only unsubmitted drafts", async () => {
    prisma.culturalEntry.findFirst.mockResolvedValue(createEntryForChange());
    prisma.culturalEntry.delete.mockResolvedValue(createEntryPayload());

    await expect(service.deleteOwnDraft(user, ids.entry)).resolves.toMatchObject({
      data: { message: "Draft deleted successfully." },
    });
    expect(prisma.culturalEntry.delete).toHaveBeenCalledWith({ where: { id: ids.entry } });
  });

  it("rejects hard deletion after draft submission", async () => {
    prisma.culturalEntry.findFirst.mockResolvedValue({
      ...createEntryForChange(),
      submittedAt: new Date("2026-01-01T00:00:00.000Z"),
    });

    await expectErrorCode(
      () => service.deleteOwnDraft(user, ids.entry),
      ENTRY_ERROR_CODES.INVALID_STATUS,
      ForbiddenException,
    );
    expect(prisma.culturalEntry.delete).not.toHaveBeenCalled();
  });

  it("submits a complete draft and creates a first content version", async () => {
    prisma.culturalEntry.findFirst.mockResolvedValueOnce(createSubmissionEntryPayload());
    prisma.culturalEntry.updateMany.mockResolvedValue({ count: 1 });
    prisma.contentVersion.aggregate.mockResolvedValue({ _max: { versionNumber: null } });
    prisma.contentVersion.create.mockResolvedValue(createContentVersionPayload());
    prisma.culturalEntry.findUnique.mockResolvedValue(
      createEntryPayload({ status: EntryStatus.PENDING_REVIEW }),
    );

    const response = await service.submitOwnEntry(user, ids.entry);

    expect(prisma.culturalEntry.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: ids.entry,
          authorId: user.id,
          status: EntryStatus.DRAFT,
        },
        data: expect.objectContaining({
          status: EntryStatus.PENDING_REVIEW,
          submittedAt: expect.any(Date),
        }),
      }),
    );
    expect(prisma.contentVersion.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          entryId: ids.entry,
          versionNumber: 1,
          versionReason: "INITIAL_SUBMISSION",
          createdById: user.id,
          snapshot: expect.objectContaining({
            title: createDraftInput.title,
            plainTextContent: "متن فرهنگی معتبر",
            internalReferences: [],
          }),
        }),
      }),
    );
    expect(auditService.createWithClient).toHaveBeenCalledWith(
      prisma,
      expect.objectContaining({
        action: "ENTRY_SUBMITTED",
        actorId: user.id,
        entryId: ids.entry,
      }),
    );
    expect(response.data.entry.status).toBe(EntryStatus.PENDING_REVIEW);
    expect(response.data.contentVersion.versionNumber).toBe(1);
  });

  it("resubmits an entry after requested changes with a resubmission version", async () => {
    prisma.culturalEntry.findFirst.mockResolvedValueOnce(
      createSubmissionEntryPayload({
        status: EntryStatus.CHANGES_REQUESTED,
        submittedAt: new Date("2026-01-01T00:00:00.000Z"),
      }),
    );
    prisma.culturalEntry.updateMany.mockResolvedValue({ count: 1 });
    prisma.contentVersion.aggregate.mockResolvedValue({ _max: { versionNumber: 1 } });
    prisma.contentVersion.create.mockResolvedValue(
      createContentVersionPayload({
        versionNumber: 2,
        versionReason: "RESUBMISSION",
      }),
    );
    prisma.culturalEntry.findUnique.mockResolvedValue(
      createEntryPayload({ status: EntryStatus.PENDING_REVIEW }),
    );

    await service.submitOwnEntry(user, ids.entry);

    expect(prisma.contentVersion.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          versionNumber: 2,
          versionReason: "RESUBMISSION",
        }),
      }),
    );
  });

  it("rejects incomplete drafts before submission", async () => {
    prisma.culturalEntry.findFirst.mockResolvedValueOnce(
      createSubmissionEntryPayload({
        contentJson: { type: "doc", content: [] },
        plainTextContent: "",
      }),
    );

    await expectErrorCode(
      () => service.submitOwnEntry(user, ids.entry),
      ENTRY_ERROR_CODES.SUBMISSION_INCOMPLETE,
      BadRequestException,
    );
    expect(prisma.contentVersion.create).not.toHaveBeenCalled();
  });

  it("does not reveal another user's entry during submission", async () => {
    prisma.culturalEntry.findFirst.mockResolvedValueOnce(null);

    await expectErrorCode(
      () => service.submitOwnEntry(user, ids.entry),
      ENTRY_ERROR_CODES.NOT_FOUND,
      NotFoundException,
    );
    expect(prisma.contentVersion.create).not.toHaveBeenCalled();
  });

  it("rejects submission when an internal reference target is no longer published", async () => {
    prisma.culturalEntry.findFirst.mockResolvedValueOnce(
      createSubmissionEntryPayload({
        contentJson: internalReferenceContentJson,
        plainTextContent: "در کابل نوروز کابل برگزار می‌شود.",
        outgoingReferences: [
          createSubmissionReferencePayload({
            targetStatus: EntryStatus.HIDDEN,
            publishedAt: null,
          }),
        ],
      }),
    );

    await expectErrorCode(
      () => service.submitOwnEntry(user, ids.entry),
      ENTRY_ERROR_CODES.SUBMISSION_REFERENCE_INVALID,
      BadRequestException,
    );
    expect(prisma.contentVersion.create).not.toHaveBeenCalled();
  });

  it("adds existing active tags to an editable owned entry", async () => {
    prisma.culturalEntry.findFirst.mockResolvedValue(createEditableEntrySummary());
    prisma.tag.findMany.mockResolvedValue([createTagReference(), createSecondTagReference()]);
    prisma.entryTag.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ tag: createTagReference() }, { tag: createSecondTagReference() }]);
    prisma.entryTag.createMany.mockResolvedValue({ count: 2 });
    prisma.culturalEntry.findUnique.mockResolvedValue(
      createEntrySearchPayload(["نوروز", "موسیقی"]),
    );
    prisma.culturalEntry.update.mockResolvedValue(createEntryPayload());

    const response = await service.addTags(user, ids.entry, {
      tagIds: [ids.tagOne, ids.tagTwo],
    });

    expect(prisma.entryTag.createMany).toHaveBeenCalledWith({
      data: [
        { entryId: ids.entry, tagId: ids.tagOne },
        { entryId: ids.entry, tagId: ids.tagTwo },
      ],
    });
    expect(prisma.culturalEntry.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          normalizedSearchText: expect.stringContaining("نوروز"),
        }),
      }),
    );
    expect(response.data).toEqual([createTagReference(), createSecondTagReference()]);
  });

  it("replaces all tags transactionally", async () => {
    prisma.culturalEntry.findFirst.mockResolvedValue(createEditableEntrySummary());
    prisma.tag.findMany.mockResolvedValue([createSecondTagReference()]);
    prisma.entryTag.findMany.mockResolvedValueOnce([{ tag: createSecondTagReference() }]);
    prisma.entryTag.deleteMany.mockResolvedValue({ count: 2 });
    prisma.entryTag.createMany.mockResolvedValue({ count: 1 });
    prisma.culturalEntry.findUnique.mockResolvedValue(createEntrySearchPayload(["موسیقی"]));
    prisma.culturalEntry.update.mockResolvedValue(createEntryPayload());

    const response = await service.replaceTags(user, ids.entry, {
      tagIds: [ids.tagTwo],
    });

    expect(prisma.entryTag.deleteMany).toHaveBeenCalledWith({ where: { entryId: ids.entry } });
    expect(prisma.entryTag.createMany).toHaveBeenCalledWith({
      data: [{ entryId: ids.entry, tagId: ids.tagTwo }],
    });
    expect(response.data).toEqual([createSecondTagReference()]);
  });

  it("removes an assigned tag from an editable owned entry", async () => {
    prisma.culturalEntry.findFirst.mockResolvedValue(createEditableEntrySummary());
    prisma.entryTag.findUnique.mockResolvedValue({ tagId: ids.tagOne });
    prisma.entryTag.delete.mockResolvedValue({ entryId: ids.entry, tagId: ids.tagOne });
    prisma.entryTag.findMany.mockResolvedValue([{ tag: createSecondTagReference() }]);
    prisma.culturalEntry.findUnique.mockResolvedValue(createEntrySearchPayload(["موسیقی"]));
    prisma.culturalEntry.update.mockResolvedValue(createEntryPayload());

    const response = await service.removeTag(user, ids.entry, ids.tagOne);

    expect(prisma.entryTag.delete).toHaveBeenCalledWith({
      where: {
        entryId_tagId: {
          entryId: ids.entry,
          tagId: ids.tagOne,
        },
      },
    });
    expect(response.data).toEqual([createSecondTagReference()]);
  });

  it("rejects duplicate tag IDs before writing tag assignments", async () => {
    prisma.culturalEntry.findFirst.mockResolvedValue(createEditableEntrySummary());

    await expectErrorCode(
      () =>
        service.addTags(user, ids.entry, {
          tagIds: [ids.tagOne, ids.tagOne],
        }),
      ENTRY_ERROR_CODES.TAG_DUPLICATE,
      BadRequestException,
    );
    expect(prisma.entryTag.createMany).not.toHaveBeenCalled();
  });

  it("rejects inactive or missing tags", async () => {
    prisma.culturalEntry.findFirst.mockResolvedValue(createEditableEntrySummary());
    prisma.tag.findMany.mockResolvedValue([createTagReference()]);

    await expectErrorCode(
      () =>
        service.addTags(user, ids.entry, {
          tagIds: [ids.tagOne, ids.tagTwo],
        }),
      ENTRY_ERROR_CODES.TAG_INVALID,
      BadRequestException,
    );
    expect(prisma.entryTag.createMany).not.toHaveBeenCalled();
  });

  it("creates a source with normalized URL and next display order", async () => {
    prisma.culturalEntry.findFirst.mockResolvedValue(createEditableEntrySummary());
    prisma.source.aggregate.mockResolvedValue({ _max: { displayOrder: 1 } });
    prisma.source.findFirst.mockResolvedValue(null);
    prisma.source.create.mockResolvedValue(
      createSourcePayload({
        websiteUrl: "https://example.com/source",
        displayOrder: 2,
      }),
    );

    const response = await service.createSource(user, ids.entry, {
      type: SourceType.WEBSITE,
      title: "منبع فرهنگی",
      websiteUrl: " HTTPS://Example.com/source ",
    });

    expect(prisma.source.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          entryId: ids.entry,
          type: SourceType.WEBSITE,
          title: "منبع فرهنگی",
          websiteUrl: "https://example.com/source",
          displayOrder: 2,
        }),
      }),
    );
    expect(response.data.websiteUrl).toBe("https://example.com/source");
  });

  it("updates an existing source on an editable owned entry", async () => {
    prisma.culturalEntry.findFirst.mockResolvedValue(createEditableEntrySummary());
    prisma.source.findFirst.mockResolvedValueOnce({ id: ids.sourceOne, displayOrder: 0 });
    prisma.source.findFirst.mockResolvedValueOnce(null);
    prisma.source.update.mockResolvedValue(
      createSourcePayload({
        title: "منبع تازه",
        displayOrder: 5,
      }),
    );

    const response = await service.updateSource(user, ids.entry, ids.sourceOne, {
      title: " منبع تازه ",
      displayOrder: 5,
    });

    expect(prisma.source.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: ids.sourceOne },
        data: expect.objectContaining({
          title: "منبع تازه",
          displayOrder: 5,
        }),
      }),
    );
    expect(response.data.title).toBe("منبع تازه");
  });

  it("removes a source from an editable owned entry", async () => {
    prisma.culturalEntry.findFirst.mockResolvedValue(createEditableEntrySummary());
    prisma.source.findFirst.mockResolvedValue({ id: ids.sourceOne, displayOrder: 0 });
    prisma.source.delete.mockResolvedValue(createSourcePayload());

    await expect(service.deleteSource(user, ids.entry, ids.sourceOne)).resolves.toMatchObject({
      data: { message: "Source deleted successfully." },
    });
    expect(prisma.source.delete).toHaveBeenCalledWith({ where: { id: ids.sourceOne } });
  });

  it("reorders entry sources after validating ownership and conflicts", async () => {
    prisma.culturalEntry.findFirst.mockResolvedValue(createEditableEntrySummary());
    prisma.source.findMany
      .mockResolvedValueOnce([{ id: ids.sourceOne }, { id: ids.sourceTwo }])
      .mockResolvedValueOnce([
        createSourcePayload({ id: ids.sourceTwo, displayOrder: 0 }),
        createSourcePayload({ id: ids.sourceOne, displayOrder: 1 }),
      ]);
    prisma.source.findFirst.mockResolvedValue(null);
    prisma.source.update.mockResolvedValue(createSourcePayload());

    const response = await service.reorderSources(user, ids.entry, {
      items: [
        { id: ids.sourceOne, displayOrder: 1 },
        { id: ids.sourceTwo, displayOrder: 0 },
      ],
    });

    expect(prisma.source.update).toHaveBeenCalledTimes(2);
    expect(response.data.map((source) => source.id)).toEqual([ids.sourceTwo, ids.sourceOne]);
  });

  it("rejects invalid source URLs", async () => {
    prisma.culturalEntry.findFirst.mockResolvedValue(createEditableEntrySummary());
    prisma.source.aggregate.mockResolvedValue({ _max: { displayOrder: null } });
    prisma.source.findFirst.mockResolvedValue(null);

    await expectErrorCode(
      () =>
        service.createSource(user, ids.entry, {
          type: SourceType.WEBSITE,
          websiteUrl: "not-a-url",
        }),
      ENTRY_ERROR_CODES.SOURCE_INVALID,
      BadRequestException,
    );
    expect(prisma.source.create).not.toHaveBeenCalled();
  });

  it("does not reveal source or tag changes for entries owned by another user", async () => {
    prisma.culturalEntry.findFirst.mockResolvedValue(null);

    await expectErrorCode(
      () =>
        service.addTags(user, ids.entry, {
          tagIds: [ids.tagOne],
        }),
      ENTRY_ERROR_CODES.NOT_FOUND,
      NotFoundException,
    );
    expect(prisma.tag.findMany).not.toHaveBeenCalled();
  });

  it("rejects tag and source edits for non-editable entries", async () => {
    prisma.culturalEntry.findFirst.mockResolvedValue({
      ...createEditableEntrySummary(),
      status: EntryStatus.PUBLISHED,
    });

    await expectErrorCode(
      () =>
        service.createSource(user, ids.entry, {
          type: SourceType.WEBSITE,
          title: "منبع",
        }),
      ENTRY_ERROR_CODES.INVALID_STATUS,
      ForbiddenException,
    );
    expect(prisma.source.create).not.toHaveBeenCalled();
  });

  it("rejects source reorder duplicate orders before writing updates", async () => {
    prisma.culturalEntry.findFirst.mockResolvedValue(createEditableEntrySummary());

    await expectErrorCode(
      () =>
        service.reorderSources(user, ids.entry, {
          items: [
            { id: ids.sourceOne, displayOrder: 1 },
            { id: ids.sourceTwo, displayOrder: 1 },
          ],
        }),
      ENTRY_ERROR_CODES.SOURCE_ORDER_DUPLICATE,
      BadRequestException,
    );
    expect(prisma.source.update).not.toHaveBeenCalled();
  });

  it("uploads a valid image with Cloudinary metadata", async () => {
    prisma.culturalEntry.findFirst.mockResolvedValue(createEditableEntrySummary());
    prisma.image.aggregate.mockResolvedValue({ _max: { displayOrder: 0 } });
    prisma.image.findFirst.mockResolvedValue(null);
    prisma.image.count.mockResolvedValue(1);
    prisma.image.create.mockResolvedValue(createImagePayload({ displayOrder: 1 }));

    const response = await service.uploadImage(
      user,
      ids.entry,
      {
        altText: "تصویر یک آیین فرهنگی",
        permissionConfirmed: true,
      },
      createMulterImage(),
    );

    expect(mediaService.uploadEntryImage).toHaveBeenCalled();
    expect(prisma.image.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          entryId: ids.entry,
          uploadedById: user.id,
          cloudinaryPublicId: "entries/sample",
          secureUrl: "https://res.cloudinary.com/demo/image/upload/entries/sample.jpg",
          thumbnailUrl: "https://res.cloudinary.com/demo/image/upload/thumb/entries/sample.jpg",
          altText: "تصویر یک آیین فرهنگی",
          permissionConfirmed: true,
          displayOrder: 1,
        }),
      }),
    );
    expect(response.data.thumbnailUrl).toBe(
      "https://res.cloudinary.com/demo/image/upload/thumb/entries/sample.jpg",
    );
  });

  it("rejects unsupported or spoofed image files", async () => {
    prisma.culturalEntry.findFirst.mockResolvedValue(createEditableEntrySummary());

    await expectErrorCode(
      () =>
        service.uploadImage(
          user,
          ids.entry,
          {
            altText: "تصویر",
            permissionConfirmed: true,
          },
          createMulterImage({
            buffer: Buffer.from("not a real image"),
            mimetype: "image/jpeg",
          }),
        ),
      ENTRY_ERROR_CODES.IMAGE_INVALID_TYPE,
      BadRequestException,
    );
    expect(mediaService.uploadEntryImage).not.toHaveBeenCalled();
  });

  it("rejects oversized images", async () => {
    prisma.culturalEntry.findFirst.mockResolvedValue(createEditableEntrySummary());
    configService.get.mockImplementation((key: string, fallback: unknown) =>
      key === "MAX_IMAGE_SIZE_MB" ? 1 : fallback,
    );

    await expectErrorCode(
      () =>
        service.uploadImage(
          user,
          ids.entry,
          {
            altText: "تصویر",
            permissionConfirmed: true,
          },
          createMulterImage({
            size: 2 * 1024 * 1024,
          }),
        ),
      ENTRY_ERROR_CODES.IMAGE_TOO_LARGE,
      BadRequestException,
    );
    expect(mediaService.uploadEntryImage).not.toHaveBeenCalled();
  });

  it("enforces the configured image-count limit", async () => {
    prisma.culturalEntry.findFirst.mockResolvedValue(createEditableEntrySummary());
    prisma.image.aggregate.mockResolvedValue({ _max: { displayOrder: 5 } });
    prisma.image.findFirst.mockResolvedValue(null);
    prisma.image.count.mockResolvedValue(6);

    await expectErrorCode(
      () =>
        service.uploadImage(
          user,
          ids.entry,
          {
            altText: "تصویر",
            permissionConfirmed: true,
          },
          createMulterImage(),
        ),
      ENTRY_ERROR_CODES.IMAGE_LIMIT_EXCEEDED,
      BadRequestException,
    );
    expect(mediaService.uploadEntryImage).not.toHaveBeenCalled();
  });

  it("requires image permission confirmation", async () => {
    prisma.culturalEntry.findFirst.mockResolvedValue(createEditableEntrySummary());

    await expectErrorCode(
      () =>
        service.uploadImage(
          user,
          ids.entry,
          {
            altText: "تصویر",
            permissionConfirmed: false,
          },
          createMulterImage(),
        ),
      ENTRY_ERROR_CODES.IMAGE_PERMISSION_REQUIRED,
      BadRequestException,
    );
    expect(mediaService.uploadEntryImage).not.toHaveBeenCalled();
  });

  it("updates image metadata", async () => {
    prisma.culturalEntry.findFirst.mockResolvedValue(createEditableEntrySummary());
    prisma.image.findFirst.mockResolvedValueOnce({
      id: ids.imageOne,
      cloudinaryPublicId: "entries/sample",
      displayOrder: 0,
    });
    prisma.image.findFirst.mockResolvedValueOnce(null);
    prisma.image.update.mockResolvedValue(
      createImagePayload({
        caption: "شرح تازه",
        displayOrder: 2,
      }),
    );

    const response = await service.updateImageMetadata(user, ids.entry, ids.imageOne, {
      caption: " شرح تازه ",
      displayOrder: 2,
    });

    expect(prisma.image.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: ids.imageOne },
        data: expect.objectContaining({
          caption: "شرح تازه",
          displayOrder: 2,
        }),
      }),
    );
    expect(response.data.caption).toBe("شرح تازه");
  });

  it("deletes an image after deleting the Cloudinary asset", async () => {
    prisma.culturalEntry.findFirst.mockResolvedValue(createEditableEntrySummary());
    prisma.image.findFirst.mockResolvedValue({
      id: ids.imageOne,
      cloudinaryPublicId: "entries/sample",
      displayOrder: 0,
    });
    prisma.image.delete.mockResolvedValue(createImagePayload());

    await expect(service.deleteImage(user, ids.entry, ids.imageOne)).resolves.toMatchObject({
      data: { message: "Image deleted successfully." },
    });
    expect(mediaService.deleteImage).toHaveBeenCalledWith("entries/sample");
    expect(prisma.image.delete).toHaveBeenCalledWith({ where: { id: ids.imageOne } });
  });

  it("does not delete the image record when Cloudinary delete fails", async () => {
    prisma.culturalEntry.findFirst.mockResolvedValue(createEditableEntrySummary());
    prisma.image.findFirst.mockResolvedValue({
      id: ids.imageOne,
      cloudinaryPublicId: "entries/sample",
      displayOrder: 0,
    });
    mediaService.deleteImage.mockRejectedValue(
      new BadRequestException({
        error: ENTRY_ERROR_CODES.IMAGE_DELETE_FAILED,
        message: "Image delete failed.",
      }),
    );

    await expectErrorCode(
      () => service.deleteImage(user, ids.entry, ids.imageOne),
      ENTRY_ERROR_CODES.IMAGE_DELETE_FAILED,
      BadRequestException,
    );
    expect(prisma.image.delete).not.toHaveBeenCalled();
  });

  it("reorders images transactionally", async () => {
    prisma.culturalEntry.findFirst.mockResolvedValue(createEditableEntrySummary());
    prisma.image.findMany
      .mockResolvedValueOnce([{ id: ids.imageOne }, { id: ids.imageTwo }])
      .mockResolvedValueOnce([
        createImagePayload({ id: ids.imageTwo, displayOrder: 0 }),
        createImagePayload({ id: ids.imageOne, displayOrder: 1 }),
      ]);
    prisma.image.findFirst.mockResolvedValue(null);
    prisma.image.update.mockResolvedValue(createImagePayload());

    const response = await service.reorderImages(user, ids.entry, {
      items: [
        { id: ids.imageOne, displayOrder: 1 },
        { id: ids.imageTwo, displayOrder: 0 },
      ],
    });

    expect(prisma.image.update).toHaveBeenCalledTimes(2);
    expect(response.data.map((image) => image.id)).toEqual([ids.imageTwo, ids.imageOne]);
  });

  it("rejects image edits for entries owned by another user", async () => {
    prisma.culturalEntry.findFirst.mockResolvedValue(null);

    await expectErrorCode(
      () =>
        service.uploadImage(
          user,
          ids.entry,
          {
            altText: "تصویر",
            permissionConfirmed: true,
          },
          createMulterImage(),
        ),
      ENTRY_ERROR_CODES.NOT_FOUND,
      NotFoundException,
    );
    expect(mediaService.uploadEntryImage).not.toHaveBeenCalled();
  });

  it("rejects image edits for non-editable entries", async () => {
    prisma.culturalEntry.findFirst.mockResolvedValue({
      ...createEditableEntrySummary(),
      status: EntryStatus.PUBLISHED,
    });

    await expectErrorCode(
      () =>
        service.uploadImage(
          user,
          ids.entry,
          {
            altText: "تصویر",
            permissionConfirmed: true,
          },
          createMulterImage(),
        ),
      ENTRY_ERROR_CODES.INVALID_STATUS,
      ForbiddenException,
    );
    expect(mediaService.uploadEntryImage).not.toHaveBeenCalled();
  });

  it("handles Cloudinary upload failure", async () => {
    prisma.culturalEntry.findFirst.mockResolvedValue(createEditableEntrySummary());
    prisma.image.aggregate.mockResolvedValue({ _max: { displayOrder: null } });
    prisma.image.findFirst.mockResolvedValue(null);
    prisma.image.count.mockResolvedValue(0);
    mediaService.uploadEntryImage.mockRejectedValue(
      new BadRequestException({
        error: ENTRY_ERROR_CODES.IMAGE_UPLOAD_FAILED,
        message: "Image upload failed.",
      }),
    );

    await expectErrorCode(
      () =>
        service.uploadImage(
          user,
          ids.entry,
          {
            altText: "تصویر",
            permissionConfirmed: true,
          },
          createMulterImage(),
        ),
      ENTRY_ERROR_CODES.IMAGE_UPLOAD_FAILED,
      BadRequestException,
    );
    expect(prisma.image.create).not.toHaveBeenCalled();
  });

  it("adds or replaces YouTube video from supported URL variants", async () => {
    prisma.culturalEntry.findFirst.mockResolvedValue(createEditableEntrySummary());
    prisma.youTubeVideo.findUnique.mockResolvedValueOnce(null);
    prisma.youTubeVideo.create.mockResolvedValue(createYouTubeVideoPayload());

    const response = await service.upsertYouTubeVideo(user, ids.entry, {
      url: "https://youtu.be/abcdefghijk",
      title: "ویدیوی فرهنگی",
    });

    expect(prisma.youTubeVideo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          entryId: ids.entry,
          videoId: "abcdefghijk",
          url: "https://www.youtube.com/watch?v=abcdefghijk",
          title: "ویدیوی فرهنگی",
        }),
      }),
    );
    expect(response.data.videoId).toBe("abcdefghijk");

    prisma.youTubeVideo.findUnique.mockResolvedValueOnce({
      id: ids.youtubeVideo,
      isRemoved: false,
    });
    prisma.youTubeVideo.update.mockResolvedValue(
      createYouTubeVideoPayload({ videoId: "zxywvutsrqp" }),
    );

    await service.upsertYouTubeVideo(user, ids.entry, {
      url: "https://www.youtube.com/shorts/zxywvutsrqp",
    });
    expect(prisma.youTubeVideo.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          videoId: "zxywvutsrqp",
        }),
      }),
    );
  });

  it("rejects invalid YouTube URLs and raw iframe HTML", async () => {
    prisma.culturalEntry.findFirst.mockResolvedValue(createEditableEntrySummary());

    await expectErrorCode(
      () =>
        service.upsertYouTubeVideo(user, ids.entry, {
          url: '<iframe src="https://www.youtube.com/embed/abcdefghijk"></iframe>',
        }),
      ENTRY_ERROR_CODES.YOUTUBE_URL_INVALID,
      BadRequestException,
    );
    expect(prisma.youTubeVideo.create).not.toHaveBeenCalled();
  });

  it("updates and removes YouTube video metadata", async () => {
    prisma.culturalEntry.findFirst.mockResolvedValue(createEditableEntrySummary());
    prisma.youTubeVideo.findUnique.mockResolvedValue({
      id: ids.youtubeVideo,
      isRemoved: false,
    });
    prisma.youTubeVideo.update.mockResolvedValue(
      createYouTubeVideoPayload({
        title: "عنوان تازه",
      }),
    );

    const response = await service.updateYouTubeVideo(user, ids.entry, {
      title: " عنوان تازه ",
    });

    expect(response.data.title).toBe("عنوان تازه");
    prisma.youTubeVideo.delete.mockResolvedValue(createYouTubeVideoPayload());

    await expect(service.removeYouTubeVideo(user, ids.entry)).resolves.toMatchObject({
      data: { message: "YouTube video removed successfully." },
    });
    expect(prisma.youTubeVideo.delete).toHaveBeenCalledWith({ where: { id: ids.youtubeVideo } });
  });

  it("creates internal references while creating a draft", async () => {
    mockActiveTaxonomy(prisma);
    prisma.culturalEntry.findFirst.mockResolvedValueOnce(null);
    prisma.culturalEntry.create.mockResolvedValue(
      createEntryPayload({
        contentJson: internalReferenceContentJson,
        plainTextContent: "در کابل نوروز کابل برگزار می‌شود.",
      }),
    );
    prisma.culturalEntry.findMany.mockResolvedValue([{ id: ids.publishedTarget }]);

    await service.createDraft(user, {
      ...createDraftInput,
      contentJson: internalReferenceContentJson,
    });

    expect(prisma.entryReference.createMany).toHaveBeenCalledWith({
      data: [
        {
          sourceEntryId: ids.entry,
          targetEntryId: ids.publishedTarget,
          anchorText: "نوروز کابل",
        },
      ],
    });
  });

  it("removes internal references when they are removed from editor content", async () => {
    prisma.culturalEntry.findFirst.mockResolvedValueOnce(createEntryForChange());
    mockActiveTaxonomy(prisma);
    prisma.culturalEntry.update.mockResolvedValue(createEntryPayload());

    await service.updateOwnEntry(user, ids.entry, {
      contentJson: validContentJson,
    });

    expect(prisma.entryReference.deleteMany).toHaveBeenCalledWith({
      where: { sourceEntryId: ids.entry },
    });
  });

  it("updates internal references when anchor text changes", async () => {
    prisma.culturalEntry.findFirst.mockResolvedValueOnce(createEntryForChange());
    mockActiveTaxonomy(prisma);
    prisma.culturalEntry.update.mockResolvedValue(
      createEntryPayload({
        contentJson: internalReferenceContentJson,
        plainTextContent: "در کابل نوروز کابل برگزار می‌شود.",
      }),
    );
    prisma.culturalEntry.findMany.mockResolvedValue([{ id: ids.publishedTarget }]);
    prisma.entryReference.findMany.mockResolvedValue([
      {
        id: ids.reference,
        targetEntryId: ids.publishedTarget,
        anchorText: "نوروز قدیمی",
      },
    ]);

    await service.updateOwnEntry(user, ids.entry, {
      contentJson: internalReferenceContentJson,
    });

    expect(prisma.entryReference.deleteMany).toHaveBeenCalledWith({
      where: {
        id: {
          in: [ids.reference],
        },
      },
    });
    expect(prisma.entryReference.createMany).toHaveBeenCalledWith({
      data: [
        {
          sourceEntryId: ids.entry,
          targetEntryId: ids.publishedTarget,
          anchorText: "نوروز کابل",
        },
      ],
    });
  });

  it("rejects duplicate internal references", async () => {
    prisma.culturalEntry.findFirst.mockResolvedValueOnce(createEntryForChange());
    mockActiveTaxonomy(prisma);

    await expectErrorCode(
      () =>
        service.updateOwnEntry(user, ids.entry, {
          contentJson: {
            type: "doc",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "نوروز کابل",
                    marks: [
                      {
                        type: "internalEntryLink",
                        attrs: { targetEntryId: ids.publishedTarget },
                      },
                    ],
                  },
                  {
                    type: "text",
                    text: "نوروز کابل",
                    marks: [
                      {
                        type: "internalEntryLink",
                        attrs: { targetEntryId: ids.publishedTarget },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        }),
      ENTRY_ERROR_CODES.REFERENCE_DUPLICATE,
      BadRequestException,
    );
  });

  it("rejects internal references to the same entry", async () => {
    prisma.culturalEntry.findFirst.mockResolvedValueOnce(createEntryForChange());
    mockActiveTaxonomy(prisma);

    await expectErrorCode(
      () =>
        service.updateOwnEntry(user, ids.entry, {
          contentJson: createInternalReferenceContent(ids.entry, "همین نوشته"),
        }),
      ENTRY_ERROR_CODES.REFERENCE_SELF,
      BadRequestException,
    );
  });

  it("rejects unpublished internal-reference targets", async () => {
    prisma.culturalEntry.findFirst.mockResolvedValueOnce(createEntryForChange());
    mockActiveTaxonomy(prisma);
    prisma.culturalEntry.findMany.mockResolvedValue([]);

    await expectErrorCode(
      () =>
        service.updateOwnEntry(user, ids.entry, {
          contentJson: internalReferenceContentJson,
        }),
      ENTRY_ERROR_CODES.REFERENCE_TARGET_INVALID,
      BadRequestException,
    );
  });

  it("rejects malformed internal-reference marks as invalid Tiptap content", async () => {
    mockActiveTaxonomy(prisma);

    await expectErrorCode(
      () =>
        service.createDraft(user, {
          ...createDraftInput,
          contentJson: {
            type: "doc",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "کابل",
                    marks: [{ type: "internalEntryLink", attrs: { targetEntryId: "entry-id" } }],
                  },
                ],
              },
            ],
          },
        }),
      ENTRY_ERROR_CODES.CONTENT_INVALID,
      BadRequestException,
    );
  });

  it("searches only published entries for internal-link targets", async () => {
    prisma.culturalEntry.findMany.mockResolvedValue([
      createReferenceTargetPayload({ title: "نوروز کابل", slug: "نوروز-کابل" }),
    ]);

    const response = await service.searchReferenceTargets({
      search: "نوروز",
      limit: 10,
    });

    expect(prisma.culturalEntry.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: EntryStatus.PUBLISHED,
        }),
        take: 30,
      }),
    );
    expect(response.data).toEqual([
      createReferenceTargetPayload({ title: "نوروز کابل", slug: "نوروز-کابل" }),
    ]);
  });

  it("validates a published internal-link target", async () => {
    prisma.culturalEntry.findFirst.mockResolvedValue(createReferenceTargetPayload());

    await expect(service.validateReferenceTarget(ids.publishedTarget)).resolves.toMatchObject({
      data: { id: ids.publishedTarget },
    });
  });

  it("rejects an invalid internal-link target", async () => {
    prisma.culturalEntry.findFirst.mockResolvedValue(null);

    await expectErrorCode(
      () => service.validateReferenceTarget(ids.publishedTarget),
      ENTRY_ERROR_CODES.REFERENCE_TARGET_INVALID,
      BadRequestException,
    );
  });

  it("lists outgoing references for an owned entry", async () => {
    prisma.culturalEntry.findFirst.mockResolvedValueOnce(createEditableEntrySummary());
    prisma.entryReference.findMany.mockResolvedValue([createOutgoingReferencePayload()]);

    const response = await service.listOutgoingReferences(user, ids.entry);

    expect(response.data).toEqual([createOutgoingReferencePayload()]);
    expect(prisma.entryReference.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { sourceEntryId: ids.entry },
      }),
    );
  });

  it("lists incoming references without exposing other users' private drafts", async () => {
    prisma.culturalEntry.findFirst.mockResolvedValueOnce(createEditableEntrySummary());
    prisma.entryReference.findMany.mockResolvedValue([createIncomingReferencePayload()]);

    const response = await service.listIncomingReferences(user, ids.entry);

    expect(response.data).toEqual([createIncomingReferencePayload()]);
    expect(prisma.entryReference.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          targetEntryId: ids.entry,
          sourceEntry: {
            OR: [{ status: EntryStatus.PUBLISHED }, { authorId: user.id }],
          },
        },
      }),
    );
  });

  it("rejects unsupported protected fields through DTO whitelist validation", async () => {
    const dto = plainToInstance(CreateEntryDraftDto, {
      ...createDraftInput,
      authorId: user.id,
      key: "manual-key",
      status: EntryStatus.PUBLISHED,
      publishedAt: "2026-01-01T00:00:00.000Z",
    });
    const errors = await validate(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    expect(errors.map((error) => error.property)).toEqual(
      expect.arrayContaining(["authorId", "key", "status", "publishedAt"]),
    );
  });
});

function createPrismaMock(): PrismaMock {
  const prisma: PrismaMock = {
    culturalEntry: createDelegateMock(),
    contentVersion: createDelegateMock(),
    province: createTaxonomyDelegateMock(),
    district: createTaxonomyDelegateMock(),
    category: createTaxonomyDelegateMock(),
    contentType: createTaxonomyDelegateMock(),
    tag: createDelegateMock(),
    entryTag: createDelegateMock(),
    entryReference: createDelegateMock(),
    source: createDelegateMock(),
    image: createDelegateMock(),
    youTubeVideo: createDelegateMock(),
    $transaction: jest.fn(),
  };

  prisma.$transaction.mockImplementation(
    (input: Array<Promise<unknown>> | ((client: PrismaMock) => unknown)) => {
      if (typeof input === "function") {
        return input(prisma);
      }

      return Promise.all(input);
    },
  );
  prisma.entryReference.findMany.mockResolvedValue([]);
  prisma.entryReference.createMany.mockResolvedValue({ count: 0 });
  prisma.entryReference.deleteMany.mockResolvedValue({ count: 0 });

  return prisma;
}

function createMediaServiceMock(): MediaServiceMock {
  return {
    uploadEntryImage: jest.fn().mockResolvedValue(createUploadedCloudinaryImage()),
    deleteImage: jest.fn().mockResolvedValue(undefined),
  };
}

function createAuditServiceMock(): AuditServiceMock {
  return {
    createWithClient: jest.fn().mockResolvedValue({ id: "audit-log-id" }),
  };
}

function createConfigServiceMock(): ConfigServiceMock {
  return {
    get: jest.fn((key: string, fallback: unknown) => {
      if (key === "MAX_IMAGES_PER_ENTRY") {
        return 6;
      }

      if (key === "MAX_IMAGE_SIZE_MB") {
        return 5;
      }

      return fallback;
    }),
  };
}

function createDelegateMock(): DelegateMock {
  return {
    aggregate: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    createMany: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
  };
}

function createTaxonomyDelegateMock(): TaxonomyDelegateMock {
  return {
    findFirst: jest.fn(),
  };
}

function mockActiveTaxonomy(
  prisma: PrismaMock,
  overrides: {
    district?: ReturnType<typeof createDistrictReference> | null;
  } = {},
): void {
  prisma.province.findFirst.mockResolvedValue(
    createTaxonomyReference(ids.province, "کابل", "kabul"),
  );
  prisma.category.findFirst.mockResolvedValue(
    createTaxonomyReference(ids.category, "رسم‌ها", "traditions"),
  );
  prisma.contentType.findFirst.mockResolvedValue(
    createTaxonomyReference(ids.contentType, "مقاله", "article"),
  );
  prisma.district.findFirst.mockResolvedValue(overrides.district ?? null);
}

function createEntryPayload(
  overrides: Partial<{
    contentJson: typeof validContentJson | typeof internalReferenceContentJson;
    geographicScope: GeographicScope;
    plainTextContent: string;
    province: ReturnType<typeof createTaxonomyReference> | null;
    provinceId: string | null;
    status: EntryStatus;
  }> = {},
) {
  return {
    id: ids.entry,
    key: "sample-entry",
    slug: "فرهنگ-کابل",
    title: createDraftInput.title,
    summary: createDraftInput.summary,
    contentJson: overrides.contentJson ?? validContentJson,
    plainTextContent: overrides.plainTextContent ?? "متن فرهنگی معتبر",
    status: overrides.status ?? EntryStatus.DRAFT,
    authorId: user.id,
    geographicScope: overrides.geographicScope ?? GeographicScope.PROVINCE,
    provinceId: overrides.provinceId === undefined ? ids.province : overrides.provinceId,
    districtId: null,
    categoryId: ids.category,
    contentTypeId: ids.contentType,
    villageOrLocation: "شهر کابل",
    author: {
      id: user.id,
      displayName: user.displayName,
    },
    province:
      overrides.province === undefined
        ? createTaxonomyReference(ids.province, "کابل", "kabul")
        : overrides.province,
    district: null,
    category: createTaxonomyReference(ids.category, "رسم‌ها", "traditions"),
    contentType: createTaxonomyReference(ids.contentType, "مقاله", "article"),
    tags: [],
    sources: [],
    images: [],
    youtubeVideo: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };
}

function createEntryForChange() {
  return {
    id: ids.entry,
    key: "sample-entry",
    slug: "فرهنگ-کابل",
    title: createDraftInput.title,
    summary: createDraftInput.summary,
    contentJson: validContentJson,
    plainTextContent: "متن فرهنگی معتبر",
    status: EntryStatus.DRAFT,
    geographicScope: GeographicScope.PROVINCE,
    provinceId: ids.province,
    districtId: null,
    categoryId: ids.category,
    contentTypeId: ids.contentType,
    villageOrLocation: "شهر کابل",
    submittedAt: null,
    publishedAt: null,
    tags: [],
  };
}

function createSubmissionEntryPayload(
  overrides: Partial<{
    status: EntryStatus;
    submittedAt: Date | null;
    contentJson:
      | typeof validContentJson
      | typeof internalReferenceContentJson
      | { type: string; content: [] };
    plainTextContent: string;
    outgoingReferences: ReturnType<typeof createSubmissionReferencePayload>[];
  }> = {},
) {
  return {
    id: ids.entry,
    key: "sample-entry",
    slug: "فرهنگ-کابل",
    title: createDraftInput.title,
    summary: createDraftInput.summary,
    contentJson: overrides.contentJson ?? validContentJson,
    plainTextContent: overrides.plainTextContent ?? "متن فرهنگی معتبر",
    normalizedSearchText: "frhng kabl متن فرهنگی معتبر",
    status: overrides.status ?? EntryStatus.DRAFT,
    authorId: user.id,
    geographicScope: GeographicScope.PROVINCE,
    provinceId: ids.province,
    districtId: null,
    categoryId: ids.category,
    contentTypeId: ids.contentType,
    villageOrLocation: "شهر کابل",
    submittedAt: overrides.submittedAt ?? null,
    publishedAt: null,
    author: {
      id: user.id,
      displayName: user.displayName,
    },
    province: createActiveTaxonomyReference(ids.province, "کابل", "kabul"),
    district: null,
    category: createActiveTaxonomyReference(ids.category, "رسم‌ها", "traditions"),
    contentType: createActiveTaxonomyReference(ids.contentType, "مقاله", "article"),
    tags: [{ tag: createActiveTaxonomyReference(ids.tagOne, "نوروز", "nowruz") }],
    sources: [createSourcePayload()],
    images: [
      createImagePayload({
        caption: "شرح تصویر",
        displayOrder: 0,
      }),
    ],
    youtubeVideo: null,
    outgoingReferences: overrides.outgoingReferences ?? [],
  };
}

function createPublicEntryCardPayload() {
  return {
    id: ids.entry,
    slug: "فرهنگ-کابل",
    title: createDraftInput.title,
    summary: createDraftInput.summary,
    averageRating: 4.25,
    ratingCount: 8,
    geographicScope: GeographicScope.PROVINCE,
    publishedAt: new Date("2026-01-02T00:00:00.000Z"),
    updatedAt: new Date("2026-01-03T00:00:00.000Z"),
    author: {
      id: publicIds.author,
      displayName: "نویسنده فرهنگی",
      profileImageUrl: null,
    },
    province: createTaxonomyReference(publicIds.province, "کابل", "kabul"),
    category: createTaxonomyReference(publicIds.category, "رسم‌ها", "traditions"),
    contentType: createTaxonomyReference(publicIds.contentType, "مقاله", "article"),
    tags: [{ tag: createTaxonomyReference(publicIds.tag, "نوروز", "nowruz") }],
    images: [createImagePayload({ id: ids.imageOne, displayOrder: 0 })],
  };
}

function createPublicEntryDetailPayload() {
  return {
    ...createPublicEntryCardPayload(),
    contentJson: validContentJson,
    plainTextContent: "متن فرهنگی معتبر برای نمایش عمومی",
    villageOrLocation: "شهر کابل",
    district: createTaxonomyReference(publicIds.district, "مرکز", "markaz"),
    images: [
      createImagePayload({ id: ids.imageOne, displayOrder: 0 }),
      createImagePayload({ id: ids.imageTwo, displayOrder: 1 }),
    ],
    sources: [
      createSourcePayload({ id: ids.sourceOne, displayOrder: 0 }),
      createSourcePayload({ id: ids.sourceTwo, displayOrder: 1 }),
    ],
    youtubeVideo: createYouTubeVideoPayload(),
    outgoingReferences: [
      {
        id: ids.reference,
        targetEntryId: ids.publishedTarget,
        anchorText: "نوروز کابل",
        targetEntry: {
          id: ids.publishedTarget,
          slug: "نوروز-کابل",
          title: "نوروز کابل",
        },
      },
    ],
    incomingReferences: [
      {
        id: ids.reference,
        sourceEntryId: ids.publishedTarget,
        anchorText: "فرهنگ کابل",
        sourceEntry: {
          id: ids.publishedTarget,
          slug: "نوشته-منتشرشده",
          title: "نوشته منتشرشده",
          summary: "خلاصه نوشته منتشرشده",
          publishedAt: new Date("2026-01-01T00:00:00.000Z"),
        },
      },
    ],
  };
}

function createEditableEntrySummary() {
  return {
    id: ids.entry,
    status: EntryStatus.DRAFT,
  };
}

function createTaxonomyReference(id: string, name: string, slug: string) {
  return {
    id,
    name,
    slug,
  };
}

function createActiveTaxonomyReference(id: string, name: string, slug: string) {
  return {
    ...createTaxonomyReference(id, name, slug),
    isActive: true,
  };
}

function createDistrictReference(provinceId = ids.province) {
  return {
    ...createTaxonomyReference(ids.district, "مرکز", "markaz"),
    provinceId,
  };
}

function createTagReference() {
  return createTaxonomyReference(ids.tagOne, "نوروز", "nowruz");
}

function createSecondTagReference() {
  return createTaxonomyReference(ids.tagTwo, "موسیقی", "music");
}

function createEntrySearchPayload(tagNames: string[] = []) {
  return {
    title: createDraftInput.title,
    summary: createDraftInput.summary,
    plainTextContent: "متن فرهنگی معتبر",
    villageOrLocation: "شهر کابل",
    geographicScope: GeographicScope.PROVINCE,
    province: createTaxonomyReference(ids.province, "کابل", "kabul"),
    district: null,
    category: createTaxonomyReference(ids.category, "رسم‌ها", "traditions"),
    contentType: createTaxonomyReference(ids.contentType, "مقاله", "article"),
    tags: tagNames.map((name) => ({
      tag: {
        name,
      },
    })),
  };
}

function createSourcePayload(
  overrides: Partial<{
    id: string;
    title: string | null;
    websiteUrl: string | null;
    displayOrder: number;
  }> = {},
) {
  return {
    id: overrides.id ?? ids.sourceOne,
    type: SourceType.WEBSITE,
    title: overrides.title ?? "منبع فرهنگی",
    authorOrProvider: null,
    publicationDate: null,
    websiteUrl: overrides.websiteUrl ?? "https://example.com/",
    bookOrArticleDetails: null,
    interviewDate: null,
    explanation: null,
    displayOrder: overrides.displayOrder ?? 0,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };
}

function createImagePayload(
  overrides: Partial<{
    id: string;
    caption: string | null;
    displayOrder: number;
  }> = {},
) {
  return {
    id: overrides.id ?? ids.imageOne,
    cloudinaryPublicId: "entries/sample",
    url: "http://res.cloudinary.com/demo/image/upload/entries/sample.jpg",
    secureUrl: "https://res.cloudinary.com/demo/image/upload/entries/sample.jpg",
    thumbnailUrl: "https://res.cloudinary.com/demo/image/upload/thumb/entries/sample.jpg",
    width: 1200,
    height: 800,
    format: "jpg",
    bytes: 1024,
    caption: overrides.caption ?? null,
    altText: "تصویر یک آیین فرهنگی",
    photographerOrSource: null,
    permissionConfirmed: true,
    displayOrder: overrides.displayOrder ?? 0,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };
}

function createUploadedCloudinaryImage() {
  return {
    publicId: "entries/sample",
    url: "http://res.cloudinary.com/demo/image/upload/entries/sample.jpg",
    secureUrl: "https://res.cloudinary.com/demo/image/upload/entries/sample.jpg",
    thumbnailUrl: "https://res.cloudinary.com/demo/image/upload/thumb/entries/sample.jpg",
    width: 1200,
    height: 800,
    format: "jpg",
    bytes: 1024,
  };
}

function createMulterImage(
  overrides: Partial<Pick<Express.Multer.File, "buffer" | "mimetype" | "size">> = {},
): Express.Multer.File {
  const buffer = overrides.buffer ?? Buffer.from([0xff, 0xd8, 0xff, 0xdb]);

  return {
    fieldname: "image",
    originalname: "sample.jpg",
    encoding: "7bit",
    mimetype: overrides.mimetype ?? "image/jpeg",
    size: overrides.size ?? buffer.length,
    destination: "",
    filename: "",
    path: "",
    buffer,
    stream: undefined as never,
  };
}

function createYouTubeVideoPayload(
  overrides: Partial<{
    videoId: string;
    title: string | null;
  }> = {},
) {
  const videoId = overrides.videoId ?? "abcdefghijk";

  return {
    id: ids.youtubeVideo,
    videoId,
    url: `https://www.youtube.com/watch?v=${videoId}`,
    title: overrides.title ?? "ویدیوی فرهنگی",
    description: null,
    isRemoved: false,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };
}

function createContentVersionPayload(
  overrides: Partial<{
    versionNumber: number;
    versionReason: "INITIAL_SUBMISSION" | "RESUBMISSION";
    moderationReviewId: string | null;
  }> = {},
) {
  return {
    id: "12121212-1212-4212-8212-121212121212",
    entryId: ids.entry,
    versionNumber: overrides.versionNumber ?? 1,
    snapshot: {
      schemaVersion: 1,
      title: createDraftInput.title,
      plainTextContent: "متن فرهنگی معتبر",
      internalReferences: [],
    },
    plainTextContent: "متن فرهنگی معتبر",
    versionReason: overrides.versionReason ?? "INITIAL_SUBMISSION",
    createdById: user.id,
    correctionSuggestionId: null,
    moderationReviewId: overrides.moderationReviewId ?? null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
  };
}

function createSubmissionReferencePayload(
  overrides: Partial<{
    targetStatus: EntryStatus;
    publishedAt: Date | null;
  }> = {},
) {
  return {
    targetEntryId: ids.publishedTarget,
    anchorText: "نوروز کابل",
    targetEntry: {
      id: ids.publishedTarget,
      slug: "نوروز-کابل",
      title: "نوروز کابل",
      status: overrides.targetStatus ?? EntryStatus.PUBLISHED,
      publishedAt: overrides.publishedAt ?? new Date("2026-01-01T00:00:00.000Z"),
    },
  };
}

function createInternalReferenceContent(
  targetEntryId = ids.publishedTarget,
  anchorText = "نوروز کابل",
) {
  return {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: anchorText,
            marks: [
              {
                type: "internalEntryLink",
                attrs: {
                  targetEntryId,
                },
              },
            ],
          },
        ],
      },
    ],
  };
}

function createReferenceTargetPayload(
  overrides: Partial<{
    id: string;
    slug: string | null;
    title: string;
  }> = {},
) {
  return {
    id: overrides.id ?? ids.publishedTarget,
    slug: overrides.slug ?? "نوشته-منتشرشده",
    title: overrides.title ?? "نوشته منتشرشده",
    summary: "خلاصه نوشته منتشرشده",
    publishedAt: new Date("2026-01-01T00:00:00.000Z"),
  };
}

function createOutgoingReferencePayload() {
  return {
    id: ids.reference,
    sourceEntryId: ids.entry,
    targetEntryId: ids.publishedTarget,
    anchorText: "نوروز کابل",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    targetEntry: createReferenceTargetPayload(),
  };
}

function createIncomingReferencePayload() {
  return {
    id: ids.reference,
    sourceEntryId: ids.publishedTarget,
    targetEntryId: ids.entry,
    anchorText: "فرهنگ کابل",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    sourceEntry: {
      id: ids.publishedTarget,
      slug: "نوشته-منتشرشده",
      title: "نوشته منتشرشده",
    },
  };
}

async function expectErrorCode<TError extends HttpException>(
  action: () => Promise<unknown>,
  expectedCode: string,
  ErrorClass: new (...args: never[]) => TError,
): Promise<void> {
  try {
    await action();
    throw new Error("Expected entry error was not thrown");
  } catch (error) {
    if (!(error instanceof ErrorClass)) {
      throw error;
    }

    expect(error.getResponse()).toMatchObject({
      error: expectedCode,
    });
  }
}
