import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import type { Prisma } from "../src/generated/prisma/client";
import {
  AuditAction,
  EntryStatus,
  type GeographicScope,
  ModerationDecision,
  SourceType,
  VersionReason,
} from "../src/generated/prisma/enums";
import { hashPassword } from "../src/modules/auth/utils/password.util";
import {
  createEntrySlug,
  normalizeEntrySearchText,
} from "../src/modules/entries/utils/entry-slug.util";
import {
  convertMarkdownToTiptap,
  createDeterministicUuid,
  type NormalizedEntryDocument,
  parseNormalizedEntryMarkdown,
  validateInternalLinkConsistency,
} from "../src/modules/entries/utils/normalized-content.util";
import { type DemoEntryManifestItem, demoEntryManifest } from "./seed-data/demo-entry-manifest";
import { DEMO_USER_PASSWORD, demoUsers } from "./seed-data/demo-users";
import { assertDemoSeedEnvironment, createSeedPrismaClient, writeSeedReport } from "./seed-utils";

type SeedPrismaClient = ReturnType<typeof createSeedPrismaClient>;

type TaxonomyItem = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  provinceId?: string;
};

type TaxonomyMaps = {
  provinces: Map<string, TaxonomyItem>;
  districts: Map<string, TaxonomyItem>;
  categories: Map<string, TaxonomyItem>;
  contentTypes: Map<string, TaxonomyItem>;
};

type ResolvedEntry = {
  document: NormalizedEntryDocument;
  manifest: DemoEntryManifestItem;
  entryId: string;
  authorId: string;
  moderatorId: string | null;
  geographicScope: GeographicScope;
  province: TaxonomyItem | null;
  district: TaxonomyItem | null;
  category: TaxonomyItem;
  contentType: TaxonomyItem;
  tagNames: string[];
  tagIds: string[];
  sources: SeedSource[];
  internalLinks: SeedInternalReference[];
  contentJson: Prisma.InputJsonValue;
  plainTextContent: string;
  normalizedSearchText: string;
};

type SeedSource = {
  id: string;
  type: SourceType;
  title: string;
  authorOrProvider: string | null;
  publicationDate: string | null;
  websiteUrl: string | null;
  displayOrder: number;
};

type SeedInternalReference = {
  id: string;
  targetKey: string;
  sourceEntryId: string;
  targetEntryId: string;
  targetSlug: string | null;
  targetTitle: string;
  anchorText: string;
};

type SeedReport = {
  normalizedFilesDiscovered: string[];
  approvedFilesImported: string[];
  skippedFiles: string[];
  missingTaxonomy: string[];
  invalidGeographicScope: string[];
  brokenSources: string[];
  unresolvedInternalLinks: string[];
  statusDistribution: Record<string, number>;
  countsBefore: DemoCounts;
  countsAfter: DemoCounts;
  tagNames: string[];
};

type DemoCounts = {
  users: number;
  entries: number;
  tags: number;
  sources: number;
  entryTags: number;
  contentVersions: number;
  moderationReviews: number;
  auditLogs: number;
  internalReferences: number;
};

const NORMALIZED_ROOT = "prisma/content-library/normalized";
const REPORT_PATH = "prisma/content-library/reports/demo-seed-report.md";
const DEMO_EMAILS = demoUsers.map((user) => user.email);

