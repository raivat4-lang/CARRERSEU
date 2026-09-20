import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  Briefcase,
  HelpCircle,
  Landmark,
  LogIn,
  Menu,
  Moon,
  Shield,
  Sparkles,
  Star,
  Sun,
  UserPlus,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const links = [
  { label: "Exam News", href: "#exam-news", icon: Landmark },
  { label: "Careers", href: "#careers", icon: Briefcase },
  { label: "Features", href: "#features", icon: Sparkles },
  { label: "Testimonials", href: "#testimonials", icon: Star },
  { label: "FAQ", href: "#faq", icon: HelpCircle },
];

function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => {
        const next = !dark;
        document.documentElement.classList.toggle("dark", next);
        setDark(next);
      }}
      className="rounded-xl size-9 text-muted-foreground hover:text-foreground transition-transform hover:scale-105"
    >
      {dark ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4 text-sky-500" />}
    </Button>
  );
}

export function Navbar() {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full px-3 sm:px-6 pt-3">
      <div className="glass mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-2xl px-4 py-2 sm:px-6 shadow-soft transition-all border border-border/75 backdrop-blur-xl">
        <Link to="/" aria-label="CareerSetu home" className="shrink-0 transition-transform hover:scale-[1.02]">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-xl px-3.5 py-1.5 text-xs sm:text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-primary/10 hover:text-primary active:scale-98"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <Button variant="ghost" size="sm" className="hidden sm:inline-flex rounded-xl text-xs font-semibold hover:bg-primary/10 hover:text-primary transition-all" asChild>
            <Link to="/student/login">
              Log in
            </Link>
          </Button>

          <Button
            size="sm"
            className="gradient-brand hidden text-primary-foreground shadow-glow hover:opacity-95 hover:shadow-lg sm:inline-flex rounded-xl font-semibold text-xs h-9 px-4 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            asChild
          >
            <Link to="/auth" search={{ mode: "signup" }}>
              <Sparkles className="size-3.5 mr-1.5" />
              Get started
            </Link>
          </Button>

          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu" className="lg:hidden rounded-xl size-9 hover:bg-accent/80">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 rounded-l-3xl p-6 bg-card/95 backdrop-blur-xl border-border flex flex-col justify-between">
              <div>
                <SheetTitle className="text-left font-display font-bold text-lg flex items-center gap-2 pb-4 border-b border-border/60">
                  <span className="gradient-brand size-8 rounded-xl grid place-items-center text-primary-foreground shadow-glow">
                    <Sparkles className="size-4" />
                  </span>
                  CareerSetu Menu
                </SheetTitle>

                <nav className="mt-5 flex flex-col gap-1.5">
                  {links.map((l) => {
                    const Icon = l.icon;
                    return (
                      <a
                        key={l.href}
                        href={l.href}
                        onClick={() => setSheetOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all hover:bg-accent/80 hover:text-primary text-foreground group"
                      >
                        <span className="size-8 rounded-lg bg-primary/10 grid place-items-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <Icon className="size-4" />
                        </span>
                        <span>{l.label}</span>
                      </a>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-5 border-t border-border/70 flex flex-col gap-2.5">
                <Button variant="outline" className="w-full rounded-xl justify-start gap-2 h-10 border-border/80" asChild onClick={() => setSheetOpen(false)}>
                  <Link to="/student/login">
                    <LogIn className="size-4 text-primary" />
                    Student Sign In
                  </Link>
                </Button>

                <Button className="gradient-brand w-full text-primary-foreground rounded-xl shadow-glow justify-start gap-2 h-10 hover:opacity-95" asChild onClick={() => setSheetOpen(false)}>
                  <Link to="/auth" search={{ mode: "signup" }}>
                    <UserPlus className="size-4" />
                    Create Free Account
                  </Link>
                </Button>

                <Link
                  to="/admin/login"
                  onClick={() => setSheetOpen(false)}
                  className="flex items-center justify-center gap-1.5 pt-2 text-[11px] text-muted-foreground hover:text-amber-500 transition-colors"
                >
                  <Shield className="size-3 text-amber-500" />
                  Administrator Gateway
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
