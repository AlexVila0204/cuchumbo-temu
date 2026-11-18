import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "cuchumbo_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 90;

function sign(value: string): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("Missing env var SESSION_SECRET");
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function isValidSignature(value: string, signature: string): boolean {
  const expected = Buffer.from(sign(value));
  const actual = Buffer.from(signature);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export async function setSession(personId: string): Promise<void> {
  (await cookies()).set(COOKIE_NAME, `${personId}.${sign(personId)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: MAX_AGE_SECONDS,
    path: "/",
  });
}

export async function clearSession(): Promise<void> {
  (await cookies()).delete(COOKIE_NAME);
}

export async function getSessionPersonId(): Promise<string | null> {
  const raw = (await cookies()).get(COOKIE_NAME)?.value;
  const [personId, signature] = raw?.split(".") ?? [];
  if (!personId || !signature) return null;
  return isValidSignature(personId, signature) ? personId : null;
}