async function main(): Promise<void> {
  assertDemoSeedEnvironment();

  const prisma = createSeedPrismaClient();

  try {
    const documents = loadNormalizedDocuments();
    const approvedDocuments = documents.filter(
      (document) => document.frontMatter.reviewStatus === "APPROVED",
    );
    const skippedFiles = documents
      .filter((document) => document.frontMatter.reviewStatus !== "APPROVED")
      .map((document) => document.fileName);

    if (approvedDocuments.length !== documents.length) {
      throw new Error(
        `Only APPROVED normalized entries can be imported. Skipped: ${skippedFiles.join(", ")}`,
      );
    }

    const manifestByKey = validateManifestCoverage(approvedDocuments);
    const countsBefore = await getDemoCounts(prisma, approvedDocuments);

    await seedDemoUsers(prisma);

    const usersByEmail = await loadDemoUsers(prisma);
    const taxonomyMaps = await loadTaxonomyMaps(prisma);
    const tagNames = uniqueSorted(
      approvedDocuments.flatMap((document) => document.frontMatter.tags),
    );

    await seedDemoTags(prisma, tagNames);

    const tagsByName = await loadTagsByName(prisma, tagNames);
    const resolvedEntries = resolveEntries({
      documents: approvedDocuments,
      manifestByKey,
      taxonomyMaps,
      usersByEmail,
      tagsByName,
    });

    await assertDemoSlugsAreSafe(prisma, resolvedEntries);

    for (const entry of resolvedEntries) {
      await seedEntry(prisma, entry);
    }

    await syncInternalReferences(prisma, resolvedEntries);

    const countsAfter = await getDemoCounts(prisma, approvedDocuments);
    const report = createReport({
      normalizedFilesDiscovered: documents.map((document) => document.fileName),
      approvedFilesImported: approvedDocuments.map((document) => document.fileName),
      skippedFiles,
      missingTaxonomy: [],
      invalidGeographicScope: [],
      brokenSources: [],
      unresolvedInternalLinks: [],
      statusDistribution: createStatusDistribution(resolvedEntries),
      countsBefore,
      countsAfter,
      tagNames,
    });

    writeSeedReport(REPORT_PATH, report);

    console.info("Demo content seed completed.");
    console.table(countsAfter);
  } finally {
    await prisma.$disconnect();
  }
}

function loadNormalizedDocuments(): NormalizedEntryDocument[] {
  return readdirSync(NORMALIZED_ROOT)
    .filter((fileName) => fileName.endsWith(".md"))
    .sort((left, right) => left.localeCompare(right))
    .map((fileName) =>
      parseNormalizedEntryMarkdown(fileName, readFileSync(join(NORMALIZED_ROOT, fileName), "utf8")),
    );
}

function validateManifestCoverage(
  documents: NormalizedEntryDocument[],
): Map<string, DemoEntryManifestItem> {
  const manifestByKey = new Map(demoEntryManifest.map((item) => [item.key, item]));
  const documentKeys = new Set(documents.map((document) => document.frontMatter.key));
  const missingManifest = [...documentKeys].filter((key) => !manifestByKey.has(key));
  const unknownManifest = demoEntryManifest
    .map((item) => item.key)
    .filter((key) => !documentKeys.has(key));

  if (missingManifest.length > 0 || unknownManifest.length > 0) {
    throw new Error(
      [
        missingManifest.length ? `Missing manifest entries: ${missingManifest.join(", ")}` : null,
        unknownManifest.length ? `Unknown manifest entries: ${unknownManifest.join(", ")}` : null,
      ]
        .filter(Boolean)
        .join("; "),
    );
  }

  return manifestByKey;
}

async function seedDemoUsers(prisma: SeedPrismaClient): Promise<void> {
  const passwordHash = await hashPassword(DEMO_USER_PASSWORD);
  const verifiedAt = new Date("2026-01-01T00:00:00.000Z");

  for (const user of demoUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        displayName: user.displayName,
        role: user.role,
        status: user.status,
        emailVerifiedAt: user.emailVerified ? verifiedAt : null,
      },
      create: {
        id: user.id,
        email: user.email,
        passwordHash,
        displayName: user.displayName,
        role: user.role,
        status: user.status,
        emailVerifiedAt: user.emailVerified ? verifiedAt : null,
      },
    });
  }
}

async function loadDemoUsers(prisma: SeedPrismaClient): Promise<Map<string, { id: string }>> {
  const users = await prisma.user.findMany({
    where: {
      email: {
        in: DEMO_EMAILS,
      },
    },
    select: {
      id: true,
      email: true,
    },
  });

  return new Map(users.map((user) => [user.email, { id: user.id }]));
}

async function loadTaxonomyMaps(prisma: SeedPrismaClient): Promise<TaxonomyMaps> {
  const [provinces, districts, categories, contentTypes] = await Promise.all([
    prisma.province.findMany({ select: taxonomySelect }),
    prisma.district.findMany({
      select: {
        ...taxonomySelect,
        provinceId: true,
      },
    }),
    prisma.category.findMany({ select: taxonomySelect }),
    prisma.contentType.findMany({ select: taxonomySelect }),
  ]);

  return {
    provinces: createTaxonomyMap(provinces),
    districts: createTaxonomyMap(districts),
    categories: createTaxonomyMap(categories),
    contentTypes: createTaxonomyMap(contentTypes),
  };
}

