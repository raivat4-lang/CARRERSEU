// Server-only Cryptographic Engine for Challenge & Session Signing (HMAC-SHA256)
// This file is strictly executed on the server side and never bundled into the browser client.

import { createHmac, createHash, randomBytes } from "node:crypto";

export interface OtpChallengeData {
  email: string;
  codeHash: string;
  purpose: string;
  expiresAt: number; // Unix epoch ms
  attemptCount: number;
}

export interface ServerSessionPayload {
  userId: string;
  email: string;
  role: "STUDENT" | "ADMIN";
  mfaVerified: boolean;
  issuedAt: number;
  expiresAt: number;
}

export function getSecretKey(): string {
  const env = typeof process !== "undefined" && process.env ? process.env : ({} as Record<string, string | undefined>);
  return env.SESSION_SECRET || "careersetu_production_cryptographic_session_secret_2026_tier1";
}

export function generate6DigitOtp(): string {
  const randomBuf = randomBytes(4);
  const num = randomBuf.readUInt32BE(0) % 900000;
  return String(100000 + num);
}

export function hashOtp(otp: string): string {
  return createHash("sha256").update(otp.trim()).digest("hex");
}

export function signChallenge(payload: OtpChallengeData): string {
  const secret = getSecretKey();
  const raw = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", secret).update(raw).digest("base64url");
  return `${raw}.${signature}`;
}

export function verifyAndDecodeChallenge(token: string): OtpChallengeData | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [raw, signature] = parts;
    if (!raw || !signature) return null;

    const secret = getSecretKey();
    const expectedSignature = createHmac("sha256", secret).update(raw).digest("base64url");

    if (signature !== expectedSignature) {
      return null;
    }

    const json = Buffer.from(raw, "base64url").toString("utf8");
    return JSON.parse(json) as OtpChallengeData;
  } catch {
    return null;
  }
}

export function signSessionToken(payload: ServerSessionPayload): string {
  const secret = getSecretKey();
  const raw = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", secret).update(raw).digest("base64url");
  return `${raw}.${signature}`;
}

export function verifyAndDecodeSessionToken(token: string): ServerSessionPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [raw, signature] = parts;
    if (!raw || !signature) return null;

    const secret = getSecretKey();
    const expectedSignature = createHmac("sha256", secret).update(raw).digest("base64url");

    if (signature !== expectedSignature) {
      return null;
    }

    const json = Buffer.from(raw, "base64url").toString("utf8");
    const payload = JSON.parse(json) as ServerSessionPayload;

    if (Date.now() > payload.expiresAt) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
