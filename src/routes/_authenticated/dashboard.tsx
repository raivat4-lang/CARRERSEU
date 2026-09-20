import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  Bookmark,
  CalendarClock,
  CheckCircle,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  Landmark,
  Plus,
  Search,
  Sparkles,
  Target,
  Trash2,
  Wallet,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { educationLabel } from "@/lib/options";
import { getMyProfile } from "@/lib/profile.functions";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — CareerSetu" },
      {
        name: "description",
        content:
          "Your personalized CareerSetu dashboard: live career match score, dynamic assessment progress, saved exams, deadlines and study plan.",
      },
      { property: "og:title", content: "Dashboard — CareerSetu" },
      {
        property: "og:description",
        content: "Track your career match score, study progress and upcoming exam deadlines in real time.",
      },
    ],
  }),
  component: Dashboard,
});

const DEFAULT_BLANK_INTERESTS = [
  { area: "Technology", score: 20 },
  { area: "Science", score: 20 },
  { area: "Management", score: 20 },
  { area: "Commerce", score: 20 },
  { area: "Arts", score: 20 },
  { area: "Law", score: 20 },
];

const CAREER_DATABASE = [
  {
    id: "1",
    name: "AI & Machine Learning Engineer",
    domain: "Technology",
    baseMatch: 95,
    salary: "₹12 - ₹35 LPA",
    demand: "Very High",
    description: "Design intelligent neural networks, LLMs, and computer vision systems.",
    bookmarked: true,
  },
  {
    id: "2",
    name: "Cloud Architect & DevOps",
    domain: "Technology",
    baseMatch: 90,
    salary: "₹10 - ₹28 LPA",
    demand: "High",
    description: "Architect scalable multi-cloud infrastructure and automated CI/CD pipelines.",
    bookmarked: false,
  },
  {
    id: "3",
    name: "Data Scientist & AI Analyst",
    domain: "Science",
    baseMatch: 88,
    salary: "₹9 - ₹24 LPA",
    demand: "High",
    description: "Extract predictive insights from massive enterprise datasets with statistics & ML.",
    bookmarked: true,
  },
  {
    id: "4",
    name: "IAS / IPS Officer (Civil Services)",
    domain: "Law",
    baseMatch: 86,
    salary: "₹7 - ₹18 LPA + Perks",
    demand: "Prestigious",
    description: "Lead district administration, public policy formulation, and governance.",
    bookmarked: true,
  },
  {
    id: "5",
    name: "Product & Strategy Manager",
    domain: "Management",
    baseMatch: 84,
    salary: "₹14 - ₹32 LPA",
    demand: "Very High",
    description: "Drive product vision, roadmap execution, and cross-functional leadership.",
    bookmarked: false,
  },
  {
    id: "6",
    name: "Chartered Financial Analyst (CFA)",
    domain: "Commerce",
    baseMatch: 82,
    salary: "₹10 - ₹26 LPA",
    demand: "High",
    description: "Manage equity portfolios, corporate valuations, and investment funds.",
    bookmarked: false,
  },
];

const INITIAL_EXAMS = [
  { id: "e1", name: "GATE CS (Computer Science)", window: "Feb 2027", category: "Engineering", saved: true },
  { id: "e2", name: "ISRO Scientist/Engineer ICRB", window: "Nov 2026", category: "Engineering", saved: true },
  { id: "e3", name: "UPSC Civil Services (Prelims)", window: "May 2027", category: "Civil Services", saved: true },
  { id: "e4", name: "JEE Advanced 2026", window: "May 2026", category: "Engineering", saved: false },
  { id: "e5", name: "NEET UG Medical 2026", window: "May 2026", category: "Medical", saved: false },
  { id: "e6", name: "SSC CGL Tier 1", window: "Sep 2026", category: "Civil Services", saved: false },
];

interface AssessmentOption {
  text: string;
  scores: Record<string, number>;
}

interface AssessmentQuestion {
  id: number;
  question: string;
  options: AssessmentOption[];
}