const taxonomySelect = {
  id: true,
  name: true,
  slug: true,
  isActive: true,
} as const;

function createTaxonomyMap<TItem extends TaxonomyItem>(items: TItem[]): Map<string, TItem> {
  const map = new Map<string, TItem>();

  for (const item of items) {
    map.set(normalizeLookupKey(item.slug), item);
    map.set(normalizeLookupKey(item.name), item);
  }

  return map;
}

async function seedDemoTags(prisma: SeedPrismaClient, tagNames: string[]): Promise<void> {
  for (const name of tagNames) {
    const normalizedName = normalizeLookupKey(name);
    const slug = createTagSlug(name);

    await prisma.tag.upsert({
      where: { normalizedName },
      update: {
        name,
        isActive: true,
      },
      create: {
        id: createDeterministicUuid("demo-tag", normalizedName),
        name,
        slug,
        normalizedName,
        isActive: true,
      },
    });
  }
}

async function loadTagsByName(
  prisma: SeedPrismaClient,
  tagNames: string[],
): Promise<Map<string, { id: string; name: string; slug: string }>> {
  const tags = await prisma.tag.findMany({
    where: {
      normalizedName: {
        in: tagNames.map(normalizeLookupKey),
      },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      normalizedName: true,
    },
  });

  return new Map(tags.map((tag) => [tag.normalizedName, tag]));
}

function resolveEntries({
  documents,
  manifestByKey,
  taxonomyMaps,
  usersByEmail,
  tagsByName,
}: {
  documents: NormalizedEntryDocument[];
  manifestByKey: Map<string, DemoEntryManifestItem>;
  taxonomyMaps: TaxonomyMaps;
  usersByEmail: Map<string, { id: string }>;
  tagsByName: Map<string, { id: string; name: string; slug: string }>;
}): ResolvedEntry[] {
  const documentByKey = new Map(documents.map((document) => [document.frontMatter.key, document]));

  return documents.map((document) => {
    const manifest = requireManifest(document, manifestByKey);
    const authorId = requireUserId(manifest.authorEmail, usersByEmail);
    const moderatorId = manifest.moderatorEmail
      ? requireUserId(manifest.moderatorEmail, usersByEmail)
      : null;
    const province = resolveProvince(document, taxonomyMaps);
    const district = resolveDistrict(document, province, taxonomyMaps);
    const category = resolveRequiredTaxonomy(
      document,
      taxonomyMaps.categories,
      document.frontMatter.category,
      "category",
    );
    const contentType = resolveRequiredTaxonomy(
      document,
      taxonomyMaps.contentTypes,
      document.frontMatter.contentType,
      "contentType",
    );
    const tagIds = document.frontMatter.tags.map((tagName) => {
      const tag = tagsByName.get(normalizeLookupKey(tagName));

      if (!tag) {
        throw new Error(`${document.fileName}: tag was not seeded: ${tagName}`);
      }

      return tag.id;
    });
    const internalLinks = resolveInternalLinks(document, documentByKey, manifestByKey);
    const conversion = convertMarkdownToTiptap(document.body, internalLinks);

    validateInternalLinkConsistency(conversion.contentJson);

    const tagNames = document.frontMatter.tags;

    return {
      document,
      manifest,
      entryId: createDeterministicUuid("demo-entry", document.frontMatter.key),
      authorId,
      moderatorId,
      geographicScope: document.frontMatter.geographicScope as GeographicScope,
      province,
      district,
      category,
      contentType,
      tagNames,
      tagIds,
      sources: document.frontMatter.sources.map((source, index) => ({
        id: createDeterministicUuid("demo-source", `${document.frontMatter.key}:${index}`),
        type: source.url ? SourceType.WEBSITE : SourceType.OTHER,
        title: source.title,
        authorOrProvider: source.author,
        publicationDate: source.published,
        websiteUrl: source.url,
        displayOrder: index,
      })),
      internalLinks,
      contentJson: conversion.contentJson as Prisma.InputJsonValue,
      plainTextContent: conversion.plainTextContent,
      normalizedSearchText: normalizeEntrySearchText([
        document.frontMatter.title,
        document.frontMatter.summary,
        conversion.plainTextContent,
        province?.name,
        district?.name,
        category.name,
        contentType.name,
        ...tagNames,
      ]),
    };
  });
}

