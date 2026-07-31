import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";
import { categories, contentTypes, provinces } from "./seed-data/taxonomy";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to run the Prisma seed.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});

async function seedTaxonomy() {
  for (const province of provinces) {
    await prisma.province.upsert({
      where: { slug: province.slug },
      update: {
        name: province.name,
        sortOrder: province.sortOrder,
        isActive: true,
      },
      create: {
        ...province,
        isActive: true,
      },
    });
  }

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        sortOrder: category.sortOrder,
        isActive: true,
      },
      create: {
        ...category,
        isActive: true,
      },
    });
  }

  for (const contentType of contentTypes) {
    await prisma.contentType.upsert({
      where: { slug: contentType.slug },
      update: {
        name: contentType.name,
        sortOrder: contentType.sortOrder,
        isActive: true,
      },
      create: {
        ...contentType,
        isActive: true,
      },
    });
  }
}

async function getTaxonomyCounts() {
  const [provinceCount, districtCount, categoryCount, contentTypeCount, tagCount] =
    await Promise.all([
      prisma.province.count(),
      prisma.district.count(),
      prisma.category.count(),
      prisma.contentType.count(),
      prisma.tag.count(),
    ]);

  return {
    provinces: provinceCount,
    districts: districtCount,
    categories: categoryCount,
    contentTypes: contentTypeCount,
    tags: tagCount,
  };
}

async function main() {
  await seedTaxonomy();

  const counts = await getTaxonomyCounts();

  console.info("Initial taxonomy seed completed.");
  console.table(counts);
}

main()
  .catch((error: unknown) => {
    console.error("Initial taxonomy seed failed.");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
