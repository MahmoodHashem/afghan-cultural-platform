import { getTaxonomyCounts, seedTaxonomy } from "./seed-taxonomy";
import { createSeedPrismaClient } from "./seed-utils";

async function main(): Promise<void> {
  const prisma = createSeedPrismaClient();

  try {
    await seedTaxonomy(prisma);

    const counts = await getTaxonomyCounts(prisma);

    console.info("Default Prisma seed completed. Taxonomy data is ready.");
    console.table(counts);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error("Default Prisma seed failed.");
  console.error(error);
  process.exitCode = 1;
});