function requireManifest(
  document: NormalizedEntryDocument,
  manifestByKey: Map<string, DemoEntryManifestItem>,
): DemoEntryManifestItem {
  const manifest = manifestByKey.get(document.frontMatter.key);

  if (!manifest) {
    throw new Error(`${document.fileName}: manifest entry is missing.`);
  }

  return manifest;
}

function requireUserId(email: string, usersByEmail: Map<string, { id: string }>): string {
  const user = usersByEmail.get(email);

  if (!user) {
    throw new Error(`Demo user is missing: ${email}`);
  }

  return user.id;
}

function resolveProvince(
  document: NormalizedEntryDocument,
  taxonomyMaps: TaxonomyMaps,
): TaxonomyItem | null {
  if (document.frontMatter.geographicScope !== "PROVINCE") {
    return null;
  }

  return resolveRequiredTaxonomy(
    document,
    taxonomyMaps.provinces,
    document.frontMatter.province,
    "province",
  );
}

function resolveDistrict(
  document: NormalizedEntryDocument,
  province: TaxonomyItem | null,
  taxonomyMaps: TaxonomyMaps,
): TaxonomyItem | null {
  if (!document.frontMatter.district) {
    return null;
  }

  const district = resolveRequiredTaxonomy(
    document,
    taxonomyMaps.districts,
    document.frontMatter.district,
    "district",
  );

  if (!province || district.provinceId !== province.id) {
    throw new Error(`${document.fileName}: district does not belong to selected province.`);
  }

  return district;
}

function resolveRequiredTaxonomy(
  document: NormalizedEntryDocument,
  map: Map<string, TaxonomyItem>,
  value: string | null,
  label: string,
): TaxonomyItem {
  if (!value) {
    throw new Error(`${document.fileName}: ${label} is required.`);
  }

  const item = map.get(normalizeLookupKey(value));

  if (!item?.isActive) {
    throw new Error(`${document.fileName}: ${label} is missing or inactive: ${value}`);
  }

  return item;
}

function resolveInternalLinks(
  document: NormalizedEntryDocument,
  documentByKey: Map<string, NormalizedEntryDocument>,
  manifestByKey: Map<string, DemoEntryManifestItem>,
): SeedInternalReference[] {
  return document.frontMatter.internalLinks.map((link) => {
    const targetDocument = documentByKey.get(link.targetKey);
    const targetManifest = manifestByKey.get(link.targetKey);

    if (!targetDocument || !targetManifest) {
      throw new Error(`${document.fileName}: unresolved internal link target ${link.targetKey}.`);
    }

    if (link.targetKey === document.frontMatter.key) {
      throw new Error(`${document.fileName}: self-references are not allowed.`);
    }

    if (targetManifest.status !== EntryStatus.PUBLISHED) {
      throw new Error(
        `${document.fileName}: internal link target ${link.targetKey} is not published.`,
      );
    }

    return {
      id: createDeterministicUuid(
        "demo-entry-reference",
        `${document.frontMatter.key}:${link.targetKey}:${link.anchorText}`,
      ),
      targetKey: link.targetKey,
      sourceEntryId: createDeterministicUuid("demo-entry", document.frontMatter.key),
      targetEntryId: createDeterministicUuid("demo-entry", link.targetKey),
      targetSlug: targetDocument.frontMatter.slug,
      targetTitle: targetDocument.frontMatter.title,
      anchorText: link.anchorText,
    };
  });
}

async function assertDemoSlugsAreSafe(
  prisma: SeedPrismaClient,
  entries: ResolvedEntry[],
): Promise<void> {
  const demoEntryIds = new Set(entries.map((entry) => entry.entryId));

  for (const entry of entries) {
    const existingEntry = await prisma.culturalEntry.findUnique({
      where: { slug: entry.document.frontMatter.slug },
      select: {
        id: true,
      },
    });

    if (existingEntry && !demoEntryIds.has(existingEntry.id)) {
      throw new Error(
        `${entry.document.fileName}: slug already belongs to a non-demo entry: ${entry.document.frontMatter.slug}`,
      );
    }
  }
}

