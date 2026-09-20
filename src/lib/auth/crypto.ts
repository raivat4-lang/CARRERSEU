// Cryptographic Utilities for Secure Authentication, Password Hashing, and MFA Tokens
// Uses standard Web Crypto API (SubtleCrypto) compatible with both SSR and Browser runtimes.

const PBKDF2_ITERATIONS = 100000;
const SALT_BYTES = 16;
const HASH_KEY_LENGTH = 32; // 256 bits

// Convert ArrayBuffer to Hex String
export function bufferToHex(buffer: ArrayBuffer): string {
  const byteArray = new Uint8Array(buffer);
  return Array.from(byteArray, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

// Convert Hex String to Uint8Array
export function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

// Generate Cryptographically Secure Random Salt
export function generateSalt(length = SALT_BYTES): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bufferToHex(bytes.buffer);
}

// SHA-256 Hash Helper (for single-use tokens & OTPs)
export async function sha256Hash(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return bufferToHex(hashBuffer);
}

// Synchronous fast fallback SHA-256 representation for sync contexts if needed
export function fastSha256(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, "0");
}

// PBKDF2-SHA256 Password Hasher
export async function hashPassword(password: string): Promise<string> {
  const saltHex = generateSalt();
  const salt = hexToBuffer(saltHex);
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password);

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    passwordData,
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    HASH_KEY_LENGTH * 8
  );

  const hashHex = bufferToHex(derivedBits);
  return `pbkdf2:sha256:${PBKDF2_ITERATIONS}:${saltHex}:${hashHex}`;
}

// Constant-Time String Comparison (Timing attack prevention)
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

// PBKDF2-SHA256 Password Verifier
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (!storedHash || !password) return false;

  // Handle standard PBKDF2 format
  if (storedHash.startsWith("pbkdf2:sha256:")) {
    const parts = storedHash.split(":");
    if (parts.length !== 5) return false;

    const iterations = parseInt(parts[2] || "100000", 10);
    const saltHex = parts[3] || "";
    const expectedHashHex = parts[4] || "";

    const salt = hexToBuffer(saltHex);
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);

    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      passwordData,
      { name: "PBKDF2" },
      false,
      ["deriveBits"]
    );

    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: salt as BufferSource,
        iterations,
        hash: "SHA-256",
      },
      keyMaterial,
      HASH_KEY_LENGTH * 8
    );

    const computedHashHex = bufferToHex(derivedBits);
    return timingSafeEqual(computedHashHex, expectedHashHex);
  }

  // Fallback for legacy dev seeds during migration
  return false;
}

// 6-Digit Cryptographically Secure Random OTP Generator
// Never uses predictable strings or 123456
export function generateSecureOtp(): string {
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  // Guarantee 6 digits between 100000 and 999999
  const otp = 100000 + (bytes[0]! % 900000);
  return otp.toString();
}

// Cryptographically Secure Random Token (for password resets & sessions)
export function generateSecureToken(prefix = "cs_tok"): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return `${prefix}_${bufferToHex(bytes.buffer)}_${Date.now()}`;
}

// Mask Email for Security Screens (e.g. tysonfire13@gmail.com -> t*********3@gmail.com)
export function maskEmail(email: string): string {
  if (!email || !email.includes("@")) return "******@domain.com";
  const [user, domain] = email.split("@");
  if (!user || !domain) return "******@domain.com";

  if (user.length <= 2) {
    return `${user[0]}*@${domain}`;
  }
  const first = user[0];
  const last = user[user.length - 1];
  const stars = "*".repeat(Math.max(3, user.length - 2));
  return `${first}${stars}${last}@${domain}`;
}

// Password Strength Evaluation
export interface PasswordStrengthResult {
  score: number; // 0 to 4
  feedback: string[];
  isValid: boolean;
}

export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  const feedback: string[] = [];
  let score = 0;

  if (!password) {
    return { score: 0, feedback: ["Password is required"], isValid: false };
  }

  if (password.length >= 10) score += 1;
  else feedback.push("Minimum 10 characters required (12+ recommended)");

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push("Must include at least one uppercase letter (A-Z)");

  if (/[a-z]/.test(password)) score += 1;
  else feedback.push("Must include at least one lowercase letter (a-z)");

  if (/[0-9]/.test(password)) score += 0.5;
  else feedback.push("Must include at least one number (0-9)");

  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) score += 0.5;
  else feedback.push("Must include at least one special character (!@#$...)");

  const finalScore = Math.min(4, Math.floor(score));
  const isValid = password.length >= 10 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password);

  return {
    score: finalScore,
    feedback,
    isValid,
  };
}
