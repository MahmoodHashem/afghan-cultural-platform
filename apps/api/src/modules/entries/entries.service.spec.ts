jest.mock("@/database/prisma.service", () => ({
  PrismaService: class PrismaService {},
}));

import {
  BadRequestException,
  ForbiddenException,
  type HttpException,
  NotFoundException,
} from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

import type { PrismaService } from "@/database/prisma.service";
import { EntryStatus, SourceType, UserRole, UserStatus } from "@/generated/prisma/enums";
import type { AuthenticatedUser } from "@/modules/auth/types/authenticated-user.type";
import { CreateEntryDraftDto } from "@/modules/entries/dto/create-entry-draft.dto";
import { ENTRY_ERROR_CODES } from "@/modules/entries/entries.constants";
import { EntriesService } from "@/modules/entries/entries.service";

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
};

type TaxonomyDelegateMock = {
  findFirst: jest.Mock;
};

type PrismaMock = {
  culturalEntry: DelegateMock;
  province: TaxonomyDelegateMock;
  district: TaxonomyDelegateMock;
  category: TaxonomyDelegateMock;
  contentType: TaxonomyDelegateMock;
  tag: DelegateMock;
  entryTag: DelegateMock;
  source: DelegateMock;
  $transaction: jest.Mock;
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
  entry: "22222222-2222-2222-2222-222222222222",
  province: "33333333-3333-3333-3333-333333333333",
  district: "44444444-4444-4444-4444-444444444444",
  category: "55555555-5555-5555-5555-555555555555",
  contentType: "66666666-6666-6666-6666-666666666666",
  tagOne: "77777777-7777-7777-7777-777777777777",
  tagTwo: "88888888-8888-8888-8888-888888888888",
  sourceOne: "99999999-9999-9999-9999-999999999999",
  sourceTwo: "aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa",
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

const createDraftInput = {
  title: "فرهنگ کابل",
  summary: "این خلاصه معتبر برای پیش‌نویس فرهنگی است.",
  contentJson: validContentJson,
  provinceId: ids.province,
  categoryId: ids.category,
  contentTypeId: ids.contentType,
  villageOrLocation: "شهر کابل",
};

describe("EntriesService", () => {
  let prisma: PrismaMock;
  let service: EntriesService;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new EntriesService(prisma as unknown as PrismaService);
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
          slug: "frhng-kabl",
          plainTextContent: "متن فرهنگی معتبر",
        }),
      }),
    );
    expect(response.data.authorId).toBe(user.id);
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

  it("rejects unsupported protected fields through DTO whitelist validation", async () => {
    const dto = plainToInstance(CreateEntryDraftDto, {
      ...createDraftInput,
      authorId: user.id,
      status: EntryStatus.PUBLISHED,
      publishedAt: "2026-01-01T00:00:00.000Z",
    });
    const errors = await validate(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    expect(errors.map((error) => error.property)).toEqual(
      expect.arrayContaining(["authorId", "status", "publishedAt"]),
    );
  });
});

function createPrismaMock(): PrismaMock {
  const prisma: PrismaMock = {
    culturalEntry: createDelegateMock(),
    province: createTaxonomyDelegateMock(),
    district: createTaxonomyDelegateMock(),
    category: createTaxonomyDelegateMock(),
    contentType: createTaxonomyDelegateMock(),
    tag: createDelegateMock(),
    entryTag: createDelegateMock(),
    source: createDelegateMock(),
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

  return prisma;
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

function createEntryPayload() {
  return {
    id: ids.entry,
    slug: "frhng-kabl",
    title: createDraftInput.title,
    summary: createDraftInput.summary,
    contentJson: validContentJson,
    plainTextContent: "متن فرهنگی معتبر",
    status: EntryStatus.DRAFT,
    authorId: user.id,
    provinceId: ids.province,
    districtId: null,
    categoryId: ids.category,
    contentTypeId: ids.contentType,
    villageOrLocation: "شهر کابل",
    author: {
      id: user.id,
      displayName: user.displayName,
    },
    province: createTaxonomyReference(ids.province, "کابل", "kabul"),
    district: null,
    category: createTaxonomyReference(ids.category, "رسم‌ها", "traditions"),
    contentType: createTaxonomyReference(ids.contentType, "مقاله", "article"),
    tags: [],
    sources: [],
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };
}

function createEntryForChange() {
  return {
    id: ids.entry,
    slug: "frhng-kabl",
    title: createDraftInput.title,
    summary: createDraftInput.summary,
    contentJson: validContentJson,
    plainTextContent: "متن فرهنگی معتبر",
    status: EntryStatus.DRAFT,
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
