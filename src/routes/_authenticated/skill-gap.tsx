import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  CheckCircle,
  Clock,
  Compass,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getManagedCareers } from "@/lib/store/admin-content-store";
import { CareerItem } from "@/lib/data/careers-data";
import {
  getSkillGapStore,
  saveSkillGapStore,
  SkillStatus,
} from "@/lib/store/careersetu-store";

export const Route = createFileRoute("/_authenticated/skill-gap")({
  head: () => ({
    meta: [
      { title: "Skill Gap Analysis — CareerSetu" },
      {
        name: "description",
        content: "Analyze missing skills for your target career, prioritize learning milestones, and track your technical mastery.",
      },
    ],
  }),
  component: SkillGapPage,
});

const STATUS_OPTIONS: SkillStatus[] = ["Not Started", "Learning", "Intermediate", "Advanced"];

function SkillGapPage() {
  const [store, setStore] = useState(getSkillGapStore());
  const [careersList, setCareersList] = useState<CareerItem[]>(() => {
    const live = getManagedCareers().filter((c) => c.status !== "ARCHIVED");
    return live.length > 0 ? live : [];
  });

  useEffect(() => {
    const live = getManagedCareers().filter((c) => c.status !== "ARCHIVED");
    setCareersList(live);
    setStore(getSkillGapStore());
  }, []);

  const selectedCareer =
    careersList.find((c) => c.id === store.targetCareerId) ??
    careersList[0] ?? {
      id: "ai-ml-engineer",
      name: "AI & Machine Learning Engineer",
      domain: "Technology",
      requiredSkills: ["Python", "Machine Learning", "Deep Learning", "SQL", "Statistics"],
    };

  const handleCareerChange = (careerId: string) => {
    const career = careersList.find((c) => c.id === careerId);
    if (!career) return;

    const newStatuses: Record<string, SkillStatus> = {};
    (career.requiredSkills || []).forEach((s) => {
      newStatuses[s] = store.skillStatuses[s] ?? "Not Started";
    });

    const newStore = { targetCareerId: careerId, skillStatuses: newStatuses };
    setStore(newStore);
    saveSkillGapStore(newStore);
    toast.success(`Target career set to ${career.name}`);
  };

  const handleStatusChange = (skill: string, status: SkillStatus) => {
    const updated = {
      ...store,
      skillStatuses: { ...store.skillStatuses, [skill]: status },
    };
    setStore(updated);
    saveSkillGapStore(updated);
    toast.success(`Updated ${skill} to ${status}`);
  };

  const skillsList = selectedCareer.requiredSkills || ["Python", "SQL", "Problem Solving"];
  const advancedCount = skillsList.filter((s) => store.skillStatuses[s] === "Advanced").length;
  const intermediateCount = skillsList.filter((s) => store.skillStatuses[s] === "Intermediate").length;
  const learningCount = skillsList.filter((s) => store.skillStatuses[s] === "Learning").length;

  const readinessScore = skillsList.length > 0
    ? Math.min(
        100,
        Math.round(
          ((advancedCount * 1.0 + intermediateCount * 0.65 + learningCount * 0.3) /
            skillsList.length) *
            100
        )
      )
    : 50;

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
              <Zap className="size-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold font-display text-foreground">
              Skill Gap & Readiness Analysis
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Compare your current skill competencies against target industry requirements.
          </p>
        </div>
      </div>

      {/* Target Career Selection Card */}
      <Card className="glass p-5 rounded-3xl border-border/80 shadow-md bg-card/90 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground block">Select Target Dream Career:</span>
            <Select value={selectedCareer.id} onValueChange={handleCareerChange}>
              <SelectTrigger className="w-72 h-10 rounded-xl text-xs font-semibold bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-2xl max-h-64">
                {careersList.map((c) => (
                  <SelectItem key={c.id} value={c.id} className="text-xs">
                    {c.name} ({c.domain})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-medium text-muted-foreground block">Role Readiness Index</span>
            <span className="text-xl font-bold text-primary font-display">{readinessScore}% Match</span>
          </div>
        </div>

        <div className="space-y-1.5 pt-2 border-t border-border/40">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Core Competency Progress</span>
            <span className="font-semibold text-foreground">
              {advancedCount} Advanced · {intermediateCount} Intermediate · {skillsList.length - advancedCount - intermediateCount} To Learn
            </span>
          </div>
          <Progress value={readinessScore} className="h-2 rounded-full" />
        </div>
      </Card>

      {/* Skills Matrix */}
      <div className="space-y-3">
        <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
          <Sparkles className="size-4 text-primary" /> Required Skills & Your Current Level
        </h3>

        <div className="space-y-2.5">
          {skillsList.map((skill, idx) => {
            const status = store.skillStatuses[skill] ?? "Not Started";
            const isHighPriority = idx < 3;

            return (
              <Card
                key={skill}
                className="p-4 rounded-2xl border border-border/80 hover:border-primary/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs bg-card"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-xs sm:text-sm text-foreground">{skill}</p>
                    {isHighPriority && (
                      <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20 text-[9px] py-0">
                        High Priority
                      </Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Required for {selectedCareer.name} technical assessments and job roles.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-muted-foreground hidden sm:inline">Proficiency:</span>
                  <Select
                    value={status}
                    onValueChange={(val: SkillStatus) => handleStatusChange(skill, val)}
                  >
                    <SelectTrigger
                      className={`w-36 h-8 rounded-xl text-xs font-semibold ${
                        status === "Advanced"
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                          : status === "Intermediate"
                          ? "bg-sky-500/10 text-sky-600 border-sky-500/30"
                          : status === "Learning"
                          ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      {STATUS_OPTIONS.map((st) => (
                        <SelectItem key={st} value={st} className="text-xs">
                          {st}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recommended Learning Path */}
      <Card className="glass p-5 rounded-3xl border-border/80 shadow-md bg-card/90 space-y-3">
        <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
          <BookOpen className="size-4 text-primary" /> Recommended Next Steps
        </h4>
        <div className="space-y-2 text-xs text-foreground/90">
          <p className="leading-relaxed">
            To achieve a 90%+ readiness score for <strong>{selectedCareer.name}</strong>, focus on converting your highest-priority missing skills into "Intermediate" through 30 days of structured hands-on projects.
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <Link
              to="/resources"
              className="inline-flex items-center gap-1.5 gradient-brand text-primary-foreground font-bold text-xs py-2 px-3.5 rounded-xl shadow-xs"
            >
              Explore Learning Resources →
            </Link>
            <Link
              to="/study-planner"
              className="inline-flex items-center gap-1.5 border border-border bg-accent/40 text-foreground font-semibold text-xs py-2 px-3.5 rounded-xl hover:bg-accent"
            >
              Schedule Daily Practice Plan
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
