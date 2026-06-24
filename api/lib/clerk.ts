import { createClerkClient } from "@clerk/backend";

export const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
});

export async function getUserIdFromHeader(authHeader: string | null): Promise<string | null> {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  try {
    const payload = await clerk.verifyToken(token);
    return payload.sub ?? null;
  } catch {
    return null;
  }
}
