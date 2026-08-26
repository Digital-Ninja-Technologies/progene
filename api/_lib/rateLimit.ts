import { db, rateLimits } from "./db";
import { sql } from "drizzle-orm";

export async function checkRateLimit(
  identifier: string,
  action: string,
  maxRequests: number,
  windowSeconds: number
): Promise<{ allowed: boolean; count: number }> {
  const now = new Date();
  const cutoff = new Date(now.getTime() - windowSeconds * 1000);

  // A single atomic UPSERT avoids the read-then-write race of a separate
  // select + insert/update: concurrent requests for the same identifier
  // can no longer all read a stale count and all pass the check at once.
  const [row] = await db
    .insert(rateLimits)
    .values({ identifier, action, requestCount: 1, windowStart: now })
    .onConflictDoUpdate({
      target: [rateLimits.identifier, rateLimits.action],
      set: {
        requestCount: sql`CASE WHEN ${rateLimits.windowStart} < ${cutoff} THEN 1 ELSE ${rateLimits.requestCount} + 1 END`,
        windowStart: sql`CASE WHEN ${rateLimits.windowStart} < ${cutoff} THEN ${now} ELSE ${rateLimits.windowStart} END`,
      },
    })
    .returning({ requestCount: rateLimits.requestCount });

  return { allowed: row.requestCount <= maxRequests, count: row.requestCount };
}
