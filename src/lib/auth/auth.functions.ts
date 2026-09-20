// TanStack Start Server Functions for Email Security Code Generation, Dispatching & Verification
// Strictly runs on the server. Environment variables (SMTP credentials, SESSION_SECRET) are accessed securely.

import { createServerFn } from "@tanstack/react-start";
import type { OtpChallengeData, ServerSessionPayload } from "./session.server";

export type { OtpChallengeData, ServerSessionPayload };

function maskEmail(email: string): string {
  if (!email || !email.includes("@")) return "******@domain.com";
  const [user, domain] = email.split("@");
  if (!user || !domain) return "******@domain.com";
  if (user.length <= 2) return `${user[0]}*@${domain}`;
  const first = user[0];
  const last = user[user.length - 1];
  const stars = "*".repeat(Math.max(3, user.length - 2));
  return `${first}${stars}${last}@${domain}`;
}

// Server in-memory rate limiting store for resend protection (cooldown enforcement)
const resendRateLimitMap = new Map<string, number>();

// 1. Dispatch OTP via Email Server Function
export const dispatchEmailOtpServerFn = createServerFn({ method: "POST" })
  .validator((data: {
    email: string;
    purpose?: "STUDENT_LOGIN" | "STUDENT_VERIFY" | "ADMIN_LOGIN" | "ADMIN_FIRST_SETUP" | "ADMIN_RESET";
    recipientName?: string;
  }) => data)
  .handler(async ({ data }) => {
    const { generate6DigitOtp, hashOtp, signChallenge } = await import("./session.server");
    const { sendEmailViaSmtp } = await import("./email.server");

    const cleanEmail = (data.email || "").trim().toLowerCase();
    const purpose = data.purpose || "STUDENT_LOGIN";
    const recipientName = data.recipientName || "Student";

    if (!cleanEmail || !cleanEmail.includes("@")) {
      return { success: false, error: "A valid email address is required." };
    }

    // Rate-limiting check: 15 second minimum between requests for same email
    const now = Date.now();
    const lastSent = resendRateLimitMap.get(cleanEmail);
    if (lastSent && now - lastSent < 15000) {
      const waitSec = Math.ceil((15000 - (now - lastSent)) / 1000);
      return {
        success: false,
        error: `Please wait ${waitSec} seconds before requesting another code.`,
      };
    }
    resendRateLimitMap.set(cleanEmail, now);

    // Cryptographically secure 6-digit numeric OTP generated on server
    const otpCode = generate6DigitOtp();
    const codeHash = hashOtp(otpCode);
    const expiresInMinutes = 10;
    const expiresAt = now + expiresInMinutes * 60 * 1000;

    // Dispatch via backend email transporter (Resend API / SMTP)
    const emailResult = await sendEmailViaSmtp({
      to: cleanEmail,
      subject: `CareerSetu Verification Code`,
      recipientName,
      otpCode,
      purpose,
      expiresInMinutes,
    });

    // Create signed challenge token (NEVER contains plaintext OTP)
    const challengePayload: OtpChallengeData = {
      email: cleanEmail,
      codeHash,
      purpose,
      expiresAt,
      attemptCount: 0,
    };
    const challengeToken = signChallenge(challengePayload);

    // In dev mode (no SMTP configured), return the OTP so the UI can show it as a dev helper.
    // In production (sentViaSmtp=true), devOtp is NEVER included.
    return {
      success: true,
      maskedEmail: maskEmail(cleanEmail),
      expiresInMinutes,
      challengeToken,
      sentViaSmtp: emailResult.sentViaSmtp,
      devOtp: emailResult.sentViaSmtp ? undefined : otpCode,
    };
  });

// 2. Verify OTP Server Function
export const verifyEmailOtpServerFn = createServerFn({ method: "POST" })
  .validator((data: {
    email: string;
    otp: string;
    challengeToken?: string;
  }) => data)
  .handler(async ({ data }) => {
    const { verifyAndDecodeChallenge, hashOtp, signChallenge } = await import("./session.server");

    const cleanEmail = (data.email || "").trim().toLowerCase();
    const cleanOtp = (data.otp || "").trim();
    const token = data.challengeToken;

    if (!cleanOtp || cleanOtp.length !== 6) {
      return { valid: false, error: "Please enter the complete 6-digit verification code." };
    }

    if (!token) {
      return { valid: false, error: "Session challenge expired. Please request a new code." };
    }

    const challenge = verifyAndDecodeChallenge(token);
    if (!challenge) {
      return { valid: false, error: "Invalid security verification token. Please sign in again." };
    }

    if (challenge.email.toLowerCase() !== cleanEmail) {
      return { valid: false, error: "Email mismatch for verification token." };
    }

    if (Date.now() > challenge.expiresAt) {
      return { valid: false, error: "Verification code has expired. Please request a new code." };
    }

    if (challenge.attemptCount >= 5) {
      return { valid: false, error: "Too many failed attempts. Code locked for security. Please request a new code." };
    }

    const inputHash = hashOtp(cleanOtp);
    if (inputHash !== challenge.codeHash) {
      // Return updated challenge token with incremented attempt count
      challenge.attemptCount += 1;
      const updatedToken = signChallenge(challenge);
      const remaining = 5 - challenge.attemptCount;

      return {
        valid: false,
        updatedChallengeToken: updatedToken,
        error: `Incorrect verification code. ${remaining > 0 ? `${remaining} attempts remaining.` : "Code locked."}`,
      };
    }

    // Success! Verification validated on backend
    return {
      valid: true,
      email: cleanEmail,
      purpose: challenge.purpose,
    };
  });

