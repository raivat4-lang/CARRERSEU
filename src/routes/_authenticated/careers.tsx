import { useState, useMemo, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bookmark,
  Briefcase,
  Check,
  ChevronDown,
  Compass,
  Filter,
  Layers,
  MapPin,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  TrendingUp,
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
import { getManagedCareers } from "@/lib/store/admin-content-store";
import { CareerItem } from "@/lib/data/careers-data";
import {
  isBookmarked,
  toggleBookmark,
} from "@/lib/store/careersetu-store";

export const Route = createFileRoute("/_authenticated/careers")({
  head: () => ({
    meta: [
      { title: "Career Explorer — CareerSetu" },
      {
        name: "description",
        content: "Explore 100+ high-growth careers across Technology, Healthcare, Civil Services, Finance, and Law.",
      },
    ],
  }),
  component: CareersExplorerPage,
});

const DOMAINS = [
  "All Domains",
  "Technology",
  "Healthcare",
  "Management",
  "Business & Finance",
  "Commerce",
  "Arts & Design",
  "Law & Policy",
  "Agriculture & Environment",
  "Science & Research",
  "Government & Defense",
];

const SECTOR_OPTIONS = ["All Sectors", "Private", "Government", "Both"];
const SALARY_OPTIONS = ["All Salaries", "Above ₹10 LPA", "Above ₹15 LPA", "Above ₹20 LPA"];

function CareersExplorerPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("All Domains");
  const [selectedSector, setSelectedSector] = useState("All Sectors");
  const [selectedSalary, setSelectedSalary] = useState("All Salaries");
  const [sortBy, setSortBy] = useState<"name" | "salary-high" | "demand">("salary-high");

  // Live Careers Data from Store
  const [careersList, setCareersList] = useState<CareerItem[]>([]);

  // Selected Career for Detail View Modal
  const [selectedCareer, setSelectedCareer] = useState<CareerItem | null>(null);

  // Compare Drawer (Up to 2-3 careers)
  const [compareList, setCompareList] = useState<CareerItem[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  // Bookmark tracking
  const [bookmarkedMap, setBookmarkedMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const live = getManagedCareers().filter((c) => c.status !== "ARCHIVED");
    setCareersList(live);

    const bMap: Record<string, boolean> = {};
    live.forEach((c) => {
      bMap[c.id] = isBookmarked("careers", c.id);
    });
    setBookmarkedMap(bMap);
  }, []);

  const handleToggleBookmark = (careerId: string) => {
    const isNow = toggleBookmark("careers", careerId);
    setBookmarkedMap((prev) => ({ ...prev, [careerId]: isNow }));
    toast.success(isNow ? "Career bookmarked" : "Removed from bookmarks");
  };

  const handleToggleCompare = (career: CareerItem) => {
    if (compareList.some((c) => c.id === career.id)) {
      setCompareList((prev) => prev.filter((c) => c.id !== career.id));
    } else {
      if (compareList.length >= 3) {
        toast.info("You can compare up to 3 careers at once");
        return;
      }
      setCompareList((prev) => [...prev, career]);
      toast.success(`Added ${career.name} to comparison`);
    }
  };

  const filteredCareers = useMemo(() => {
    return careersList.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.domain.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q)) ||
        c.requiredSkills.some((s) => s.toLowerCase().includes(q));

      const matchesDomain =
        selectedDomain === "All Domains" || c.domain === selectedDomain;

      const matchesSector =
        selectedSector === "All Sectors" ||
        c.sector === selectedSector ||
        c.sector === "Both";

      let matchesSalary = true;
      if (selectedSalary === "Above ₹10 LPA") matchesSalary = c.maxSalaryLPA >= 10;
      if (selectedSalary === "Above ₹15 LPA") matchesSalary = c.maxSalaryLPA >= 15;
      if (selectedSalary === "Above ₹20 LPA") matchesSalary = c.maxSalaryLPA >= 20;

      return matchesSearch && matchesDomain && matchesSector && matchesSalary;
    }).sort((a, b) => {
      if (sortBy === "salary-high") return b.maxSalaryLPA - a.maxSalaryLPA;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0;
    });
  }, [searchQuery, selectedDomain, selectedSector, selectedSalary, sortBy]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedDomain("All Domains");
    setSelectedSector("All Sectors");
    setSelectedSalary("All Salaries");
    setSortBy("salary-high");
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
              <Compass className="size-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold font-display text-foreground">
              Career Explorer (100+ Pathways)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Search, filter, compare, and build step-by-step roadmaps for modern Indian and global careers.
          </p>
        </div>

        {compareList.length > 0 && (
          <Button
            size="sm"
            onClick={() => setIsCompareOpen(true)}
            className="gradient-brand text-primary-foreground font-bold rounded-xl shadow-glow cursor-pointer gap-2"
          >
            <Layers className="size-4" /> Compare ({compareList.length})
          </Button>
        )}
      </div>

      {/* Filters Bar */}
      <Card className="glass p-4 rounded-3xl border-border/80 shadow-xs space-y-3 bg-card/80">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, skill, domain..."
              className="pl-9 h-10 rounded-xl bg-background border-border text-xs sm:text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Domain Select */}
          <Select value={selectedDomain} onValueChange={setSelectedDomain}>
            <SelectTrigger className="rounded-xl h-10 text-xs bg-background">
              <SelectValue placeholder="Industry / Domain" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl max-h-64">
              {DOMAINS.map((d) => (
                <SelectItem key={d} value={d} className="text-xs">
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sector Select */}
          <Select value={selectedSector} onValueChange={setSelectedSector}>
            <SelectTrigger className="rounded-xl h-10 text-xs bg-background">
              <SelectValue placeholder="Sector" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              {SECTOR_OPTIONS.map((s) => (
                <SelectItem key={s} value={s} className="text-xs">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort By Select */}
          <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
            <SelectTrigger className="rounded-xl h-10 text-xs bg-background">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              <SelectItem value="salary-high" className="text-xs">💰 Highest Package First</SelectItem>
              <SelectItem value="name" className="text-xs">🔤 Alphabetical (A-Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Active Filter Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-muted-foreground font-semibold">Showing:</span>
            <Badge variant="secondary" className="text-[11px] font-medium">
              {filteredCareers.length} Careers Found
            </Badge>
            {selectedDomain !== "All Domains" && (
              <Badge variant="outline" className="text-[11px] gap-1 bg-primary/5 text-primary border-primary/20">
                {selectedDomain}
                <button onClick={() => setSelectedDomain("All Domains")} className="cursor-pointer">
                  <X className="size-2.5" />
                </button>
              </Badge>
            )}
          </div>

          {(searchQuery || selectedDomain !== "All Domains" || selectedSector !== "All Sectors") && (
            <button
              onClick={resetFilters}
              className="text-[11px] text-primary hover:underline flex items-center gap-1 cursor-pointer font-medium"
            >
              <RotateCcw className="size-3" /> Clear Filters
            </button>
          )}
        </div>
      </Card>

      {/* Careers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCareers.map((c) => {
          const isSaved = bookmarkedMap[c.id];
          const isCompared = compareList.some((item) => item.id === c.id);

          return (
            <Card
              key={c.id}
              className="glass p-5 rounded-3xl border-border/80 hover:border-primary/40 transition-all shadow-xs hover:shadow-lg flex flex-col justify-between space-y-4 bg-card/90 group"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="outline" className="text-[10px] border-primary/20 text-primary bg-primary/5">
                    {c.domain}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleCompare(c)}
                      className={`p-1 rounded-lg text-xs transition-colors cursor-pointer ${
                        isCompared ? "text-primary font-bold bg-primary/10" : "text-muted-foreground hover:text-foreground"
                      }`}
                      title="Add to comparison"
                    >
                      <Layers className="size-3.5" />
                    </button>
                    <button
                      onClick={() => handleToggleBookmark(c.id)}
                      className="p-1 rounded-lg text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                      title="Bookmark career"
                    >
                      <Bookmark className={`size-3.5 ${isSaved ? "fill-primary text-primary" : ""}`} />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors leading-snug">
                    {c.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                    {c.description}
                  </p>
                </div>

                <div className="space-y-1 pt-2 border-t border-border/40 text-xs">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Salary:</span>
                    <strong className="text-foreground">{c.salary}</strong>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Work Type:</span>
                    <span className="text-foreground">{c.workType}</span>
                  </div>
                </div>

                {/* Skills Chips */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {c.requiredSkills.slice(0, 3).map((skill) => (
                    <span key={skill} className="text-[10px] px-2 py-0.5 rounded-md bg-accent text-foreground font-mono">
                      {skill}
                    </span>
                  ))}
                  {c.requiredSkills.length > 3 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md text-muted-foreground font-mono">
                      +{c.requiredSkills.length - 3}
                    </span>
                  )}
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedCareer(c)}
                className="w-full rounded-xl text-xs font-semibold hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer"
              >
                View Full Roadmap & Scope →
              </Button>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredCareers.length === 0 && (
        <Card className="glass p-12 text-center rounded-3xl border-border space-y-3">
          <Compass className="size-10 mx-auto text-muted-foreground" />
          <h3 className="font-bold text-base text-foreground">No matching careers found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Try adjusting your search terms or clearing industry domain filters.
          </p>
          <Button size="sm" onClick={resetFilters} className="rounded-xl gradient-brand text-primary-foreground font-bold">
            Reset All Filters
          </Button>
        </Card>
      )}

      {/* Full Career Detail Modal */}
      {selectedCareer && (
        <Dialog open={!!selectedCareer} onOpenChange={() => setSelectedCareer(null)}>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto p-6 sm:p-8 rounded-3xl">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                  {selectedCareer.domain}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {selectedCareer.sector} Sector
                </Badge>
              </div>
              <DialogTitle className="text-xl sm:text-2xl font-bold font-display text-foreground">
                {selectedCareer.name}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 text-xs sm:text-sm mt-2">
              <p className="text-foreground/90 leading-relaxed bg-accent/30 p-3.5 rounded-2xl border border-border/60">
                {selectedCareer.description}
              </p>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-2xl bg-card border border-border">
                  <span className="text-[10px] text-muted-foreground block">Salary Range</span>
                  <strong className="text-foreground text-xs sm:text-sm">{selectedCareer.salary}</strong>
                </div>
                <div className="p-3 rounded-2xl bg-card border border-border">
                  <span className="text-[10px] text-muted-foreground block">Demand Level</span>
                  <strong className="text-emerald-500 text-xs sm:text-sm">{selectedCareer.demand}</strong>
                </div>
                <div className="p-3 rounded-2xl bg-card border border-border">
                  <span className="text-[10px] text-muted-foreground block">Education Req.</span>
                  <strong className="text-foreground text-xs sm:text-sm">{selectedCareer.educationRequired}</strong>
                </div>
                <div className="p-3 rounded-2xl bg-card border border-border">
                  <span className="text-[10px] text-muted-foreground block">Work Model</span>
                  <strong className="text-foreground text-xs sm:text-sm">{selectedCareer.workType}</strong>
                </div>
              </div>

              {/* Required Skills & Degrees */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Required Skills</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCareer.requiredSkills.map((s) => (
                    <Badge key={s} variant="secondary" className="text-xs px-2.5 py-1 rounded-xl bg-accent text-foreground font-mono">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Top Colleges & Recruiters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-accent/20 border border-border space-y-1.5">
                  <h4 className="font-bold text-xs text-foreground">Top Colleges in India:</h4>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    {selectedCareer.topColleges.map((c) => (
                      <li key={c} className="flex items-center gap-1.5">
                        <span className="size-1.5 rounded-full bg-primary" /> {c}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 rounded-2xl bg-accent/20 border border-border space-y-1.5">
                  <h4 className="font-bold text-xs text-foreground">Top Recruiters & Employers:</h4>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    {selectedCareer.topRecruiters.map((r) => (
                      <li key={r} className="flex items-center gap-1.5">
                        <span className="size-1.5 rounded-full bg-emerald-500" /> {r}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Step-by-Step 6-Stage Roadmap */}
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-primary" /> Step-by-Step Career Roadmap
                </h4>
                <div className="space-y-2.5">
                  {selectedCareer.roadmap.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-2xl bg-card border border-border/80">
                      <span className="grid size-6 place-items-center rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div>
                        <p className="font-bold text-foreground text-xs sm:text-sm">{step.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-2 justify-end pt-4 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleBookmark(selectedCareer.id)}
                  className="rounded-xl cursor-pointer"
                >
                  <Bookmark className={`size-3.5 mr-1 ${bookmarkedMap[selectedCareer.id] ? "fill-primary text-primary" : ""}`} />
                  {bookmarkedMap[selectedCareer.id] ? "Bookmarked" : "Bookmark Career"}
                </Button>
                <Link
                  to="/skill-gap"
                  className="inline-flex items-center gap-1.5 gradient-brand text-primary-foreground font-semibold text-xs py-2 px-4 rounded-xl shadow-xs hover:opacity-95"
                >
                  <Zap className="size-3.5" /> Analyze Skill Gap
                </Link>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Comparison Drawer / Modal */}
      {isCompareOpen && (
        <Dialog open={isCompareOpen} onOpenChange={setIsCompareOpen}>
          <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto p-6 rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold font-display flex items-center gap-2">
                <Layers className="size-5 text-primary" /> Career Comparison Matrix
              </DialogTitle>
            </DialogHeader>

            <div className="overflow-x-auto mt-4">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-accent/40">
                    <th className="p-3 font-bold text-foreground">Criteria</th>
                    {compareList.map((c) => (
                      <th key={c.id} className="p-3 font-bold text-primary">
                        {c.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/40">
                    <td className="p-3 font-semibold text-muted-foreground">Domain</td>
                    {compareList.map((c) => (
                      <td key={c.id} className="p-3 font-medium text-foreground">{c.domain}</td>
                    ))}
                  </tr>
                  <tr className="border-b border-border/40">
                    <td className="p-3 font-semibold text-muted-foreground">Salary Range</td>
                    {compareList.map((c) => (
                      <td key={c.id} className="p-3 font-bold text-emerald-500">{c.salary}</td>
                    ))}
                  </tr>
                  <tr className="border-b border-border/40">
                    <td className="p-3 font-semibold text-muted-foreground">Demand Level</td>
                    {compareList.map((c) => (
                      <td key={c.id} className="p-3 text-foreground">{c.demand}</td>
                    ))}
                  </tr>
                  <tr className="border-b border-border/40">
                    <td className="p-3 font-semibold text-muted-foreground">Work Model</td>
                    {compareList.map((c) => (
                      <td key={c.id} className="p-3 text-foreground">{c.workType}</td>
                    ))}
                  </tr>
                  <tr className="border-b border-border/40">
                    <td className="p-3 font-semibold text-muted-foreground">Core Skills</td>
                    {compareList.map((c) => (
                      <td key={c.id} className="p-3 text-foreground">
                        <div className="flex flex-wrap gap-1">
                          {c.requiredSkills.slice(0, 3).map((s) => (
                            <span key={s} className="px-1.5 py-0.5 rounded bg-muted text-[10px]">{s}</span>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCompareList([])}
                className="rounded-xl cursor-pointer"
              >
                Clear Comparison
              </Button>
              <Button
                size="sm"
                onClick={() => setIsCompareOpen(false)}
                className="gradient-brand text-primary-foreground font-bold rounded-xl"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
