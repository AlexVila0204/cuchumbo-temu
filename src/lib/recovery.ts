import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";

function digest(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

export function isValidRecoveryKey(candidate: string): boolean {
  const expected = process.env.ADMIN_RECOVERY_KEY;
  if (!expected) return false;
  return timingSafeEqual(digest(candidate), digest(expected));
}
