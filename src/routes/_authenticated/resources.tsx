import { useState, useMemo, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  BookOpen,
  Bookmark,
  CheckCircle,
  ExternalLink,
  FileText,
  Filter,
  Search,
  Star,
  Video,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getManagedResources } from "@/lib/store/admin-content-store";
import { LearningResourceItem } from "@/lib/data/resources-data";
import { isBookmarked, toggleBookmark } from "@/lib/store/careersetu-store";

export const Route = createFileRoute("/_authenticated/resources")({
  head: () => ({
    meta: [
      { title: "Learning Resources — CareerSetu" },
      {
        name: "description",
        content: "Curated learning materials, standard textbooks, official PYQs, YouTube lecture series, and free study notes.",
      },
    ],
  }),
  component: LearningResourcesPage,
});

const RESOURCE_CATEGORIES = [
  "All Categories",
  "Standard Books",
  "Official Portals & Syllabus",
  "YouTube Courses",
  "Practice Papers & PYQs",
  "Free PDFs & Notes",
];

function LearningResourcesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [bookmarkedMap, setBookmarkedMap] = useState<Record<string, boolean>>({});
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});
  const [resourcesList, setResourcesList] = useState<LearningResourceItem[]>([]);

  useEffect(() => {
    const live = getManagedResources().filter((r) => r.status !== "ARCHIVED");
    setResourcesList(live);

    const bMap: Record<string, boolean> = {};
    live.forEach((r) => {
      bMap[r.id] = isBookmarked("resources", r.id);
    });
    setBookmarkedMap(bMap);

    if (typeof localStorage !== "undefined") {
      const comp = localStorage.getItem("careersetu_completed_resources");
      if (comp) {
        try {
          setCompletedMap(JSON.parse(comp));
        } catch {}
      }
    }
  }, []);

  const handleToggleBookmark = (id: string) => {
    const isNow = toggleBookmark("resources", id);
    setBookmarkedMap((prev) => ({ ...prev, [id]: isNow }));
    toast.success(isNow ? "Resource saved to bookmarks" : "Removed from bookmarks");
  };

  const handleToggleComplete = (id: string) => {
    const updated = { ...completedMap, [id]: !completedMap[id] };
    setCompletedMap(updated);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("careersetu_completed_resources", JSON.stringify(updated));
    }
    toast.success(updated[id] ? "Marked resource as completed! 🎉" : "Marked as incomplete");
  };

  const filteredResources = useMemo(() => {
    return resourcesList.filter((r) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        r.title.toLowerCase().includes(q) ||
        (r.authorOrProvider && r.authorOrProvider.toLowerCase().includes(q)) ||
        (r.targetExamOrCareer && r.targetExamOrCareer.toLowerCase().includes(q)) ||
        (r.tags && r.tags.some((t) => t.toLowerCase().includes(q)));

      const matchesCat =
        selectedCategory === "All Categories" || r.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [resourcesList, searchQuery, selectedCategory]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
              <BookOpen className="size-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold font-display text-foreground">
              Curated Learning Resources & PYQs
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Standard textbooks, official previous year question banks, free YouTube series, and verified portals.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="glass p-4 rounded-3xl border-border/80 shadow-xs space-y-3 bg-card/80">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by book, exam, author, topic..."
              className="pl-9 h-10 rounded-xl bg-background border-border text-xs sm:text-sm"
            />
          </div>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="rounded-xl h-10 text-xs bg-background">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              {RESOURCE_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c} className="text-xs">
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between text-xs pt-1 text-muted-foreground">
          <span>Showing {filteredResources.length} verified learning resources</span>
          {(searchQuery || selectedCategory !== "All Categories") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All Categories");
              }}
              className="text-primary hover:underline text-[11px] font-medium cursor-pointer"
            >
              Clear Filters
            </button>
          )}
        </div>
      </Card>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredResources.map((res) => {
          const isSaved = bookmarkedMap[res.id];
          const isDone = completedMap[res.id];

          return (
            <Card
              key={res.id}
              className={`glass p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-4 shadow-xs hover:shadow-lg ${
                isDone ? "bg-muted/30 border-border/50 opacity-80" : "bg-card/90 border-border/80 hover:border-primary/40"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="outline" className="text-[10px] border-primary/20 text-primary bg-primary/5">
                    {res.category}
                  </Badge>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                      <Star className="size-3 fill-amber-500 text-amber-500" /> {res.rating}
                    </span>
                    <button
                      onClick={() => handleToggleBookmark(res.id)}
                      className="p-1 rounded-lg text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                      title="Bookmark resource"
                    >
                      <Bookmark className={`size-3.5 ${isSaved ? "fill-primary text-primary" : ""}`} />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-base text-foreground leading-snug">
                    {res.title}
                  </h3>
                  <p className="text-xs font-semibold text-primary mt-0.5">
                    {res.authorOrProvider} · Target: {res.targetExamOrCareer}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                    {res.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1 pt-1">
                  {res.tags.map((t) => (
                    <span key={t} className="text-[10px] px-2 py-0.5 rounded-md bg-accent text-foreground font-mono">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-3 border-t border-border/40">
                <button
                  onClick={() => handleToggleComplete(res.id)}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl border transition-colors cursor-pointer ${
                    isDone
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                      : "hover:bg-accent border-border text-muted-foreground"
                  }`}
                >
                  <CheckCircle className={`size-3.5 ${isDone ? "fill-emerald-500 text-white" : ""}`} />
                  <span>{isDone ? "Completed" : "Mark Done"}</span>
                </button>

                <a
                  href={res.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                >
                  Open {res.sourceLabel} <ExternalLink className="size-3.5" />
                </a>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