const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 1,
    question: "When solving a complex challenge, what is your preferred approach?",
    options: [
      { text: "Write code, algorithms or build automated software", scores: { Technology: 30, Science: 15 } },
      { text: "Analyze financial statements, spreadsheets & trends", scores: { Commerce: 30, Management: 15 } },
      { text: "Lead people, coordinate strategy & team execution", scores: { Management: 30, Law: 15 } },
      { text: "Research scientific hypotheses, nature or medicine", scores: { Science: 30, Arts: 10 } },
    ],
  },
  {
    id: 2,
    question: "Which work environment excites you most?",
    options: [
      { text: "High-tech innovation lab / AI software startup", scores: { Technology: 25 } },
      { text: "Government ministry / Policy & civil administration", scores: { Law: 25, Management: 15 } },
      { text: "Research laboratory / Hospital / Space agency", scores: { Science: 25 } },
      { text: "Investment bank / FinTech corporate boardroom", scores: { Commerce: 25 } },
    ],
  },
  {
    id: 3,
    question: "What subjects did you naturally enjoy most?",
    options: [
      { text: "Mathematics, Programming & Computer Science", scores: { Technology: 25, Science: 15 } },
      { text: "Physics, Chemistry & Biology", scores: { Science: 25 } },
      { text: "Economics, Accountancy & Business Studies", scores: { Commerce: 25, Management: 15 } },
      { text: "Political Science, Civics, History & Law", scores: { Law: 25, Arts: 20 } },
    ],
  },
  {
    id: 4,
    question: "What long-term career impact motivates you most?",
    options: [
      { text: "Building groundbreaking tech used by millions worldwide", scores: { Technology: 25 } },
      { text: "Formulating national policies and reforming public welfare", scores: { Law: 25, Arts: 15 } },
      { text: "Founding or scaling high-growth enterprises and funds", scores: { Management: 20, Commerce: 20 } },
      { text: "Discovering scientific breakthroughs & healthcare solutions", scores: { Science: 25 } },
    ],
  },
  {
    id: 5,
    question: "How do you prefer spending your productive work hours?",
    options: [
      { text: "Deep work on technical logic, architecture & system design", scores: { Technology: 25 } },
      { text: "Debating, negotiating, presenting and resolving disputes", scores: { Law: 20, Management: 15 } },
      { text: "Conducting empirical data modeling & experimental analysis", scores: { Science: 20, Technology: 10 } },
      { text: "Optimizing budgets, revenue models & market investments", scores: { Commerce: 25 } },
    ],
  },
];

