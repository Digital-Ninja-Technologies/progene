import { Hono } from "hono";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../_lib/auth";
import { db, timeEntries } from "../_lib/db";

export const timeRoutes = new Hono<{ Variables: { userId: string } }>();
timeRoutes.use("*", requireAuth);

timeRoutes.get("/", async (c) => {
  const rows = await db.select().from(timeEntries).where(eq(timeEntries.userId, c.get("userId")));
  return c.json(rows);
});

timeRoutes.post("/", async (c) => {
  const userId = c.get("userId");
  const { description, hours, date, billable, proposalId, clientId } = await c.req.json();
  if (!description?.trim()) return c.json({ error: "Description is required" }, 400);
  if (!hours || isNaN(Number(hours))) return c.json({ error: "Hours is required" }, 400);

  const [created] = await db.insert(timeEntries).values({ userId, description, hours: String(hours), date, billable, proposalId, clientId }).returning();
  return c.json(created, 201);
});

timeRoutes.put("/:id", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json();
  const updates: Record<string, unknown> = {};
  for (const key of ["description", "hours", "date", "billable", "proposalId", "clientId"]) if (key in body) updates[key] = body[key];

  const [updated] = await db
    .update(timeEntries)
    .set(updates)
    .where(and(eq(timeEntries.id, c.req.param("id")), eq(timeEntries.userId, userId)))
    .returning();
  if (!updated) return c.json({ error: "Not found" }, 404);
  return c.json(updated);
});

timeRoutes.delete("/:id", async (c) => {
  const userId = c.get("userId");
  await db.delete(timeEntries).where(and(eq(timeEntries.id, c.req.param("id")), eq(timeEntries.userId, userId)));
  return c.json({ ok: true });
});
