import { useState, useMemo, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Bookmark,
  Building2,
  ExternalLink,
  GraduationCap,
  MapPin,
  Search,
  Star,
  Trophy,
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
import { getManagedColleges } from "@/lib/store/admin-content-store";
import { CollegeItem } from "@/lib/data/colleges-data";
import { isBookmarked, toggleBookmark } from "@/lib/store/careersetu-store";

export const Route = createFileRoute("/_authenticated/colleges")({
  head: () => ({
    meta: [
      { title: "College Directory & Rankings — CareerSetu" },
      {
        name: "description",
        content: "Explore top NIRF-ranked Indian universities and institutes across Engineering, Medical, IT, Management, and Law.",
      },
    ],
  }),
  component: CollegesDirectoryPage,
});

const COLLEGE_TYPES = [
  "All Types",
  "Government / Autonomous",
  "Private University",
  "Deemed University",
  "Central University",
];

function CollegesDirectoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All Types");
  const [bookmarkedMap, setBookmarkedMap] = useState<Record<string, boolean>>({});
  const [collegesList, setCollegesList] = useState<CollegeItem[]>([]);

  useEffect(() => {
    const live = getManagedColleges().filter((c) => c.status !== "ARCHIVED");
    setCollegesList(live);

    const bMap: Record<string, boolean> = {};
    live.forEach((col) => {
      bMap[col.id] = isBookmarked("colleges", col.id);
    });
    setBookmarkedMap(bMap);
  }, []);

  const handleToggleBookmark = (id: string) => {
    const isNow = toggleBookmark("colleges", id);
    setBookmarkedMap((prev) => ({ ...prev, [id]: isNow }));
    toast.success(isNow ? "College added to bookmarks" : "Removed from bookmarks");
  };

  const filteredColleges = useMemo(() => {
    return collegesList.filter((col) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        col.name.toLowerCase().includes(q) ||
        col.city.toLowerCase().includes(q) ||
        col.state.toLowerCase().includes(q) ||
        (col.popularDegrees && col.popularDegrees.some((deg) => deg.toLowerCase().includes(q))) ||
        (col.acceptedExams && col.acceptedExams.some((ex) => ex.toLowerCase().includes(q)));

      const matchesType =
        selectedType === "All Types" || col.type === selectedType;

      return matchesSearch && matchesType;
    });
  }, [collegesList, searchQuery, selectedType]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <Building2 className="size-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold font-display text-foreground">
              College & University Directory
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            NIRF rankings, tuition fees, placement averages, accepted exams, and campus infrastructure.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <Card className="glass p-4 rounded-3xl border-border/80 shadow-xs space-y-3 bg-card/80">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by college name, city, course (B.Tech, BCA, MBA)..."
              className="pl-9 h-10 rounded-xl bg-background border-border text-xs sm:text-sm"
            />
          </div>

          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="rounded-xl h-10 text-xs bg-background">
              <SelectValue placeholder="University Type" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              {COLLEGE_TYPES.map((t) => (
                <SelectItem key={t} value={t} className="text-xs">
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between text-xs pt-1 text-muted-foreground">
          <span>Showing {filteredColleges.length} Top-Tier Indian Institutions</span>
          {(searchQuery || selectedType !== "All Types") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedType("All Types");
              }}
              className="text-primary hover:underline text-[11px] font-medium cursor-pointer"
            >
              Clear Filters
            </button>
          )}
        </div>
      </Card>

      {/* Colleges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredColleges.map((col) => {
          const isSaved = bookmarkedMap[col.id];

          return (
            <Card
              key={col.id}
              className="glass p-5 rounded-3xl border-border/80 hover:border-emerald-500/40 transition-all shadow-xs hover:shadow-lg flex flex-col justify-between space-y-4 bg-card/90"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5">
                    {col.type}
                  </Badge>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Trophy className="size-3 text-amber-500" /> NIRF #{col.nirfRank}
                    </span>
                    <button
                      onClick={() => handleToggleBookmark(col.id)}
                      className="p-1 rounded-lg text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                      title="Bookmark college"
                    >
                      <Bookmark className={`size-3.5 ${isSaved ? "fill-primary text-primary" : ""}`} />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-base text-foreground leading-snug">
                    {col.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                    <MapPin className="size-3 text-primary" /> {col.city}, {col.state}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                    {col.description}
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-border/40 text-xs text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>Average Package:</span>
                    <strong className="text-emerald-500 font-bold">₹{col.avgPlacementPackageLPA} LPA</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Annual Tuition Fees:</span>
                    <strong className="text-foreground">{col.annualFeesRange}</strong>
                  </div>
                </div>

                {/* Popular Degrees */}
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-muted-foreground block">Popular Degrees:</span>
                  <div className="flex flex-wrap gap-1">
                    {col.popularDegrees.map((deg) => (
                      <span key={deg} className="text-[10px] px-2 py-0.5 rounded-md bg-accent text-foreground font-medium">
                        {deg}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Accepted Exams */}
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-muted-foreground block">Accepted Exams:</span>
                  <div className="flex flex-wrap gap-1">
                    {col.acceptedExams.map((ex) => (
                      <span key={ex} className="text-[10px] px-2 py-0.5 rounded-md bg-primary/10 text-primary font-mono font-semibold">
                        {ex}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-3 border-t border-border/40">
                <span className="text-xs font-semibold text-amber-500 flex items-center gap-1">
                  <Star className="size-3.5 fill-amber-500" /> {col.rating} / 5.0
                </span>

                <a
                  href={col.officialWebsite}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline cursor-pointer"
                >
                  Official Website <ExternalLink className="size-3.5" />
                </a>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
