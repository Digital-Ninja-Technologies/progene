import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../../src/server/db/schema";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
export * from "../../src/server/db/schema";