async function seedEntry(prisma: SeedPrismaClient, entry: ResolvedEntry): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const baseData = createEntryData(entry);

    await tx.culturalEntry.upsert({
      where: { id: entry.entryId },
      update: baseData,
      create: {
        id: entry.entryId,
        ...baseData,
      },
    });

    await tx.entryTag.deleteMany({ where: { entryId: entry.entryId } });

    if (entry.tagIds.length > 0) {
      await tx.entryTag.createMany({
        data: entry.tagIds.map((tagId) => ({
          entryId: entry.entryId,
          tagId,
        })),
      });
    }

    await tx.source.deleteMany({ where: { entryId: entry.entryId } });

    if (entry.sources.length > 0) {
      await tx.source.createMany({
        data: entry.sources.map((source) => ({
          id: source.id,
          entryId: entry.entryId,
          type: source.type,
          title: source.title,
          authorOrProvider: source.authorOrProvider,
          publicationDate: source.publicationDate,
          websiteUrl: source.websiteUrl,
          displayOrder: source.displayOrder,
        })),
      });
    }

    if (entry.manifest.status !== EntryStatus.DRAFT) {
      await seedContentVersion(tx, entry);
      await seedSubmissionAudit(tx, entry);
    }

    if (entry.manifest.status === EntryStatus.PUBLISHED) {
      await seedModerationDecision(
        tx,
        entry,
        ModerationDecision.APPROVE,
        AuditAction.ENTRY_APPROVED,
      );
    }

    if (entry.manifest.status === EntryStatus.CHANGES_REQUESTED) {
      await seedModerationDecision(
        tx,
        entry,
        ModerationDecision.REQUEST_CHANGES,
        AuditAction.ENTRY_CHANGES_REQUESTED,
      );
    }

    if (entry.manifest.status === EntryStatus.REJECTED) {
      await seedModerationDecision(
        tx,
        entry,
        ModerationDecision.REJECT,
        AuditAction.ENTRY_REJECTED,
      );
    }
  });
}

function createEntryData(entry: ResolvedEntry): Prisma.CulturalEntryUncheckedCreateInput {
  return {
    slug: entry.document.frontMatter.slug,
    title: entry.document.frontMatter.title,
    summary: entry.document.frontMatter.summary,
    contentJson: entry.contentJson,
    plainTextContent: entry.plainTextContent,
    normalizedSearchText: entry.normalizedSearchText,
    status: entry.manifest.status,
    geographicScope: entry.geographicScope,
    authorId: entry.authorId,
    provinceId: entry.province?.id ?? null,
    districtId: entry.district?.id ?? null,
    categoryId: entry.category.id,
    contentTypeId: entry.contentType.id,
    villageOrLocation: null,
    submittedAt: entry.manifest.submittedAt ? new Date(entry.manifest.submittedAt) : null,
    publishedAt: entry.manifest.publishedAt ? new Date(entry.manifest.publishedAt) : null,
    hiddenAt:
      entry.manifest.status === EntryStatus.HIDDEN ? new Date("2026-03-01T00:00:00.000Z") : null,
    archivedAt:
      entry.manifest.status === EntryStatus.ARCHIVED ? new Date("2026-03-02T00:00:00.000Z") : null,
  };
}

async function seedContentVersion(
  tx: Prisma.TransactionClient,
  entry: ResolvedEntry,
): Promise<void> {
  await tx.contentVersion.upsert({
    where: {
      entryId_versionNumber: {
        entryId: entry.entryId,
        versionNumber: 1,
      },
    },
    update: {
      snapshot: createContentSnapshot(entry),
      plainTextContent: entry.plainTextContent,
      versionReason: VersionReason.INITIAL_SUBMISSION,
      createdById: entry.authorId,
    },
    create: {
      id: createDeterministicUuid("demo-content-version", `${entry.document.frontMatter.key}:1`),
      entryId: entry.entryId,
      versionNumber: 1,
      snapshot: createContentSnapshot(entry),
      plainTextContent: entry.plainTextContent,
      versionReason: VersionReason.INITIAL_SUBMISSION,
      createdById: entry.authorId,
      createdAt: new Date(entry.manifest.submittedAt ?? "2026-02-01T08:00:00.000Z"),
    },
  });
}

