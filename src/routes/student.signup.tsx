import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Loader2, RefreshCw, ShieldCheck, Sparkles, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { registerStudentUser, resetUsersToTrialOnly } from "@/lib/auth/rbac";
import { evaluatePasswordStrength } from "@/lib/auth/crypto";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/student/signup")({
  head: () => ({
    meta: [
      { title: "Student Registration — CareerSetu AI" },
      { name: "description", content: "Create your CareerSetu student account and start personalized career discovery." },
    ],
  }),
  component: StudentSignupPage,
});

function StudentSignupPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [duplicateEmail, setDuplicateEmail] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    age: "18",
    gender: "Male",
    state: "Maharashtra",
    city: "Pune",
    education: "Class 12 (Science)",
    preferred_language: "English",
  });

  const passwordStrength = evaluatePasswordStrength(formData.password);

  // Clears all non-trial user registrations & resets to preseeded trial accounts
  const handleClearTestData = () => {
    resetUsersToTrialOnly();
    setDuplicateEmail(null);
    toast.success("All test accounts removed. System reset to pre-seeded trial accounts.");
    window.location.reload();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (!passwordStrength.isValid) {
      toast.error("Please create a stronger password (minimum 10 characters with uppercase, lowercase, and numbers).");
      return;
    }

    setLoading(true);

    try {
      const result = await registerStudentUser({
        name: formData.name.trim(),
        full_name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: formData.phone,
        age: formData.age,
        gender: formData.gender,
        state: formData.state,
        city: formData.city,
        education: formData.education,
        current_education: formData.education,
        preferred_language: formData.preferred_language,
      });

      if (!result.success) {
        if (result.error?.includes("already exists")) {
          setDuplicateEmail(formData.email.trim().toLowerCase());
        }
        toast.error(result.error || "Registration failed. Please try again.");
        setLoading(false);
        return;
      }

      const cleanEmail = formData.email.trim().toLowerCase();

      // Store the student's email in session for the verify screen
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.setItem("careersetu_pending_student_email", cleanEmail);
        sessionStorage.setItem("careersetu_pending_student_masked", result.maskedEmail || "");
        if (result.devOtp) {
          sessionStorage.setItem("careersetu_dev_otp", result.devOtp);
          sessionStorage.setItem("careersetu_pending_dev_otp", result.devOtp);
        }
      }

      toast.success("Account created! Check your inbox for the 6-digit verification code.");
      navigate({ to: "/student/verify-mfa" as any });
    } catch (err) {
      toast.error("An unexpected error occurred. Please try again.");
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
      <div className="mx-auto w-full max-w-xl flex items-center justify-between pt-2">
        <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity" aria-label="CareerSetu home">
          <Logo />
        </Link>
        <button
          type="button"
          onClick={handleClearTestData}
          title="Remove all registered test accounts and reset to default trial state"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1 rounded-lg border border-border/60 hover:bg-accent"
        >
          <RefreshCw className="size-3" />
          Reset Accounts
        </button>
      </div>

      {/* Duplicate email banner — shown when trying to re-register an existing account */}
      {duplicateEmail && (
        <div className="mx-auto w-full max-w-xl">
          <div className="rounded-2xl border border-amber-400/50 bg-amber-400/10 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-amber-300 mb-0.5">Account Already Exists</p>
              <p className="text-xs text-amber-200/80">
                <span className="font-mono font-bold">{duplicateEmail}</span> is already registered.
                If this is a test account, clear local data and try again.
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate({ to: "/student/login" as any })}
                className="h-8 text-xs rounded-xl border-amber-400/50 text-amber-300 hover:bg-amber-400/10"
              >
                Sign In Instead
              </Button>
              <Button
                size="sm"
                onClick={handleClearTestData}
                className="h-8 text-xs rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold"
              >
                <RefreshCw className="size-3 mr-1" />
                Clear &amp; Re-register
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto w-full max-w-xl py-6">
        <Card className="rounded-3xl p-6 sm:p-8 bg-card/90 border border-border/80 shadow-elegant backdrop-blur-xl">
          <div className="space-y-6">
            <div className="flex items-center gap-3.5 pb-4 border-b border-border/70">
              <span className="grid size-12 place-items-center rounded-2xl gradient-brand text-primary-foreground shadow-glow shrink-0">
                <UserPlus className="size-5" />
              </span>
              <div>
                <h1 className="text-xl font-bold font-display text-foreground tracking-tight">Create Student Account</h1>
                <p className="text-xs text-muted-foreground mt-0.5">Join CareerSetu for personalized AI career guidance</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-foreground font-semibold mb-1.5 block">Full Name *</Label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Tanvi Deshmukh"
                    className="rounded-xl h-10 text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <Label className="text-xs text-foreground font-semibold mb-1.5 block">Email Address *</Label>
                  <Input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="student@example.com"
                    className="rounded-xl h-10 text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-foreground font-semibold mb-1.5 block">Password *</Label>
                  <Input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••••••"
                    className="rounded-xl h-10 text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <Label className="text-xs text-foreground font-semibold mb-1.5 block">Confirm Password *</Label>
                  <Input
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="••••••••••••"
                    className="rounded-xl h-10 text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* Password Strength Meter */}
              {formData.password && (
                <div className="p-3.5 rounded-2xl bg-accent/40 border border-border/80 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-[11px] font-medium">Password Security:</span>
                    <span className={`text-[11px] font-bold ${passwordStrength.isValid ? "text-emerald-500" : "text-amber-500"}`}>
                      {passwordStrength.isValid ? "✓ Strong Password" : "⚠ Needs Improvement"}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${passwordStrength.score >= 1 ? "bg-red-500" : "bg-transparent"}`} />
                    <div className={`h-full rounded-full transition-all ${passwordStrength.score >= 2 ? "bg-amber-500" : "bg-transparent"}`} />
                    <div className={`h-full rounded-full transition-all ${passwordStrength.score >= 3 ? "bg-blue-500" : "bg-transparent"}`} />
                    <div className={`h-full rounded-full transition-all ${passwordStrength.score >= 4 ? "bg-emerald-500" : "bg-transparent"}`} />
                  </div>
                  {!passwordStrength.isValid && passwordStrength.feedback.length > 0 && (
                    <p className="text-[11px] text-muted-foreground leading-tight">
                      • {passwordStrength.feedback[0]}
                    </p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs text-foreground font-semibold mb-1.5 block">Phone Number</Label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="9876543210"
                    className="rounded-xl h-10 text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <Label className="text-xs text-foreground font-semibold mb-1.5 block">Age</Label>
                  <Input
                    type="number"
                    min={12}
                    max={60}
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="rounded-xl h-10 text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <Label className="text-xs text-foreground font-semibold mb-1.5 block">Gender</Label>
                  <Select value={formData.gender} onValueChange={(val) => setFormData({ ...formData, gender: val })}>
                    <SelectTrigger className="rounded-xl h-10 text-xs sm:text-sm border-input bg-card/75">
                      <SelectValue placeholder="Gender" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border bg-card">
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                      <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-foreground font-semibold mb-1.5 block">State</Label>
                  <Input
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="Maharashtra"
                    className="rounded-xl h-10 text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <Label className="text-xs text-foreground font-semibold mb-1.5 block">City</Label>
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Pune"
                    className="rounded-xl h-10 text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-foreground font-semibold mb-1.5 block">Current Education</Label>
                  <Select value={formData.education} onValueChange={(val) => setFormData({ ...formData, education: val })}>
                    <SelectTrigger className="rounded-xl h-10 text-xs sm:text-sm border-input bg-card/75">
                      <SelectValue placeholder="Select Education" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border bg-card">
                      <SelectItem value="Class 10">Class 10</SelectItem>
                      <SelectItem value="Class 12 (Science)">Class 12 (Science)</SelectItem>
                      <SelectItem value="Class 12 (Commerce)">Class 12 (Commerce)</SelectItem>
                      <SelectItem value="Class 12 (Arts)">Class 12 (Arts)</SelectItem>
                      <SelectItem value="Diploma">Diploma / Polytechnic</SelectItem>
                      <SelectItem value="Graduate (B.Tech CS)">Graduate (B.Tech / B.E.)</SelectItem>
                      <SelectItem value="Graduate (B.Sc IT)">Graduate (B.Sc / BCA)</SelectItem>
                      <SelectItem value="Graduate (Commerce/B.Com)">Graduate (Commerce)</SelectItem>
                      <SelectItem value="Post Graduate">Post Graduate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs text-foreground font-semibold mb-1.5 block">Preferred Language</Label>
                  <Select value={formData.preferred_language} onValueChange={(val) => setFormData({ ...formData, preferred_language: val })}>
                    <SelectTrigger className="rounded-xl h-10 text-xs sm:text-sm border-input bg-card/75">
                      <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border bg-card">
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Hindi">हिंदी (Hindi)</SelectItem>
                      <SelectItem value="Marathi">मराठी (Marathi)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-3">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-xl gradient-brand text-primary-foreground font-bold text-xs sm:text-sm shadow-glow hover:opacity-95 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 cursor-pointer transition-all group"
                >
                  {loading ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-2" />
                      Creating Account & Generating MFA OTP...
                    </>
                  ) : (
                    <>
                      Create Account & Verify Email
                      <ArrowRight className="size-4 ml-2 transition-transform duration-200 group-hover:translate-x-1" />
                    </>
                  )}
                </Button>
              </div>
            </form>

            <div className="pt-2 text-center text-xs text-muted-foreground">
              Already have an account?{" "}
              <Link to="/student/login" className="text-primary font-semibold hover:underline underline-offset-2">
                Sign In
              </Link>
            </div>
          </div>
        </Card>
      </div>

      <footer className="text-center text-[11px] text-muted-foreground py-3">
        CareerSetu AI Student Registration • Encrypted Credential Security
      </footer>
    </div>
  );
}
