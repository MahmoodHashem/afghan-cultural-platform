/**
 * Connection check for the database in DATABASE_URL (or DIRECT_URL with --direct).
 * Prints the host (never the password), round-trip time and the full error cause on failure.
 *
 *   pnpm --filter @afghan-culture/api prisma:check:db
 *   pnpm --filter @afghan-culture/api prisma:check:db -- --direct
 */
import "dotenv/config";

import { Client } from "pg";

const useDirect = process.argv.includes("--direct");
const key = useDirect ? "DIRECT_URL" : "DATABASE_URL";
const connectionString = process.env[key];

async function main() {
  if (!connectionString) throw new Error(`${key} is not set.`);
  const url = new URL(connectionString);
  console.log(`${key} → ${url.hostname}:${url.port || 5432}${url.pathname}${url.search}`);

  const client = new Client({ connectionString, connectionTimeoutMillis: 30_000 });
  client.on("error", (error) => console.error("Connection error event:", error));

  const started = Date.now();
  await client.connect();
  console.log(`Connected in ${Date.now() - started} ms`);

  const queryStarted = Date.now();
  const { rows } = await client.query<{ version: string; provinces: number }>(
    'select version(), (select count(*)::int from "Province") as provinces',
  );
  console.log(`Query took ${Date.now() - queryStarted} ms`);
  console.log(rows[0]);
  await client.end();
}

main().catch((error: unknown) => {
  console.error("Database check failed.");
  console.error(error);
  if (error instanceof Error && error.cause) console.error("Cause:", error.cause);
  process.exitCode = 1;
});
