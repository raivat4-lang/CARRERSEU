import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardList,
  Loader2,
  Mail,
  Phone,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createAdminApplication,
  getAdminApplicationByEmail,
  getUserByEmail,
} from "@/lib/auth/rbac";
import { hashPassword, evaluatePasswordStrength, generateSecureOtp } from "@/lib/auth/crypto";
import { sendAuthenticationEmail } from "@/lib/auth/email-service";

export const Route = createFileRoute("/admin/signup")({
  head: () => ({
    meta: [
      { title: "Request Admin Access — CareerSetu AI" },
      {
        name: "description",
        content:
          "Apply for administrator access on CareerSetu AI. All applications require Super Admin approval.",
      },
    ],
  }),
  component: AdminSignupPage,
});

type Step = "details" | "email-verify" | "phone-verify" | "submitted";

function AdminSignupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("details");
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    organization: "",
    reason: "",
    password: "",
    confirmPassword: "",
  });

  // Email OTP
  const [emailOtp, setEmailOtp] = useState(["", "", "", "", "", ""]);
  const [emailOtpCode, setEmailOtpCode] = useState("");
  const [, setEmailVerified] = useState(false);
  const [emailResendCooldown, setEmailResendCooldown] = useState(0);
  const [emailTimeLeft, setEmailTimeLeft] = useState(600);
  const emailRefs = useRef<Array<HTMLInputElement | null>>([]);

  // Phone OTP (SMS verification simulated / logged for dev testing)
  const [phoneOtp, setPhoneOtp] = useState(["", "", "", "", "", ""]);
  const [phoneOtpCode, setPhoneOtpCode] = useState("");
  const [, setPhoneVerified] = useState(false);
  const [phoneResendCooldown, setPhoneResendCooldown] = useState(0);
  const phoneRefs = useRef<Array<HTMLInputElement | null>>([]);

  // Application reference
  const [applicationId, setApplicationId] = useState("");

  const passwordStrength = evaluatePasswordStrength(formData.password);

  const startTimer = (
    setter: React.Dispatch<React.SetStateAction<number>>,
    seconds: number
  ) => {
    setter(seconds);
    const id = setInterval(() => {
      setter((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTimer = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60)
      .toString()
      .padStart(2, "0")}`;

  // ── Step 1: Submit details → send email OTP
  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { fullName, email, phone, organization, reason, password, confirmPassword } = formData;

    if (!fullName || !email || !phone || !organization || !reason || !password) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (!email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (phone.replace(/\D/g, "").length < 10) {
      toast.error("Please enter a valid 10-digit phone number.");
      return;
    }
    if (reason.trim().length < 30) {
      toast.error("Please provide a more detailed reason (at least 30 characters).");
      return;
    }
    if (!passwordStrength.isValid) {
      toast.error("Please choose a stronger password (min 10 chars with uppercase, lowercase, and numbers).");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const existingUser = getUserByEmail(cleanEmail);
    if (existingUser && existingUser.role === "ADMIN") {
      toast.error("An administrator account with this email already exists. Please log in.");
      return;
    }

    const existingApp = getAdminApplicationByEmail(cleanEmail);
    if (existingApp && existingApp.status === "APPROVED") {
      toast.error("This email already has an approved admin account. Please log in.");
      return;
    }
    if (existingApp && existingApp.status === "PENDING_APPROVAL") {
      toast.info("Your application is already under review. Please wait for Super Admin approval.");
      return;
    }

    setLoading(true);
    try {
      const otp = generateSecureOtp();
      setEmailOtpCode(otp);

      await sendAuthenticationEmail({
        to: cleanEmail,
        templateType: "ADMIN_FIRST_SETUP",
        recipientName: fullName.trim(),
        otpCode: otp,
        expiresInMinutes: 10,
      });

      setStep("email-verify");
      startTimer(setEmailTimeLeft, 600);
      startTimer(setEmailResendCooldown, 45);
      toast.success("A 6-digit verification code has been sent to your email.");
      setTimeout(() => emailRefs.current[0]?.focus(), 150);
    } catch {
      toast.error("Failed to send verification email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Email OTP input handlers
  const handleEmailOtpInput = (index: number, value: string) => {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, "").slice(0, 6).split("");
      const newOtp = Array.from({ length: 6 }, (_, i) => digits[i] || "");
      setEmailOtp(newOtp);
      setTimeout(() => emailRefs.current[Math.min(digits.length, 5)]?.focus(), 20);
      return;
    }
    const digit = value.replace(/\D/g, "");
    const newOtp = [...emailOtp];
    newOtp[index] = digit;
    setEmailOtp(newOtp);
    if (digit && index < 5) setTimeout(() => emailRefs.current[index + 1]?.focus(), 20);
  };

  const handleEmailOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !emailOtp[index] && index > 0) {
      const newOtp = [...emailOtp];
      newOtp[index - 1] = "";
      setEmailOtp(newOtp);
      setTimeout(() => emailRefs.current[index - 1]?.focus(), 20);
    }
  };

  const handleVerifyEmail = async () => {
    const entered = emailOtp.join("");
    if (entered.length !== 6) {
      toast.error("Please enter all 6 digits.");
      return;
    }
    if (emailTimeLeft <= 0) {
      toast.error("The verification code has expired. Please request a new one.");
      return;
    }
    if (entered !== emailOtpCode) {
      toast.error("Incorrect code. Please try again.");
      setEmailOtp(["", "", "", "", "", ""]);
      setTimeout(() => emailRefs.current[0]?.focus(), 50);
      return;
    }
    setEmailVerified(true);

    // Generate phone OTP (simulated for dev)
    const pOtp = generateSecureOtp();
    setPhoneOtpCode(pOtp);

    console.log(`[ADMIN SIGNUP PHONE OTP] To: ${formData.phone} | Code: ${pOtp}`);
    toast.success("Email verified! Now verify your phone number.");
    toast.info(`[Dev Testing] Phone OTP is: ${pOtp}`);

    setStep("phone-verify");
    startTimer(setPhoneResendCooldown, 45);
    setTimeout(() => phoneRefs.current[0]?.focus(), 150);
  };

  const handleResendEmailOtp = async () => {
    if (emailResendCooldown > 0) return;
    setLoading(true);
    try {
      const otp = generateSecureOtp();
      setEmailOtpCode(otp);
      await sendAuthenticationEmail({
        to: formData.email.trim().toLowerCase(),
        templateType: "ADMIN_FIRST_SETUP",
        recipientName: formData.fullName.trim(),
        otpCode: otp,
        expiresInMinutes: 10,
      });
      startTimer(setEmailTimeLeft, 600);
      startTimer(setEmailResendCooldown, 45);
      setEmailOtp(["", "", "", "", "", ""]);
      toast.success("A new verification code has been sent.");
    } catch {
      toast.error("Failed to resend code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Phone OTP input handlers
  const handlePhoneOtpInput = (index: number, value: string) => {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, "").slice(0, 6).split("");
      const newOtp = Array.from({ length: 6 }, (_, i) => digits[i] || "");
      setPhoneOtp(newOtp);
      setTimeout(() => phoneRefs.current[Math.min(digits.length, 5)]?.focus(), 20);
      return;
    }
    const digit = value.replace(/\D/g, "");
    const newOtp = [...phoneOtp];
    newOtp[index] = digit;
    setPhoneOtp(newOtp);
    if (digit && index < 5) setTimeout(() => phoneRefs.current[index + 1]?.focus(), 20);
  };

  const handlePhoneOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !phoneOtp[index] && index > 0) {
      const newOtp = [...phoneOtp];
      newOtp[index - 1] = "";
      setPhoneOtp(newOtp);
      setTimeout(() => phoneRefs.current[index - 1]?.focus(), 20);
    }
  };

  const handleResendPhoneOtp = () => {
    if (phoneResendCooldown > 0) return;
    const pOtp = generateSecureOtp();
    setPhoneOtpCode(pOtp);
    console.log(`[ADMIN SIGNUP PHONE OTP] To: ${formData.phone} | Code: ${pOtp}`);
    toast.info(`[Dev Testing] New Phone OTP is: ${pOtp}`);
    startTimer(setPhoneResendCooldown, 45);
    setPhoneOtp(["", "", "", "", "", ""]);
  };

  const handleVerifyPhone = async () => {
    const entered = phoneOtp.join("");
    if (entered.length !== 6) {
      toast.error("Please enter all 6 digits.");
      return;
    }
    if (entered !== phoneOtpCode) {
      toast.error("Incorrect phone OTP. Please try again.");
      setPhoneOtp(["", "", "", "", "", ""]);
      setTimeout(() => phoneRefs.current[0]?.focus(), 50);
      return;
    }
    setPhoneVerified(true);

    setLoading(true);
    try {
      const password_hash = await hashPassword(formData.password);
      const result = createAdminApplication({
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        organization: formData.organization.trim(),
        reason: formData.reason.trim(),
        password_hash,
        emailVerified: true,
        phoneVerified: true,
      });

      if (!result.success || !result.application) {
        toast.error(result.error || "Failed to submit application. Please try again.");
        return;
      }

      setApplicationId(result.application.id);
      setStep("submitted");
      toast.success("Application submitted! Awaiting Super Admin review.");
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-background text-foreground relative overflow-hidden flex flex-col justify-between p-4 sm:p-8 antialiased">
      <div className="gradient-soft absolute inset-0 -z-10 opacity-70" />
      <div className="blueprint-grid absolute inset-0 -z-10 opacity-40" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 -z-10 size-[36rem] rounded-full bg-amber-500/10 blur-[120px] pointer-events-none" />

      {/* Top Header */}
      <div className="mx-auto w-full max-w-lg flex items-center justify-between pt-2">
        <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity" aria-label="CareerSetu home">
          <Logo />
        </Link>
        <Link
          to="/admin/login"
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-xl border border-border/60 hover:bg-accent"
        >
          <ArrowLeft className="size-3.5" />
          Back to Admin Login
        </Link>
      </div>

      <div className="mx-auto w-full max-w-lg py-6">
        {/* Step Indicator */}
        {step !== "submitted" && (
          <div className="flex items-center justify-center gap-2 mb-6">
            {(["details", "email-verify", "phone-verify"] as Step[]).map((s, idx) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`flex items-center justify-center size-7 rounded-full text-xs font-bold transition-all ${
                    step === s
                      ? "bg-amber-500 text-black shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                      : (["details", "email-verify", "phone-verify"] as Step[]).indexOf(step) > idx
                      ? "bg-emerald-500/20 border border-emerald-500/50 text-emerald-400"
                      : "bg-muted border border-border/60 text-muted-foreground"
                  }`}
                >
                  {(["details", "email-verify", "phone-verify"] as Step[]).indexOf(step) > idx ? (
                    <CheckCircle2 className="size-4" />
                  ) : (
                    idx + 1
                  )}
                </div>
                {idx < 2 && (
                  <div
                    className={`w-8 h-0.5 rounded-full ${
                      (["details", "email-verify", "phone-verify"] as Step[]).indexOf(step) > idx
                        ? "bg-emerald-500/50"
                        : "bg-border/50"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        <Card className="rounded-3xl p-6 sm:p-8 bg-card/90 border border-border/80 shadow-elegant backdrop-blur-xl">
          {/* STEP 1: Details */}
          {step === "details" && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 pb-4 border-b border-border/70">
                <span className="grid size-11 place-items-center rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shrink-0">
                  <ShieldAlert className="size-5" />
                </span>
                <div>
                  <h1 className="text-lg font-bold font-display text-foreground">Request Admin Access</h1>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Submit your details for Super Admin authorization.
                  </p>
                </div>
              </div>

              <form onSubmit={handleDetailsSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="admin-full-name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Full Name *
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                      <Input
                        id="admin-full-name"
                        placeholder="Your full name"
                        value={formData.fullName}
                        onChange={(e) => setFormData((p) => ({ ...p, fullName: e.target.value }))}
                        className="pl-9 h-10 rounded-xl"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="admin-phone" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Phone Number *
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                      <Input
                        id="admin-phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                        className="pl-9 h-10 rounded-xl"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="admin-email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Work Email *
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="you@organization.com"
                      value={formData.email}
                      onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                      className="pl-9 h-10 rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="admin-org" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Organization / Institution *
                  </Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                    <Input
                      id="admin-org"
                      placeholder="e.g. National Career Institute"
                      value={formData.organization}
                      onChange={(e) => setFormData((p) => ({ ...p, organization: e.target.value }))}
                      className="pl-9 h-10 rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="admin-reason" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Reason for Admin Access *
                    <span className="ml-1 text-muted-foreground/60 normal-case font-normal">(min 30 chars)</span>
                  </Label>
                  <div className="relative">
                    <ClipboardList className="absolute left-3 top-3 size-3.5 text-muted-foreground" />
                    <textarea
                      id="admin-reason"
                      placeholder="Describe why you require administrator permissions and how you plan to manage platform content..."
                      value={formData.reason}
                      onChange={(e) => setFormData((p) => ({ ...p, reason: e.target.value }))}
                      rows={3}
                      className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl bg-background/60 border border-border/70 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-500/60 resize-none transition-colors"
                      required
                    />
                    <span className={`absolute bottom-2 right-3 text-[10px] ${formData.reason.length >= 30 ? "text-emerald-400" : "text-muted-foreground/50"}`}>
                      {formData.reason.length}/30+
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="admin-password" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Password *
                    </Label>
                    <Input
                      id="admin-password"
                      type="password"
                      placeholder="Min 10 chars"
                      value={formData.password}
                      onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                      className="h-10 rounded-xl"
                      required
                    />
                    {formData.password && (
                      <div className="flex gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((lvl) => (
                          <div
                            key={lvl}
                            className={`h-1 flex-1 rounded-full transition-colors ${
                              passwordStrength.score >= lvl
                                ? passwordStrength.score >= 4
                                  ? "bg-emerald-500"
                                  : passwordStrength.score >= 3
                                  ? "bg-amber-400"
                                  : "bg-red-500"
                                : "bg-border/50"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="admin-confirm-password" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Confirm Password *
                    </Label>
                    <Input
                      id="admin-confirm-password"
                      type="password"
                      placeholder="Repeat password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData((p) => ({ ...p, confirmPassword: e.target.value }))}
                      className={`h-10 rounded-xl ${
                        formData.confirmPassword && formData.password !== formData.confirmPassword
                          ? "border-red-500/60"
                          : ""
                      }`}
                      required
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25">
                  <p className="text-xs text-amber-300/90 flex gap-2">
                    <Shield className="size-4 shrink-0 mt-0.5 text-amber-400" />
                    <span>
                      <strong>Super Admin Review Policy:</strong> Accounts are marked as <em>Pending Approval</em>. You will only be granted access after verified Super Admin approval.
                    </span>
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-md shadow-amber-600/25 group cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-2" /> Sending Verification Code...
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-4 mr-2" />
                      Continue to Verification
                      <ArrowRight className="size-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          )}

          {/* STEP 2: Email OTP */}
          {step === "email-verify" && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 pb-4 border-b border-border/70">
                <span className="grid size-11 place-items-center rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shrink-0">
                  <Mail className="size-5" />
                </span>
                <div>
                  <h1 className="text-lg font-bold font-display">Verify Email</h1>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Enter the 6-digit code sent to <span className="text-foreground font-medium">{formData.email}</span>
                  </p>
                </div>
              </div>

              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">Code expires in</div>
                <div className={`text-2xl font-mono font-bold ${emailTimeLeft < 60 ? "text-red-400" : "text-foreground"}`}>
                  {formatTimer(emailTimeLeft)}
                </div>
              </div>

              {/* Dev Mode Helper Banner */}
              {emailOtpCode && (
                <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-3.5 flex items-start gap-3">
                  <span className="text-amber-500 text-base leading-none mt-0.5">🔧</span>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-xs font-bold text-amber-500 dark:text-amber-400">
                      Dev Mode — Security Code Generated
                    </p>
                    <p
                      className="font-mono text-xl font-black tracking-[0.3em] text-amber-600 dark:text-amber-300 select-all cursor-pointer hover:opacity-85 transition-opacity"
                      onClick={() => {
                        const digits = emailOtpCode.slice(0, 6).split("");
                        setEmailOtp(Array.from({ length: 6 }, (_, i) => digits[i] || ""));
                        toast.success("Email verification code auto-filled!");
                        setTimeout(() => emailRefs.current[5]?.focus(), 50);
                      }}
                      title="Click to auto-fill"
                    >
                      {emailOtpCode}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Click code to auto-fill. To receive real emails, configure SMTP in <code className="font-mono text-[9px] bg-muted px-1 py-0.5 rounded">.env</code>.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-center gap-2.5 my-4">
                {emailOtp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      emailRefs.current[i] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleEmailOtpInput(i, e.target.value)}
                    onKeyDown={(e) => handleEmailOtpKeyDown(i, e)}
                    className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-lg font-bold rounded-xl border-2 bg-background/60 text-foreground outline-none transition-all duration-200 ${
                      digit
                        ? "border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.3)]"
                        : "border-border/70 focus:border-amber-500/70"
                    }`}
                  />
                ))}
              </div>

              <Button
                onClick={handleVerifyEmail}
                disabled={loading || emailOtp.join("").length !== 6}
                className="w-full h-11 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer"
              >
                {loading ? <Loader2 className="size-4 animate-spin mr-2" /> : <ShieldCheck className="size-4 mr-2" />}
                Verify Email & Continue
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendEmailOtp}
                  disabled={emailResendCooldown > 0 || loading}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 flex items-center gap-1.5 mx-auto cursor-pointer"
                >
                  <RefreshCw className="size-3" />
                  {emailResendCooldown > 0 ? `Resend code in ${emailResendCooldown}s` : "Resend Email Code"}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Phone OTP */}
          {step === "phone-verify" && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 pb-4 border-b border-border/70">
                <span className="grid size-11 place-items-center rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shrink-0">
                  <Phone className="size-5" />
                </span>
                <div>
                  <h1 className="text-lg font-bold font-display">Verify Phone</h1>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Enter the 6-digit code sent to <span className="text-foreground font-medium">{formData.phone}</span>
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-400">
                <CheckCircle2 className="size-3.5 inline mr-1.5 text-emerald-400" />
                Work email verified successfully.
              </div>

              {/* Dev Mode Helper Banner for Phone */}
              {phoneOtpCode && (
                <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-3.5 flex items-start gap-3">
                  <span className="text-emerald-500 text-base leading-none mt-0.5">🔧</span>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-xs font-bold text-emerald-500 dark:text-emerald-400">
                      Dev Mode — Simulated Phone OTP
                    </p>
                    <p
                      className="font-mono text-xl font-black tracking-[0.3em] text-emerald-600 dark:text-emerald-300 select-all cursor-pointer hover:opacity-85 transition-opacity"
                      onClick={() => {
                        const digits = phoneOtpCode.slice(0, 6).split("");
                        setPhoneOtp(Array.from({ length: 6 }, (_, i) => digits[i] || ""));
                        toast.success("Phone verification code auto-filled!");
                        setTimeout(() => phoneRefs.current[5]?.focus(), 50);
                      }}
                      title="Click to auto-fill"
                    >
                      {phoneOtpCode}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Click code to auto-fill simulated SMS verification code.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-center gap-2.5 my-4">
                {phoneOtp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      phoneRefs.current[i] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handlePhoneOtpInput(i, e.target.value)}
                    onKeyDown={(e) => handlePhoneOtpKeyDown(i, e)}
                    className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-lg font-bold rounded-xl border-2 bg-background/60 text-foreground outline-none transition-all duration-200 ${
                      digit
                        ? "border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                        : "border-border/70 focus:border-emerald-500/70"
                    }`}
                  />
                ))}
              </div>

              <Button
                onClick={handleVerifyPhone}
                disabled={loading || phoneOtp.join("").length !== 6}
                className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" /> Submitting Application...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="size-4 mr-2" /> Verify Phone & Submit Application
                  </>
                )}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendPhoneOtp}
                  disabled={phoneResendCooldown > 0}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 flex items-center gap-1.5 mx-auto cursor-pointer"
                >
                  <RefreshCw className="size-3" />
                  {phoneResendCooldown > 0 ? `Resend in ${phoneResendCooldown}s` : "Resend Phone Code"}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Submitted & Pending Review */}
          {step === "submitted" && (
            <div className="space-y-6 text-center py-4">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="size-20 rounded-full bg-amber-500/15 flex items-center justify-center border border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                    <ShieldCheck className="size-10 text-amber-400" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 size-7 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-background">
                    <CheckCircle2 className="size-4 text-white" />
                  </div>
                </div>
              </div>

              <div>
                <h1 className="text-xl font-bold font-display text-foreground mb-1">
                  Application Submitted!
                </h1>
                <p className="text-sm text-muted-foreground">
                  Your administrator application is now{" "}
                  <span className="text-amber-400 font-semibold">Pending Super Admin Review</span>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-background/60 border border-border/70 text-left space-y-2.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Applicant</span>
                  <span className="font-medium text-foreground">{formData.fullName}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium text-foreground">{formData.email}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Organization</span>
                  <span className="font-medium text-foreground">{formData.organization}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Application ID</span>
                  <span className="font-mono text-[10px] text-amber-400">{applicationId}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Status</span>
                  <span className="text-amber-400 font-semibold flex items-center gap-1">
                    <span className="size-2 rounded-full bg-amber-400 animate-pulse" />
                    Pending Super Admin Approval
                  </span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                Super Admin (<span className="text-foreground font-medium">raivats4@gmail.com</span>) has received your application. Once approved, you will be able to log in to the Management Console.
              </p>

              <div className="flex flex-col gap-2 pt-2">
                <Button
                  onClick={() => navigate({ to: "/admin/login" as any })}
                  className="w-full h-11 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer"
                >
                  Go to Admin Login
                </Button>
                <Link
                  to="/"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors mt-2"
                >
                  Return to Homepage
                </Link>
              </div>
            </div>
          )}
        </Card>
      </div>

      <footer className="text-center text-[11px] text-muted-foreground py-3">
        CareerSetu AI • Super Admin Governed Access Portal • All applications reviewed server-side
      </footer>
    </div>
  );
}
