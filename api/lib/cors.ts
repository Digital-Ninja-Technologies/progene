import type { MiddlewareHandler } from "hono";

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://progene.lovable.app",
  process.env.FRONTEND_URL ?? "",
].filter(Boolean);

export const corsMiddleware: MiddlewareHandler = async (c, next) => {
  const origin = c.req.header("Origin") ?? "";
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : null;

  if (c.req.method === "OPTIONS") {
    const headers: Record<string, string> = {
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
      Vary: "Origin",
    };
    if (allowed) headers["Access-Control-Allow-Origin"] = allowed;
    return new Response(null, { status: 204, headers });
  }

  await next();
  if (allowed) c.res.headers.set("Access-Control-Allow-Origin", allowed);
  c.res.headers.set("Vary", "Origin");
};