function createContentSnapshot(entry: ResolvedEntry): Prisma.InputJsonValue {
  return {
    schemaVersion: 1,
    entryId: entry.entryId,
    title: entry.document.frontMatter.title,
    summary: entry.document.frontMatter.summary,
    contentJson: entry.contentJson,
    plainTextContent: entry.plainTextContent,
    normalizedSearchText: entry.normalizedSearchText,
    slug: entry.document.frontMatter.slug,
    geographicScope: entry.geographicScope,
    province: entry.province ? mapTaxonomySnapshot(entry.province) : null,
    district: entry.district ? mapTaxonomySnapshot(entry.district) : null,
    category: mapTaxonomySnapshot(entry.category),
    contentType: mapTaxonomySnapshot(entry.contentType),
    villageOrLocation: null,
    tags: entry.tagNames,
    sources: entry.sources.map((source) => ({
      id: source.id,
      type: source.type,
      title: source.title,
      authorOrProvider: source.authorOrProvider,
      publicationDate: source.publicationDate,
      websiteUrl: source.websiteUrl,
      bookOrArticleDetails: null,
      interviewDate: null,
      explanation: null,
      displayOrder: source.displayOrder,
    })),
    images: [],
    youtubeVideo: null,
    internalReferences: entry.internalLinks.map((link) => ({
      targetEntryId: link.targetEntryId,
      targetSlug: link.targetSlug,
      targetTitle: link.targetTitle,
      anchorText: link.anchorText,
    })),
    versionReason: VersionReason.INITIAL_SUBMISSION,
    creatorId: entry.authorId,
    createdAt: entry.manifest.submittedAt ?? "2026-02-01T08:00:00.000Z",
  };
}

function mapTaxonomySnapshot(item: TaxonomyItem) {
  return {
    id: item.id,
    name: item.name,
    slug: item.slug,
  };
}

async function seedSubmissionAudit(
  tx: Prisma.TransactionClient,
  entry: ResolvedEntry,
): Promise<void> {
  await tx.auditLog.upsert({
    where: {
      id: createDeterministicUuid("demo-audit", `${entry.document.frontMatter.key}:submit`),
    },
    update: {
      actorId: entry.authorId,
      entryId: entry.entryId,
      metadata: {
        entryId: entry.entryId,
        versionNumber: 1,
        oldStatus: EntryStatus.DRAFT,
        newStatus: EntryStatus.PENDING_REVIEW,
        authorId: entry.authorId,
        versionReason: VersionReason.INITIAL_SUBMISSION,
        demoSeed: true,
      },
    },
    create: {
      id: createDeterministicUuid("demo-audit", `${entry.document.frontMatter.key}:submit`),
      action: AuditAction.ENTRY_SUBMITTED,
      actorId: entry.authorId,
      entryId: entry.entryId,
      metadata: {
        entryId: entry.entryId,
        versionNumber: 1,
        oldStatus: EntryStatus.DRAFT,
        newStatus: EntryStatus.PENDING_REVIEW,
        authorId: entry.authorId,
        versionReason: VersionReason.INITIAL_SUBMISSION,
        demoSeed: true,
      },
      createdAt: new Date(entry.manifest.submittedAt ?? "2026-02-01T08:00:00.000Z"),
    },
  });
}

