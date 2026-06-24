import { Hono } from "hono";
import { eq, and, inArray } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { db, proposals, proposalViews, profiles, brandingSettings } from "../lib/db";
import { randomBytes } from "crypto";
import { Resend } from "resend";

export const proposalsRoutes = new Hono<{ Variables: { userId: string } }>();

const resend = new Resend(process.env.RESEND_API_KEY);

// All routes except public ones require auth
proposalsRoutes.use("*", async (c, next) => {
  // Public routes: GET /share/:token, POST /share/:token/view, POST /share/:token/sign
  if (c.req.path.includes("/share/")) return next();
  return requireAuth(c, next);
});

// GET /api/proposals/views — all views for user's proposals (analytics)
proposalsRoutes.get("/views", async (c) => {
  const userId = c.get("userId");
  const userProposals = await db.select({ id: proposals.id }).from(proposals).where(eq(proposals.userId, userId));
  if (userProposals.length === 0) return c.json([]);
  const ids = userProposals.map((p) => p.id);
  const views = await db.select().from(proposalViews).where(inArray(proposalViews.proposalId, ids));
  return c.json(views);
});

// GET /api/proposals — list user's proposals
proposalsRoutes.get("/", async (c) => {
  const userId = c.get("userId");
  const rows = await db.select().from(proposals).where(eq(proposals.userId, userId));
  return c.json(rows);
});

// POST /api/proposals — create proposal
proposalsRoutes.post("/", async (c) => {
  const userId = c.get("userId");

  // Check proposal limit
  const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
  if (!profile) return c.json({ error: "Profile not found" }, 404);

  if (!profile.isPremium && profile.subscriptionPlan !== "pro" && profile.subscriptionPlan !== "agency") {
    const existing = await db.select().from(proposals).where(eq(proposals.userId, userId));
    if (existing.length >= 3) {
      return c.json({ error: "Proposal limit reached. Upgrade to Pro for unlimited proposals." }, 403);
    }
  }

  const body = await c.req.json();
  const shareToken = randomBytes(16).toString("hex");

  // Capture branding snapshot
  const [branding] = await db.select().from(brandingSettings).where(eq(brandingSettings.userId, userId)).limit(1);

  const [created] = await db
    .insert(proposals)
    .values({
      userId,
      projectType: body.projectType,
      projectConfig: body.projectConfig,
      pricingResult: body.pricingResult,
      proposalData: body.proposalData,
      clientId: body.clientId ?? null,
      shareToken,
      brandingSnapshot: branding ?? null,
    })
    .returning();

  // Increment proposals_used
  await db
    .update(profiles)
    .set({ proposalsUsed: (profile.proposalsUsed ?? 0) + 1, updatedAt: new Date() })
    .where(eq(profiles.userId, userId));

  return c.json(created, 201);
});

// GET /api/proposals/:id
proposalsRoutes.get("/:id", async (c) => {
  const userId = c.get("userId");
  const [row] = await db
    .select()
    .from(proposals)
    .where(and(eq(proposals.id, c.req.param("id")), eq(proposals.userId, userId)))
    .limit(1);
  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json(row);
});

// PUT /api/proposals/:id
proposalsRoutes.put("/:id", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json();
  const allowed = ["projectConfig", "pricingResult", "proposalData", "isPublic", "clientId", "documentDetails"];
  const updates: Record<string, unknown> = {};
  for (const key of allowed) if (key in body) updates[key] = body[key];

  const [updated] = await db
    .update(proposals)
    .set({ ...updates, updatedAt: new Date() })
    .where(and(eq(proposals.id, c.req.param("id")), eq(proposals.userId, userId)))
    .returning();

  if (!updated) return c.json({ error: "Not found" }, 404);
  return c.json(updated);
});

// DELETE /api/proposals/:id
proposalsRoutes.delete("/:id", async (c) => {
  const userId = c.get("userId");
  await db
    .delete(proposals)
    .where(and(eq(proposals.id, c.req.param("id")), eq(proposals.userId, userId)));
  return c.json({ ok: true });
});

// GET /api/proposals/:id/share-status — share status for proposal owner
proposalsRoutes.get("/:id/share-status", async (c) => {
  const userId = c.get("userId");
  const [row] = await db
    .select()
    .from(proposals)
    .where(and(eq(proposals.id, c.req.param("id")), eq(proposals.userId, userId)))
    .limit(1);
  if (!row) return c.json({ error: "Not found" }, 404);

  const viewCount = await db
    .select()
    .from(proposalViews)
    .where(eq(proposalViews.proposalId, row.id));

  return c.json({
    isPublic: row.isPublic,
    shareToken: row.shareToken,
    clientSignedAt: row.clientSignedAt,
    clientSignature: row.clientSignature,
    viewCount: viewCount.length,
  });
});

