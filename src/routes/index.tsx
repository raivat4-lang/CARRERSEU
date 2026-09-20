import { createFileRoute } from "@tanstack/react-router";

import { ExamNewsSection } from "@/components/landing/ExamNewsSection";
import { Categories, Features, Stats } from "@/components/landing/Features";
import { Hero } from "@/components/landing/Hero";
import { Navbar } from "@/components/landing/Navbar";
import { CtaBand, Faq, Footer, Testimonials } from "@/components/landing/Sections";

const title = "CareerSetu — AI Career & Government Exam Guidance";
const description =
  "Take an AI career assessment, discover 100+ careers, find government exams, get live Indian exam news, study plans & college matches — built for Indian students.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <ExamNewsSection />
        <Features />
        <Categories />
        <Testimonials />
        <Faq />
        <CtaBand />
      </main>
      <Footer />
    </div>
  );
}
