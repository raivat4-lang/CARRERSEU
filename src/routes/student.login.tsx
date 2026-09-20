import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Eye, EyeOff, KeyRound, Loader2, Lock, Mail, Moon, ShieldAlert, Sparkles, Sun, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initiateStudentLogin } from "@/lib/auth/rbac";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/student/login")({
  head: () => ({
    meta: [
      { title: "Student Sign In — CareerSetu AI" },
      { name: "description", content: "Sign in to your CareerSetu student account with secure Email MFA verification." },
    ],
  }),
  component: StudentLoginPage,
});

function StudentLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please provide both email and password.");
      return;
    }

    setLoading(true);

    try {
      const result = await initiateStudentLogin(email, password);

      if (!result.success) {
        toast.error(result.error || "Invalid email or password.");
        setLoading(false);
        return;
      }

      // Store pending auth state for MFA screen
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.setItem("careersetu_pending_student_email", email.trim().toLowerCase());
        sessionStorage.setItem("careersetu_pending_student_masked", result.maskedEmail || "");
        if (result.devOtp) {
          sessionStorage.setItem("careersetu_dev_otp", result.devOtp);
          sessionStorage.setItem("careersetu_pending_dev_otp", result.devOtp);
        }
      }

      if (result.requiresVerification) {
        toast.info("Account pending verification — check your email for a 6-digit code.");
      } else {
        toast.success("Verification code sent — check your email.");
      }

      navigate({ to: "/student/verify-mfa" as any });
    } catch (err) {
      toast.error("An unexpected error occurred during login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-background text-foreground relative overflow-hidden flex flex-col justify-between p-4 sm:p-8 antialiased">
      {/* Ambient background decoration */}
      <div className="gradient-soft absolute inset-0 -z-10 opacity-70" />
      <div className="blueprint-grid absolute inset-0 -z-10 opacity-40" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 -z-10 size-[32rem] rounded-full bg-primary/15 blur-[120px] pointer-events-none" />

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
        {/* Security / MFA Notice */}
        <div className="mb-4 rounded-2xl bg-primary/10 border border-primary/25 p-3.5 flex items-start gap-3 text-xs text-primary backdrop-blur-md shadow-xs">
          <Sparkles className="size-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Backend Email 2FA Enabled</p>
            <p className="mt-0.5 text-muted-foreground leading-relaxed text-[11px]">
              Every sign-in dispatches a single-use 6-digit security code directly to your registered email address.
            </p>
          </div>
        </div>

        <Card className="rounded-3xl p-6 sm:p-8 bg-card/90 border border-border/80 shadow-elegant backdrop-blur-xl">
          <div className="space-y-5">
            <div className="flex items-center gap-3.5 pb-4 border-b border-border/70">
              <span className="grid size-12 place-items-center rounded-2xl gradient-brand text-primary-foreground shadow-glow shrink-0">
                <Mail className="size-5" />
              </span>
              <div>
                <h1 className="text-xl font-bold font-display text-foreground tracking-tight">Student Sign In</h1>
                <p className="text-xs text-muted-foreground mt-0.5">Step 1: Enter email & password</p>
              </div>
            </div>

            <form onSubmit={handleStudentLogin} className="space-y-4">
              <div>
                <Label className="text-xs text-foreground font-semibold mb-1.5 block">Student Email</Label>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@careersetu.ai"
                  className="rounded-xl h-11 text-xs sm:text-sm"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label className="text-xs text-foreground font-semibold">Password</Label>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    required
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
                  className="w-full h-11 rounded-xl gradient-brand text-primary-foreground font-bold text-xs sm:text-sm shadow-glow hover:opacity-95 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 cursor-pointer transition-all group"
                >
                  {loading ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-2" />
                      Verifying & Sending Security Code...
                    </>
                  ) : (
                    <>
                      Sign In & Request Email Code
                      <ArrowRight className="size-4 ml-2 transition-transform duration-200 group-hover:translate-x-1" />
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* Evaluation Quick Credentials */}
            <div className="pt-4 border-t border-border/70 text-center">
              <p className="text-[11px] text-muted-foreground mb-2.5 font-medium">Quick Demo Accounts:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEmail("aditi.kulkarni@gmail.com");
                    setPassword("student123");
                    toast.info("Loaded Aditi Kulkarni credentials");
                  }}
                  className="text-[11px] font-medium rounded-xl h-8 px-3 border-border/80 bg-card/75 text-foreground hover:bg-accent/80 hover:border-primary/40 cursor-pointer transition-all active:scale-95"
                >
                  <KeyRound className="size-3 mr-1.5 text-primary" /> Aditi (student123)
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEmail("rahul.sharma@gmail.com");
                    setPassword("student123");
                    toast.info("Loaded Rahul Sharma credentials");
                  }}
                  className="text-[11px] font-medium rounded-xl h-8 px-3 border-border/80 bg-card/75 text-foreground hover:bg-accent/80 hover:border-primary/40 cursor-pointer transition-all active:scale-95"
                >
                  <KeyRound className="size-3 mr-1.5 text-primary" /> Rahul (student123)
                </Button>
              </div>
            </div>

            {/* Registration Link */}
            <div className="pt-2 text-center text-xs text-muted-foreground">
              Don't have a student account yet?{" "}
              <Link to="/student/signup" className="text-primary font-semibold hover:underline underline-offset-2">
                Create Student Account
              </Link>
            </div>
          </div>
        </Card>

        {/* Link to Admin Gateway */}
        <div className="mt-5 text-center">
          <Link to="/admin/login" className="text-xs text-muted-foreground hover:text-amber-500 transition-colors inline-flex items-center gap-1">
            Looking for Administrator Gateway? Click here →
          </Link>
        </div>
      </div>

      <footer className="text-center text-[11px] text-muted-foreground py-3">
        CareerSetu AI Student Portal • Protected by PBKDF2 Encryption & Email MFA
      </footer>
    </div>
  );
}