async function seedModerationDecision(
  tx: Prisma.TransactionClient,
  entry: ResolvedEntry,
  decision: ModerationDecision,
  auditAction: AuditAction,
): Promise<void> {
  if (!entry.moderatorId) {
    throw new Error(`${entry.document.fileName}: moderator is required for ${decision}.`);
  }

  if (entry.moderatorId === entry.authorId) {
    throw new Error(`${entry.document.fileName}: moderator cannot review their own entry.`);
  }

  const previousStatus = EntryStatus.PENDING_REVIEW;
  const nextStatus = entry.manifest.status;
  const reviewId = createDeterministicUuid(
    "demo-moderation-review",
    `${entry.document.frontMatter.key}:${decision}`,
  );

  await tx.moderationReview.upsert({
    where: { id: reviewId },
    update: {
      moderatorId: entry.moderatorId,
      decision,
      comments: entry.manifest.moderationComment,
      previousStatus,
      nextStatus,
    },
    create: {
      id: reviewId,
      entryId: entry.entryId,
      moderatorId: entry.moderatorId,
      decision,
      comments: entry.manifest.moderationComment,
      previousStatus,
      nextStatus,
      createdAt: new Date(
        entry.manifest.publishedAt ?? entry.manifest.submittedAt ?? "2026-02-01T12:00:00.000Z",
      ),
    },
  });

  await tx.auditLog.upsert({
    where: {
      id: createDeterministicUuid("demo-audit", `${entry.document.frontMatter.key}:${decision}`),
    },
    update: {
      actorId: entry.moderatorId,
      entryId: entry.entryId,
      metadata: {
        entryId: entry.entryId,
        versionNumber: 1,
        oldStatus: previousStatus,
        newStatus: nextStatus,
        moderatorId: entry.moderatorId,
        decision,
        reason: entry.manifest.moderationComment,
        reviewId,
        demoSeed: true,
      },
    },
    create: {
      id: createDeterministicUuid("demo-audit", `${entry.document.frontMatter.key}:${decision}`),
      action: auditAction,
      actorId: entry.moderatorId,
      entryId: entry.entryId,
      metadata: {
        entryId: entry.entryId,
        versionNumber: 1,
        oldStatus: previousStatus,
        newStatus: nextStatus,
        moderatorId: entry.moderatorId,
        decision,
        reason: entry.manifest.moderationComment,
        reviewId,
        demoSeed: true,
      },
      createdAt: new Date(
        entry.manifest.publishedAt ?? entry.manifest.submittedAt ?? "2026-02-01T12:00:00.000Z",
      ),
    },
  });
}

async function syncInternalReferences(
  prisma: SeedPrismaClient,
  entries: ResolvedEntry[],
): Promise<void> {
  const entryIds = entries.map((entry) => entry.entryId);
  const references = entries.flatMap((entry) => entry.internalLinks);

  await prisma.$transaction(async (tx) => {
    await tx.entryReference.deleteMany({
      where: {
        sourceEntryId: {
          in: entryIds,
        },
      },
    });

    if (references.length > 0) {
      await tx.entryReference.createMany({
        data: references.map((reference) => ({
          id: reference.id,
          sourceEntryId: reference.sourceEntryId,
          targetEntryId: reference.targetEntryId,
          anchorText: reference.anchorText,
        })),
      });
    }
  });
}

async function getDemoCounts(
  prisma: SeedPrismaClient,
  documents: NormalizedEntryDocument[],
): Promise<DemoCounts> {
  const entryIds = documents.map((document) =>
    createDeterministicUuid("demo-entry", document.frontMatter.key),
  );
  const auditIds = createDemoAuditIds(documents);
  const tagNames = uniqueSorted(documents.flatMap((document) => document.frontMatter.tags));

  const [
    users,
    entries,
    tags,
    sources,
    entryTags,
    contentVersions,
    moderationReviews,
    auditLogs,
    internalReferences,
  ] = await Promise.all([
    prisma.user.count({ where: { email: { in: DEMO_EMAILS } } }),
    prisma.culturalEntry.count({ where: { id: { in: entryIds } } }),
    prisma.tag.count({ where: { normalizedName: { in: tagNames.map(normalizeLookupKey) } } }),
    prisma.source.count({ where: { entryId: { in: entryIds } } }),
    prisma.entryTag.count({ where: { entryId: { in: entryIds } } }),
    prisma.contentVersion.count({ where: { entryId: { in: entryIds } } }),
    prisma.moderationReview.count({ where: { entryId: { in: entryIds } } }),
    prisma.auditLog.count({ where: { id: { in: auditIds } } }),
    prisma.entryReference.count({ where: { sourceEntryId: { in: entryIds } } }),
  ]);

  return {
    users,
    entries,
    tags,
    sources,
    entryTags,
    contentVersions,
    moderationReviews,
    auditLogs,
    internalReferences,
  };
}

function createDemoAuditIds(documents: NormalizedEntryDocument[]): string[] {
  const manifestByKey = new Map(demoEntryManifest.map((item) => [item.key, item]));
  const ids: string[] = [];

  for (const document of documents) {
    const manifest = manifestByKey.get(document.frontMatter.key);

    if (!manifest || manifest.status === EntryStatus.DRAFT) {
      continue;
    }

    ids.push(createDeterministicUuid("demo-audit", `${document.frontMatter.key}:submit`));

    if (manifest.status === EntryStatus.PUBLISHED) {
      ids.push(
        createDeterministicUuid(
          "demo-audit",
          `${document.frontMatter.key}:${ModerationDecision.APPROVE}`,
        ),
      );
    }

    if (manifest.status === EntryStatus.CHANGES_REQUESTED) {
      ids.push(
        createDeterministicUuid(
          "demo-audit",
          `${document.frontMatter.key}:${ModerationDecision.REQUEST_CHANGES}`,
        ),
      );
    }

    if (manifest.status === EntryStatus.REJECTED) {
      ids.push(
        createDeterministicUuid(
          "demo-audit",
          `${document.frontMatter.key}:${ModerationDecision.REJECT}`,
        ),
      );
    }
  }

  return ids;
}

