import { PrismaClient } from "../../../prisma/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";
import { env } from "@/shared/env";

const globalForDb = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pgPool: Pool | undefined;
};

function createPool() {
  return new Pool({
    connectionString: env.DATABASE_URL,
    max: env.DATABASE_POOL_MAX,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
}

function createPrismaClient() {
  const pool = globalForDb.pgPool ?? createPool();
  globalForDb.pgPool = pool;

  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const db = globalForDb.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") {
  globalForDb.prisma = db;
}
