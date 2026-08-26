import type { MiddlewareHandler } from "hono";
import { getUserIdFromHeader } from "./clerk";

export const requireAuth: MiddlewareHandler = async (c, next) => {
  const userId = await getUserIdFromHeader(c.req.header("Authorization") ?? null);
  if (!userId) {
    return c.json({ error: "Authentication required" }, 401);
  }
  c.set("userId", userId);
  await next();
};
