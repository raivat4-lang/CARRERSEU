import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { AlertCircle } from "lucide-react";

import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

import { EDUCATION_LEVELS, GENDERS, INDIAN_STATES, LANGUAGES } from "@/lib/options";

import {
  authenticateStudent,
  completeStudentMfaLogin,
  initiateStudentLogin,
  registerStudentUser,
  getUserByEmail,
  createAndDispatchMfaCode,
} from "@/lib/auth/rbac";

const title = "Sign In or Register — CareerSetu AI";
const description =
  "Access your CareerSetu AI career assessment, exam tracker, and customized study planner with secure multi-factor authentication.";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    mode: search["mode"] === "signup" ? ("signup" as const) : ("login" as const),
  }),
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: AuthPage,
});

const signupSchema = z.object({
  full_name: z.string().trim().min(2, "Enter your full name").max(80),
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(72),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9]{10}$/, "Enter a 10 digit phone number"),
  age: z.coerce.number().int().min(12, "Age must be 12 or above").max(60),
  gender: z.string().min(1, "Select your gender"),
  state: z.string().min(1, "Select your state"),
  city: z.string().trim().min(2, "Enter your city").max(60),
  current_education: z.string().min(1, "Select your current education"),
  preferred_language: z.string().min(1, "Select a language"),
});

// ─── Google Identity Services OAuth ───────────────────────────────────────
const GOOGLE_CLIENT_ID = import.meta.env["VITE_GOOGLE_CLIENT_ID"] as string | undefined;

function GoogleButton({ label }: { label: string }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showSetup, setShowSetup] = useState(false);

  const handleGoogleLogin = async () => {
    if (!GOOGLE_CLIENT_ID) {
      setShowSetup((v) => !v);
      return;
    }
    setLoading(true);
    try {
      await loadGsiScript();
      
      // Preferred: Modern OAuth 2.0 token client popup
      if (window.google?.accounts?.oauth2?.initTokenClient) {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: "email profile openid",
          callback: async (tokenResponse: any) => {
            if (tokenResponse.error) {
              if (tokenResponse.error !== "popup_closed_by_user") {
                toast.error(`Google sign-in error: ${tokenResponse.error}`);
              }
              setLoading(false);
              return;
            }
            try {
              const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
              });
              const payload = await res.json();
              if (!payload?.email) {
                toast.error("Google sign-in failed: could not read your email.");
                setLoading(false);
                return;
              }
              const { setCurrentUser } = await import("@/lib/auth/rbac");
              setCurrentUser({
                id: `google-${payload.sub}`,
                name: payload.name || payload.email.split("@")[0],
                full_name: payload.name || payload.email.split("@")[0],
                email: payload.email,
                password_hash: null,
                role: "STUDENT",
                is_active: true,
                status: "ACTIVE",
                email_verified: true,
                is_first_login: false,
                preferred_language: "english",
                created_at: new Date().toISOString(),
                registeredAt: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                lastActive: new Date().toISOString(),
              });
              toast.success(`Welcome, ${payload.name || payload.email}!`);
              navigate({ to: "/dashboard" });
            } catch (fetchErr: any) {
              toast.error("Could not fetch Google profile details.");
              setLoading(false);
            }
          },
          error_callback: (err: any) => {
            console.error("Google Auth error:", err);
            setLoading(false);
          },
        });
        client.requestAccessToken();
        return;
      }

      // Fallback: google.accounts.id OneTap / ID Token
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response: { credential: string }) => {
          const payload = parseGoogleJwt(response.credential);
          if (!payload?.email) {
            toast.error("Google sign-in failed: could not read your profile.");
            setLoading(false);
            return;
          }
          const { setCurrentUser } = await import("@/lib/auth/rbac");
          setCurrentUser({
            id: `google-${payload.sub}`,
            name: payload.name || payload.email.split("@")[0],
            full_name: payload.name || payload.email.split("@")[0],
            email: payload.email,
            password_hash: null,
            role: "STUDENT",
            is_active: true,
            status: "ACTIVE",
            email_verified: true,
            is_first_login: false,
            preferred_language: "english",
            created_at: new Date().toISOString(),
            registeredAt: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            lastActive: new Date().toISOString(),
          });
          toast.success(`Welcome, ${payload.name || payload.email}!`);
          navigate({ to: "/dashboard" });
        },
        context: "signin",
        ux_mode: "popup",
      });
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setLoading(false);
        }
      });
    } catch (err: any) {
      toast.error(err?.message || "Google sign-in failed.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        id="google-signin-btn"
        className="h-11 w-full rounded-2xl gap-2.5 font-medium border-border/80 hover:bg-accent/70 transition-all cursor-pointer shadow-xs"
        disabled={loading}
        onClick={handleGoogleLogin}
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <svg viewBox="0 0 24 24" className="size-4 shrink-0" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        )}
        {label}
      </Button>
      {showSetup && (
        <div className="rounded-2xl bg-amber-400/10 border border-amber-400/40 p-3.5 text-xs space-y-2 animate-fade-up">
          <p className="font-bold text-amber-300">🔧 Google OAuth Setup (one-time, ~2 min)</p>
          <ol className="text-amber-200/80 space-y-1.5 list-decimal list-inside leading-relaxed">
            <li>Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-100">Google Cloud Console → Credentials</a></li>
            <li>Click <strong>Create Credentials → OAuth 2.0 Client ID → Web Application</strong></li>
            <li>Add <code className="bg-amber-400/20 px-1 rounded">http://localhost:8080</code> to Authorized JavaScript Origins</li>
            <li>Copy the Client ID, add to <code className="bg-amber-400/20 px-1 rounded">.env</code>:<br/><code className="bg-amber-400/20 px-1 rounded block mt-1 font-mono">VITE_GOOGLE_CLIENT_ID=your_id</code></li>
            <li>Restart the dev server — Google login works instantly!</li>
          </ol>
        </div>
      )}
    </div>
  );
}

function loadGsiScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) { resolve(); return; }
    const existing = document.getElementById("gsi-client-script");
    if (existing) { existing.addEventListener("load", () => resolve()); return; }
    const script = document.createElement("script");
    script.id = "gsi-client-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load Google Sign-In. Check your internet connection."));
    document.head.appendChild(script);
  });
}

function parseGoogleJwt(token: string): Record<string, any> | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch { return null; }
}

declare global { interface Window { google: any; } }


function AuthPage() {
  const { mode } = useSearch({ from: "/auth" });
  const navigate = useNavigate();

  const [loginStep, setLoginStep] = useState<"CREDENTIALS" | "OTP">("CREDENTIALS");
  const [pendingEmail, setPendingEmail] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpCode, setOtpCode] = useState(""); // keep for backwards compat in OTP verify
  const [otpError, setOtpError] = useState("");
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [timeLeft, setTimeLeft] = useState(600);
  const [resendCooldown, setResendCooldown] = useState(45);

  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [devOtp, setDevOtp] = useState<string | undefined>();

  // Countdown timer for OTP
  useEffect(() => {
    if (loginStep !== "OTP" || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(timer);
  }, [loginStep, timeLeft]);

  // Resend cooldown timer
  useEffect(() => {
    if (loginStep !== "OTP" || resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((prev) => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(timer);
  }, [loginStep, resendCooldown]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Demo Login Handler
  function handleDemoLogin() {
    setDemoLoading(true);
    const res = authenticateStudent("aditi.kulkarni@gmail.com", "student123");
    if (res.success && res.user) {
      toast.success("Signed in as Demo Student (Aditi Kulkarni)!");
      navigate({ to: "/dashboard" });
    }
    setDemoLoading(false);
  }

  // Step 1: Submit Credentials -> Backend generates and emails OTP
  async function handleLoginSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    if (!email || !password) {
      toast.error("Please enter both your email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await initiateStudentLogin(email, password);
      if (res.success) {
        setPendingEmail(email.toLowerCase());
        setMaskedEmail(res.maskedEmail || email);
        setDevOtp(res.devOtp);
        setLoginStep("OTP");
        setTimeLeft(600);
        setResendCooldown(45);
        setOtp(["", "", "", "", "", ""]);
        setOtpCode("");
        setOtpError("");

        if (typeof sessionStorage !== "undefined") {
          sessionStorage.setItem("careersetu_pending_student_email", email.toLowerCase());
          sessionStorage.setItem("careersetu_pending_student_masked", res.maskedEmail || "");
        }

        toast.success(`Security verification code sent to ${res.maskedEmail || email}.`);
        setTimeout(() => otpRefs.current[0]?.focus(), 150);
      } else {
        toast.error(res.error || "Invalid credentials. Please verify your email and password.");
      }
    } catch {
      toast.error("An unexpected error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  }

  async function handleOtpVerify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const cleanOtp = otp.join("").trim();

    if (!cleanOtp || cleanOtp.length !== 6) {
      setOtpError("Please enter the complete 6-digit verification code.");
      return;
    }

    setLoading(true);
    setOtpError("");
    try {
      const result = await completeStudentMfaLogin(pendingEmail, cleanOtp);

      if (!result.success) {
        setOtpError(result.error || "The verification code is incorrect or has expired.");
        setOtp(["", "", "", "", "", ""]);
        setTimeout(() => otpRefs.current[0]?.focus(), 50);
        setLoading(false);
        return;
      }

      toast.success(`Welcome back, ${result.user?.name || "Student"}!`);
      navigate({ to: "/dashboard" });
    } catch {
      setOtpError("Verification error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResendCode() {
    if (resendCooldown > 0) return;

    const user = getUserByEmail(pendingEmail);
    if (!user) {
      toast.error("Session expired. Please sign in again.");
      setLoginStep("CREDENTIALS");
      return;
    }

    setLoading(true);
    setOtp(["", "", "", "", "", ""]);
    setOtpError("");
    try {
      const dispatch = await createAndDispatchMfaCode(user, "LOGIN");
      setTimeLeft(600);
      setResendCooldown(45);
      if (dispatch.devOtp) setDevOtp(dispatch.devOtp);
      toast.success("A fresh verification code has been dispatched to your email.");
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch {
      toast.error("Failed to resend code. Please try again in a few moments.");
    } finally {
      setLoading(false);
    }
  }

  // Signup Submit Handler
  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = Object.fromEntries(new FormData(e.currentTarget).entries());
    const parsed = signupSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        fieldErrors[String(issue.path[0])] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setLoading(true);

    const { email, password, ...meta } = parsed.data;

    try {
      const res = await registerStudentUser({
        email,
        password,
        name: meta.full_name,
        full_name: meta.full_name,
        phone: meta.phone,
        age: String(meta.age),
        gender: meta.gender,
        state: meta.state,
        city: meta.city,
        education: meta.current_education,
        current_education: meta.current_education,
        preferred_language: meta.preferred_language,
      });

      if (res.success && res.user) {
        setPendingEmail(email.toLowerCase());
        setMaskedEmail(email);
        setLoginStep("OTP");
        setTimeLeft(600);
        setResendCooldown(45);

        if (typeof sessionStorage !== "undefined") {
          sessionStorage.setItem("careersetu_pending_student_email", email.toLowerCase());
        }
        toast.success(`Account registered! Verification code sent to ${email}.`);
      } else {
        toast.error(res.error || "Could not complete registration.");
      }
    } catch {
      toast.error("Failed to complete registration.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh bg-background text-foreground relative overflow-hidden flex flex-col justify-between px-4 py-8 sm:py-12 antialiased">
      {/* Ambient background decorations */}
      <div className="gradient-soft absolute inset-0 -z-10 opacity-70" />
      <div className="blueprint-grid absolute inset-0 -z-10 opacity-40" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 -z-10 size-[36rem] rounded-full bg-primary/12 blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-20 right-1/4 -z-10 size-[24rem] rounded-full bg-violet/10 blur-[100px] pointer-events-none" />

      <div className="mx-auto w-full max-w-lg">
        <Link to="/" className="mb-6 flex justify-center transition-transform hover:scale-105" aria-label="CareerSetu home">
          <Logo size="lg" />
        </Link>

        {/* Demo Fast Access Banner */}
        <div className="mb-4 rounded-2xl bg-card/80 border border-primary/25 p-3.5 flex items-center justify-between text-xs sm:text-sm backdrop-blur-md shadow-soft">
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="size-4 text-primary" />
            </span>
            <span className="font-medium text-foreground text-xs sm:text-sm">
              Instant evaluation demo mode
            </span>
          </div>
          <Button
            size="sm"
            onClick={handleDemoLogin}
            disabled={demoLoading}
            className="gradient-brand text-primary-foreground text-xs rounded-xl h-8 px-3.5 shrink-0 shadow-glow font-semibold cursor-pointer"
          >
            {demoLoading ? <Loader2 className="size-3 animate-spin mr-1" /> : <UserCheck className="size-3.5 mr-1" />}
            Demo Login
          </Button>
        </div>

        <Card className="glass rounded-3xl p-6 sm:p-8 shadow-elegant border-border/80 backdrop-blur-xl">
          {/* STEP 2: EMAIL OTP VERIFICATION */}
          {loginStep === "OTP" ? (
            <div className="space-y-5 animate-fade-up">
              <div className="flex items-center justify-between pb-4 border-b border-border/80">
                <div className="flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-xs">
                    <Mail className="size-5 text-primary" />
                  </span>
                  <div>
                    <h1 className="text-xl font-bold font-display text-foreground">Email Security Code</h1>
                    <p className="text-xs text-muted-foreground">Step 2: Enter 6-digit verification code</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setLoginStep("CREDENTIALS"); setOtp(["","","","","",""]); setOtpError(""); }}
                  className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground rounded-xl cursor-pointer"
                >
                  <ArrowLeft className="size-3.5 mr-1" /> Back
                </Button>
              </div>

              {/* Dev-mode OTP helper banner — hidden when SMTP is live */}
              {devOtp && (
                <div className="rounded-2xl border border-amber-400/50 bg-amber-400/10 p-3.5 flex items-start gap-3">
                  <span className="text-amber-400 text-lg leading-none mt-0.5">🔧</span>
                  <div>
                    <p className="text-xs font-bold text-amber-300 mb-1">Dev Mode — OTP (no SMTP configured)</p>
                    <p className="font-mono text-2xl font-black tracking-[0.35em] text-amber-200 select-all">{devOtp}</p>
                    <p className="text-[10px] text-amber-400/70 mt-1">This banner is hidden when real email delivery is active.</p>
                  </div>
                </div>
              )}

              {/* Email dispatch notice */}
              <div className="p-3.5 rounded-2xl bg-accent/40 border border-border/70 text-xs space-y-1">
                <p className="text-muted-foreground">
                  A 6-digit single-use security code was generated on the backend and sent to:
                </p>
                <p className="font-mono font-bold text-primary text-sm tracking-wide">
                  {maskedEmail || pendingEmail}
                </p>
              </div>

              <form onSubmit={handleOtpVerify} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-xs font-semibold text-foreground">Enter 6-Digit Code</Label>
                    <span className={`text-[11px] font-mono tabular-nums ${timeLeft <= 60 ? "text-red-400" : "text-muted-foreground"}`}>
                      {timeLeft > 0 ? (
                        <>Expires in <strong className={timeLeft <= 60 ? "text-red-400" : "text-amber-500"}>{formatTimer(timeLeft)}</strong></>
                      ) : (
                        <span className="text-red-400 font-semibold">Code expired</span>
                      )}
                    </span>
                  </div>

                  {/* Segmented OTP boxes */}
                  <div
                    className="flex gap-2 sm:gap-2.5 justify-center"
                    onPaste={(e) => {
                      e.preventDefault();
                      const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
                      if (!pasted) return;
                      const digits = pasted.split("");
                      const newOtp = Array.from({ length: 6 }, (_, i) => digits[i] || "");
                      setOtp(newOtp);
                      setOtpError("");
                      setTimeout(() => otpRefs.current[Math.min(pasted.length, 5)]?.focus(), 20);
                    }}
                  >
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => { otpRefs.current[index] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={digit}
                        disabled={loading || timeLeft <= 0}
                        onChange={(e) => {
                          setOtpError("");
                          const val = e.target.value;
                          if (val.length > 1) {
                            const digits = val.replace(/\D/g, "").slice(0, 6).split("");
                            const newOtp = Array.from({ length: 6 }, (_, i) => digits[i] || "");
                            setOtp(newOtp);
                            setTimeout(() => otpRefs.current[Math.min(digits.length, 5)]?.focus(), 20);
                            return;
                          }
                          const d = val.replace(/\D/g, "");
                          const newOtp = [...otp]; newOtp[index] = d; setOtp(newOtp);
                          if (d && index < 5) setTimeout(() => otpRefs.current[index + 1]?.focus(), 20);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Backspace") {
                            if (!otp[index] && index > 0) {
                              const newOtp = [...otp]; newOtp[index - 1] = ""; setOtp(newOtp);
                              setTimeout(() => otpRefs.current[index - 1]?.focus(), 20);
                            } else { const newOtp = [...otp]; newOtp[index] = ""; setOtp(newOtp); }
                          } else if (e.key === "ArrowLeft" && index > 0) { otpRefs.current[index - 1]?.focus(); }
                            else if (e.key === "ArrowRight" && index < 5) { otpRefs.current[index + 1]?.focus(); }
                        }}
                        onFocus={(e) => e.target.select()}
                        style={{
                          width: "100%", maxWidth: "56px", aspectRatio: "1",
                          borderRadius: "14px",
                          border: `2px solid ${digit ? "hsl(var(--primary))" : otpError ? "rgba(239,68,68,0.6)" : "hsl(var(--border))"}`,
                          background: digit ? "hsl(var(--primary) / 0.05)" : "hsl(var(--background))",
                          color: "hsl(var(--foreground))",
                          textAlign: "center", fontSize: "1.4rem", fontWeight: "900",
                          fontFamily: "monospace", outline: "none",
                          transition: "all 0.15s ease",
                          opacity: (loading || timeLeft <= 0) ? 0.5 : 1,
                          boxShadow: digit ? "0 0 0 3px hsl(var(--primary) / 0.15)" : "none",
                        }}
                        onFocusCapture={(e) => {
                          e.currentTarget.style.borderColor = "hsl(var(--primary))";
                          e.currentTarget.style.boxShadow = "0 0 0 3px hsl(var(--primary) / 0.2)";
                        }}
                        onBlurCapture={(e) => {
                          const v = e.currentTarget.value;
                          e.currentTarget.style.borderColor = v ? "hsl(var(--primary))" : "hsl(var(--border))";
                          e.currentTarget.style.boxShadow = v ? "0 0 0 3px hsl(var(--primary) / 0.15)" : "none";
                        }}
                        aria-label={`Digit ${index + 1}`}
                      />
                    ))}
                  </div>

                  {otpError && (
                    <div className="mt-2.5 flex items-start gap-2 p-2.5 rounded-xl bg-red-500/10 border border-red-500/25 text-xs text-red-400">
                      <AlertCircle className="size-3.5 shrink-0 mt-0.5" />
                      <span>{otpError}</span>
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={loading || otp.join("").length !== 6 || timeLeft <= 0}
                  className="gradient-brand h-12 w-full rounded-2xl text-primary-foreground font-bold shadow-glow text-sm cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <><Loader2 className="mr-2 size-4 animate-spin" />Verifying Code...</>
                  ) : (
                    <><CheckCircle2 className="mr-2 size-4" />Verify &amp; Open Dashboard</>
                  )}
                </Button>

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                  <span>Didn't receive the email?</span>
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={resendCooldown > 0 || loading}
                    className={`flex items-center gap-1.5 font-semibold cursor-pointer transition-colors ${
                      resendCooldown > 0 ? "text-muted-foreground/60 cursor-not-allowed" : "text-primary hover:underline"
                    }`}
                  >
                    <RefreshCw className={`size-3 ${loading ? "animate-spin" : ""}`} />
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* STEP 1: LOGIN / SIGNUP TABS */
            <Tabs
              value={mode}
              onValueChange={(v) =>
                navigate({ to: "/auth", search: { mode: v === "signup" ? "signup" : "login" } })
              }
            >
              <TabsList className="grid w-full grid-cols-2 rounded-2xl p-1 bg-accent/60 h-12">
                <TabsTrigger value="login" className="rounded-xl font-semibold text-xs sm:text-sm">
                  Log in
                </TabsTrigger>
                <TabsTrigger value="signup" className="rounded-xl font-semibold text-xs sm:text-sm">
                  Sign up
                </TabsTrigger>
              </TabsList>

              {/* TAB 1: LOGIN */}
              <TabsContent value="login" className="mt-6 space-y-4">
                <div>
                  <h1 className="text-2xl font-bold font-display text-foreground">Welcome Back</h1>
                  <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                    Sign in to your student account with secure Email MFA.
                  </p>
                </div>

                <form className="space-y-4" onSubmit={handleLoginSubmit}>
                  <div className="space-y-1.5">
                    <Label htmlFor="login-email" className="text-xs font-semibold">Email Address</Label>
                    <Input
                      id="login-email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      defaultValue="aditi.kulkarni@gmail.com"
                      placeholder="you@example.com"
                      className="h-11 rounded-2xl bg-background border-border"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-password" className="text-xs font-semibold">Password</Label>
                    </div>
                    <Input
                      id="login-password"
                      name="password"
                      type="password"
                      required
                      autoComplete="current-password"
                      defaultValue="student123"
                      placeholder="••••••••"
                      className="h-11 rounded-2xl bg-background border-border"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="gradient-brand h-12 w-full rounded-2xl text-primary-foreground font-semibold shadow-glow hover:opacity-90 mt-2 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Generating & Sending Code...
                      </>
                    ) : (
                      <>
                        Continue to Email Verification
                        <ArrowRight className="ml-2 size-4" />
                      </>
                    )}
                  </Button>
                </form>

                <Divider />
                <GoogleButton label="Continue with Google" />
              </TabsContent>

              {/* TAB 2: SIGNUP */}
              <TabsContent value="signup" className="mt-6 space-y-4">
                <div>
                  <h1 className="text-2xl font-bold font-display text-foreground">Create Student Profile</h1>
                  <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                    Get AI-powered career recommendations and customized exam roadmaps.
                  </p>
                </div>

                <form className="space-y-4" onSubmit={handleSignup} noValidate>
                  <Field label="Full name" name="full_name" error={errors["full_name"]}>
                    <Input
                      id="full_name"
                      name="full_name"
                      placeholder="Aditi Kulkarni"
                      className="h-11 rounded-2xl bg-background border-border"
                    />
                  </Field>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Email" name="email" error={errors["email"]}>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        className="h-11 rounded-2xl bg-background border-border"
                      />
                    </Field>
                    <Field label="Password" name="password" error={errors["password"]}>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        placeholder="Min 6 characters"
                        className="h-11 rounded-2xl bg-background border-border"
                      />
                    </Field>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Phone number" name="phone" error={errors["phone"]}>
                      <Input
                        id="phone"
                        name="phone"
                        inputMode="numeric"
                        placeholder="9876543210"
                        className="h-11 rounded-2xl bg-background border-border"
                      />
                    </Field>
                    <Field label="Age" name="age" error={errors["age"]}>
                      <Input
                        id="age"
                        name="age"
                        inputMode="numeric"
                        placeholder="20"
                        className="h-11 rounded-2xl bg-background border-border"
                      />
                    </Field>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Gender" name="gender" error={errors["gender"]}>
                      <SelectField name="gender" placeholder="Select gender" options={GENDERS} />
                    </Field>
                    <Field label="State" name="state" error={errors["state"]}>
                      <SelectField
                        name="state"
                        placeholder="Select state"
                        options={INDIAN_STATES.map((s) => ({ value: s, label: s }))}
                      />
                    </Field>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="City" name="city" error={errors["city"]}>
                      <Input id="city" name="city" placeholder="Pune" className="h-11 rounded-2xl bg-background border-border" />
                    </Field>
                    <Field
                      label="Current education"
                      name="current_education"
                      error={errors["current_education"]}
                    >
                      <SelectField
                        name="current_education"
                        placeholder="Select level"
                        options={EDUCATION_LEVELS}
                      />
                    </Field>
                  </div>

                  <Field
                    label="Preferred language"
                    name="preferred_language"
                    error={errors["preferred_language"]}
                  >
                    <SelectField
                      name="preferred_language"
                      placeholder="Select language"
                      options={LANGUAGES}
                      defaultValue="english"
                    />
                  </Field>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="gradient-brand h-12 w-full rounded-2xl text-primary-foreground font-semibold shadow-glow hover:opacity-90 mt-2 cursor-pointer"
                  >
                    {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                    Create Profile & Send Security Code
                  </Button>
                </form>

                <Divider />
                <GoogleButton label="Sign up with Google" />
              </TabsContent>
            </Tabs>
          )}
        </Card>

        {/* Footer Navigation Links */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-2">
          <Link to="/" className="hover:text-foreground transition-colors">
            ← Back to home
          </Link>
          <Link to="/admin/login" className="text-amber-500 hover:text-amber-400 font-semibold flex items-center gap-1 transition-colors">
            <Lock className="size-3" /> Admin Gateway →
          </Link>
        </div>
      </div>

      <footer className="text-center text-[11px] text-muted-foreground py-4">
        Protected by Cryptographic PBKDF2 Password Hashing & Backend Email Security Code Verification
      </footer>
    </div>
  );
}

function Divider() {
  return (
    <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
      <span className="h-px flex-1 bg-border/80" />
      or
      <span className="h-px flex-1 bg-border/80" />
    </div>
  );
}

function Field({
  label,
  name,
  error,
  children,
}: {
  label: string;
  name: string;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name} className="text-xs font-semibold text-foreground">{label}</Label>
      {children}
      {error ? <p className="text-[11px] text-destructive font-medium">{error}</p> : null}
    </div>
  );
}

function SelectField({
  name,
  placeholder,
  options,
  defaultValue,
}: {
  name: string;
  placeholder: string;
  options: readonly { value: string; label: string }[];
  defaultValue?: string;
}) {
  const [value, setValue] = useState(defaultValue ?? "");
  return (
    <>
      <input type="hidden" name={name} value={value} />
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger id={name} className="h-11 w-full rounded-2xl bg-background border-border">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="max-h-72 rounded-2xl">
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value} className="rounded-xl">
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}
