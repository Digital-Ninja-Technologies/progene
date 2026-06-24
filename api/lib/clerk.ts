import { verifyToken } from "@clerk/backend";

export async function getUserIdFromHeader(authHeader: string | null): Promise<string | null> {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  try {
    const payload = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY! });
    return payload.sub ?? null;
  } catch {
    return null;
  }
}
