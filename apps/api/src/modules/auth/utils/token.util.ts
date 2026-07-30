import { createHash, randomBytes } from "node:crypto";

const VERIFICATION_TOKEN_BYTES = 32;

function createSecureToken(): string {
  return randomBytes(VERIFICATION_TOKEN_BYTES).toString("base64url");
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export { createSecureToken, hashToken };