export function Dashboard() {
  const fetchProfile = useServerFn(getMyProfile);
  const { data: serverProfile, isLoading } = useQuery<Record<string, any> | null>({
    queryKey: ["profile"],
    queryFn: async () => {
      try {
        const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(null), 150));
        return (await Promise.race([fetchProfile(), timeoutPromise])) as Record<string, any> | null;
      } catch {
        return null;
      }
    },
    staleTime: 60000,
  });

  // Local storage profile fallback
  const demoProfile = typeof localStorage !== "undefined" ? localStorage.getItem("careersetu_demo_user") : null;
  const parsedDemo = demoProfile ? JSON.parse(demoProfile) : null;

  const profile = serverProfile || parsedDemo || {
    full_name: "Tushar Devendra",
    city: "Mumbai",
    current_education: "class_12",
  };

  const userId = profile?.id || "default_user";
  const STORAGE_KEY = `careersetu_dashboard_${userId}`;

  // Interactive Dynamic State
  const [assessmentTaken, setAssessmentTaken] = useState(false);
  const [assessmentProgress, setAssessmentProgress] = useState(0); // 0 to 5
  const [matchScore, setMatchScore] = useState(0);
  const [topRole, setTopRole] = useState("AI & Machine Learning Engineer");
  const [topDomain, setTopDomain] = useState("Technology & Engineering");
  const [interestsData, setInterestsData] = useState(DEFAULT_BLANK_INTERESTS);
  const [careersList, setCareersList] = useState(CAREER_DATABASE);
  const [savedExamsList, setSavedExamsList] = useState(INITIAL_EXAMS);
  const [examSearch, setExamSearch] = useState("");

  const [tasks, setTasks] = useState([
    { id: "1", title: "Aptitude: 20 quantitative questions", done: true },
    { id: "2", title: "Current affairs: 30 minutes reading", done: true },
    { id: "3", title: "Core syllabus revision: 1 hour", done: false },
    { id: "4", title: "Mock test Section 2 analysis", done: false },
  ]);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  // Assessment Modal State
  const [isAssessmentOpen, setIsAssessmentOpen] = useState(false);
  const [assessmentStep, setAssessmentStep] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);

  // Load persisted state on mount
  useEffect(() => {
    if (typeof localStorage !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const data = JSON.parse(saved);
          if (data.assessmentTaken !== undefined) setAssessmentTaken(data.assessmentTaken);
          if (data.assessmentProgress !== undefined) setAssessmentProgress(data.assessmentProgress);
          if (data.matchScore !== undefined) setMatchScore(data.matchScore);
          if (data.topRole) setTopRole(data.topRole);
          if (data.topDomain) setTopDomain(data.topDomain);
          if (data.interestsData) setInterestsData(data.interestsData);
          if (data.careersList) setCareersList(data.careersList);
          if (data.savedExamsList) setSavedExamsList(data.savedExamsList);
          if (data.tasks) setTasks(data.tasks);
        } catch {}
      }
    }
  }, [STORAGE_KEY]);

  // Persist state updates
  const saveStateToStorage = (updated: Record<string, unknown>) => {
    if (typeof localStorage === "undefined") return;
    try {
      const current = localStorage.getItem(STORAGE_KEY);
      const parsed = current ? JSON.parse(current) : {};
      const merged = {
        ...parsed,
        assessmentTaken,
        assessmentProgress,
        matchScore,
        topRole,
        topDomain,
        interestsData,
        careersList,
        savedExamsList,
        tasks,
        ...updated,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    } catch {}
  };

  const firstName = (profile?.full_name || "").split(" ")[0] || "Student";
  const doneTasks = tasks.filter((t) => t.done).length;
  const progressPercent = Math.round((doneTasks / (tasks.length || 1)) * 100);
  const bookmarkedCareersCount = careersList.filter((c) => c.bookmarked).length;
  const trackedExamsCount = savedExamsList.filter((e) => e.saved).length;

  const toggleTask = (id: string) => {
    const nextTasks = tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
    setTasks(nextTasks);
    saveStateToStorage({ tasks: nextTasks });
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const nextTasks = [
      ...tasks,
      { id: Date.now().toString(), title: newTaskTitle.trim(), done: false },
    ];
    setTasks(nextTasks);
    setNewTaskTitle("");
    saveStateToStorage({ tasks: nextTasks });
    toast.success("Task added to Study Planner!");
  };

  const removeTask = (id: string) => {
    const nextTasks = tasks.filter((t) => t.id !== id);
    setTasks(nextTasks);
    saveStateToStorage({ tasks: nextTasks });
  };

  const toggleBookmarkCareer = (id: string) => {
    const nextCareers = careersList.map((c) => {
      if (c.id === id) {
        const nextState = !c.bookmarked;
        toast.success(nextState ? `Bookmarked ${c.name}` : `Removed ${c.name}`);
        return { ...c, bookmarked: nextState };
      }
      return c;
    });
    setCareersList(nextCareers);
    saveStateToStorage({ careersList: nextCareers });
  };

  const toggleSaveExam = (id: string) => {
    const nextExams = savedExamsList.map((e) => {
      if (e.id === id) {
        const next = !e.saved;
        toast.success(next ? `Bookmarked ${e.name}` : `Removed ${e.name}`);
        return { ...e, saved: next };
      }
      return e;
    });
    setSavedExamsList(nextExams);
    saveStateToStorage({ savedExamsList: nextExams });
  };

  const handleAssessmentOptionSelect = (optionIndex: number) => {
    const nextAnswers = [...selectedAnswers, optionIndex];
    setSelectedAnswers(nextAnswers);

    if (assessmentStep < ASSESSMENT_QUESTIONS.length - 1) {
      setAssessmentStep((prev) => prev + 1);
    } else {
      // Complete Assessment & Calculate Real Domain Scores
      const rawScores: Record<string, number> = {
        Technology: 35,
        Science: 30,
        Management: 25,
        Commerce: 25,
        Arts: 20,
        Law: 20,
      };

      nextAnswers.forEach((ansIdx, qIdx) => {
        const q = ASSESSMENT_QUESTIONS[qIdx];
        const option = q?.options[ansIdx];
        if (option?.scores) {
          Object.entries(option.scores).forEach(([area, points]) => {
            rawScores[area] = (rawScores[area] ?? 20) + points;
          });
        }
      });

      // Normalize scores
      const updatedInterests = [
        { area: "Technology", score: Math.min(98, Math.max(30, rawScores["Technology"] ?? 35)) },
        { area: "Science", score: Math.min(96, Math.max(25, rawScores["Science"] ?? 30)) },
        { area: "Management", score: Math.min(95, Math.max(25, rawScores["Management"] ?? 25)) },
        { area: "Commerce", score: Math.min(94, Math.max(25, rawScores["Commerce"] ?? 25)) },
        { area: "Arts", score: Math.min(92, Math.max(20, rawScores["Arts"] ?? 20)) },
        { area: "Law", score: Math.min(95, Math.max(20, rawScores["Law"] ?? 20)) },
      ];

      // Find top domain
      const sortedDomains = [...updatedInterests].sort((a, b) => b.score - a.score);
      const topArea = sortedDomains[0]?.area ?? "Technology";
      const computedMatchScore = sortedDomains[0]?.score ?? 94;

      // Assign top recommended career based on real top domain
      let computedTopRole = "AI & Machine Learning Engineer";
      let domainLabel = "Technology & Engineering";
      if (topArea === "Science") {
        computedTopRole = "Data Scientist & AI Analyst";
        domainLabel = "Science & Data Analytics";
      } else if (topArea === "Management") {
        computedTopRole = "Product & Strategy Manager";
        domainLabel = "Management & Product Leadership";
      } else if (topArea === "Commerce") {
        computedTopRole = "Chartered Financial Analyst (CFA)";
        domainLabel = "Commerce & High Finance";
      } else if (topArea === "Law") {
        computedTopRole = "IAS / IPS Officer (Civil Services)";
        domainLabel = "Civil Services & Governance";
      } else if (topArea === "Arts") {
        computedTopRole = "Creative Design & UX Lead";
        domainLabel = "Creative Arts & Design";
      }

      // Re-score careers list dynamically
      const dynamicCareers = careersList.map((c) => {
        if (c.domain === topArea) {
          return { ...c, baseMatch: computedMatchScore };
        }
        const areaScore = updatedInterests.find((i) => i.area === c.domain)?.score ?? 70;
        return { ...c, baseMatch: Math.max(65, areaScore - 6) };
      }).sort((a, b) => b.baseMatch - a.baseMatch);

      setInterestsData(updatedInterests);
      setMatchScore(computedMatchScore);
      setTopRole(computedTopRole);
      setTopDomain(domainLabel);
      setAssessmentTaken(true);
      setAssessmentProgress(5);
      setCareersList(dynamicCareers);
      setIsAssessmentOpen(false);
      setAssessmentStep(0);
      setSelectedAnswers([]);

      saveStateToStorage({
        assessmentTaken: true,
        assessmentProgress: 5,
        matchScore: computedMatchScore,
        topRole: computedTopRole,
        topDomain: domainLabel,
        interestsData: updatedInterests,
        careersList: dynamicCareers,
      });

      toast.success(`Assessment complete! Your Top Match is ${computedTopRole} (${computedMatchScore}% Match)!`);
    }
  };

  const retakeAssessment = () => {
    setAssessmentStep(0);
    setSelectedAnswers([]);
    setIsAssessmentOpen(true);
  };

  const fallbackQuestion: AssessmentQuestion = {
    id: 1,
    question: "When solving a complex challenge, what is your preferred approach?",
    options: [
      { text: "Write code, algorithms or build automated software", scores: { Technology: 30, Science: 15 } },
      { text: "Analyze financial statements, spreadsheets & trends", scores: { Commerce: 30, Management: 15 } },
      { text: "Lead people, coordinate strategy & team execution", scores: { Management: 30, Law: 15 } },
      { text: "Research scientific hypotheses, nature or medicine", scores: { Science: 30, Arts: 10 } },
    ],
  };

  const activeQuestion: AssessmentQuestion = ASSESSMENT_QUESTIONS[assessmentStep] ?? fallbackQuestion;

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
      <h1 className="sr-only">Your CareerSetu dashboard</h1>

      {/* Welcome Banner */}
      <Card className="gradient-brand shadow-elegant overflow-hidden rounded-3xl border-0 p-6 sm:p-8 text-primary-foreground">
        {isLoading && !serverProfile && !parsedDemo ? (
          <div className="space-y-3">
            <Skeleton className="h-8 w-64 bg-primary-foreground/20" />
            <Skeleton className="h-4 w-80 bg-primary-foreground/20" />
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <div className="min-w-0 space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-semibold backdrop-blur">
                <Sparkles className="size-3.5" />
                {educationLabel(profile?.current_education)}
                {profile?.city ? ` · ${profile.city}` : ""}
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome back, {firstName}!
              </h2>
              <p className="max-w-xl text-xs sm:text-sm text-primary-foreground/85 leading-relaxed">
                {assessmentTaken ? (
                  <>
                    Your AI career analysis is <strong className="text-white font-bold">{matchScore}% matched</strong> for <strong className="text-white font-bold">{topDomain}</strong> ({topRole}).
                  </>
                ) : (
                  <>
                    Take our quick 5-question AI assessment to calculate your real-time career match score, interest spectrum, and personalized exam roadmap!
                  </>
                )}
              </p>
            </div>

            <Button
              size="lg"
              variant="secondary"
              onClick={retakeAssessment}
              className="h-12 rounded-xl font-bold px-6 shadow-soft shrink-0 hover:scale-[1.02] transition-transform cursor-pointer"
            >
              <Sparkles className="mr-2 size-4 text-primary" />
              {assessmentTaken ? "Retake AI Assessment" : "Take Quick AI Assessment"}
            </Button>
          </div>
        )}
      </Card>

      {/* Key Stats Row - Real-time Reactive Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Target}
          label="Top Match Score"
          value={assessmentTaken ? `${matchScore}%` : "Pending"}
          hint={assessmentTaken ? topRole : "Complete quiz to unlock"}
          badge={assessmentTaken ? "Live Match" : "Take Quiz"}
        />
        <StatCard
          icon={GraduationCap}
          label="Assessment Progress"
          value={`${assessmentProgress}/5`}
          hint={assessmentTaken ? "100% complete" : "Not started yet"}
          badge={assessmentTaken ? "Completed" : "Action Needed"}
        />
        <StatCard
          icon={Bookmark}
          label="Bookmarked Careers"
          value={String(bookmarkedCareersCount)}
          hint="Saved career paths"
          badge={`${careersList.length} Available`}
        />
        <StatCard
          icon={Landmark}
          label="Tracked Govt Exams"
          value={String(trackedExamsCount)}
          hint="Active deadlines"
          badge="Live Tracker"
        />
      </div>

      {/* Dashboard Tabs for Modules */}
      <Tabs defaultValue="overview" className="w-full space-y-6">
        <TabsList className="flex w-full overflow-x-auto justify-start sm:justify-center rounded-2xl bg-card border border-border p-1.5 scrollbar-none">
          <TabsTrigger value="overview" className="rounded-xl text-xs sm:text-sm font-medium px-4">Overview</TabsTrigger>
          <TabsTrigger value="planner" className="rounded-xl text-xs sm:text-sm font-medium px-4">Study Planner ({doneTasks}/{tasks.length})</TabsTrigger>
          <TabsTrigger value="exams" className="rounded-xl text-xs sm:text-sm font-medium px-4">Government Exams ({trackedExamsCount})</TabsTrigger>
          <TabsTrigger value="careers" className="rounded-xl text-xs sm:text-sm font-medium px-4">Saved Careers ({bookmarkedCareersCount})</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Interest Radar Chart */}
            <Card className="glass rounded-2xl p-5 lg:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-base">Career Interest Spectrum</h3>
                  <p className="text-xs text-muted-foreground">
                    {assessmentTaken ? "Computed live from your assessment responses" : "Take assessment to generate live analytics"}
                  </p>
                </div>
                <Badge variant={assessmentTaken ? "default" : "outline"} className="text-xs">
                  {assessmentTaken ? "Live Analytics" : "Baseline"}
                </Badge>
              </div>
              <div className="mt-4 h-64 sm:h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={interestsData} outerRadius="70%">
                    <PolarGrid stroke="var(--border)" />
                    <PolarAngleAxis dataKey="area" tick={{ fill: "var(--foreground)", fontSize: 12 }} />
                    <Radar
                      dataKey="score"
                      stroke="var(--chart-1)"
                      fill="var(--chart-1)"
                      fillOpacity={assessmentTaken ? 0.45 : 0.15}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "var(--popover)",
                        border: "1px solid var(--border)",
                        borderRadius: 12,
                        color: "var(--popover-foreground)",
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Today's Goal Quick Card */}
            <Card className="glass rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-base">Today's Study Goal</h3>
                  <Badge variant={progressPercent === 100 ? "default" : "secondary"}>
                    {progressPercent}% Complete
                  </Badge>
                </div>
                <Progress value={progressPercent} className="mt-4 h-2.5 rounded-full" />
                <ul className="mt-4 space-y-2.5">
                  {tasks.slice(0, 4).map((t) => (
                    <li
                      key={t.id}
                      onClick={() => toggleTask(t.id)}
                      className="flex items-center gap-3 text-xs sm:text-sm cursor-pointer group"
                    >
                      <span
                        className={`grid size-5 shrink-0 place-items-center rounded-full transition-colors ${
                          t.done
                            ? "bg-emerald-500 text-white"
                            : "border border-border group-hover:border-primary"
                        }`}
                      >
                        {t.done ? <CheckCircle2 className="size-3.5" /> : null}
                      </span>
                      <span className={t.done ? "text-muted-foreground line-through" : "text-foreground font-medium"}>
                        {t.title}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <Button
                variant="outline"
                onClick={retakeAssessment}
                className="mt-6 w-full rounded-xl gap-2 border-primary/20 text-xs font-semibold text-primary cursor-pointer hover:bg-primary/5"
              >
                <Sparkles className="size-4" />
                {assessmentTaken ? "Retake Career Assessment" : "Take Career Quiz"}
              </Button>
            </Card>
          </div>

          {/* Secondary Charts & Lists */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <ListCard
              icon={Bookmark}
              title="Top Matched Careers"
              items={careersList.slice(0, 4).map((c) => ({
                primary: c.name,
                secondary: `${c.baseMatch}% match`,
              }))}
            />
            <ListCard
              icon={Landmark}
              title="Tracked Government Exams"
              items={savedExamsList.filter((e) => e.saved).map((e) => ({
                primary: e.name,
                secondary: e.window,
              }))}
            />
            <ListCard
              icon={Wallet}
              title="Matched Scholarships"
              items={[
                { primary: "NSP Merit Scholarship 2026", secondary: "₹20,000/yr" },
                { primary: "Maharashtra Freeship Scheme", secondary: "Full Tuition" },
                { primary: "INSPIRE DST Science Fellowship", secondary: "₹80,000/yr" },
              ]}
            />
          </div>
        </TabsContent>

        {/* STUDY PLANNER TAB */}
        <TabsContent value="planner" className="space-y-6">
          <Card className="glass rounded-3xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold font-display">Interactive AI Study Planner</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Manage daily study objectives and track preparation progress.</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-sm px-3 py-1">
                  {doneTasks} of {tasks.length} Completed
                </Badge>
              </div>
            </div>

            <Progress value={progressPercent} className="mt-4 h-3 rounded-full" />

            {/* Add Task Form */}
            <form onSubmit={addTask} className="mt-6 flex items-center gap-2">
              <Input
                placeholder="Add a new study goal (e.g. Solve 30 Quant questions)..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="h-11 rounded-xl bg-background border-border text-sm"
              />
              <Button type="submit" className="gradient-brand h-11 px-5 rounded-xl text-primary-foreground font-semibold shrink-0 gap-1.5 cursor-pointer">
                <Plus className="size-4" /> Add Task
              </Button>
            </form>

            {/* Tasks List */}
            <div className="mt-6 space-y-3">
              {tasks.map((t) => (
                <div
                  key={t.id}
                  className={`flex items-center justify-between gap-4 p-4 rounded-2xl border transition-all ${
                    t.done
                      ? "bg-accent/30 border-border/40"
                      : "bg-card border-border shadow-xs hover:border-primary/40"
                  }`}
                >
                  <div
                    onClick={() => toggleTask(t.id)}
                    className="flex items-center gap-3.5 cursor-pointer flex-1 min-w-0"
                  >
                    <span
                      className={`grid size-6 shrink-0 place-items-center rounded-full transition-colors ${
                        t.done
                          ? "bg-emerald-500 text-white"
                          : "border-2 border-border"
                      }`}
                    >
                      {t.done ? <CheckCircle className="size-4" /> : null}
                    </span>
                    <span className={`text-sm font-medium ${t.done ? "text-muted-foreground line-through" : "text-foreground"}`}>
                      {t.title}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTask(t.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-lg cursor-pointer"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* EXAMS TAB */}
        <TabsContent value="exams" className="space-y-6">
          <Card className="glass rounded-3xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold font-display">Government & Entrance Exam Tracker</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Discover eligibility, schedules, and bookmark exams for your target timeline.</p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search exam name..."
                  value={examSearch}
                  onChange={(e) => setExamSearch(e.target.value)}
                  className="pl-9 h-10 rounded-xl bg-background border-border text-sm"
                />
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {savedExamsList
                .filter((e) => e.name.toLowerCase().includes(examSearch.toLowerCase()))
                .map((exam) => (
                  <Card key={exam.id} className="p-5 rounded-2xl border-border/80 flex flex-col justify-between bg-card hover-lift">
                    <div>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-[11px]">{exam.category}</Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleSaveExam(exam.id)}
                          className={`h-8 w-8 rounded-full cursor-pointer ${exam.saved ? "text-primary fill-primary" : "text-muted-foreground"}`}
                        >
                          <Bookmark className={`size-4 ${exam.saved ? "fill-primary text-primary" : ""}`} />
                        </Button>
                      </div>
                      <h4 className="font-bold text-base mt-3">{exam.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                        <CalendarClock className="size-3.5 text-primary" /> Target: <strong className="text-foreground">{exam.window}</strong>
                      </p>
                    </div>
                    <Button
                      variant={exam.saved ? "outline" : "default"}
                      size="sm"
                      onClick={() => toggleSaveExam(exam.id)}
                      className="mt-5 w-full rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      {exam.saved ? "Bookmarked ✓" : "Track Exam"}
                    </Button>
                  </Card>
                ))}
            </div>
          </Card>
        </TabsContent>

        {/* CAREERS TAB */}
        <TabsContent value="careers" className="space-y-6">
          <Card className="glass rounded-3xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold font-display">AI Recommended Careers</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {assessmentTaken
                    ? "Ranked according to your exact multi-discipline assessment scores."
                    : "Complete the assessment to receive tailored real-time match rankings."}
                </p>
              </div>
              <Badge variant="outline" className="px-3 py-1 text-xs">
                {bookmarkedCareersCount} Saved
              </Badge>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {careersList.map((career) => (
                <Card key={career.id} className="p-5 rounded-2xl border-border bg-card hover-lift flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <Badge className="bg-primary/10 text-primary border-primary/20">{career.baseMatch}% Match</Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleBookmarkCareer(career.id)}
                        className={`h-8 w-8 rounded-full cursor-pointer ${career.bookmarked ? "text-primary" : "text-muted-foreground"}`}
                        title={career.bookmarked ? "Remove bookmark" : "Bookmark career"}
                      >
                        <Bookmark className={`size-4 ${career.bookmarked ? "fill-primary text-primary" : ""}`} />
                      </Button>
                    </div>
                    <h4 className="font-bold text-lg mt-2">{career.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {career.description}
                    </p>
                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
                      <span>Salary: <strong className="text-foreground font-semibold">{career.salary}</strong></span>
                      <span>Demand: <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">{career.demand}</strong></span>
                    </div>
                  </div>
                  <Button
                    variant={career.bookmarked ? "outline" : "default"}
                    size="sm"
                    onClick={() => toggleBookmarkCareer(career.id)}
                    className="mt-5 w-full rounded-xl text-xs font-semibold gap-1.5 cursor-pointer"
                  >
                    {career.bookmarked ? "Saved in Profile ✓" : "Bookmark Career Path"}
                  </Button>
                </Card>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Mini Assessment Quiz Dialog */}
      {isAssessmentOpen && (
        <Dialog open={isAssessmentOpen} onOpenChange={setIsAssessmentOpen}>
          <DialogContent className="max-w-lg rounded-3xl p-6 sm:p-8">
            <DialogHeader>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className="text-xs text-primary border-primary/20">
                  Question {assessmentStep + 1} of {ASSESSMENT_QUESTIONS.length}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {Math.round(((assessmentStep + 1) / ASSESSMENT_QUESTIONS.length) * 100)}% Complete
                </span>
              </div>
              <Progress
                value={((assessmentStep + 1) / ASSESSMENT_QUESTIONS.length) * 100}
                className="h-1.5 rounded-full mb-3"
              />
              <DialogTitle className="text-base sm:text-lg font-bold font-display leading-snug">
                {activeQuestion.question}
              </DialogTitle>
            </DialogHeader>

            <div className="mt-4 space-y-2.5">
              {activeQuestion.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAssessmentOptionSelect(idx)}
                  className="w-full text-left p-4 rounded-2xl bg-card border border-border/80 hover:border-primary hover:bg-primary/5 transition-all text-xs sm:text-sm font-medium text-foreground flex items-center justify-between group cursor-pointer shadow-2xs"
                >
                  <span className="pr-2">{option.text}</span>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </main>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  badge,
}: {
  icon: typeof Target;
  label: string;
  value: string;
  hint: string;
  badge?: string;
}) {
  return (
    <Card className="hover-lift glass rounded-2xl p-5 border-border/70 relative overflow-hidden">
      {badge && (
        <Badge variant="secondary" className="absolute top-4 right-4 text-[10px] font-semibold py-0.5 px-2">
          {badge}
        </Badge>
      )}
      <div className="flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
          <Icon className="size-5 text-primary" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs text-muted-foreground font-medium">{label}</p>
          <p className="font-display text-2xl font-bold text-foreground">{value}</p>
        </div>
      </div>
      <p className="mt-3 truncate text-xs text-muted-foreground font-normal">{hint}</p>
    </Card>
  );
}

function ListCard({
  icon: Icon,
  title,
  items,
}: {
  icon: typeof Target;
  title: string;
  items: { primary: string; secondary: string }[];
}) {
  return (
    <Card className="glass rounded-2xl p-5 border-border/70">
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-primary shrink-0" />
        <h3 className="font-semibold text-sm">{title}</h3>
      </div>
      {items.length === 0 ? (
        <p className="mt-4 text-xs text-muted-foreground">Nothing saved yet.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map((i) => (
            <li key={i.primary} className="flex items-start justify-between gap-3 text-xs">
              <span className="min-w-0 flex-1 font-medium text-foreground truncate">{i.primary}</span>
              <span className="shrink-0 text-muted-foreground font-semibold">{i.secondary}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
