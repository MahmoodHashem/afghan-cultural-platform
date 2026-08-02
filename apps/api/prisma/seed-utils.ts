import "dotenv/config";

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";

function getDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to run Prisma seed commands.");
  }

  return databaseUrl;
}

function createSeedPrismaClient(): PrismaClient {
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: getDatabaseUrl() }),
  });
}

function assertDemoSeedEnvironment(): void {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_DEMO_SEED !== "true") {
    throw new Error(
      "Demo seeding is disabled in production. Set ALLOW_DEMO_SEED=true only when explicitly approved.",
    );
  }
}

function writeSeedReport(filePath: string, content: string): void {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, content, "utf8");
}

export { assertDemoSeedEnvironment, createSeedPrismaClient, writeSeedReport };
