import { Hono } from "hono";
import { Resend } from "resend";
import { db, contactSubmissions } from "../lib/db";
import { checkRateLimit } from "../lib/rateLimit";

export const contactRoutes = new Hono();

const resend = new Resend(process.env.RESEND_API_KEY);

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// POST /api/contact
function getClientIp(c: { req: { header: (name: string) => string | undefined } }): string {
  const realIp = c.req.header("x-real-ip");
  if (realIp) return realIp.trim();
  const forwarded = c.req.header("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded.split(",").map((p) => p.trim()).filter(Boolean);
    // The last entry is appended by our own trusted reverse proxy; earlier
    // entries can be set by the client and are not trustworthy for rate limiting.
    return parts[parts.length - 1] ?? "unknown";
  }
  return "unknown";
}

contactRoutes.post("/", async (c) => {
  const ip = getClientIp(c);
  const rl = await checkRateLimit(ip, "contact_form", 5, 3600);
  if (!rl.allowed) return c.json({ error: "Too many requests. Please try again later." }, 429);

  const { name, email, subject, message } = await c.req.json();

  if (!name || !email || !subject || !message) return c.json({ error: "Missing required fields" }, 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return c.json({ error: "Invalid email format" }, 400);
  if (name.length > 100 || email.length > 255 || subject.length > 200 || message.length > 2000) {
    return c.json({ error: "Field length exceeded" }, 400);
  }

  await db.insert(contactSubmissions).values({ name, email, subject, message }).catch(console.error);

  await Promise.all([
    resend.emails.send({
      from: "ProGene Contact <notifications@progene.app>",
      to: [process.env.CONTACT_EMAIL ?? "Ifeoluwa.designs@gmail.com"],
      replyTo: email,
      subject: `[Contact Form] ${subject}`,
      html: `<p><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p><p><strong>Subject:</strong> ${escapeHtml(subject)}</p><p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>`,
    }),
    resend.emails.send({
      from: "ProGene <notifications@progene.app>",
      to: [email],
      subject: `We received your message: ${subject}`,
      html: `<p>Hi ${escapeHtml(name)}, thanks for reaching out! We'll get back to you within 24–48 hours.</p><p><strong>Your message:</strong><br>${escapeHtml(message).replace(/\n/g, "<br>")}</p>`,
    }),
  ]);

  return c.json({ success: true });
});
