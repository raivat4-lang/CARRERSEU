import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Eye, EyeOff, KeyRound, Loader2, Lock, Mail, Moon, ShieldAlert, ShieldCheck, Sparkles, Sun } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initiateAdminLogin } from "@/lib/auth/rbac";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Administrator Sign In — CareerSetu AI" },
      { name: "description", content: "Restricted Administrative Gateway with Encrypted Database Verification and Email MFA." },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("raivats4@gmail.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your administrator email.");
      return;
    }

    setLoading(true);

    try {
      const result = await initiateAdminLogin(email, password);

      if (!result.success) {
        toast.error(result.error || "Invalid email or password.");
        setLoading(false);
        return;
      }

      // Store pending admin auth in sessionStorage
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.setItem("careersetu_pending_admin_email", email.trim().toLowerCase());
        sessionStorage.setItem("careersetu_pending_admin_masked", result.maskedEmail || "");
        // In dev mode (no SMTP), persist devOtp for the MFA verify screen
        if (result.devOtp) {
          sessionStorage.setItem("careersetu_dev_otp", result.devOtp);
        } else {
          sessionStorage.removeItem("careersetu_dev_otp");
        }
      }

      // If this is the initial first-time login requiring password setup
      if (result.requiresFirstSetup) {
        toast.info("First-time setup detected. A security authorization code has been sent to your email.");
        navigate({ to: "/admin/first-setup" as any });
        return;
      }

      toast.success("Administrator 2FA security code dispatched to your registered email.");
      navigate({ to: "/admin/verify-mfa" as any });
    } catch (err) {
      toast.error("An unexpected error occurred during administrative verification.");
    } finally {
      setLoading(false);
    }
  };

  const [showPassword, setShowPassword] = useState(false);

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
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle theme"
          onClick={() => {
            document.documentElement.classList.toggle("dark");
          }}
          className="rounded-xl size-9 text-muted-foreground hover:text-foreground"
        >
          <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
          <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-sky-400" />
        </Button>
      </div>

      <div className="mx-auto w-full max-w-md py-6">
        {/* 3-Stage Security Protocol Indicator */}
        <div className="mb-4 rounded-3xl bg-card/85 border border-border/80 p-4 space-y-2.5 backdrop-blur-xl shadow-soft">
          <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
            <span className="flex items-center gap-1.5 text-amber-500 font-bold">
              <ShieldCheck className="size-4" /> Tier-1 Administrator Gateway
            </span>
            <span className="text-[10px] uppercase tracking-wider font-mono bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full">
              Strict RBAC
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-[10px]">
            <div className="p-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-300 font-bold text-center">
              <div>1. Credentials</div>
              <div className="text-[9px] opacity-80 font-normal">Admin Email & Pass</div>
            </div>

            <div className="p-2.5 rounded-2xl bg-accent/40 border border-border/70 text-muted-foreground text-center">
              <div>2. Email 2FA</div>
              <div className="text-[9px] opacity-80">Security Code</div>
            </div>

            <div className="p-2.5 rounded-2xl bg-accent/40 border border-border/70 text-muted-foreground text-center">
              <div>3. Session</div>
              <div className="text-[9px] opacity-80">RBAC Token</div>
            </div>
          </div>
        </div>

        {/* Security Warning Banner */}
        <div className="mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 p-3.5 flex items-start gap-3 text-xs text-amber-600 dark:text-amber-300 backdrop-blur-md">
          <ShieldAlert className="size-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Restricted Administration Gateway</p>
            <p className="mt-0.5 text-muted-foreground leading-relaxed text-[11px]">
              Access restricted to verified administrators. Protected by SQL RBAC, PBKDF2 encryption, and Email MFA.
            </p>
          </div>
        </div>

        <Card className="rounded-3xl p-6 sm:p-8 bg-card/90 border border-border/80 shadow-elegant backdrop-blur-xl">
          <div className="space-y-5">
            <div className="flex items-center gap-3.5 pb-4 border-b border-border/70">
              <span className="grid size-12 place-items-center rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-xs shrink-0">
                <Lock className="size-5" />
              </span>
              <div>
                <h1 className="text-xl font-bold font-display text-foreground tracking-tight">Administrator Sign In</h1>
                <p className="text-xs text-muted-foreground mt-0.5">Step 1 of 2: Provide credentials</p>
              </div>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <Label className="text-xs text-foreground font-semibold mb-1.5 block">Administrator Email</Label>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@careersetu.ai"
                  className="rounded-xl h-11 text-xs sm:text-sm font-mono"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label className="text-xs text-foreground font-semibold">Admin Password</Label>
                  <Link
                    to="/admin/forgot-password"
                    className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline underline-offset-2 transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="rounded-xl h-11 text-xs sm:text-sm pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-1.5 rounded-lg hover:bg-accent/80 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-amber-600/25 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 cursor-pointer transition-all group"
                >
                  {loading ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-2" />
                      Verifying & Requesting 2FA Code...
                    </>
                  ) : (
                    <>
                      Sign In & Request 2FA Code
                      <ArrowRight className="size-4 ml-2 transition-transform duration-200 group-hover:translate-x-1" />
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* Quick Fill Helper */}
            <div className="pt-4 border-t border-border/70 text-center">
              <p className="text-[11px] text-muted-foreground mb-2 font-medium">Super Administrator Quick Fill:</p>
              <div className="flex justify-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEmail("raivats4@gmail.com");
                    setPassword("admin1234");
                    toast.info("Selected Super Admin (raivats4@gmail.com)");
                  }}
                  className="text-[11px] rounded-xl h-8 border-border text-foreground hover:bg-accent cursor-pointer"
                >
                  <KeyRound className="size-3 mr-1 text-amber-500" /> raivats4@gmail.com (admin1234)
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <div className="mt-5 flex flex-col items-center gap-2">
          <Link to="/student/login" className="text-xs text-muted-foreground hover:text-primary transition-colors">
            ← Back to Student Login
          </Link>
          <Link
            to="/admin/signup"
            className="text-xs text-amber-500 hover:text-amber-400 font-medium transition-colors flex items-center gap-1.5 py-1 px-3 rounded-lg hover:bg-amber-500/10 border border-amber-500/20"
          >
            <ShieldAlert className="size-3.5" />
            Create Admin Account / Request Access
          </Link>
        </div>
      </div>

      <footer className="text-center text-[11px] text-muted-foreground py-3">
        CareerSetu AI Platform Security System • Multi-Factor Authentication & RBAC Tier 1
      </footer>
    </div>
  );
}
