import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, AlertCircle, CheckCircle2, Loader2, Mail, RefreshCw, ShieldAlert, ShieldCheck } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { completeAdminMfaLogin, getUserByEmail, createAndDispatchMfaCode } from "@/lib/auth/rbac";
import { maskEmail } from "@/lib/auth/crypto";

export const Route = createFileRoute("/admin/verify-mfa")({
  head: () => ({
    meta: [
      { title: "Administrator Verification — CareerSetu AI" },
      { name: "description", content: "Enter the 6-digit administrator MFA security code to access the console." },
    ],
  }),
  component: AdminVerifyMfaPage,
});

function AdminVerifyMfaPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [maskedDisplay, setMaskedDisplay] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);
  const [resendCooldown, setResendCooldown] = useState(45);
  const [errorMsg, setErrorMsg] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]); 

  useEffect(() => {
    let storedEmail = "";
    if (typeof sessionStorage !== "undefined") {
      storedEmail = sessionStorage.getItem("careersetu_pending_admin_email") || "";
      const storedDevOtp = sessionStorage.getItem("careersetu_dev_otp");
      if (storedDevOtp) {
        setDevOtp(storedDevOtp);
      }
    }
    if (!storedEmail) {
      navigate({ to: "/admin/login" as any });
      return;
    }
    setEmail(storedEmail);
    setMaskedDisplay(maskEmail(storedEmail));
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  }, [navigate]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Resend cooldown countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((prev) => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const otpValue = otp.join("");



  const handleOtpInput = (index: number, value: string) => {
    setErrorMsg("");
    if (value.length > 1) {
      const digits = value.replace(/\D/g, "").slice(0, 6).split("");
      const newOtp = Array.from({ length: 6 }, (_, i) => digits[i] || "");
      setOtp(newOtp);
      setTimeout(() => inputRefs.current[Math.min(digits.length, 5)]?.focus(), 20);
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
    setTimeout(() => inputRefs.current[Math.min(pasted.length, 5)]?.focus(), 20);
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
      setErrorMsg("Verification code has expired. Please request a new one.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    try {
      const result = await completeAdminMfaLogin(email, code);
      if (!result.success) {
        setErrorMsg(result.error || "The verification code is incorrect or expired.");
        setOtp(["", "", "", "", "", ""]);
        setTimeout(() => inputRefs.current[0]?.focus(), 50);
        setLoading(false);
        return;
      }
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.removeItem("careersetu_pending_admin_email");
        sessionStorage.removeItem("careersetu_dev_otp");
      }
      toast.success("Administrator session authorized. Redirecting to console...");
      navigate({ to: "/admin" as any });
    } catch {
      setErrorMsg("An error occurred while validating security credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    const user = getUserByEmail(email);
    if (!user) {
      toast.error("No administrator account found. Please return to login.");
      navigate({ to: "/admin/login" as any });
      return;
    }
    setLoading(true);
    setErrorMsg("");
    setOtp(["", "", "", "", "", ""]);
    try {
      const dispatch = await createAndDispatchMfaCode(user, "ADMIN_LOGIN");
      if (dispatch.devOtp) {
        setDevOtp(dispatch.devOtp);
        if (typeof sessionStorage !== "undefined") {
          sessionStorage.setItem("careersetu_dev_otp", dispatch.devOtp);
        }
      }
      setResendCooldown(45);
      setTimeLeft(600);
      toast.success("A fresh 2FA code has been dispatched to your administrator email.");
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch {
      toast.error("Failed to resend code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-background text-foreground relative overflow-hidden flex flex-col justify-between p-4 sm:p-8 antialiased">
      {/* Ambient background decoration */}
      <div className="gradient-soft absolute inset-0 -z-10 opacity-70" />
      <div className="blueprint-grid absolute inset-0 -z-10 opacity-40" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 -z-10 size-[32rem] rounded-full bg-amber-500/10 blur-[120px] pointer-events-none" />

      {/* Top Header */}
      <div className="mx-auto w-full max-w-md flex items-center justify-between pt-2">
        <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity" aria-label="CareerSetu home">
          <Logo />
        </Link>
        <Link
          to="/admin/login"
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors rounded-xl px-3 py-1.5 hover:bg-accent"
        >
          <ArrowLeft className="size-3.5" />
          Back to Login
        </Link>
      </div>

      <div className="mx-auto w-full max-w-md py-6">
        {/* 3-Stage Security Protocol Indicator */}
        <div className="mb-4 rounded-3xl bg-card/85 border border-border/80 p-4 space-y-2.5 backdrop-blur-xl shadow-soft">
          <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
            <span className="flex items-center gap-1.5 text-amber-500 font-bold">
              <ShieldCheck className="size-4" /> Secure Administrator Sign-In
            </span>
            <span className="text-[10px] uppercase tracking-wider font-mono bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full">
              Tier-1 RBAC
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-[10px]">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-center">
              <div>✓ 1. Credentials</div>
              <div className="text-[9px] opacity-80">Verified</div>
            </div>

            <div className="p-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-300 font-bold text-center">
              <div>2. Email 2FA</div>
              <div className="text-[9px] opacity-80 font-normal">Enter Code</div>
            </div>

            <div className="p-2.5 rounded-2xl bg-accent/40 border border-border/70 text-muted-foreground text-center">
              <div>3. Session</div>
              <div className="text-[9px] opacity-80">Issue Token</div>
            </div>
          </div>
        </div>

        <Card className="rounded-3xl p-6 sm:p-8 bg-card/85 border border-border/80 shadow-elegant backdrop-blur-xl">
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-border/70">
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-xs">
                  <Mail className="size-5" />
                </span>
                <div>
                  <h1 className="text-lg font-bold font-display text-foreground">Administrator Verification</h1>
                  <p className="text-xs text-muted-foreground">Step 2 of 2: Multi-Factor Authentication</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate({ to: "/admin/login" as any })}
                className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground rounded-xl"
              >
                <ArrowLeft className="size-3.5 mr-1" /> Back
              </Button>
            </div>

            {/* Notification Notice */}
            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-1.5 text-xs">
              <p className="text-muted-foreground leading-relaxed">
                A security code was generated on the backend and dispatched to the administrator's security email:
              </p>
              <p className="font-mono font-bold text-amber-600 dark:text-amber-400 text-sm tracking-wide">
                {maskedDisplay || "t*********3@gmail.com"}
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
                <label className="text-xs text-foreground font-semibold">6-Digit Security Code</label>
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
                      border: `2px solid ${digit ? "hsl(38 92% 50%)" : errorMsg && !digit ? "rgba(239,68,68,0.6)" : "hsl(var(--border))"}`,
                      background: digit ? "rgba(245,158,11,0.08)" : "hsl(var(--card) / 0.8)",
                      color: "hsl(var(--foreground))",
                      textAlign: "center",
                      fontSize: "1.5rem",
                      fontWeight: "900",
                      fontFamily: "monospace",
                      outline: "none",
                      transition: "all 0.15s ease",
                      opacity: (loading || timeLeft <= 0) ? 0.5 : 1,
                      cursor: (loading || timeLeft <= 0) ? "not-allowed" : "text",
                      boxShadow: digit ? "0 0 0 3px rgba(245,158,11,0.2)" : "none",
                    }}
                    onFocusCapture={(e) => {
                      e.currentTarget.style.borderColor = "hsl(38 92% 50%)";
                      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(245,158,11,0.25)";
                    }}
                    onBlurCapture={(e) => {
                      const hasValue = e.currentTarget.value;
                      e.currentTarget.style.borderColor = hasValue ? "hsl(38 92% 50%)" : "hsl(var(--border))";
                      e.currentTarget.style.boxShadow = hasValue ? "0 0 0 3px rgba(245,158,11,0.2)" : "none";
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
              className="w-full h-12 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md shadow-amber-600/20 cursor-pointer disabled:opacity-50 transition-all"
            >
              {loading ? (
                <><Loader2 className="size-4 animate-spin mr-2" />Authorizing Administrator Session...</>
              ) : (
                <><ShieldCheck className="size-4 mr-2" />Verify Code &amp; Enter Admin Console</>
              )}
            </Button>

            {/* Resend */}
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
              <span>Didn't receive the security code?</span>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendCooldown > 0 || loading}
                className={`flex items-center gap-1.5 font-semibold transition-colors ${resendCooldown > 0 || loading ? "text-muted-foreground/50 cursor-not-allowed" : "text-amber-600 dark:text-amber-400 hover:underline underline-offset-2 cursor-pointer"}`}
              >
                <RefreshCw className={`size-3 ${loading ? "animate-spin" : ""}`} />
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Security Code"}
              </button>
            </div>
          </div>
        </Card>
      </div>

      <footer className="text-center text-[11px] text-muted-foreground py-3">
        CareerSetu AI Platform Security System • Multi-Factor Authentication & RBAC Tier 1
      </footer>
    </div>
  );
}