// POST /api/proposals/:id/share — enable public sharing (auth'd owner)
proposalsRoutes.post("/:id/share", async (c) => {
  const userId = c.get("userId");
  const [branding] = await db.select().from(brandingSettings).where(eq(brandingSettings.userId, userId)).limit(1);
  const [updated] = await db
    .update(proposals)
    .set({ isPublic: true, brandingSnapshot: branding ?? null, updatedAt: new Date() })
    .where(and(eq(proposals.id, c.req.param("id")), eq(proposals.userId, userId)))
    .returning();
  if (!updated) return c.json({ error: "Not found" }, 404);
  return c.json({ shareToken: updated.shareToken });
});

// POST /api/proposals/:id/sign — sign by ID (used from public page when proposal ID is known)
proposalsRoutes.post("/:id/sign", async (c) => {
  const { clientSignature } = await c.req.json();
  const trimmed = (clientSignature ?? "").trim();
  if (!trimmed) return c.json({ error: "Signature cannot be empty" }, 400);
  if (trimmed.length > 100) return c.json({ error: "Signature too long" }, 400);
  if (!/^[a-zA-Z\s\-'.]+$/.test(trimmed)) return c.json({ error: "Invalid signature characters" }, 400);

  const [row] = await db
    .select()
    .from(proposals)
    .where(and(eq(proposals.id, c.req.param("id")), eq(proposals.isPublic, true)))
    .limit(1);
  if (!row) return c.json({ error: "Not found" }, 404);
  if (row.clientSignedAt) return c.json({ error: "Already signed" }, 409);

  const [updated] = await db
    .update(proposals)
    .set({ clientSignature: trimmed, clientSignedAt: new Date() })
    .where(eq(proposals.id, row.id))
    .returning();
  notifySign(row.id, trimmed).catch(console.error);
  return c.json(updated);
});

// GET /api/proposals/share/:token — public proposal view
proposalsRoutes.get("/share/:token", async (c) => {
  const [row] = await db
    .select()
    .from(proposals)
    .where(and(eq(proposals.shareToken, c.req.param("token")), eq(proposals.isPublic, true)))
    .limit(1);
  if (!row) return c.json({ error: "Proposal not found or not public" }, 404);
  return c.json(row);
});

// POST /api/proposals/share/:token/view — record a view
proposalsRoutes.post("/share/:token/view", async (c) => {
  const [row] = await db
    .select({ id: proposals.id, isPublic: proposals.isPublic })
    .from(proposals)
    .where(and(eq(proposals.shareToken, c.req.param("token")), eq(proposals.isPublic, true)))
    .limit(1);
  if (!row) return c.json({ error: "Not found" }, 404);

  await db.insert(proposalViews).values({
    proposalId: row.id,
    viewerIp: c.req.header("x-forwarded-for")?.split(",")[0] ?? null,
    viewerUserAgent: c.req.header("user-agent") ?? null,
  });

  // Notify owner
  notifyView(row.id).catch(console.error);

  return c.json({ ok: true });
});

// POST /api/proposals/share/:token/sign — sign proposal
proposalsRoutes.post("/share/:token/sign", async (c) => {
  const { clientSignature } = await c.req.json();
  const trimmed = (clientSignature ?? "").trim();

  if (!trimmed) return c.json({ error: "Signature cannot be empty" }, 400);
  if (trimmed.length > 100) return c.json({ error: "Signature too long" }, 400);
  if (!/^[a-zA-Z\s\-'.]+$/.test(trimmed)) return c.json({ error: "Invalid signature characters" }, 400);

  const [row] = await db
    .select()
    .from(proposals)
    .where(and(eq(proposals.shareToken, c.req.param("token")), eq(proposals.isPublic, true)))
    .limit(1);

  if (!row) return c.json({ error: "Proposal not found" }, 404);
  if (row.clientSignedAt) return c.json({ error: "Proposal already signed" }, 409);

  const [updated] = await db
    .update(proposals)
    .set({ clientSignature: trimmed, clientSignedAt: new Date() })
    .where(eq(proposals.id, row.id))
    .returning();

  // Notify owner
  notifySign(row.id, trimmed).catch(console.error);

  return c.json(updated);
});

// ─── helpers ─────────────────────────────────────────────────────────────────

async function getOwnerEmail(proposalId: string) {
  const [proposal] = await db.select().from(proposals).where(eq(proposals.id, proposalId)).limit(1);
  if (!proposal) return null;
  const [profile] = await db.select().from(profiles).where(eq(profiles.userId, proposal.userId)).limit(1);
  return profile?.email ?? null;
}

async function notifyView(proposalId: string) {
  const email = await getOwnerEmail(proposalId);
  if (!email) return;
  await resend.emails.send({
    from: "ProGene <notifications@progene.app>",
    to: [email],
    subject: "Someone viewed your proposal",
    html: `<p>Your proposal was just viewed. Follow up while it's fresh!</p>`,
  });
}

async function notifySign(proposalId: string, signature: string) {
  const email = await getOwnerEmail(proposalId);
  if (!email) return;
  await resend.emails.send({
    from: "ProGene <notifications@progene.app>",
    to: [email],
    subject: "🎉 Your proposal was signed!",
    html: `<p>Congratulations! Your proposal was signed by <strong>${signature.replace(/</g, "&lt;")}</strong>.</p>`,
  });
}