function createStatusDistribution(entries: ResolvedEntry[]): Record<string, number> {
  return entries.reduce<Record<string, number>>((distribution, entry) => {
    distribution[entry.manifest.status] = (distribution[entry.manifest.status] ?? 0) + 1;

    return distribution;
  }, {});
}

function createReport(report: SeedReport): string {
  const idempotency =
    report.countsBefore.users === report.countsAfter.users &&
    report.countsBefore.entries === report.countsAfter.entries &&
    report.countsBefore.sources === report.countsAfter.sources &&
    report.countsBefore.entryTags === report.countsAfter.entryTags &&
    report.countsBefore.contentVersions === report.countsAfter.contentVersions &&
    report.countsBefore.moderationReviews === report.countsAfter.moderationReviews &&
    report.countsBefore.auditLogs === report.countsAfter.auditLogs &&
    report.countsBefore.internalReferences === report.countsAfter.internalReferences
      ? "Stable on this run; counts did not increase."
      : "Seed wrote missing or changed demo records on this run. Run again to confirm stability.";

  return [
    "# Demo Content Seed Report",
    "",
    `Generated at: ${new Date().toISOString()}`,
    "",
    "## Files",
    "",
    `- Normalized files discovered: ${report.normalizedFilesDiscovered.length}`,
    `- Approved files imported: ${report.approvedFilesImported.length}`,
    `- Skipped files: ${report.skippedFiles.length}`,
    "",
    "## Validation",
    "",
    `- Missing taxonomy: ${formatList(report.missingTaxonomy)}`,
    `- Invalid geographic scope: ${formatList(report.invalidGeographicScope)}`,
    `- Broken sources: ${formatList(report.brokenSources)}`,
    `- Unresolved internal links: ${formatList(report.unresolvedInternalLinks)}`,
    "",
    "## Imported Data",
    "",
    `- Demo users: ${report.countsAfter.users}`,
    `- Demo entries: ${report.countsAfter.entries}`,
    `- Demo tags: ${report.countsAfter.tags}`,
    `- Entry tag links: ${report.countsAfter.entryTags}`,
    `- Sources: ${report.countsAfter.sources}`,
    `- Content versions: ${report.countsAfter.contentVersions}`,
    `- Moderation reviews: ${report.countsAfter.moderationReviews}`,
    `- Audit logs: ${report.countsAfter.auditLogs}`,
    `- Internal references: ${report.countsAfter.internalReferences}`,
    "",
    "## Status Distribution",
    "",
    ...Object.entries(report.statusDistribution).map(([status, count]) => `- ${status}: ${count}`),
    "",
    "## Idempotency",
    "",
    `- ${idempotency}`,
    `- Counts before: ${JSON.stringify(report.countsBefore)}`,
    `- Counts after: ${JSON.stringify(report.countsAfter)}`,
    "",
    "## Demo Tags",
    "",
    ...report.tagNames.map((tagName) => `- ${tagName}`),
    "",
  ].join("\n");
}

function formatList(items: string[]): string {
  return items.length > 0 ? items.join(", ") : "none";
}

function normalizeLookupKey(value: string): string {
  return value.replaceAll("ي", "ی").replaceAll("ك", "ک").replace(/\s+/g, " ").trim().toLowerCase();
}

function createTagSlug(name: string): string {
  const baseSlug = createEntrySlug(name, "tag");
  const suffix = createDeterministicUuid("demo-tag-slug", normalizeLookupKey(name)).slice(0, 8);

  return `${baseSlug}-${suffix}`;
}

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort((left, right) =>
    left.localeCompare(right),
  );
}

main().catch((error: unknown) => {
  console.error("Demo content seed failed.");
  console.error(error);
  process.exitCode = 1;
});
