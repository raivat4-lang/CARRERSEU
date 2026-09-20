import {
  Brain,
  Briefcase,
  CalendarCheck,
  FileText,
  GraduationCap,
  Landmark,
  Library,
  MessageSquareHeart,
  Target,
  Wallet,
} from "lucide-react";

import { Card } from "@/components/ui/card";

const features = [
  {
    icon: Brain,
    title: "AI Career Assessment",
    desc: "50 adaptive questions across interests, personality, reasoning and creativity.",
  },
  {
    icon: Target,
    title: "Career Recommendations",
    desc: "Compatibility scores with salary, demand, skills and a step-by-step roadmap.",
  },
  {
    icon: Landmark,
    title: "Government Exam Finder",
    desc: "UPSC, SSC, GATE, ISRO, RBI and more — eligibility, pattern and cutoffs.",
  },
  {
    icon: CalendarCheck,
    title: "AI Study Planner",
    desc: "Daily, weekly and monthly plans that reschedule themselves when you miss a task.",
  },
  {
    icon: Library,
    title: "Learning Resources",
    desc: "Curated books, videos, PDFs, mock tests and current affairs per exam.",
  },
  {
    icon: Wallet,
    title: "Scholarship Finder",
    desc: "Matched to your state, income, category and marks with live deadlines.",
  },
  {
    icon: GraduationCap,
    title: "College Recommendations",
    desc: "Government and private colleges with fees, placements and admission process.",
  },
  {
    icon: FileText,
    title: "Resume Builder",
    desc: "Professional resume, CV and cover letter templates you can export as PDF.",
  },
  {
    icon: MessageSquareHeart,
    title: "AI Career Chatbot",
    desc: "Ask anything — streams, eligibility, exams, scholarships — in your language.",
  },
];

const stats = [
  { value: "100+", label: "Career paths" },
  { value: "20+", label: "Government exams" },
  { value: "50", label: "Assessment questions" },
  { value: "3", label: "Languages supported" },
];

const categories = [
  { icon: Brain, name: "Technology", roles: "AI Engineer · Cloud · Cyber Security" },
  { icon: GraduationCap, name: "Healthcare", roles: "Doctor · Physiotherapist · Nursing" },
  { icon: Briefcase, name: "Management", roles: "MBA · Product · Operations" },
  { icon: Landmark, name: "Civil Services", roles: "IAS · IPS · IFS" },
  { icon: Wallet, name: "Commerce", roles: "CA · CS · Economist" },
  { icon: FileText, name: "Law", roles: "Advocate · Patent Analyst" },
  { icon: Library, name: "Science & Research", roles: "ISRO · DRDO · Data Science" },
  { icon: MessageSquareHeart, name: "Creative & Media", roles: "Design · Journalism · Film" },
];

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-4 py-16 sm:py-20 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1 text-xs font-semibold text-primary mb-3 backdrop-blur-xs">
          Comprehensive Toolset
        </div>
        <h2 className="text-3xl font-extrabold sm:text-4xl text-foreground tracking-tight">One platform for your entire journey</h2>
        <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
          From choosing the right stream after Class 10 to cracking premier competitive exams and building an ATS-ready resume.
        </p>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <Card
            key={f.title}
            className="hover-lift glass arch-accent overflow-hidden rounded-3xl p-6 border-border/80 hover:border-primary/40 group transition-all shadow-soft hover:shadow-elegant flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <span className="gradient-brand grid size-12 place-items-center rounded-2xl text-primary-foreground shadow-glow group-hover:scale-105 transition-transform">
                  <f.icon className="size-5" />
                </span>
              </div>
              <h3 className="mt-5 text-base sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors tracking-tight">
                {f.title}
              </h3>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

export function Stats() {
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6">
      <div className="gradient-brand shadow-elegant grain grid gap-4 sm:gap-6 rounded-3xl p-6 sm:p-10 grid-cols-2 lg:grid-cols-4 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px] pointer-events-none" />
        {stats.map((s, index) => (
          <div
            key={s.label}
            className={`text-center relative z-10 p-3 sm:p-4 ${
              index !== 0 ? "lg:border-l lg:border-white/20" : ""
            }`}
          >
            <p className="font-display text-4xl sm:text-5xl font-black tracking-tight drop-shadow-xs">{s.value}</p>
            <p className="mt-2 text-xs sm:text-sm font-semibold tracking-wide text-white/90">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Categories() {
  return (
    <section id="careers" className="mx-auto max-w-6xl px-4 py-16 sm:py-20 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1 text-xs font-semibold text-primary mb-3 backdrop-blur-xs">
          Domain Spectrum
        </div>
        <h2 className="text-3xl font-extrabold sm:text-4xl text-foreground tracking-tight">Explore 8 High-Growth Domains</h2>
        <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
          Discover comprehensive career pathways, skill requirements, and compensation benchmarks tailored to India.
        </p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((c) => (
          <Card
            key={c.name}
            className="hover-lift rounded-3xl border-border/75 bg-card/85 p-5 shadow-soft hover:border-primary/45 transition-all cursor-default group"
          >
            <div className="flex items-center justify-between">
              <span className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary border border-primary/20 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <c.icon className="size-5" />
              </span>
              <span className="text-[11px] font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                Explore →
              </span>
            </div>
            <h3 className="mt-4 font-bold text-base text-foreground group-hover:text-primary transition-colors">{c.name}</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{c.roles}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
