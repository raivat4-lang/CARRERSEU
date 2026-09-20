import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Award,
  Bookmark,
  CalendarCheck,
  CheckCircle2,
  Compass,
  FileText,
  Flame,
  GraduationCap,
  Landmark,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DEFAULT_ACHIEVEMENTS, AchievementItem } from "@/lib/data/achievements-data";
import { getAssessmentResults, getStudyTasks, getBookmarks } from "@/lib/store/careersetu-store";

export const Route = createFileRoute("/_authenticated/progress")({
  head: () => ({
    meta: [
      { title: "Progress & Achievements — CareerSetu" },
      {
        name: "description",
        content: "Track your study streaks, assessment history, completed milestones, and unlocked achievement badges.",
      },
    ],
  }),
  component: ProgressPage,
});

function ProgressPage() {
  const [achievements, setAchievements] = useState<AchievementItem[]>(DEFAULT_ACHIEVEMENTS);
  const results = getAssessmentResults();
  const studyTasks = getStudyTasks();
  const bookmarks = getBookmarks();

  const completedTasks = studyTasks.filter((t) => t.completed).length;
  const totalBookmarks =
    bookmarks.careers.length +
    bookmarks.exams.length +
    bookmarks.scholarships.length +
    bookmarks.colleges.length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-amber-500/10 text-amber-500">
              <Trophy className="size-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold font-display text-foreground">
              Learning Progress & Achievements
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Track your milestones, examination consistency, and unlocked student honors.
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="glass p-4 rounded-2xl border-border/80 text-center space-y-1 bg-card/90">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Study Streak</span>
          <p className="text-xl font-bold text-amber-500 flex items-center justify-center gap-1">
            <Flame className="size-5" /> 7 Days
          </p>
        </Card>

        <Card className="glass p-4 rounded-2xl border-border/80 text-center space-y-1 bg-card/90">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Tasks Completed</span>
          <p className="text-xl font-bold text-emerald-500 flex items-center justify-center gap-1">
            <CheckCircle2 className="size-5" /> {completedTasks} Done
          </p>
        </Card>

        <Card className="glass p-4 rounded-2xl border-border/80 text-center space-y-1 bg-card/90">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Saved Pathways</span>
          <p className="text-xl font-bold text-primary flex items-center justify-center gap-1">
            <Bookmark className="size-5" /> {totalBookmarks}
          </p>
        </Card>

        <Card className="glass p-4 rounded-2xl border-border/80 text-center space-y-1 bg-card/90">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Assessment</span>
          <p className="text-xl font-bold text-primary flex items-center justify-center gap-1">
            <Target className="size-5" /> 100%
          </p>
        </Card>
      </div>

      {/* Achievements Badges Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
            <Award className="size-4 text-primary" /> Unlocked Honors & Badges
          </h3>
          <span className="text-xs text-muted-foreground font-semibold">
            {achievements.filter((a) => a.unlocked).length} of {achievements.length} Badges Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {achievements.map((ach) => (
            <Card
              key={ach.id}
              className={`p-4 rounded-3xl border transition-all flex flex-col justify-between space-y-3 shadow-xs ${
                ach.unlocked
                  ? "bg-card/95 border-amber-500/30 shadow-md"
                  : "bg-muted/30 border-border/40 opacity-60"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <span
                    className={`grid size-10 place-items-center rounded-2xl text-base ${
                      ach.unlocked
                        ? "bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-xs"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    🏆
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-[9px] ${
                      ach.unlocked
                        ? "border-emerald-500/30 text-emerald-500 bg-emerald-500/5"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    {ach.unlocked ? "Unlocked" : "In Progress"}
                  </Badge>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-foreground">{ach.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{ach.description}</p>
                </div>
              </div>

              <div className="space-y-1 pt-1 border-t border-border/40">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>Progress</span>
                  <span>{ach.progressPercent}%</span>
                </div>
                <Progress value={ach.progressPercent} className="h-1.5 rounded-full" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
