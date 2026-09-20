import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Bookmark,
  CheckCircle,
  Compass,
  FileText,
  GraduationCap,
  Lightbulb,
  Redo,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getManagedCareers } from "@/lib/store/admin-content-store";
import {
  getAssessmentResults,
  isBookmarked,
  toggleBookmark,
} from "@/lib/store/careersetu-store";

export const Route = createFileRoute("/_authenticated/assessment-results")({
  head: () => ({
    meta: [
      { title: "Assessment Results — CareerSetu" },
      {
        name: "description",
        content: "View your AI Career Assessment personality analysis, interest radar, and top recommended career paths.",
      },
    ],
  }),
  component: AssessmentResultsPage,
});

function AssessmentResultsPage() {
  const navigate = useNavigate();
  const [results, setResults] = useState(getAssessmentResults());
  const [bookmarkedMap, setBookmarkedMap] = useState<Record<string, boolean>>({});
  const allCareers = getManagedCareers().filter((c) => c.status !== "ARCHIVED");

  useEffect(() => {
    const res = getAssessmentResults();
    setResults(res);

    const bMap: Record<string, boolean> = {};
    allCareers.forEach((c) => {
      bMap[c.id] = isBookmarked("careers", c.id);
    });
    setBookmarkedMap(bMap);
  }, []);

  const handleToggleBookmark = (careerId: string) => {
    const isNowBookmarked = toggleBookmark("careers", careerId);
    setBookmarkedMap((prev) => ({ ...prev, [careerId]: isNowBookmarked }));
    toast.success(isNowBookmarked ? "Career added to bookmarks" : "Career removed from bookmarks");
  };

  const topCareers = results.recommendedCareerIds
    .map((id) => allCareers.find((c) => c.id === id) || CAREERS_DATA.find((c) => c.id === id))
    .filter(Boolean);

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-2">
      {/* Header Banner */}
      <div className="gradient-brand p-6 sm:p-8 rounded-3xl text-primary-foreground shadow-glow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Badge className="bg-white/20 text-white border-0 text-xs font-semibold backdrop-blur">
            Verified AI Assessment Report
          </Badge>
          <h1 className="text-xl sm:text-3xl font-bold font-display leading-tight">
            Your Personalized Career Blueprint 🎯
          </h1>
          <p className="text-xs sm:text-sm opacity-90 max-w-xl leading-relaxed">
            Based on your responses across 50 adaptive behavioral and domain questions, here is your multidimensional career compatibility profile.
          </p>
        </div>

        <Link
          to="/assessment"
          className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-primary font-bold text-xs shadow-md hover:bg-white/90 transition-all"
        >
          <Redo className="size-3.5" /> Retake Test
        </Link>
      </div>

      {/* Grid: Radar Chart & Personality Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Radar Chart Card */}
        <Card className="glass p-5 rounded-3xl border-border/80 shadow-md space-y-3 bg-card/90">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
              <Sparkles className="size-4 text-primary" /> Career Interest Spectrum
            </h3>
            <span className="text-[10px] text-muted-foreground font-mono">Multidimensional Scale</span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={results.radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                <PolarGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                <PolarAngleAxis dataKey="area" tick={{ fill: "hsl(var(--foreground))", fontSize: 11 }} />
                <Radar
                  name="Interest Score"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.4}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "0.75rem",
                    fontSize: "12px",
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Personality & Learning Style */}
        <Card className="glass p-5 rounded-3xl border-border/80 shadow-md space-y-4 bg-card/90 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
              <Lightbulb className="size-4 text-amber-500" /> Cognitive & Personality Profile
            </h3>
            <p className="text-xs text-foreground/90 leading-relaxed bg-accent/40 p-3 rounded-2xl border border-border/60">
              {results.personalitySummary}
            </p>

            <div>
              <p className="text-[11px] font-semibold text-muted-foreground mb-1">Top Signature Traits:</p>
              <div className="flex flex-wrap gap-1.5">
                {results.topTraits.map((trait) => (
                  <Badge key={trait} variant="secondary" className="text-[11px] rounded-lg bg-primary/10 text-primary border border-primary/20 font-semibold">
                    {trait}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[11px] font-semibold text-muted-foreground mb-1">Optimal Learning Style:</p>
              <p className="text-xs text-foreground/90 leading-relaxed">
                {results.learningStyle}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Strengths & Growth Areas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-5 rounded-3xl border-emerald-500/20 bg-emerald-500/5 shadow-xs space-y-2.5">
          <h4 className="font-bold text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <CheckCircle className="size-4" /> Core Key Strengths
          </h4>
          <ul className="space-y-1.5 text-xs text-foreground/90">
            {results.strengths.map((s, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="size-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5 rounded-3xl border-amber-500/20 bg-amber-500/5 shadow-xs space-y-2.5">
          <h4 className="font-bold text-xs sm:text-sm text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
            <TrendingUp className="size-4" /> Strategic Growth Areas
          </h4>
          <ul className="space-y-1.5 text-xs text-foreground/90">
            {results.growthAreas.map((g, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="size-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                <span>{g}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Recommended Careers Section */}
      <div className="space-y-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold font-display text-foreground flex items-center gap-2">
              <Compass className="size-5 text-primary" /> Top Recommended Careers for You
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Ranked by deterministic behavioral compatibility, stream prerequisites, and growth demand.
            </p>
          </div>
          <Link
            to="/careers"
            className="text-xs font-semibold text-primary hover:underline"
          >
            Explore 100+ Careers →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topCareers.map((c, index) => {
            if (!c) return null;
            const matchPercentage = 98 - index * 3;
            const isSaved = bookmarkedMap[c.id];

            return (
              <Card
                key={c.id}
                className="glass p-5 rounded-3xl border-border/80 hover:border-primary/40 transition-all shadow-md hover:shadow-lg flex flex-col justify-between space-y-4 bg-card/90"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="outline" className="text-[11px] border-primary/20 text-primary bg-primary/5">
                      {c.domain}
                    </Badge>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        {matchPercentage}% Match
                      </span>
                      <button
                        onClick={() => handleToggleBookmark(c.id)}
                        className="p-1 rounded-lg text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                        title="Bookmark career"
                      >
                        <Bookmark className={`size-4 ${isSaved ? "fill-primary text-primary" : ""}`} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-foreground leading-snug">
                      {c.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                      {c.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-border/40 text-muted-foreground">
                    <span>Salary: <strong className="text-foreground">{c.salary}</strong></span>
                    <span>Demand: <strong className="text-foreground">{c.demand}</strong></span>
                  </div>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {c.requiredSkills.slice(0, 4).map((skill) => (
                      <span key={skill} className="text-[10px] px-2 py-0.5 rounded-md bg-accent text-foreground font-mono">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Link
                    to="/careers"
                    className="flex-1 gradient-brand text-primary-foreground font-semibold text-xs py-2 px-3 rounded-xl text-center shadow-xs hover:opacity-95 transition-opacity"
                  >
                    View Roadmap & Details →
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
