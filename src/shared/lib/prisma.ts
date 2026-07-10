import { PrismaClient } from "../../../prisma/generated/prisma/client";
// import { PrismaPg } from "@prisma/adapter-pg"; // Postgres
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"; // Better SQLite3
import "dotenv/config";

const connectionString = `${process.env.DATABASE_URL}`;

// const adapter = new PrismaPg({ connectionString });
const adapter = new PrismaBetterSqlite3({ url: connectionString });
const prisma = new PrismaClient({ adapter });

export const db = prisma;
