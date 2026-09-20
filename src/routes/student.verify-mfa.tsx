import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Loader2, Mail, RefreshCw, ShieldCheck, Sparkles, AlertCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  completeStudentMfaLogin,
  createAndDispatchMfaCode,
  getUserByEmail,
  getActiveDevOtpForEmail,
} from "@/lib/auth/rbac";
import { maskEmail } from "@/lib/auth/crypto";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/student/verify-mfa")({
  head: () => ({
    meta: [
      { title: "Verify Your Email — CareerSetu AI" },
      { name: "description", content: "Enter the 6-digit email verification code to access your student dashboard." },
    ],
  }),
  component: StudentVerifyMfaPage,
});

function StudentVerifyMfaPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [maskedDisplay, setMaskedDisplay] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);
  const [resendCooldown, setResendCooldown] = useState(45);
  const [errorMsg, setErrorMsg] = useState("");
  const [attempts, setAttempts] = useState(0);

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    let storedEmail = "";
    let storedMasked = "";
    let storedDevOtp = "";
    if (typeof sessionStorage !== "undefined") {
      storedEmail = sessionStorage.getItem("careersetu_pending_student_email") || "";
      storedMasked = sessionStorage.getItem("careersetu_pending_student_masked") || "";
      storedDevOtp = sessionStorage.getItem("careersetu_dev_otp") || sessionStorage.getItem("careersetu_pending_dev_otp") || "";
    }
    if (!storedEmail) {
      toast.error("No active verification session. Please sign up or log in first.");
      navigate({ to: "/student/signup" as any });
      return;
    }
    setEmail(storedEmail);
    setMaskedDisplay(storedMasked || maskEmail(storedEmail));
    const activeOtp = storedDevOtp || getActiveDevOtpForEmail(storedEmail);
    if (activeOtp) {
      setDevOtp(activeOtp);
    }
  }, [navigate]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((prev) => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const otpValue = otp.join("");

  const handleOtpInput = (index: number, value: string) => {
    setErrorMsg("");
    if (value.length > 1) {
      const digits = value.replace(/\D/g, "").slice(0, 6).split("");
      const newOtp = Array.from({ length: 6 }, (_, i) => digits[i] || "");
      setOtp(newOtp);
      const nextFocus = Math.min(digits.length, 5);
      setTimeout(() => inputRefs.current[nextFocus]?.focus(), 20);
      return;
    }
    const digit = value.replace(/\D/g, "");
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    if (digit && index < 5) setTimeout(() => inputRefs.current[index + 1]?.focus(), 20);
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        setTimeout(() => inputRefs.current[index - 1]?.focus(), 20);
      } else {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    } else if (e.key === "Enter" && otpValue.length === 6) {
      handleVerifyOtp();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const digits = pasted.split("");
    const newOtp = Array.from({ length: 6 }, (_, i) => digits[i] || "");
    setOtp(newOtp);
    const nextFocus = Math.min(pasted.length, 5);
    setTimeout(() => inputRefs.current[nextFocus]?.focus(), 20);
  };

  const handleVerifyOtp = async () => {
    const code = otpValue.trim();
    if (code.length !== 6) {
      setErrorMsg("Please enter all 6 digits of the verification code.");
      const firstEmpty = otp.findIndex((d) => !d);
      if (firstEmpty >= 0) inputRefs.current[firstEmpty]?.focus();
      return;
    }
    if (timeLeft <= 0) {
      setErrorMsg("The verification code has expired. Please request a new one.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    try {
      // Verify via RBAC Engine (validates SHA-256 OTP code hash & expiresAt)
      const rbacResult = await completeStudentMfaLogin(email, code);
      if (rbacResult.success) {
        if (typeof sessionStorage !== "undefined") {
          sessionStorage.removeItem("careersetu_pending_student_email");
          sessionStorage.removeItem("careersetu_pending_student_masked");
          sessionStorage.removeItem("careersetu_dev_otp");
          sessionStorage.removeItem("careersetu_pending_dev_otp");
        }
        toast.success(`Welcome to CareerSetu, ${rbacResult.user?.name || "Student"}! 🎉`);
        navigate({ to: "/dashboard" as any });
        return;
      }

      setAttempts((prev) => prev + 1);
      const msg = rbacResult.error || "The verification code is incorrect or expired.";
      if (msg.toLowerCase().includes("expired")) {
        setErrorMsg("Verification code has expired. Click 'Resend Code' to get a new one.");
      } else {
        const remaining = Math.max(0, 5 - (attempts + 1));
        setErrorMsg(`Incorrect code.${remaining > 0 ? ` ${remaining} attempts remaining.` : " Please request a new code."}`);
      }
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } catch (err: any) {
      setErrorMsg("An unexpected error occurred. Please try again.");
      console.error("[VerifyOtp] Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    setErrorMsg("");
    setOtp(["", "", "", "", "", ""]);
    try {
      const user = getUserByEmail(email);
      if (!user) {
        toast.error("User account not found. Please register again.");
        return;
      }
      const dispatch = await createAndDispatchMfaCode(user, user.email_verified ? "LOGIN" : "EMAIL_VERIFICATION");
      const activeOtp = dispatch.devOtp || getActiveDevOtpForEmail(email);
      if (activeOtp) {
        setDevOtp(activeOtp);
        if (typeof sessionStorage !== "undefined") {
          sessionStorage.setItem("careersetu_dev_otp", activeOtp);
          sessionStorage.setItem("careersetu_pending_dev_otp", activeOtp);
        }
      }
      setResendCooldown(45);
      setTimeLeft(600);
      setAttempts(0);
      toast.success("A fresh 6-digit verification code has been sent to your email.");
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch {
      toast.error("Failed to resend code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-background text-foreground relative overflow-hidden flex flex-col justify-between p-4 sm:p-8 antialiased">
      <div className="gradient-soft absolute inset-0 -z-10 opacity-70" />
      <div className="blueprint-grid absolute inset-0 -z-10 opacity-40" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 -z-10 size-[36rem] rounded-full bg-primary/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 -z-10 size-64 rounded-full bg-violet-500/10 blur-[80px] pointer-events-none" />

      <div className="mx-auto w-full max-w-md flex items-center justify-between pt-2">
        <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity" aria-label="CareerSetu home">
          <Logo />
        </Link>
        <Link
          to="/student/login"
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors rounded-xl px-3 py-1.5 hover:bg-accent"
        >
          <ArrowLeft className="size-3.5" />
          Back to Login
        </Link>
      </div>

      <div className="mx-auto w-full max-w-md py-6">
        <Card className="rounded-3xl p-6 sm:p-8 bg-card/90 border border-border/80 shadow-elegant backdrop-blur-xl">
          <div className="space-y-5">

            {/* Header */}
            <div className="flex items-center gap-4 pb-4 border-b border-border/70">
              <span className="grid size-12 place-items-center rounded-2xl gradient-brand text-primary-foreground shadow-glow shrink-0">
                <Mail className="size-5" />
              </span>
              <div>
                <h1 className="text-xl font-bold font-display text-foreground tracking-tight">Email Verification</h1>
                <p className="text-xs text-muted-foreground mt-0.5">Step 2 of 2 — Enter 6-digit security code</p>
              </div>
            </div>

            {/* Email notice */}
            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-1.5">
              <p className="text-xs text-muted-foreground leading-relaxed flex items-start gap-2">
                <Sparkles className="size-3.5 text-primary shrink-0 mt-0.5" />
                A single-use 6-digit code was sent to:
              </p>
              <p className="font-mono font-bold text-primary text-base tracking-widest pl-5">
                {maskedDisplay || "your@email.com"}
              </p>
              <p className="text-[11px] text-muted-foreground pl-5">
                Check your <span className="text-foreground font-medium">inbox and spam folder</span> for the verification code from CareerSetu AI.
              </p>
            </div>

            {/* Dev Mode Helper Banner — Shown when SMTP/Resend is not delivering real emails */}
            {devOtp && (
              <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 flex items-start gap-3">
                <span className="text-amber-500 text-lg leading-none mt-0.5">🔧</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-bold text-amber-500 dark:text-amber-400">
                      Dev Mode — Security Code Generated
                    </p>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300 font-semibold">
                      Local Testing
                    </span>
                  </div>
                  <p
                    className="font-mono text-2xl font-black tracking-[0.35em] text-amber-600 dark:text-amber-300 select-all cursor-pointer hover:opacity-85 transition-opacity"
                    onClick={() => {
                      const digits = devOtp.slice(0, 6).split("");
                      setOtp(Array.from({ length: 6 }, (_, i) => digits[i] || ""));
                      toast.success("Security code auto-filled!");
                      setTimeout(() => inputRefs.current[5]?.focus(), 50);
                    }}
                    title="Click to auto-fill"
                  >
                    {devOtp}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Click code to auto-fill. To receive real emails in your inbox, configure SMTP in <code className="font-mono text-[10px] bg-muted px-1 py-0.5 rounded">.env</code>.
                  </p>
                </div>
              </div>
            )}

            {/* OTP Input Grid */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs text-foreground font-semibold">6-Digit Verification Code</label>
                <span className={`text-[11px] font-mono font-medium tabular-nums ${timeLeft <= 60 ? "text-red-400" : "text-muted-foreground"}`}>
                  {timeLeft > 0 ? (
                    <>Expires in <strong className={timeLeft <= 60 ? "text-red-400" : "text-amber-400"}>{formatTimer(timeLeft)}</strong></>
                  ) : (
                    <span className="text-red-400 font-semibold">Code expired</span>
                  )}
                </span>
              </div>

              <div className="flex gap-2 sm:gap-3 justify-center" onPaste={handleOtpPaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={digit}
                    disabled={loading || timeLeft <= 0}
                    onChange={(e) => handleOtpInput(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onFocus={(e) => e.target.select()}
                    style={{
                      width: "100%",
                      maxWidth: "60px",
                      aspectRatio: "1",
                      borderRadius: "16px",
                      border: `2px solid ${digit ? "hsl(var(--primary))" : errorMsg && !digit ? "rgba(239,68,68,0.6)" : "hsl(var(--border))"}`,
                      background: digit ? "hsl(var(--primary) / 0.05)" : "hsl(var(--card) / 0.8)",
                      color: "hsl(var(--foreground))",
                      textAlign: "center",
                      fontSize: "1.5rem",
                      fontWeight: "900",
                      fontFamily: "monospace",
                      outline: "none",
                      transition: "all 0.15s ease",
                      opacity: (loading || timeLeft <= 0) ? 0.5 : 1,
                      cursor: (loading || timeLeft <= 0) ? "not-allowed" : "text",
                      boxShadow: digit ? "0 0 0 3px hsl(var(--primary) / 0.15)" : "none",
                    }}
                    onFocusCapture={(e) => {
                      e.currentTarget.style.borderColor = "hsl(var(--primary))";
                      e.currentTarget.style.boxShadow = "0 0 0 3px hsl(var(--primary) / 0.2)";
                    }}
                    onBlurCapture={(e) => {
                      const hasValue = e.currentTarget.value;
                      e.currentTarget.style.borderColor = hasValue ? "hsl(var(--primary))" : "hsl(var(--border))";
                      e.currentTarget.style.boxShadow = hasValue ? "0 0 0 3px hsl(var(--primary) / 0.15)" : "none";
                    }}
                    aria-label={`Digit ${index + 1}`}
                  />
                ))}
              </div>

              {errorMsg && (
                <div className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-xs text-red-400">
                  <AlertCircle className="size-3.5 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            {/* Verify Button */}
            <Button
              type="button"
              onClick={handleVerifyOtp}
              disabled={loading || otpValue.length !== 6 || timeLeft <= 0}
              className="w-full h-12 rounded-xl gradient-brand text-primary-foreground font-bold text-sm shadow-glow hover:opacity-95 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><Loader2 className="size-4 animate-spin mr-2" />Verifying Code...</>
              ) : (
                <><CheckCircle2 className="size-4 mr-2" />Verify &amp; Open Dashboard</>
              )}
            </Button>

            {/* Resend + Security */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Didn't receive the email?</span>
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendCooldown > 0 || loading}
                  className={`flex items-center gap-1.5 font-semibold transition-colors ${resendCooldown > 0 || loading ? "text-muted-foreground/50 cursor-not-allowed" : "text-primary hover:underline underline-offset-2 cursor-pointer"}`}
                >
                  <RefreshCw className={`size-3 ${loading ? "animate-spin" : ""}`} />
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
                </button>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-xl bg-accent/30 border border-border/50">
                <ShieldCheck className="size-3.5 text-muted-foreground shrink-0" />
                <p className="text-[11px] text-muted-foreground leading-tight">
                  This code expires in 10 minutes and can only be used once. Never share it with anyone.
                </p>
              </div>

              {attempts >= 3 && (
                <p className="text-[11px] text-center text-muted-foreground">
                  Having trouble?{" "}
                  <button
                    type="button"
                    onClick={() => navigate({ to: "/student/signup" as any })}
                    className="text-primary underline underline-offset-2 cursor-pointer"
                  >
                    Try registering again
                  </button>
                </p>
              )}
            </div>

          </div>
        </Card>
      </div>

      <footer className="text-center text-[11px] text-muted-foreground py-3">
        CareerSetu AI • End-to-end Encrypted Verification
      </footer>
    </div>
  );
}
