import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bookmark,
  Briefcase,
  Building2,
  ExternalLink,
  GraduationCap,
  Landmark,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CAREERS_DATA } from "@/lib/data/careers-data";
import { EXAMS_DATA } from "@/lib/data/exams-data";
import { SCHOLARSHIPS_DATA } from "@/lib/data/scholarships-data";
import { COLLEGES_DATA } from "@/lib/data/colleges-data";
import {
  getBookmarks,
  toggleBookmark,
  BookmarkStore,
} from "@/lib/store/careersetu-store";

export const Route = createFileRoute("/_authenticated/bookmarks")({
  head: () => ({
    meta: [
      { title: "My Bookmarks — CareerSetu" },
      {
        name: "description",
        content: "Access your saved careers, government exams, scholarships, and colleges in one centralized hub.",
      },
    ],
  }),
  component: BookmarksPage,
});

function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkStore>(getBookmarks());

  useEffect(() => {
    setBookmarks(getBookmarks());
  }, []);

  const handleRemove = (type: keyof BookmarkStore, id: string) => {
    toggleBookmark(type, id);
    setBookmarks(getBookmarks());
    toast.info("Removed from bookmarks");
  };

  const savedCareers = CAREERS_DATA.filter((c) => bookmarks.careers.includes(c.id));
  const savedExams = EXAMS_DATA.filter((e) => bookmarks.exams.includes(e.id));
  const savedScholarships = SCHOLARSHIPS_DATA.filter((s) => bookmarks.scholarships.includes(s.id));
  const savedColleges = COLLEGES_DATA.filter((col) => bookmarks.colleges.includes(col.id));

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
              <Bookmark className="size-5 fill-primary" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold font-display text-foreground">
              My Bookmarks Hub
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Easily manage and review your saved career roadmaps, exam notifications, grants, and colleges.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="careers" className="space-y-4">
        <TabsList className="rounded-2xl p-1 bg-accent/60 w-full sm:w-auto flex-wrap">
          <TabsTrigger value="careers" className="rounded-xl text-xs font-semibold gap-1.5">
            <Briefcase className="size-3.5" /> Careers ({savedCareers.length})
          </TabsTrigger>
          <TabsTrigger value="exams" className="rounded-xl text-xs font-semibold gap-1.5">
            <Landmark className="size-3.5" /> Exams ({savedExams.length})
          </TabsTrigger>
          <TabsTrigger value="scholarships" className="rounded-xl text-xs font-semibold gap-1.5">
            <GraduationCap className="size-3.5" /> Scholarships ({savedScholarships.length})
          </TabsTrigger>
          <TabsTrigger value="colleges" className="rounded-xl text-xs font-semibold gap-1.5">
            <Building2 className="size-3.5" /> Colleges ({savedColleges.length})
          </TabsTrigger>
        </TabsList>

        {/* Careers Tab */}
        <TabsContent value="careers" className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {savedCareers.map((c) => (
              <Card key={c.id} className="glass p-4 rounded-2xl border-border/80 flex justify-between items-start gap-3 bg-card">
                <div>
                  <Badge variant="outline" className="text-[10px] mb-1 text-primary">{c.domain}</Badge>
                  <h4 className="font-bold text-sm text-foreground">{c.name}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{c.salary} · {c.demand} Demand</p>
                </div>
                <div className="flex items-center gap-1">
                  <Link to="/careers" className="p-1 text-primary hover:underline text-xs font-semibold">
                    View
                  </Link>
                  <button onClick={() => handleRemove("careers", c.id)} className="p-1 text-muted-foreground hover:text-destructive">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
          {savedCareers.length === 0 && (
            <Card className="p-8 text-center rounded-2xl text-muted-foreground text-xs">
              No careers bookmarked yet. Visit <Link to="/careers" className="text-primary underline">Career Explorer</Link> to save favorites.
            </Card>
          )}
        </TabsContent>

        {/* Exams Tab */}
        <TabsContent value="exams" className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {savedExams.map((e) => (
              <Card key={e.id} className="glass p-4 rounded-2xl border-border/80 flex justify-between items-start gap-3 bg-card">
                <div>
                  <Badge variant="outline" className="text-[10px] mb-1 text-blue-500">{e.category}</Badge>
                  <h4 className="font-bold text-sm text-foreground">{e.name}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{e.conductingBody} · Status: {e.status}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Link to="/exams" className="p-1 text-primary hover:underline text-xs font-semibold">
                    View
                  </Link>
                  <button onClick={() => handleRemove("exams", e.id)} className="p-1 text-muted-foreground hover:text-destructive">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
          {savedExams.length === 0 && (
            <Card className="p-8 text-center rounded-2xl text-muted-foreground text-xs">
              No exams bookmarked. Visit <Link to="/exams" className="text-primary underline">Government Exams</Link> to save exams.
            </Card>
          )}
        </TabsContent>

        {/* Scholarships Tab */}
        <TabsContent value="scholarships" className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {savedScholarships.map((s) => (
              <Card key={s.id} className="glass p-4 rounded-2xl border-border/80 flex justify-between items-start gap-3 bg-card">
                <div>
                  <Badge variant="outline" className="text-[10px] mb-1 text-amber-500">{s.category}</Badge>
                  <h4 className="font-bold text-sm text-foreground">{s.name}</h4>
                  <p className="text-xs text-emerald-500 font-bold mt-0.5">{s.amount} · Deadline: {s.deadline}</p>
                </div>
                <div className="flex items-center gap-1">
                  <a href={s.officialUrl} target="_blank" rel="noreferrer" className="p-1 text-primary hover:underline text-xs font-semibold">
                    Portal
                  </a>
                  <button onClick={() => handleRemove("scholarships", s.id)} className="p-1 text-muted-foreground hover:text-destructive">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
          {savedScholarships.length === 0 && (
            <Card className="p-8 text-center rounded-2xl text-muted-foreground text-xs">
              No scholarships bookmarked. Visit <Link to="/scholarships" className="text-primary underline">Scholarship Finder</Link> to save grants.
            </Card>
          )}
        </TabsContent>

        {/* Colleges Tab */}
        <TabsContent value="colleges" className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {savedColleges.map((col) => (
              <Card key={col.id} className="glass p-4 rounded-2xl border-border/80 flex justify-between items-start gap-3 bg-card">
                <div>
                  <Badge variant="outline" className="text-[10px] mb-1 text-emerald-500">NIRF #{col.nirfRank}</Badge>
                  <h4 className="font-bold text-sm text-foreground">{col.name}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{col.city}, {col.state} · Avg: ₹{col.avgPlacementPackageLPA} LPA</p>
                </div>
                <div className="flex items-center gap-1">
                  <a href={col.officialWebsite} target="_blank" rel="noreferrer" className="p-1 text-primary hover:underline text-xs font-semibold">
                    Website
                  </a>
                  <button onClick={() => handleRemove("colleges", col.id)} className="p-1 text-muted-foreground hover:text-destructive">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
          {savedColleges.length === 0 && (
            <Card className="p-8 text-center rounded-2xl text-muted-foreground text-xs">
              No colleges bookmarked. Visit <Link to="/colleges" className="text-primary underline">College Directory</Link> to save institutions.
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
