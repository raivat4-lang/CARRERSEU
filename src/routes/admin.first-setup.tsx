import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, KeyRound, Loader2, Lock, ShieldCheck, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { completeAdminFirstSetup, initiateAdminFirstSetup, getUserByEmail } from "@/lib/auth/rbac";
import { evaluatePasswordStrength, maskEmail } from "@/lib/auth/crypto";

export const Route = createFileRoute("/admin/first-setup")({
  head: () => ({
    meta: [
      { title: "First-Time Administrator Setup — CareerSetu AI" },
      { name: "description", content: "Establish initial administrator credentials with secure authorization." },
    ],
  }),
  component: AdminFirstSetupPage,
});

function AdminFirstSetupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("tysonfire13@gmail.com");
  const [securityCode, setSecurityCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  useEffect(() => {
    let stored = "";
    if (typeof sessionStorage !== "undefined") {
      stored = sessionStorage.getItem("careersetu_pending_admin_email") || "";
      // Read dev OTP from the unified key set by admin.login.tsx
      const devOtpStored = sessionStorage.getItem("careersetu_dev_otp");
      if (devOtpStored) {
        setDevOtp(devOtpStored);
      }
    }
    if (!stored) stored = "tysonfire13@gmail.com";
    setEmail(stored);
  }, []);

  const passwordStrength = evaluatePasswordStrength(password);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!securityCode || securityCode.trim().length !== 6) {
      toast.error("Please enter the 6-digit authorization security code.");
      return;
    }

    if (!password || password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (!passwordStrength.isValid) {
      toast.error("Please create a stronger password meeting security criteria.");
      return;
    }

    setLoading(true);

    try {
      const result = await completeAdminFirstSetup(email, securityCode.trim(), password);

      if (!result.success) {
        toast.error(result.error || "Setup verification failed.");
        setLoading(false);
        return;
      }

      toast.success("Administrator password established successfully! Logging you in...");
      navigate({ to: "/admin/dashboard" as any });
    } catch (err) {
      toast.error("An error occurred during first-time administrator setup.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    const res = await initiateAdminFirstSetup(email);
    if (res.isDev && typeof sessionStorage !== "undefined") {
      const devRecord = sessionStorage.getItem("careersetu_latest_dev_email");
      if (devRecord) {
        try {
          const parsed = JSON.parse(devRecord);
          setDevOtp(parsed.otpCode);
        } catch {}
      }
    }
    toast.success("New authorization security code dispatched.");
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
      </div>

      <div className="mx-auto w-full max-w-md py-6">
        {/* Security Alert Header */}
        <div className="mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 p-3.5 flex items-start gap-3 text-xs text-amber-600 dark:text-amber-300">
          <Sparkles className="size-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">First-Time Administrator Setup</p>
            <p className="mt-0.5 text-muted-foreground leading-relaxed text-[11px]">
              Set up your personal administrator password. No permanent hardcoded password is used.
            </p>
          </div>
        </div>

        <Card className="rounded-3xl p-6 sm:p-8 bg-card/85 border border-border/80 shadow-elegant backdrop-blur-xl">
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-border/70">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  <KeyRound className="size-5" />
                </span>
                <div>
                  <h1 className="text-lg font-bold font-display text-foreground">Create Admin Password</h1>
                  <p className="text-xs text-muted-foreground">Account: {email}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate({ to: "/admin/login" as any })}
                className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground rounded-xl"
              >
                <ArrowLeft className="size-3.5 mr-1" /> Back
              </Button>
            </div>

            {/* Security Dispatch Notice */}
            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-1.5 text-xs">
              <p className="text-muted-foreground leading-relaxed">
                A one-time setup code was generated on the backend and dispatched to your administrator email:
              </p>
              <p className="font-mono font-bold text-amber-600 dark:text-amber-400 text-sm tracking-wide">
                {maskEmail(email)}
              </p>
            </div>

            <form onSubmit={handleSetup} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label className="text-xs text-foreground font-semibold">6-Digit Authorization Code</Label>
                  <button
                    type="button"
                    onClick={handleResend}
                    className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                  >
                    Resend Code
                  </button>
                </div>
                <Input
                  type="text"
                  required
                  maxLength={6}
                  value={securityCode}
                  onChange={(e) => setSecurityCode(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="• • • • • •"
                  className="rounded-xl h-11 text-center text-lg tracking-[0.4em] font-mono font-bold"
                />
              </div>

              <div>
                <Label className="text-xs text-foreground font-semibold mb-1.5 block">New Administrator Password</Label>
                <Input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="rounded-xl h-10 text-xs"
                />
              </div>

              <div>
                <Label className="text-xs text-foreground font-semibold mb-1.5 block">Confirm Administrator Password</Label>
                <Input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="rounded-xl h-10 text-xs"
                />
              </div>

              {/* Password Strength Meter */}
              {password && (
                <div className="p-3 rounded-xl bg-accent/40 border border-border/80 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-[11px]">Password Security:</span>
                    <span className={`text-[11px] font-bold ${passwordStrength.isValid ? "text-emerald-500" : "text-amber-500"}`}>
                      {passwordStrength.isValid ? "Strong Password" : "Requirements Pending"}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full ${passwordStrength.score >= 1 ? "bg-red-500" : "bg-transparent"}`} />
                    <div className={`h-full ${passwordStrength.score >= 2 ? "bg-amber-500" : "bg-transparent"}`} />
                    <div className={`h-full ${passwordStrength.score >= 3 ? "bg-blue-500" : "bg-transparent"}`} />
                    <div className={`h-full ${passwordStrength.score >= 4 ? "bg-emerald-500" : "bg-transparent"}`} />
                  </div>
                  {!passwordStrength.isValid && passwordStrength.feedback.length > 0 && (
                    <p className="text-[10px] text-muted-foreground leading-tight">
                      {passwordStrength.feedback[0]}
                    </p>
                  )}
                </div>
              )}

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={loading || !passwordStrength.isValid || securityCode.length !== 6}
                  className="w-full h-11 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/20 cursor-pointer disabled:opacity-50 transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-2" />
                      Hashing Password with PBKDF2 & Activating...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="size-4 mr-2" />
                      Establish Password & Open Admin Dashboard
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </div>

      <footer className="text-center text-[11px] text-muted-foreground py-3">
        CareerSetu AI Platform Security System • Multi-Factor Authentication & RBAC Tier 1
      </footer>
    </div>
  );
}
