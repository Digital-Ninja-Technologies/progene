import { Hono } from "hono";
import { corsMiddleware } from "./_lib/cors";

import { aiRoutes } from "./_routes/ai";
import { proposalsRoutes } from "./_routes/proposals";
import { clientsRoutes } from "./_routes/clients";
import { brandingRoutes } from "./_routes/branding";
import { templatesRoutes } from "./_routes/templates";
import { timeRoutes } from "./_routes/time";
import { paymentsRoutes } from "./_routes/payments";
import { webhooksRoutes } from "./_routes/webhooks";
import { contactRoutes } from "./_routes/contact";
import { profileRoutes } from "./_routes/profile";
import { subscriptionRoutes } from "./_routes/subscription";

const app = new Hono().basePath("/api");

app.use("*", corsMiddleware);

app.route("/ai", aiRoutes);
app.route("/proposals", proposalsRoutes);
app.route("/clients", clientsRoutes);
app.route("/branding", brandingRoutes);
app.route("/templates", templatesRoutes);
app.route("/time", timeRoutes);
app.route("/payments", paymentsRoutes);
app.route("/webhooks", webhooksRoutes);
app.route("/contact", contactRoutes);
app.route("/profile", profileRoutes);
app.route("/subscription", subscriptionRoutes);

app.get("/health", (c) => c.json({ ok: true }));

export default app;
