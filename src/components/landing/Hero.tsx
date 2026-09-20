import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Compass, Flame, Shield, Sparkles, Star, TrendingUp } from "lucide-react";

import heroImage from "@/assets/hero-career.png";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const trustPoints = [
  "50-question adaptive assessment",
  "100+ career paths mapped",
  "20+ govt exams tracked",
  "Dual English & Hindi support",
];

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-8 pb-14 lg:pt-14 lg:pb-18">
      {/* Background decorations */}
      <div className="gradient-soft absolute inset-0 -z-10 opacity-75" />
      <div className="blueprint-grid absolute inset-0 -z-10 opacity-55" />
      <div className="absolute -top-36 left-1/3 -z-10 size-[32rem] rounded-full bg-primary/15 blur-[120px] pointer-events-none" />
      <div className="absolute -right-20 top-20 -z-10 size-[28rem] rounded-full bg-violet/15 blur-[100px] pointer-events-none" />

      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-14">
        <div className="animate-fade-up">
          {/* Tag pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary backdrop-blur-md shadow-xs">
            <Sparkles className="size-3.5 text-primary animate-pulse" />
            <span>AI Career & Exam Intelligence for Indian Students</span>
          </div>

          <h1 className="mt-5 text-4xl leading-[1.12] font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-foreground">
            Bridge your education to a <span className="text-gradient">Dream Career</span>
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base lg:text-lg">
            Take our scientific AI career assessment, explore 100+ high-growth careers, track 20+ government exams, and receive adaptive daily study schedules — built specifically for Indian students.
          </p>

          <div className="mt-8 flex flex-col gap-3.5 sm:flex-row sm:items-center">
            <Button
              size="lg"
              className="gradient-brand h-12 rounded-xl px-7 text-sm sm:text-base font-semibold text-primary-foreground shadow-glow transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 group cursor-pointer"
              asChild
            >
              <Link to="/auth" search={{ mode: "signup" }}>
                Start Free Assessment
                <ArrowRight className="ml-2 size-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 rounded-xl border-border/85 bg-card/85 px-6 text-sm sm:text-base font-semibold backdrop-blur-xs hover:bg-accent hover:border-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
              asChild
            >
              <a href="#features">
                <Compass className="mr-2 size-4 text-primary" />
                Explore Features
              </a>
            </Button>
          </div>

          {/* Value tags */}
          <div className="mt-8 pt-6 border-t border-border/70">
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-muted-foreground">
              {trustPoints.map((t) => (
                <li
                  key={t}
                  className="flex items-center gap-2 rounded-xl bg-card/50 border border-border/60 px-3 py-2 shadow-2xs backdrop-blur-xs transition-colors hover:border-primary/30"
                >
                  <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                  <span className="font-medium text-foreground/90">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Hero Visual Container */}
        <div className="relative animate-fade-up [animation-delay:120ms] flex justify-center">
          <div className="relative w-full max-w-md lg:max-w-none">
            {/* Ambient image glow */}
            <div className="absolute inset-4 -z-10 rounded-3xl bg-primary/20 blur-2xl opacity-60 pointer-events-none" />
            <div className="animate-float">
              <img
                src={heroImage}
                alt="CareerSetu AI guidance dashboard with charts, a compass and study material"
                width={1280}
                height={1024}
                className="mx-auto w-full max-w-md lg:max-w-lg drop-shadow-2xl rounded-2xl border border-white/10"
              />
            </div>

            {/* Floating metric 1 */}
            <div className="glass absolute -bottom-3 left-2 sm:-bottom-2 sm:left-4 rounded-2xl p-3.5 shadow-soft border border-border/80 backdrop-blur-xl transition-transform hover:-translate-y-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[11px] font-medium text-muted-foreground">Top Career Match</p>
              </div>
              <p className="text-gradient font-display text-xl sm:text-2xl font-black leading-tight">94% AI Match</p>
              <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">AI & Machine Learning</p>
            </div>

            {/* Floating metric 2 */}
            <div className="glass absolute top-2 right-2 sm:top-5 sm:right-3 rounded-2xl p-3 shadow-soft border border-border/80 backdrop-blur-xl transition-transform hover:-translate-y-1 block">
              <div className="flex items-center gap-1.5 mb-1">
                <Flame className="size-3.5 text-amber-500 animate-pulse" />
                <p className="text-[11px] font-medium text-muted-foreground">Live Notification</p>
              </div>
              <p className="font-display text-xs font-bold text-foreground">UPSC CSE 2027 Portal Open</p>
              <span className="text-[9px] text-primary font-semibold mt-0.5 inline-block">Updated 10m ago</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
