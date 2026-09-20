import { useEffect, useState } from "react";
import {
  Bell,
  Calendar,
  ExternalLink,
  Filter,
  Info,
  Loader2,
  RefreshCw,
  Search,
  Sparkles,
} from "lucide-react";

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
import { ExamNewsItem, fetchGeminiExamNews } from "@/lib/gemini-news";

const CATEGORIES = ["All", "Engineering", "Medical", "Civil Services", "Banking", "Defense", "Management"] as const;

export function ExamNewsSection() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [news, setNews] = useState<ExamNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAiPowered, setIsAiPowered] = useState(false);
  const [selectedExam, setSelectedExam] = useState<ExamNewsItem | null>(null);

  const loadExamNews = async (cat: string) => {
    setLoading(true);
    const result = await fetchGeminiExamNews(cat);
    setNews(result.items);
    setIsAiPowered(result.source === "ai");
    setLoading(false);
  };

  useEffect(() => {
    loadExamNews(selectedCategory);
  }, [selectedCategory]);

  const filteredNews = news.filter((item) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      item.title.toLowerCase().includes(query) ||
      item.shortName.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.summary.toLowerCase().includes(query)
    );
  });

  const getStatusBadge = (status: ExamNewsItem["status"]) => {
    switch (status) {
      case "Registration Open":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {status}
          </span>
        );
      case "Admit Card Released":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25">
            <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
            {status}
          </span>
        );
      case "Results Declared":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/25">
            <span className="size-1.5 rounded-full bg-blue-500" />
            {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-secondary text-secondary-foreground border border-border">
            {status}
          </span>
        );
    }
  };

  return (
    <section id="exam-news" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary backdrop-blur-xs">
            <Sparkles className="size-3.5 text-primary animate-pulse" />
            Gemini AI Live Updates
          </div>
          <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl text-foreground">
            Recent Government & Entrance Exam News
          </h2>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base max-w-2xl leading-relaxed">
            Stay updated with real-time exam notifications, eligibility, key dates, and application portals across India.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          disabled={loading}
          onClick={() => loadExamNews(selectedCategory)}
          className="h-10 rounded-xl gap-2 border-border/80 bg-card/80 hover:bg-primary/10 hover:border-primary/40 hover:text-primary self-start md:self-auto cursor-pointer transition-all"
        >
          <RefreshCw className={`size-4 text-primary ${loading ? "animate-spin" : ""}`} />
          <span>{loading ? "Updating AI News..." : "Refresh News"}</span>
        </Button>
      </div>

      {/* Category filters & Search input */}
      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "gradient-brand text-primary-foreground shadow-glow scale-[1.02]"
                  : "bg-card/85 hover:bg-accent text-muted-foreground hover:text-foreground border border-border/70 hover:border-primary/30"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72 shrink-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search exam, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 rounded-xl bg-card/80 border-border/85 text-xs sm:text-sm"
          />
        </div>
      </div>

      {/* Exam News Grid */}
      {loading ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse rounded-2xl p-6 space-y-4 border-border/60 bg-card/50">
              <div className="h-5 bg-accent/60 rounded-full w-1/3" />
              <div className="h-6 bg-accent/80 rounded-xl w-3/4" />
              <div className="h-16 bg-accent/50 rounded-xl w-full" />
              <div className="h-4 bg-accent/40 rounded-lg w-1/2" />
            </Card>
          ))}
        </div>
      ) : filteredNews.length === 0 ? (
        <div className="mt-12 text-center py-14 rounded-3xl bg-card/40 border border-dashed border-border/80">
          <Bell className="mx-auto size-10 text-muted-foreground/50" />
          <h3 className="mt-3 text-lg font-semibold text-foreground">No exam news found</h3>
          <p className="mt-1 text-xs text-muted-foreground">Try clearing your search query or selecting another category.</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredNews.map((item) => (
            <Card
              key={item.id}
              className="hover-lift glass group flex flex-col justify-between rounded-2xl p-6 border-border/80 transition-all hover:border-primary/40 h-full shadow-soft hover:shadow-elegant"
            >
              <div>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <Badge variant="outline" className="text-[11px] font-semibold border-primary/20 bg-primary/5 text-primary">
                    {item.category}
                  </Badge>
                  {getStatusBadge(item.status)}
                </div>

                <h3 className="mt-4 font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                  {item.title}
                </h3>

                <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground line-clamp-3">
                  {item.summary}
                </p>

                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground border-t border-border/60 pt-3">
                  <Calendar className="size-3.5 text-primary shrink-0" />
                  <span className="truncate">Exam Date: <strong className="text-foreground font-semibold">{item.date}</strong></span>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between pt-2 border-t border-border/40">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedExam(item)}
                  className="h-9 px-3 text-xs font-semibold text-primary hover:text-primary hover:bg-primary/10 rounded-xl cursor-pointer"
                >
                  <Info className="mr-1.5 size-3.5" />
                  View Details & Syllabus
                </Button>

                {item.officialUrl && (
                  <a
                    href={item.officialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-colors"
                    title="Official Website"
                    aria-label="Official Website"
                  >
                    <ExternalLink className="size-4" />
                  </a>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Exam Details Modal */}
      {selectedExam && (
        <Dialog open={!!selectedExam} onOpenChange={() => setSelectedExam(null)}>
          <DialogContent className="max-w-xl rounded-3xl p-6 sm:p-8 bg-card/95 backdrop-blur-xl border-border">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                  {selectedExam.category}
                </Badge>
                {getStatusBadge(selectedExam.status)}
              </div>
              <DialogTitle className="text-xl font-bold font-display text-foreground leading-tight">
                {selectedExam.title}
              </DialogTitle>
            </DialogHeader>

            <div className="mt-4 space-y-4 text-sm">
              <div className="rounded-2xl bg-accent/40 p-4 border border-border/70">
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Eligibility Criteria</p>
                <p className="mt-1 font-medium text-foreground text-xs sm:text-sm leading-relaxed">{selectedExam.eligibility}</p>
              </div>

              <div>
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Overview</p>
                <p className="mt-1 leading-relaxed text-muted-foreground text-xs sm:text-sm">{selectedExam.summary}</p>
              </div>

              <div>
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Key Highlights & Updates</p>
                <ul className="space-y-2">
                  {selectedExam.highlights.map((hl, index) => (
                    <li key={index} className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground">
                      <span className="mt-1.5 size-1.5 rounded-full bg-primary shrink-0" />
                      <span className="leading-relaxed">{hl}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-border/80 flex items-center justify-between gap-3">
                <div className="text-xs text-muted-foreground">
                  Target Window: <strong className="text-foreground">{selectedExam.date}</strong>
                </div>

                {selectedExam.officialUrl && (
                  <Button className="gradient-brand text-primary-foreground rounded-xl text-xs gap-1.5 shadow-glow hover:opacity-95" asChild>
                    <a href={selectedExam.officialUrl} target="_blank" rel="noreferrer">
                      Official Portal <ExternalLink className="size-3.5" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </section>
  );
}
