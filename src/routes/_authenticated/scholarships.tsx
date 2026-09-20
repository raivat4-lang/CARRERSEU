import { useState, useMemo, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Bookmark,
  Calendar,
  CheckCircle,
  ExternalLink,
  GraduationCap,
  RotateCcw,
  Search,
  ShieldCheck,
  Wallet,
  X,
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
import { getManagedScholarships } from "@/lib/store/admin-content-store";
import { ScholarshipItem } from "@/lib/data/scholarships-data";
import { isBookmarked, toggleBookmark } from "@/lib/store/careersetu-store";

export const Route = createFileRoute("/_authenticated/scholarships")({
  head: () => ({
    meta: [
      { title: "Scholarship Finder — CareerSetu" },
      {
        name: "description",
        content: "Discover verified government and CSR scholarships for Indian school and college students with active application deadlines.",
      },
    ],
  }),
  component: ScholarshipsFinderPage,
});

const SCHOLARSHIP_CATEGORIES = [
  "All Categories",
  "Central Government",
  "State Government",
  "Corporate CSR",
  "Women in STEM",
];

function ScholarshipsFinderPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [bookmarkedMap, setBookmarkedMap] = useState<Record<string, boolean>>({});
  const [scholarshipsList, setScholarshipsList] = useState<ScholarshipItem[]>([]);

  useEffect(() => {
    const live = getManagedScholarships().filter((s) => s.status !== "ARCHIVED");
    setScholarshipsList(live);

    const bMap: Record<string, boolean> = {};
    live.forEach((s) => {
      bMap[s.id] = isBookmarked("scholarships", s.id);
    });
    setBookmarkedMap(bMap);
  }, []);

  const handleToggleBookmark = (id: string) => {
    const isNow = toggleBookmark("scholarships", id);
    setBookmarkedMap((prev) => ({ ...prev, [id]: isNow }));
    toast.success(isNow ? "Scholarship added to bookmarks" : "Removed from bookmarks");
  };

  const filteredScholarships = useMemo(() => {
    return scholarshipsList.filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.provider.toLowerCase().includes(q) ||
        (s.eligibleStates && s.eligibleStates.some((st) => st.toLowerCase().includes(q)));

      const matchesCat =
        selectedCategory === "All Categories" || s.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [scholarshipsList, searchQuery, selectedCategory]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-amber-500/10 text-amber-500">
              <GraduationCap className="size-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold font-display text-foreground">
              National & State Scholarship Finder
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Verified financial aid programs, income ceilings, official portals, and active deadlines.
          </p>
        </div>
      </div>

      {/* Filter Card */}
      <Card className="glass p-4 rounded-3xl border-border/80 shadow-xs space-y-3 bg-card/80">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by scholarship, state, provider..."
              className="pl-9 h-10 rounded-xl bg-background border-border text-xs sm:text-sm"
            />
          </div>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="rounded-xl h-10 text-xs bg-background">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              {SCHOLARSHIP_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c} className="text-xs">
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between text-xs pt-1 text-muted-foreground">
          <span>Showing {filteredScholarships.length} Active Scholarships</span>
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

      {/* Scholarships Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredScholarships.map((s) => {
          const isSaved = bookmarkedMap[s.id];

          return (
            <Card
              key={s.id}
              className="glass p-5 rounded-3xl border-border/80 hover:border-amber-500/40 transition-all shadow-xs hover:shadow-lg flex flex-col justify-between space-y-4 bg-card/90"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-500 bg-amber-500/5">
                    {s.category}
                  </Badge>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        s.status === "Closing Soon"
                          ? "bg-rose-500/10 text-rose-500 border-rose-500/30 animate-pulse"
                          : "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                      }`}
                    >
                      {s.status}
                    </span>
                    <button
                      onClick={() => handleToggleBookmark(s.id)}
                      className="p-1 rounded-lg text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                      title="Bookmark scholarship"
                    >
                      <Bookmark className={`size-3.5 ${isSaved ? "fill-primary text-primary" : ""}`} />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-base text-foreground leading-snug">
                    {s.name}
                  </h3>
                  <p className="text-[11px] font-semibold text-primary mt-0.5">
                    {s.provider}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                    {s.description}
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-border/40 text-xs text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>Grant Amount:</span>
                    <strong className="text-emerald-500 font-bold">{s.amount}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Application Deadline:</span>
                    <strong className="text-foreground font-mono">{s.deadline}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Family Income Limit:</span>
                    <span className="text-foreground">Below ₹{(s.annualFamilyIncomeLimitINR / 100000).toFixed(1)} Lakhs / yr</span>
                  </div>
                </div>

                {/* Eligibility Summary */}
                <div className="p-2.5 rounded-xl bg-accent/40 border border-border/60 text-[11px] text-foreground/90 space-y-1">
                  <strong className="block text-muted-foreground font-semibold">Eligibility Criteria:</strong>
                  <p>{s.eligibility}</p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-3 border-t border-border/40">
                <span className="text-[10px] text-muted-foreground">
                  Verified: {s.lastUpdated}
                </span>

                <a
                  href={s.officialUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 gradient-brand text-primary-foreground font-bold text-xs py-2 px-3.5 rounded-xl shadow-xs hover:opacity-95"
                >
                  Apply on Official Portal <ExternalLink className="size-3.5" />
                </a>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
