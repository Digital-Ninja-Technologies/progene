import { Hono } from "hono";
import { requireAuth } from "../_lib/auth";
import { checkRateLimit } from "../_lib/rateLimit";

export const aiRoutes = new Hono<{ Variables: { userId: string } }>();

aiRoutes.use("*", requireAuth);

const AI_GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const TONE_GUIDES: Record<string, string> = {
  professional: "Use polished, formal language suitable for corporate clients. Confident and authoritative.",
  friendly: "Use warm, approachable, human language. Write like a real person, not a template.",
  conversational: "Use casual, plain-spoken language — as if talking to a peer over coffee.",
  concise: "Keep every line short and punchy. Strip all filler words. Maximum signal, minimum words.",
};

// POST /api/ai/scope
aiRoutes.post("/scope", async (c) => {
  const userId = c.get("userId");

  const rl = await checkRateLimit(userId, "generate_scope", 30, 3600);
  if (!rl.allowed) return c.json({ error: "Rate limit exceeded. Please try again later." }, 429);

  const body = await c.req.json();
  const { projectType, pages, cmsNeeded, integrations, animations, urgency, maintenance, scopeItems, tone } = body;

  if (!projectType || typeof projectType !== "string") {
    return c.json({ error: "Project type is required" }, 400);
  }

  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) return c.json({ error: "AI service unavailable" }, 503);

  const selectedTone = TONE_GUIDES[tone] ? tone : "professional";

  const systemPrompt = `You are a freelance project scope writer. Generate clear scope descriptions a freelancer can paste straight into a client proposal.

TONE: ${selectedTone.toUpperCase()} — ${TONE_GUIDES[selectedTone]}

Output: a JSON array of strings. Each string is one scope item, 1–2 sentences. Generate 8–12 items.
Rules: Sound human. Be specific. Cover kickoff → design → build → review → handoff.
Return ONLY a valid JSON array of strings. No prose, no markdown.`;

  const userPrompt = `Project: ${projectType}, Pages: ${pages}, CMS: ${cmsNeeded}, Integrations: ${integrations?.join(", ") || "None"}, Animations: ${animations}, Urgency: ${urgency}, Maintenance: ${maintenance}${scopeItems?.length ? `\nExisting scope:\n${scopeItems.map((s: string) => `- ${s}`).join("\n")}` : ""}`;

  const resp = await fetch(AI_GATEWAY, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
    }),
  });

  if (!resp.ok) {
    if (resp.status === 429) return c.json({ error: "Rate limit exceeded. Please try again in a moment." }, 429);
    if (resp.status === 402) return c.json({ error: "AI credits depleted. Please try again later." }, 402);
    return c.json({ error: "AI service unavailable" }, 503);
  }

  const data = await resp.json();
  const content = data.choices?.[0]?.message?.content ?? "[]";
  let scope: string[];
  try {
    const match = content.match(/\[[\s\S]*\]/);
    scope = match ? JSON.parse(match[0]) : [];
  } catch {
    scope = content.split("\n").filter((l: string) => l.trim()).map((l: string) => l.replace(/^[-•*]\s*/, "").trim());
  }

  return c.json({ scope });
});

// POST /api/ai/cover-letter
aiRoutes.post("/cover-letter", async (c) => {
  const userId = c.get("userId");

  const rl = await checkRateLimit(userId, "generate_cover_letter", 20, 3600);
  if (!rl.allowed) return c.json({ error: "Rate limit exceeded. Please try again later." }, 429);

  const body = await c.req.json();
  const { jobDescription, userName, userSkills, refinePrompt, existingLetter } = body;

  if (!jobDescription?.trim()) return c.json({ error: "Job description is required" }, 400);
  if (jobDescription.length > 5000) return c.json({ error: "Job description too long (max 5000 characters)" }, 400);
  if (userName && userName.length > 100) return c.json({ error: "Name too long (max 100 characters)" }, 400);
  if (userSkills && userSkills.length > 1000) return c.json({ error: "Skills too long (max 1000 characters)" }, 400);
  if (refinePrompt && refinePrompt.length > 2000) return c.json({ error: "Refinement prompt too long" }, 400);
  if (existingLetter && existingLetter.length > 10000) return c.json({ error: "Existing letter too long" }, 400);

  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) return c.json({ error: "AI service unavailable" }, 503);

  const isRefine = refinePrompt && existingLetter;
  const systemPrompt = isRefine
    ? `You are a professional cover letter editor. Apply the requested changes while maintaining professionalism. Return ONLY the updated cover letter text.`
    : `You are a professional cover letter writer. Generate a compelling, personalized cover letter (300–400 words). Include placeholders like [Your Name], [Date] where needed.${userName ? ` Use the name "${userName}".` : ""}${userSkills ? ` Emphasize: ${userSkills}.` : ""}\nReturn ONLY the cover letter text.`;

  const userMessage = isRefine
    ? `Current letter:\n\n${existingLetter}\n\nJob description:\n\n${jobDescription}\n\nChanges requested:\n${refinePrompt}`
    : `Generate a cover letter for:\n\n${jobDescription}`;

  const apiKey2 = process.env.LOVABLE_API_KEY;
  const resp = await fetch(AI_GATEWAY, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey2}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userMessage }],
      stream: true,
    }),
  });

  if (!resp.ok) {
    if (resp.status === 429) return c.json({ error: "Rate limit exceeded. Please try again in a moment." }, 429);
    if (resp.status === 402) return c.json({ error: "AI credits exhausted. Please try again later." }, 402);
    return c.json({ error: "Failed to generate cover letter" }, 503);
  }

  return new Response(resp.body, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
  });
});
