import { Link } from "@tanstack/react-router";
import { Github, Linkedin, Mail, Star, Twitter } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const testimonials = [
  {
    quote:
      "I was confused between BSc IT and Diploma. The assessment showed a 94% match with Cloud Engineering and gave me a clear roadmap.",
    name: "Aditi Kulkarni",
    meta: "Class 12 · Pune",
    rating: 5,
    domain: "Technology",
    avatarColor: "from-violet-500 to-primary",
  },
  {
    quote:
      "The study planner rebuilt my schedule every time I missed a day. I finally cleared SSC CGL Tier 1 in my second attempt.",
    name: "Rahul Verma",
    meta: "Graduate · Lucknow",
    rating: 5,
    domain: "Civil Services",
    avatarColor: "from-primary to-sky-400",
  },
  {
    quote:
      "Scholarship finder alone saved my year — it matched three Maharashtra scholarships I never knew existed and I got all three.",
    name: "Sneha Patil",
    meta: "Diploma · Nashik",
    rating: 5,
    domain: "Scholarships",
    avatarColor: "from-emerald-500 to-teal-400",
  },
];

const faqs = [
  {
    q: "Who is CareerSetu for?",
    a: "Students after Class 10, Class 12, Diploma, Graduation and Post Graduation who want clarity on careers, streams and government exams.",
  },
  {
    q: "How does the AI Career Assessment work?",
    a: "You answer 50 adaptive questions across interests, personality, reasoning and creativity. We then generate interest scores, a personality summary, your learning style and top career matches.",
  },
  {
    q: "Which government exams are covered?",
    a: "UPSC, SSC CGL and CHSL, MPSC, GATE, DRDO, ISRO, RBI Grade B, SEBI, NABARD, RRB, IB ACIO, CDS, AFCAT, CAPF, ESIC and major PSU recruitments.",
  },
  {
    q: "Is it available in Hindi and Marathi?",
    a: "Yes. You pick your preferred language — English, Hindi or Marathi — while creating your account.",
  },
  {
    q: "Do I need to pay to start?",
    a: "No. The career assessment, career explorer and exam finder are free to start with.",
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="relative overflow-hidden py-18 sm:py-24">
      <div className="gradient-soft absolute inset-0 -z-10 opacity-60" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1 text-xs font-semibold text-primary mb-3 backdrop-blur-xs">
            Student Stories
          </div>
          <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl text-foreground tracking-tight">Guidance that changed decisions</h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
            Real students, real results — from career clarity to exam success.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {testimonials.map((t) => (
            <Card
              key={t.name}
              className="hover-lift glass arch-accent rounded-3xl p-6 sm:p-7 flex flex-col justify-between border-border/80 hover:border-primary/40 transition-all shadow-soft hover:shadow-elegant"
            >
              {/* Stars */}
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Quote */}
              <div className="relative mb-6">
                <div className="absolute -top-3 -left-1 font-display text-5xl text-gradient opacity-20 leading-none select-none pointer-events-none">“</div>
                <p className="relative text-xs sm:text-sm leading-relaxed text-foreground font-medium pl-3.5">
                  {t.quote}
                </p>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-border/60">
                <span
                  className={`grid size-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${t.avatarColor} text-white font-bold text-sm shadow-sm`}
                >
                  {t.name.charAt(0)}
                </span>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-foreground truncate">{t.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{t.meta}</p>
                </div>
                <span className="ml-auto text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
                  {t.domain}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-4 py-16 sm:py-20 sm:px-6">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1 text-xs font-semibold text-primary mb-3 backdrop-blur-xs">
          FAQ
        </div>
        <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl text-foreground tracking-tight">Questions students ask</h2>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          Everything you need to know before getting started.
        </p>
      </div>

      <Accordion type="single" collapsible className="mt-10 space-y-3">
        {faqs.map((f) => (
          <AccordionItem
            key={f.q}
            value={f.q}
            className="border border-border/80 rounded-2xl px-5 bg-card/80 data-[state=open]:bg-card data-[state=open]:border-primary/40 data-[state=open]:shadow-soft transition-all"
          >
            <AccordionTrigger className="text-left text-sm font-bold py-4 hover:no-underline text-foreground cursor-pointer">
              {f.q}
            </AccordionTrigger>
            <AccordionContent className="text-xs sm:text-sm leading-relaxed text-muted-foreground pb-4">
              {f.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

export function CtaBand() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      <div className="gradient-brand shadow-elegant grain overflow-hidden rounded-[2.5rem] px-6 py-14 text-center sm:px-12 relative border border-white/10">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 size-56 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 size-40 rounded-full bg-black/15 blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/20 px-4 py-1.5 text-xs font-semibold text-white/95 mb-5 backdrop-blur-sm shadow-xs">
            ✨ Start Free — No Credit Card Required
          </div>
          <h2 className="text-3xl font-extrabold text-primary-foreground sm:text-4xl tracking-tight">
            Your career deserves a plan, not a guess
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-primary-foreground/90 text-sm sm:text-base leading-relaxed">
            Start the AI assessment and get your match score, exam shortlist and study plan in minutes.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Button
              size="lg"
              variant="secondary"
              className="h-12 rounded-xl px-8 text-sm sm:text-base font-bold shadow-lg hover:scale-[1.02] active:scale-100 transition-all cursor-pointer bg-white text-foreground hover:bg-white/95"
              asChild
            >
              <Link to="/auth" search={{ mode: "signup" }}>Start Career Assessment →</Link>
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="h-12 rounded-xl px-7 text-sm sm:text-base font-semibold text-primary-foreground/90 hover:text-primary-foreground hover:bg-white/15 transition-colors cursor-pointer border border-white/20"
              asChild
            >
              <Link to="/student/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  const columns = [
    {
      title: "Platform",
      items: [
        { label: "Career Assessment", href: "#features" },
        { label: "Career Explorer", href: "#careers" },
        { label: "Government Exams", href: "#exam-news" },
        { label: "Study Planner", href: "#features" },
      ],
    },
    {
      title: "Resources",
      items: [
        { label: "Scholarships", href: "#features" },
        { label: "Colleges", href: "#features" },
        { label: "Learning Resources", href: "#features" },
        { label: "Resume Builder", href: "#features" },
      ],
    },
    {
      title: "Company",
      items: [
        { label: "About", href: "#" },
        { label: "Contact", href: "#" },
        { label: "Privacy Policy", href: "#" },
        { label: "Terms of Service", href: "#" },
      ],
    },
  ];

  return (
    <footer className="border-t border-border bg-card/60">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            AI career and government exam guidance built for Indian students — from Class 10 to Post Graduation.
          </p>
          {/* Social Links */}
          <div className="mt-5 flex items-center gap-2">
            {[
              { icon: Twitter, label: "Twitter" },
              { icon: Linkedin, label: "LinkedIn" },
              { icon: Github, label: "GitHub" },
              { icon: Mail, label: "Email" },
            ].map(({ icon: Icon, label }) => (
              <a
                key={label}
                href="#"
                className="grid size-9 place-items-center rounded-xl bg-accent/60 text-muted-foreground hover:bg-primary/10 hover:text-primary border border-border/60 transition-all"
                aria-label={label}
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h3 className="text-sm font-semibold text-foreground">{col.title}</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              {col.items.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="transition-colors hover:text-foreground hover:underline underline-offset-2"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-border py-6">
        <div className="mx-auto flex max-w-6xl flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} CareerSetu. Made with ❤️ for Indian students.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="/admin/login" className="hover:text-amber-500 transition-colors">Admin Portal</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

