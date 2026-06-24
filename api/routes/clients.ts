import { Hono } from "hono";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { db, clients } from "../lib/db";

export const clientsRoutes = new Hono<{ Variables: { userId: string } }>();
clientsRoutes.use("*", requireAuth);

clientsRoutes.get("/", async (c) => {
  const rows = await db.select().from(clients).where(eq(clients.userId, c.get("userId")));
  return c.json(rows);
});

clientsRoutes.post("/", async (c) => {
  const userId = c.get("userId");
  const { name, email, phone, company, notes } = await c.req.json();
  if (!name?.trim()) return c.json({ error: "Name is required" }, 400);

  const [created] = await db.insert(clients).values({ userId, name, email, phone, company, notes }).returning();
  return c.json(created, 201);
});

clientsRoutes.put("/:id", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json();
  const updates: Record<string, unknown> = { updatedAt: new Date() };
  for (const key of ["name", "email", "phone", "company", "notes"]) if (key in body) updates[key] = body[key];

  const [updated] = await db
    .update(clients)
    .set(updates)
    .where(and(eq(clients.id, c.req.param("id")), eq(clients.userId, userId)))
    .returning();

  if (!updated) return c.json({ error: "Not found" }, 404);
  return c.json(updated);
});

clientsRoutes.delete("/:id", async (c) => {
  const userId = c.get("userId");
  await db.delete(clients).where(and(eq(clients.id, c.req.param("id")), eq(clients.userId, userId)));
  return c.json({ ok: true });
});