// 3. Issue Authenticated Session Server Function
export const issueAuthenticatedSessionServerFn = createServerFn({ method: "POST" })
  .validator((data: {
    email: string;
    role: "STUDENT" | "ADMIN";
    userId?: string;
  }) => data)
  .handler(async ({ data }) => {
    const { signSessionToken } = await import("./session.server");

    const cleanEmail = (data.email || "").trim().toLowerCase();
    const role = data.role;

    if (!cleanEmail) {
      return { success: false, error: "Email is required." };
    }

    // Role check: If requesting ADMIN role, verify authorization server-side
    // Super Admins are always allowed; other approved admins are checked from the user store
    if (role === "ADMIN") {
      const superAdmins = ["raivats4@gmail.com", "tysonfire13@gmail.com", "admin@careersetu.ai"];
      const isSuperAdmin = superAdmins.includes(cleanEmail);
      if (!isSuperAdmin) {
        // Check if this email belongs to an approved admin application
        const { getAllUsers } = await import("./rbac");
        const users = getAllUsers();
        const user = users.find((u) => u.email.toLowerCase() === cleanEmail && u.role === "ADMIN" && u.is_active);
        if (!user) {
          return { success: false, error: "Access forbidden: Account is not authorized as an administrator." };
        }
      }
    }

    const now = Date.now();
    const expiresAt = now + 7 * 24 * 60 * 60 * 1000; // 7 days

    const payload: ServerSessionPayload = {
      userId: data.userId || (role === "ADMIN" ? "a0000000-0000-0000-0000-000000000001" : `usr-${Date.now()}`),
      email: cleanEmail,
      role,
      mfaVerified: true,
      issuedAt: now,
      expiresAt,
    };

    const token = signSessionToken(payload);

    return {
      success: true,
      token,
      session: payload,
    };
  });

// 4. Verify Admin Access Server Function (Enforces Server-Side Admin Authorization)
export const verifyAdminAccessServerFn = createServerFn({ method: "POST" })
  .validator((data: { token?: string }) => data)
  .handler(async ({ data }) => {
    const { verifyAndDecodeSessionToken } = await import("./session.server");

    const token = (data.token || "").trim();
    if (!token) {
      return { authorized: false, error: "Authentication token missing." };
    }

    const session = verifyAndDecodeSessionToken(token);
    if (!session) {
      return { authorized: false, error: "Session token invalid or expired." };
    }

    if (session.role !== "ADMIN" || !session.mfaVerified) {
      return { authorized: false, error: "Forbidden: 2FA-verified Administrator role required." };
    }

    return {
      authorized: true,
      user: {
        id: session.userId,
        email: session.email,
        role: session.role,
        mfaVerified: session.mfaVerified,
      },
    };
  });

// 5. Verify Student Access Server Function
export const verifyStudentAccessServerFn = createServerFn({ method: "POST" })
  .validator((data: { token?: string }) => data)
  .handler(async ({ data }) => {
    const { verifyAndDecodeSessionToken } = await import("./session.server");

    const token = (data.token || "").trim();
    if (!token) {
      return { authorized: false, error: "Authentication token missing." };
    }

    const session = verifyAndDecodeSessionToken(token);
    if (!session) {
      return { authorized: false, error: "Session token invalid or expired." };
    }

    if (!session.mfaVerified) {
      return { authorized: false, error: "MFA verification required." };
    }

    return {
      authorized: true,
      user: {
        id: session.userId,
        email: session.email,
        role: session.role,
        mfaVerified: session.mfaVerified,
      },
    };
  });

// 6. Direct OTP Email Dispatch Server Function (Server-Side Resend Delivery)
export const dispatchResendOtpDirectServerFn = createServerFn({ method: "POST" })
  .validator((data: {
    to: string;
    otpCode: string;
    purpose?: "STUDENT_LOGIN" | "STUDENT_VERIFY" | "ADMIN_LOGIN" | "ADMIN_FIRST_SETUP" | "ADMIN_RESET";
    recipientName?: string;
    expiresInMinutes?: number;
  }) => data)
  .handler(async ({ data }) => {
    const { sendEmailViaSmtp } = await import("./email.server");

    const cleanEmail = (data.to || "").trim().toLowerCase();
    const purpose = data.purpose || "STUDENT_LOGIN";
    const recipientName = data.recipientName || "User";
    const otpCode = data.otpCode;
    const expiresInMinutes = data.expiresInMinutes || 10;

    if (!cleanEmail || !cleanEmail.includes("@")) {
      return { success: false, error: "A valid email address is required." };
    }
    if (!otpCode) {
      return { success: false, error: "OTP code missing." };
    }

    const emailResult = await sendEmailViaSmtp({
      to: cleanEmail,
      subject: "CareerSetu Verification Code",
      recipientName,
      otpCode,
      purpose,
      expiresInMinutes,
    });

    return {
      success: emailResult.success,
      sentViaSmtp: emailResult.sentViaSmtp,
      error: emailResult.error,
    };
  });
