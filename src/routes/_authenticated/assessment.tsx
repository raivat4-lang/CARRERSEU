import { useState, useEffect } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getManagedQuestions, ManagedQuestionItem } from "@/lib/store/admin-content-store";
import { calculateAssessmentResults } from "@/lib/data/assessment-questions";
import { getCurrentUser } from "@/lib/auth/rbac";
import {
  getStoredAssessmentAnswers,
  saveAssessmentAnswers,
  saveAssessmentResults,
  recordAssessmentCompletion,
} from "@/lib/store/careersetu-store";

export const Route = createFileRoute("/_authenticated/assessment")({
  head: () => ({
    meta: [
      { title: "AI Career Assessment — CareerSetu" },
      {
        name: "description",
        content: "Take the 50-question adaptive AI Career Assessment to discover your ideal career matches and strengths.",
      },
    ],
  }),
  component: AssessmentPage,
});

const SCALE_OPTIONS = [
  { value: 1, label: "Strongly Disagree", color: "hover:border-rose-500 hover:bg-rose-500/10" },
  { value: 2, label: "Disagree", color: "hover:border-amber-500 hover:bg-amber-500/10" },
  { value: 3, label: "Neutral", color: "hover:border-slate-500 hover:bg-slate-500/10" },
  { value: 4, label: "Agree", color: "hover:border-sky-500 hover:bg-sky-500/10" },
  { value: 5, label: "Strongly Agree", color: "hover:border-emerald-500 hover:bg-emerald-500/10" },
];

function AssessmentPage() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [questionsList, setQuestionsList] = useState<ManagedQuestionItem[]>(() => {
    const live = getManagedQuestions().filter((q) => q.active !== false);
    return live.length > 0 ? live : [];
  });

  useEffect(() => {
    const live = getManagedQuestions().filter((q) => q.active !== false);
    setQuestionsList(live);

    const saved = getStoredAssessmentAnswers();
    if (Object.keys(saved).length > 0) {
      setAnswers(saved);
      // Auto-seek to first unanswered question
      const firstUnanswered = live.findIndex((q) => !saved[q.id]);
      if (firstUnanswered !== -1) {
        setCurrentIndex(firstUnanswered);
      }
    }
  }, []);

  const totalQuestions = questionsList.length || 50;
  const currentQuestion = questionsList[currentIndex] ?? questionsList[0] ?? {
    id: 1,
    text: "I enjoy solving problems and exploring structured solutions.",
    category: "Technology",
    weight: 1,
    traits: ["Analytical Thinking"],
    order: 1,
  };
  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  const traitDisplay = Array.isArray((currentQuestion as any).traits)
    ? (currentQuestion as any).traits.join(", ")
    : (currentQuestion as any).traits || (currentQuestion as any).trait || currentQuestion.category;

  const handleSelectAnswer = (value: number) => {
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);
    saveAssessmentAnswers(newAnswers);

    // Auto advance
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleComplete = () => {
    const results = calculateAssessmentResults(answers);
    saveAssessmentResults(results);
    recordAssessmentCompletion(
      currentUser.email,
      currentUser.full_name || "Student",
      results
    );
    toast.success("Assessment completed successfully! Generating your career blueprint...");
    navigate({ to: "/assessment-results" as any });
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all assessment answers?")) {
      setAnswers({});
      saveAssessmentAnswers({});
      setCurrentIndex(0);
      toast.info("Assessment answers reset");
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto py-2">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/70">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary">
              <Target className="size-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold font-display text-foreground">
              AI Career Assessment
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            50 Adaptive questions evaluating logic, tech, healthcare, business, and leadership traits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-8 rounded-xl text-xs text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <RotateCcw className="size-3.5 mr-1" /> Reset
          </Button>
          <Link
            to="/assessment-results"
            className="inline-flex items-center text-xs font-semibold text-primary hover:underline"
          >
            View Latest Results →
          </Link>
        </div>
      </div>

      {/* Progress Bar Card */}
      <Card className="glass p-4 rounded-2xl border-border/80 shadow-xs space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-foreground flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-primary" />
            Question {currentIndex + 1} of {totalQuestions}
          </span>
          <span className="text-primary font-bold">{progressPercent}% Completed</span>
        </div>
        <Progress value={progressPercent} className="h-2 rounded-full" />
      </Card>

      {/* Main Question Card */}
      <Card className="glass p-6 sm:p-8 rounded-3xl border-primary/20 shadow-xl bg-card/90 space-y-6 relative overflow-hidden">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="outline" className="text-xs border-primary/30 text-primary bg-primary/5">
            Category: {currentQuestion.category}
          </Badge>
          <span className="text-[11px] font-medium text-muted-foreground">
            Trait: {traitDisplay}
          </span>
        </div>

        <div className="py-4">
          <h2 className="text-lg sm:text-2xl font-semibold leading-relaxed text-foreground text-center sm:text-left">
            "{currentQuestion.text}"
          </h2>
        </div>

        {/* 5-Option Likert Scale */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 pt-2">
          {SCALE_OPTIONS.map((opt) => {
            const isSelected = answers[currentQuestion.id] === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => handleSelectAnswer(opt.value)}
                className={`flex sm:flex-col items-center justify-between sm:justify-center gap-2 p-3 sm:py-4 rounded-2xl border transition-all text-xs font-semibold cursor-pointer text-center ${
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground shadow-glow scale-[1.02]"
                    : `border-border/80 bg-background/80 text-foreground ${opt.color}`
                }`}
              >
                <span className="grid size-6 sm:size-7 place-items-center rounded-full bg-black/10 text-xs font-bold">
                  {opt.value}
                </span>
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between pt-6 border-t border-border/50">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="rounded-xl cursor-pointer"
          >
            <ArrowLeft className="size-4 mr-1" /> Previous
          </Button>

          <div className="flex items-center gap-2">
            {currentIndex < totalQuestions - 1 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                className="rounded-xl cursor-pointer"
              >
                Next <ArrowRight className="size-4 ml-1" />
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleComplete}
                className="gradient-brand text-primary-foreground font-bold rounded-xl shadow-glow cursor-pointer"
              >
                <CheckCircle2 className="size-4 mr-1.5" /> Submit Assessment
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Question Index Grid Pill Map */}
      <div className="p-4 rounded-2xl border border-border/60 bg-accent/20 space-y-2">
        <p className="text-[11px] font-semibold text-muted-foreground">Jump to question:</p>
        <div className="flex flex-wrap gap-1.5">
          {questionsList.map((q, idx) => {
            const isAnswered = answers[q.id] !== undefined;
            const isCurrent = currentIndex === idx;
            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={`size-6 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                  isCurrent
                    ? "ring-2 ring-primary bg-primary text-primary-foreground font-bold"
                    : isAnswered
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
