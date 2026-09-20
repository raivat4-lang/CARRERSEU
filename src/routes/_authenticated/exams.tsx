import { useState, useMemo, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Bookmark,
  Calendar,
  CheckCircle,
  ExternalLink,
  Filter,
  Landmark,
  RotateCcw,
  Search,
  ShieldAlert,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getManagedExams } from "@/lib/store/admin-content-store";
import { GovernmentExamItem } from "@/lib/data/exams-data";
import { isBookmarked, toggleBookmark } from "@/lib/store/careersetu-store";

export const Route = createFileRoute("/_authenticated/exams")({
  head: () => ({
    meta: [
      { title: "Government & National Exams — CareerSetu" },
      {
        name: "description",
        content: "Discover 20+ national entrance and government exams like UPSC, GATE, SSC CGL, RBI Grade B, and ISRO with official eligibility and syllabus.",
      },
    ],
  }),
  component: ExamsFinderPage,
});

const EXAM_CATEGORIES = [
  "All Categories",
  "Civil Services",
  "Engineering & Science",
  "Defense & Police",
  "Banking & Finance",
];

const STATUS_FILTERS = ["All Statuses", "Registration Open", "Upcoming", "Admit Card Released"];

function ExamsFinderPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");
  const [selectedExam, setSelectedExam] = useState<GovernmentExamItem | null>(null);
  const [bookmarkedMap, setBookmarkedMap] = useState<Record<string, boolean>>({});
  const [examsList, setExamsList] = useState<GovernmentExamItem[]>([]);

  useEffect(() => {
    const live = getManagedExams().filter((e) => e.status !== "ARCHIVED");
    setExamsList(live);

    const bMap: Record<string, boolean> = {};
    live.forEach((e) => {
      bMap[e.id] = isBookmarked("exams", e.id);
    });
    setBookmarkedMap(bMap);
  }, []);

  const handleToggleBookmark = (examId: string) => {
    const isNow = toggleBookmark("exams", examId);
    setBookmarkedMap((prev) => ({ ...prev, [examId]: isNow }));
    toast.success(isNow ? "Exam added to bookmarks" : "Removed from bookmarks");
  };

  const filteredExams = useMemo(() => {
    return examsList.filter((e) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        e.name.toLowerCase().includes(q) ||
        (e.shortName && e.shortName.toLowerCase().includes(q)) ||
        (e.conductingBody && e.conductingBody.toLowerCase().includes(q)) ||
        (e.category && e.category.toLowerCase().includes(q));

      const matchesCat =
        selectedCategory === "All Categories" || e.category === selectedCategory;

      const matchesStatus =
        selectedStatus === "All Statuses" || e.status === selectedStatus;

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [examsList, searchQuery, selectedCategory, selectedStatus]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All Categories");
    setSelectedStatus("All Statuses");
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-blue-500/10 text-blue-500">
              <Landmark className="size-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold font-display text-foreground">
              Government & National Exam Finder
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Track official timelines, eligibility, age limits, syllabus patterns, and salary scales.
          </p>
        </div>

        <Link
          to="/study-planner"
          className="shrink-0 inline-flex items-center gap-1.5 gradient-brand text-primary-foreground font-bold text-xs py-2 px-3.5 rounded-2xl shadow-glow"
        >
          <Calendar className="size-4" /> Create Study Plan
        </Link>
      </div>

      {/* Filter Bar */}
      <Card className="glass p-4 rounded-3xl border-border/80 shadow-xs space-y-3 bg-card/80">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search UPSC, GATE, SSC, ISRO..."
              className="pl-9 h-10 rounded-xl bg-background border-border text-xs sm:text-sm"
            />
          </div>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="rounded-xl h-10 text-xs bg-background">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              {EXAM_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c} className="text-xs">
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="rounded-xl h-10 text-xs bg-background">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              {STATUS_FILTERS.map((s) => (
                <SelectItem key={s} value={s} className="text-xs">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Active Filter summary */}
        <div className="flex items-center justify-between text-xs pt-1">
          <span className="text-muted-foreground font-semibold">
            Showing {filteredExams.length} Active National Exams
          </span>
          {(searchQuery || selectedCategory !== "All Categories" || selectedStatus !== "All Statuses") && (
            <button
              onClick={resetFilters}
              className="text-[11px] text-primary hover:underline flex items-center gap-1 cursor-pointer font-medium"
            >
              <RotateCcw className="size-3" /> Reset Filters
            </button>
          )}
        </div>
      </Card>

      {/* Exams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredExams.map((exam) => {
          const isSaved = bookmarkedMap[exam.id];

          return (
            <Card
              key={exam.id}
              className="glass p-5 rounded-3xl border-border/80 hover:border-blue-500/40 transition-all shadow-xs hover:shadow-lg flex flex-col justify-between space-y-4 bg-card/90"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="outline" className="text-[10px] border-blue-500/30 text-blue-500 bg-blue-500/5">
                    {exam.category}
                  </Badge>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        exam.status === "Registration Open"
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30 animate-pulse"
                          : exam.status === "Admit Card Released"
                          ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
                          : "bg-accent text-foreground/80 border-border"
                      }`}
                    >
                      {exam.status}
                    </span>
                    <button
                      onClick={() => handleToggleBookmark(exam.id)}
                      className="p-1 rounded-lg text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                      title="Bookmark exam"
                    >
                      <Bookmark className={`size-3.5 ${isSaved ? "fill-primary text-primary" : ""}`} />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-base text-foreground leading-snug">
                    {exam.name}
                  </h3>
                  <p className="text-[11px] font-semibold text-primary mt-0.5">
                    {exam.conductingBody} · {exam.frequency}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                    {exam.summary}
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-border/40 text-xs text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>Age Limit:</span>
                    <strong className="text-foreground">{exam.ageLimit}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Starting Package:</span>
                    <strong className="text-emerald-500">{exam.salaryPayScale.split("->")[0]?.slice(0, 32)}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Last Updated:</span>
                    <span className="text-[11px] font-mono text-muted-foreground">{exam.lastUpdated}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedExam(exam)}
                  className="flex-1 rounded-xl text-xs font-semibold hover:bg-accent cursor-pointer"
                >
                  View Details & Pattern →
                </Button>
                <a
                  href={exam.officialWebsite}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl border border-border hover:bg-accent text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Official Website"
                >
                  <ExternalLink className="size-4" />
                </a>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Exam Details Modal */}
      {selectedExam && (
        <Dialog open={!!selectedExam} onOpenChange={() => setSelectedExam(null)}>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto p-6 sm:p-8 rounded-3xl">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 text-xs">
                  {selectedExam.category}
                </Badge>
                <span className="text-xs font-bold text-muted-foreground">
                  Official Portal: {selectedExam.conductingBody}
                </span>
              </div>
              <DialogTitle className="text-xl sm:text-2xl font-bold font-display text-foreground">
                {selectedExam.name} ({selectedExam.shortName})
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 text-xs sm:text-sm mt-2">
              <p className="text-foreground/90 leading-relaxed bg-accent/30 p-3.5 rounded-2xl border border-border/60">
                {selectedExam.summary}
              </p>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-2xl bg-card border border-border">
                  <span className="text-[10px] text-muted-foreground block">Eligibility Qualification</span>
                  <strong className="text-foreground text-xs">{selectedExam.eligibility}</strong>
                </div>
                <div className="p-3 rounded-2xl bg-card border border-border">
                  <span className="text-[10px] text-muted-foreground block">Age Bracket</span>
                  <strong className="text-foreground text-xs">{selectedExam.ageLimit}</strong>
                </div>
                <div className="p-3 rounded-2xl bg-card border border-border">
                  <span className="text-[10px] text-muted-foreground block">Pay Scale & Allowances</span>
                  <strong className="text-emerald-500 text-xs">{selectedExam.salaryPayScale}</strong>
                </div>
              </div>

              {/* Exam Pattern & Stages */}
              <div className="p-4 rounded-2xl bg-accent/20 border border-border space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-primary" /> Examination Structure & Pattern
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div><span className="text-muted-foreground block text-[10px]">Total Marks:</span><strong>{selectedExam.examPattern.totalMarks}</strong></div>
                  <div><span className="text-muted-foreground block text-[10px]">Duration:</span><strong>{selectedExam.examPattern.duration}</strong></div>
                  <div><span className="text-muted-foreground block text-[10px]">Mode:</span><strong>{selectedExam.examPattern.mode}</strong></div>
                  <div><span className="text-muted-foreground block text-[10px]">Negative Marking:</span><strong>{selectedExam.examPattern.negativeMarking}</strong></div>
                </div>
              </div>

              {/* Syllabus Highlights */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Syllabus Highlights</h4>
                <ul className="space-y-1.5 text-xs text-foreground/90">
                  {selectedExam.syllabusHighlights.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="size-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Previous Year Cutoff & Prep Tips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-card border border-border space-y-1">
                  <h5 className="font-bold text-xs text-foreground">Previous Year Cutoff:</h5>
                  <p className="text-xs text-muted-foreground font-mono">{selectedExam.previousYearCutoff}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-card border border-border space-y-1">
                  <h5 className="font-bold text-xs text-foreground">Official Timeline:</h5>
                  <p className="text-xs text-muted-foreground">{selectedExam.applicationTimeline}</p>
                </div>
              </div>

              {/* Trust Disclaimer */}
              <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-600 dark:text-amber-400">
                <ShieldAlert className="size-4 shrink-0 mt-0.5" />
                <span>
                  Official information last verified: <strong>{selectedExam.lastUpdated}</strong>. Always confirm dates and updates on the official website:{" "}
                  <a href={selectedExam.officialWebsite} target="_blank" rel="noreferrer" className="underline font-semibold">
                    {selectedExam.officialWebsite}
                  </a>.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleBookmark(selectedExam.id)}
                  className="rounded-xl cursor-pointer"
                >
                  <Bookmark className={`size-3.5 mr-1 ${bookmarkedMap[selectedExam.id] ? "fill-primary text-primary" : ""}`} />
                  {bookmarkedMap[selectedExam.id] ? "Bookmarked" : "Bookmark Exam"}
                </Button>

                <div className="flex items-center gap-2">
                  <a
                    href={selectedExam.officialWebsite}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border hover:bg-accent text-xs font-semibold cursor-pointer"
                  >
                    Official Portal <ExternalLink className="size-3.5" />
                  </a>
                  <Link
                    to="/study-planner"
                    className="gradient-brand text-primary-foreground font-bold text-xs py-2 px-4 rounded-xl shadow-xs"
                  >
                    Create Study Plan →
                  </Link>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
