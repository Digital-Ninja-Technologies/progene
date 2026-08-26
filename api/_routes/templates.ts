import { Hono } from "hono";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../_lib/auth";
import { db, proposalTemplates } from "../_lib/db";

export const templatesRoutes = new Hono<{ Variables: { userId: string } }>();
templatesRoutes.use("*", requireAuth);

templatesRoutes.get("/", async (c) => {
  const rows = await db.select().from(proposalTemplates).where(eq(proposalTemplates.userId, c.get("userId")));
  return c.json(rows);
});

templatesRoutes.post("/", async (c) => {
  const userId = c.get("userId");
  const { name, description, projectConfig, isDefault } = await c.req.json();
  if (!name?.trim()) return c.json({ error: "Name is required" }, 400);
  const [created] = await db.insert(proposalTemplates).values({ userId, name, description, projectConfig, isDefault }).returning();
  return c.json(created, 201);
});

templatesRoutes.put("/:id", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json();
  const updates: Record<string, unknown> = { updatedAt: new Date() };
  for (const key of ["name", "description", "projectConfig", "isDefault"]) if (key in body) updates[key] = body[key];

  const [updated] = await db
    .update(proposalTemplates)
    .set(updates)
    .where(and(eq(proposalTemplates.id, c.req.param("id")), eq(proposalTemplates.userId, userId)))
    .returning();
  if (!updated) return c.json({ error: "Not found" }, 404);
  return c.json(updated);
});

templatesRoutes.delete("/:id", async (c) => {
  const userId = c.get("userId");
  await db.delete(proposalTemplates).where(and(eq(proposalTemplates.id, c.req.param("id")), eq(proposalTemplates.userId, userId)));
  return c.json({ ok: true });
});
