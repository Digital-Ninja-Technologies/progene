import { Hono } from "hono";
import { corsMiddleware } from "./lib/cors";

import { aiRoutes } from "./routes/ai";
import { proposalsRoutes } from "./routes/proposals";
import { clientsRoutes } from "./routes/clients";
import { brandingRoutes } from "./routes/branding";
import { templatesRoutes } from "./routes/templates";
import { timeRoutes } from "./routes/time";
import { paymentsRoutes } from "./routes/payments";
import { webhooksRoutes } from "./routes/webhooks";
import { contactRoutes } from "./routes/contact";
import { profileRoutes } from "./routes/profile";
import { subscriptionRoutes } from "./routes/subscription";

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
