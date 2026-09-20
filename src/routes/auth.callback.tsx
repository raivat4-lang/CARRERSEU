import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { supabase } from "@/integrations/supabase/client";
import { setCurrentUser } from "@/lib/auth/rbac";
import type { AppUser } from "@/lib/auth/rbac";

export const Route = createFileRoute("/auth/callback")({
  head: () => ({
    meta: [{ title: "Signing you in… — CareerSetu AI" }],
  }),
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Completing Google sign-in…");

  useEffect(() => {
    async function handleCallback() {
      try {
        // Supabase exchanges the URL hash/code for a session automatically on the client.
        // We call getSession() to read the freshly set session.
        const { data, error } = await supabase.auth.getSession();

        if (error || !data.session) {
          // Try explicit exchangeCodeForSession if hash-based flow didn't work
          const hash = window.location.hash;
          const search = window.location.search;

          if (hash || search.includes("code=")) {
            const { data: exchangeData, error: exchangeError } =
              await supabase.auth.exchangeCodeForSession(
                search || hash
              );
            if (exchangeError || !exchangeData.session) {
              throw new Error(exchangeError?.message || "No session returned from Google.");
            }
            // Use exchanged session
            await buildAndSaveUser(exchangeData.session.user, navigate);
            return;
          }

          throw new Error(error?.message || "Google sign-in was cancelled or failed.");
        }

        await buildAndSaveUser(data.session.user, navigate);
      } catch (err: any) {
        console.error("[Google OAuth callback error]", err);
        setStatus("error");
        setMessage(err?.message || "Sign-in failed. Please try again.");
        setTimeout(() => navigate({ to: "/auth", search: { mode: "login" } }), 3000);
      }
    }

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-dvh bg-gradient-to-br from-background via-background/95 to-primary/5 flex items-center justify-center p-4">
      <div className="text-center space-y-5 max-w-sm w-full">
        <div className="flex justify-center mb-2">
          <Logo size="lg" />
        </div>

        <div className="flex flex-col items-center gap-4 p-8 rounded-3xl bg-card border border-border/80 shadow-elegant backdrop-blur-xl">
          {status === "loading" && (
            <>
              <div className="size-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Loader2 className="size-7 text-primary animate-spin" />
              </div>
              <div>
                <p className="font-bold text-foreground font-display text-lg">Google Sign-In</p>
                <p className="text-sm text-muted-foreground mt-1">{message}</p>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                <div className="h-full bg-primary rounded-full animate-pulse w-3/4" />
              </div>
            </>
          )}

          {status === "success" && (
            <>
              <div className="size-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="size-7 text-emerald-500" />
              </div>
              <div>
                <p className="font-bold text-foreground font-display text-lg">Signed In!</p>
                <p className="text-sm text-muted-foreground mt-1">{message}</p>
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <div className="size-14 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
                <XCircle className="size-7 text-destructive" />
              </div>
              <div>
                <p className="font-bold text-foreground font-display text-lg">Sign-In Failed</p>
                <p className="text-sm text-muted-foreground mt-1">{message}</p>
                <p className="text-xs text-muted-foreground/70 mt-2">Redirecting back to login…</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

async function buildAndSaveUser(
  supabaseUser: { id: string; email?: string; user_metadata?: Record<string, any> },
  navigate: ReturnType<typeof useNavigate>
) {
  const email = supabaseUser.email || "";
  const meta = supabaseUser.user_metadata || {};
  const name =
    meta.full_name || meta.name || meta.preferred_username || email.split("@")[0] || "Student";

  const googleUser: AppUser = {
    id: `google-${supabaseUser.id}`,
    name,
    full_name: name,
    email,
    password_hash: null, // Google users have no password
    phone: meta.phone || undefined,
    role: "STUDENT",
    is_active: true,
    status: "ACTIVE",
    email_verified: true, // Google guarantees email verification
    is_first_login: false,
    education: undefined,
    current_education: undefined,
    preferred_language: "english",
    created_at: new Date().toISOString(),
    registeredAt: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    lastActive: new Date().toISOString(),
  };

  setCurrentUser(googleUser);
  navigate({ to: "/dashboard" });
}
