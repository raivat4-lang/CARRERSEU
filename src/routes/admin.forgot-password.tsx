import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, CheckCircle2, KeyRound, Loader2, Lock, Mail, ShieldAlert, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initiateAdminForgotPassword, completeAdminPasswordReset } from "@/lib/auth/rbac";
import { evaluatePasswordStrength, maskEmail } from "@/lib/auth/crypto";

export const Route = createFileRoute("/admin/forgot-password")({
  head: () => ({
    meta: [
      { title: "Administrator Password Recovery — CareerSetu AI" },
      { name: "description", content: "Recover and reset your administrator account password using secure security code verification." },
    ],
  }),
  component: AdminForgotPasswordPage,
});

type ForgotStep = "REQUEST_CODE" | "VERIFY_AND_RESET" | "SUCCESS";

function AdminForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<ForgotStep>("REQUEST_CODE");
  const [email, setEmail] = useState("tysonfire13@gmail.com");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  const passwordStrength = evaluatePasswordStrength(newPassword);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your administrator email address.");
      return;
    }

    setLoading(true);

    try {
      const result = await initiateAdminForgotPassword(email);
      setMaskedEmail(result.maskedEmail || email);

      // In dev mode (no SMTP), capture the OTP so the user can enter it
      if (result.devOtp) {
        setDevOtp(result.devOtp);
        if (typeof sessionStorage !== "undefined") {
          sessionStorage.setItem("careersetu_dev_otp", result.devOtp);
        }
      }

      toast.info("If an administrator account exists for this email, a security code has been sent.");
      setStep("VERIFY_AND_RESET");
    } catch (err) {
      toast.error("An error occurred while requesting password recovery.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetCode || resetCode.trim().length !== 6) {
      toast.error("Please enter the 6-digit password reset security code.");
      return;
    }

    if (!newPassword || newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    if (!passwordStrength.isValid) {
      toast.error("Please choose a stronger password meeting security guidelines.");
      return;
    }

    setLoading(true);

    try {
      const result = await completeAdminPasswordReset(email, resetCode.trim(), newPassword);

      if (!result.success) {
        toast.error(result.error || "Password reset verification failed.");
        setLoading(false);
        return;
      }

      toast.success("Administrator password updated! All previous sessions revoked.");
      setStep("SUCCESS");
    } catch (err) {
      toast.error("Failed to reset password.");
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
      </div>

      <div className="mx-auto w-full max-w-md py-6">
        {/* Security Header Alert */}
        <div className="mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 p-3.5 flex items-start gap-3 text-xs text-amber-600 dark:text-amber-300 backdrop-blur-md">
          <ShieldAlert className="size-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Administrator Password Recovery</p>
            <p className="mt-0.5 text-muted-foreground leading-relaxed text-[11px]">
              Requires single-use security code dispatched to your registered security email.
            </p>
          </div>
        </div>

        <Card className="rounded-3xl p-6 sm:p-8 bg-card/85 border border-border/80 shadow-elegant backdrop-blur-xl">
          {/* STEP 1: Request Code */}
          {step === "REQUEST_CODE" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-border/70">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                    <Mail className="size-5" />
                  </span>
                  <div>
                    <h1 className="text-lg font-bold font-display text-foreground">Forgot Password</h1>
                    <p className="text-xs text-muted-foreground">Step 1: Enter registered admin email</p>
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

              <form onSubmit={handleRequestCode} className="space-y-4">
                <div>
                  <Label className="text-xs text-foreground font-semibold mb-1.5 block">Administrator Email</Label>
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@careersetu.ai"
                    className="rounded-xl h-10 text-xs font-mono"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/20 cursor-pointer transition-all"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="size-4 animate-spin mr-2" />
                        Verifying & Generating Security Code...
                      </>
                    ) : (
                      <>
                        Send Password Reset Security Code
                        <ArrowRight className="size-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 2: Verify Code & Enter New Password */}
          {step === "VERIFY_AND_RESET" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-border/70">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                    <KeyRound className="size-5" />
                  </span>
                  <div>
                    <h2 className="text-lg font-bold font-display text-foreground">Reset Password</h2>
                    <p className="text-xs text-muted-foreground">Step 2: Enter code & new password</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep("REQUEST_CODE")}
                  className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground rounded-xl"
                >
                  <ArrowLeft className="size-3.5 mr-1" /> Back
                </Button>
              </div>

              {/* Dev-mode OTP helper banner — only shown when SMTP is not configured */}
              {devOtp && (
                <div className="rounded-2xl border border-amber-400/50 bg-amber-400/10 p-3.5 flex items-start gap-3">
                  <span className="text-amber-400 text-lg leading-none mt-0.5">🔧</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-amber-300 mb-1">Dev Mode — No SMTP configured</p>
                    <p
                      className="font-mono text-2xl font-black tracking-[0.35em] text-amber-200 select-all cursor-pointer hover:text-amber-100 transition-colors"
                      onClick={() => {
                        setResetCode(devOtp);
                        setDevOtp(null);
                        if (typeof sessionStorage !== "undefined") sessionStorage.removeItem("careersetu_dev_otp");
                      }}
                      title="Click to auto-fill"
                    >
                      {devOtp}
                    </p>
                    <p className="text-[10px] text-amber-400/70 mt-1">Click the code to auto-fill. Hidden when real email delivery is active.</p>
                  </div>
                </div>
              )}

              {/* Security Dispatch Notice */}
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-1.5 text-xs">
                <p className="text-muted-foreground leading-relaxed">
                  A 6-digit password reset security code was generated on the backend and sent to:
                </p>
                <p className="font-mono font-bold text-amber-600 dark:text-amber-400 text-sm tracking-wide">
                  {maskEmail(email)}
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <Label className="text-xs text-foreground font-semibold mb-1.5 block">
                    6-Digit Password Reset Code
                  </Label>
                  <Input
                    type="text"
                    required
                    maxLength={6}
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="• • • • • •"
                    className="rounded-xl h-11 text-center text-lg tracking-[0.4em] font-mono font-bold"
                  />
                </div>

                <div>
                  <Label className="text-xs text-foreground font-semibold mb-1.5 block">New Password</Label>
                  <Input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="rounded-xl h-10 text-xs"
                  />
                </div>

                <div>
                  <Label className="text-xs text-foreground font-semibold mb-1.5 block">Confirm New Password</Label>
                  <Input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="rounded-xl h-10 text-xs"
                  />
                </div>

                {/* Password Strength */}
                {newPassword && (
                  <div className="p-3 rounded-xl bg-accent/40 border border-border/80 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-[11px]">Strength:</span>
                      <span className={`text-[11px] font-bold ${passwordStrength.isValid ? "text-emerald-500" : "text-amber-500"}`}>
                        {passwordStrength.isValid ? "Strong Password" : "Criteria Pending"}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full ${passwordStrength.score >= 1 ? "bg-red-500" : "bg-transparent"}`} />
                      <div className={`h-full ${passwordStrength.score >= 2 ? "bg-amber-500" : "bg-transparent"}`} />
                      <div className={`h-full ${passwordStrength.score >= 3 ? "bg-blue-500" : "bg-transparent"}`} />
                      <div className={`h-full ${passwordStrength.score >= 4 ? "bg-emerald-500" : "bg-transparent"}`} />
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={loading || !passwordStrength.isValid || resetCode.length !== 6}
                    className="w-full h-11 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/20 cursor-pointer disabled:opacity-50 transition-all"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="size-4 animate-spin mr-2" />
                        Updating Password & Revoking Sessions...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="size-4 mr-2" />
                        Reset Password & Secure Account
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 3: Success */}
          {step === "SUCCESS" && (
            <div className="py-6 text-center space-y-4">
              <div className="size-16 rounded-3xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-glow">
                <CheckCircle2 className="size-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-foreground">Password Reset Successful</h3>
                <p className="text-xs text-muted-foreground">
                  Your administrator password has been updated and all previous sessions have been invalidated.
                </p>
              </div>
              <Button
                onClick={() => navigate({ to: "/admin/login" as any })}
                className="w-full h-11 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/20 cursor-pointer mt-4"
              >
                Proceed to Administrator Sign In
              </Button>
            </div>
          )}
        </Card>
      </div>

      <footer className="text-center text-[11px] text-muted-foreground py-3">
        CareerSetu AI Platform Security System • Multi-Factor Authentication & RBAC Tier 1
      </footer>
    </div>
  );
}
