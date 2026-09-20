// Backend Server Email Dispatcher for CareerSetu AI
// Uses nodemailer with SMTP environment variables:
// SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM

import fs from "node:fs";
import path from "node:path";

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user?: string;
  password?: string;
  from: string;
}

export function getSecretEnv(key: string): string {
  try {
    const envPath = path.resolve(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (trimmed.startsWith("#") || !trimmed.includes("=")) continue;
        const [k, ...vParts] = trimmed.split("=");
        if (k.trim() === key) {
          return vParts.join("=").trim().replace(/^["']|["']$/g, "");
        }
      }
    }
  } catch {}
  if (typeof process !== "undefined" && process.env && process.env[key]) {
    return process.env[key]!;
  }
  return "";
}

export function getSmtpConfig(): SmtpConfig {
  const host = getSecretEnv("SMTP_HOST");
  const port = Number(getSecretEnv("SMTP_PORT")) || 587;
  const secure = port === 465;
  const user = getSecretEnv("SMTP_USER");
  const password = getSecretEnv("SMTP_PASSWORD");
  const from = getSecretEnv("SMTP_FROM") || "CareerSetu AI <no-reply@careersetu.ai>";

  return { host, port, secure, user, password, from };
}

export interface SendEmailPayload {
  to: string;
  subject: string;
  recipientName?: string;
  otpCode: string;
  purpose: "STUDENT_LOGIN" | "STUDENT_VERIFY" | "ADMIN_LOGIN" | "ADMIN_FIRST_SETUP" | "ADMIN_RESET";
  expiresInMinutes?: number;
}

export function renderEmailHtml(payload: SendEmailPayload): { subject: string; text: string; html: string } {
  const { to, recipientName = "User", otpCode, purpose, expiresInMinutes = 10 } = payload;

  let headerColor = "#0284c7";
  let title = "Login Verification Code";
  let badgeText = "Account Security";
  let greeting = `Hello ${recipientName},`;
  let instructions = "Please enter the following 6-digit security code to verify your sign-in:";

  if (purpose === "STUDENT_VERIFY") {
    headerColor = "#059669";
    title = "Verify Your Student Account";
    badgeText = "Welcome to CareerSetu";
    instructions = "Welcome to CareerSetu AI! Use this single-use code to complete your registration:";
  } else if (purpose === "ADMIN_LOGIN") {
    headerColor = "#f59e0b";
    title = "Administrator Two-Factor Authentication";
    badgeText = "Tier-1 Restricted Access";
    greeting = `Administrator (${to}),`;
    instructions = "A sign-in attempt was initiated for the Administrator Console. Use the following 2FA code:";
  } else if (purpose === "ADMIN_FIRST_SETUP") {
    headerColor = "#3b82f6";
    title = "Initial Administrator Password Setup";
    badgeText = "Security Onboarding";
    greeting = `Administrator (${to}),`;
    instructions = "Use the following one-time authorization code to establish your primary administrator password:";
  } else if (purpose === "ADMIN_RESET") {
    headerColor = "#ef4444";
    title = "Administrator Password Reset";
    badgeText = "Password Recovery";
    greeting = `Administrator (${to}),`;
    instructions = "A password reset request was received for your administrator account. Use this authorization code:";
  }

  const text = `${title} — CareerSetu AI\n\n${greeting}\n\n${instructions}\n\nSecurity Code: ${otpCode}\n\nThis single-use code expires in ${expiresInMinutes} minutes.\nIf you did not request this, please disregard this email.\n\nCareerSetu AI Security Team`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#f8fafc;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#0f172a;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:540px;background-color:#1e293b;border-radius:24px;border:1px solid #334155;overflow:hidden;box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);">
          <!-- Header Banner -->
          <tr>
            <td style="padding:32px 32px 20px 32px;background:linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);border-bottom:1px solid #334155;">
              <table width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="font-size:22px;font-weight:800;letter-spacing:-0.5px;color:#ffffff;">
                      Career<span style="color:#38bdf8;">Setu</span> <span style="font-size:12px;padding:3px 8px;background:rgba(56,189,248,0.15);color:#38bdf8;border-radius:8px;border:1px solid rgba(56,189,248,0.3);font-weight:600;margin-left:6px;">AI</span>
                    </div>
                  </td>
                  <td align="right">
                    <span style="display:inline-block;padding:4px 12px;background:rgba(255,255,255,0.08);border-radius:999px;font-size:11px;font-weight:600;color:#94a3b8;letter-spacing:0.5px;text-transform:uppercase;">
                      ${badgeText}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding:32px;">
              <h1 style="margin:0 0 12px 0;font-size:20px;font-weight:700;color:#f8fafc;letter-spacing:-0.3px;">
                ${title}
              </h1>
              <p style="margin:0 0 8px 0;font-size:14px;line-height:1.6;color:#cbd5e1;">
                ${greeting}
              </p>
              <p style="margin:0 0 24px 0;font-size:14px;line-height:1.6;color:#94a3b8;">
                ${instructions}
              </p>

              <!-- OTP Code Display Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:24px 0;">
                <tr>
                  <td align="center" style="background:#090d16;border:1px dashed ${headerColor};border-radius:18px;padding:24px 16px;">
                    <div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#94a3b8;font-weight:600;margin-bottom:8px;">
                      Single-Use Security Code
                    </div>
                    <div style="font-family:'Courier New',Courier,monospace;font-size:38px;font-weight:800;letter-spacing:10px;color:#ffffff;text-shadow:0 0 16px ${headerColor};">
                      ${otpCode}
                    </div>
                    <div style="font-size:12px;color:#94a3b8;margin-top:10px;">
                      ⏱️ Valid for <strong style="color:#f8fafc;">${expiresInMinutes} minutes</strong>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Security Information -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:rgba(255,255,255,0.03);border-radius:14px;padding:16px;margin:20px 0 0 0;border:1px solid rgba(255,255,255,0.06);">
                <tr>
                  <td style="font-size:12px;line-height:1.6;color:#94a3b8;">
                    🔒 <strong style="color:#e2e8f0;">Security Notice:</strong> Never share this verification code with anyone. CareerSetu support will never ask for your code. If you did not initiate this request, please secure your account immediately.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;background:#090d16;border-top:1px solid #1e293b;text-align:center;">
              <p style="margin:0;font-size:11px;color:#64748b;line-height:1.6;">
                This automated message was dispatched by CareerSetu AI Cryptographic Identity Gateway.<br>
                © ${new Date().getFullYear()} CareerSetu AI • All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return {
    subject: `CareerSetu: ${otpCode} is your ${title}`,
    text,
    html,
  };
}

export async function sendEmailViaSmtp(payload: SendEmailPayload): Promise<{
  success: boolean;
  sentViaSmtp: boolean;
  error?: string;
}> {
  const resendApiKey = getSecretEnv("RESEND_API_KEY");
  const resendFrom = getSecretEnv("RESEND_FROM") || getSecretEnv("FROM_EMAIL") || "CareerSetu AI <onboarding@resend.dev>";
  const { subject, text, html } = renderEmailHtml(payload);

  // 1. Priority: Brevo API if BREVO_API_KEY is configured
  const brevoApiKey = getSecretEnv("BREVO_API_KEY");
  const brevoSender = getSecretEnv("BREVO_SENDER_EMAIL") || getSecretEnv("SMTP_USER") || getSecretEnv("SMTP_FROM") || "CareerSetu AI <no-reply@careersetu.ai>";

  if (brevoApiKey && brevoApiKey.trim().length > 0) {
    if (brevoApiKey.trim().startsWith("xsmtpsib-")) {
      console.warn(
        `[SERVER EMAIL DISPATCH] Note: BREVO_API_KEY starts with 'xsmtpsib-' which is an SMTP password, not an API key. Brevo REST API requires an API key starting with 'xkeysib-' (Brevo Dashboard -> SMTP & API -> API Keys -> Generate Key). Skipping Brevo REST API.`
      );
    } else {
      try {
        // Parse sender email if formatted like "Name <email@domain.com>"
        let senderEmail = brevoSender.trim();
        let senderName = "CareerSetu AI";
        const match = brevoSender.match(/^(.*?)\s*<([^>]+)>$/);
        if (match) {
          senderName = match[1].trim() || senderName;
          senderEmail = match[2].trim();
        }

        const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            "api-key": brevoApiKey.trim(),
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify({
            sender: { name: senderName, email: senderEmail },
            to: [{ email: payload.to }],
            subject,
            htmlContent: html,
            textContent: text,
          }),
        });

        const brevoData = await brevoRes.json();

        if (brevoRes.ok) {
          console.log(`[SERVER EMAIL DISPATCH] Successfully sent email to ${payload.to} via Brevo API (messageId: ${brevoData.messageId})`);
          return {
            success: true,
            sentViaSmtp: true,
          };
        } else {
          console.error(`[SERVER EMAIL DISPATCH] Brevo API error:`, brevoData);
        }
      } catch (brevoErr: any) {
        console.error(`[SERVER EMAIL DISPATCH] Brevo API request failed:`, brevoErr?.message || brevoErr);
      }
    }
  }

  // 2. Secondary: Resend API if RESEND_API_KEY is configured
  if (resendApiKey && resendApiKey.trim().length > 0) {
    try {
      // Sandbox mode detection: onboarding@resend.dev can ONLY send to the account owner.
      // If a RESEND_TEST_REDIRECT_TO is configured (or we detect sandbox mode), redirect all
      // delivery to that address so emails actually arrive. The original recipient is noted in subject.
      const isSandboxSender = resendFrom.includes("onboarding@resend.dev");
      const testRedirect = getSecretEnv("RESEND_TEST_REDIRECT_TO") || (isSandboxSender ? getSecretEnv("SMTP_USER") : "");
      const actualTo = testRedirect && testRedirect.trim().length > 0 ? testRedirect.trim() : payload.to;
      const sandboxNote = actualTo !== payload.to ? ` [→ originally for: ${payload.to}]` : "";
      const finalSubject = subject + sandboxNote;

      if (actualTo !== payload.to) {
        console.log(`[SERVER EMAIL DISPATCH] Resend sandbox mode — redirecting delivery from ${payload.to} → ${actualTo}`);
      }

      const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey.trim()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: resendFrom,
          to: [actualTo],
          subject: finalSubject,
          text: `[OTP for ${payload.to}]\n\n` + text,
          html,
        }),
      });

      const resendData = await resendResponse.json();

      if (resendResponse.ok) {
        console.log(`[SERVER EMAIL DISPATCH] Successfully sent email to ${actualTo} via Resend (id: ${resendData.id})`);
        return {
          success: true,
          sentViaSmtp: true,
        };
      } else {
        console.error(`[SERVER EMAIL DISPATCH] Resend error:`, resendData);
      }
    } catch (resendErr: any) {
      console.error(`[SERVER EMAIL DISPATCH] Resend request failed:`, resendErr?.message || resendErr);
    }
  }

  // 2. Secondary: SMTP Transporter (Nodemailer)
  const config = getSmtpConfig();
  const hasHost = Boolean(config.host && config.host.trim().length > 0);
  const hasUser = Boolean(config.user && config.user.trim().length > 0);

  if (hasHost) {
    try {
      const nodemailer = await import("nodemailer");
      const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: hasUser
          ? {
              user: config.user,
              pass: config.password,
            }
          : undefined,
        tls: {
          rejectUnauthorized: false,
        },
      });

      await transporter.sendMail({
        from: config.from,
        to: payload.to,
        subject,
        text,
        html,
      });

      console.log(`[SERVER EMAIL DISPATCH] Successfully delivered email to ${payload.to} via SMTP ${config.host}:${config.port}`);

      return {
        success: true,
        sentViaSmtp: true,
      };
    } catch (err: any) {
      console.error(`[SERVER EMAIL DISPATCH ERROR] Failed sending to ${payload.to} via SMTP:`, err?.message || err);
    }
  }

  // 3. Fallback: Local dev logging when neither Resend nor SMTP is live
  console.log(`\n======================================================`);
  console.log(`[SERVER EMAIL DISPATCH - LOCAL DEV LOG]`);
  console.log(`To: ${payload.to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Purpose: ${payload.purpose}`);
  console.log(`OTP Code: [${payload.otpCode}] (Valid for ${payload.expiresInMinutes || 10}m)`);
  console.log(`Note: To send real emails, define RESEND_API_KEY or SMTP_HOST in .env`);
  console.log(`======================================================\n`);

  return {
    success: true,
    sentViaSmtp: false,
  };
}
