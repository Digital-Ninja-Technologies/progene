import { db, rateLimits } from "./db";
import { eq, and } from "drizzle-orm";

export async function checkRateLimit(
  identifier: string,
  action: string,
  maxRequests: number,
  windowSeconds: number
): Promise<{ allowed: boolean; count: number }> {
  const windowMs = windowSeconds * 1000;
  const now = new Date();

  const [existing] = await db
    .select()
    .from(rateLimits)
    .where(and(eq(rateLimits.identifier, identifier), eq(rateLimits.action, action)))
    .limit(1);

  if (!existing || now.getTime() - existing.windowStart.getTime() > windowMs) {
    await db
      .insert(rateLimits)
      .values({ identifier, action, requestCount: 1, windowStart: now })
      .onConflictDoUpdate({
        target: [rateLimits.identifier, rateLimits.action],
        set: { requestCount: 1, windowStart: now },
      });
    return { allowed: true, count: 1 };
  }

  if (existing.requestCount >= maxRequests) {
    return { allowed: false, count: existing.requestCount };
  }

  await db
    .update(rateLimits)
    .set({ requestCount: existing.requestCount + 1 })
    .where(and(eq(rateLimits.identifier, identifier), eq(rateLimits.action, action)));

  return { allowed: true, count: existing.requestCount + 1 };
}
