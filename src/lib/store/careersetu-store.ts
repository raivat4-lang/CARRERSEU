import { CAREERS_DATA, CareerItem } from "../data/careers-data";
import { EXAMS_DATA, GovernmentExamItem } from "../data/exams-data";
import { SCHOLARSHIPS_DATA, ScholarshipItem } from "../data/scholarships-data";
import { COLLEGES_DATA, CollegeItem } from "../data/colleges-data";
import { RESOURCES_DATA, LearningResourceItem } from "../data/resources-data";
import {
  ASSESSMENT_QUESTIONS,
  calculateAssessmentResults,
  AssessmentResultData,
} from "../data/assessment-questions";
import { getUserScopedKey } from "../auth/rbac";

// BOOKMARKS
export interface BookmarkStore {
  careers: string[]; // career IDs
  exams: string[]; // exam IDs
  scholarships: string[]; // scholarship IDs
  colleges: string[]; // college IDs
  resources: string[]; // resource IDs
}

const DEFAULT_BOOKMARKS: BookmarkStore = {
  careers: ["ai-ml-engineer", "full-stack-developer", "ias-officer"],
  exams: ["upsc-cse", "gate-engineering", "isro-icrb"],
  scholarships: ["nsp-csss", "dst-inspire-fellowship"],
  colleges: ["iit-bombay", "st-xaviers-mumbai", "iim-ahmedabad"],
  resources: ["upsc-laxmikanth-polity", "striver-sde-sheet"],
};

export function getBookmarks(): BookmarkStore {
  if (typeof localStorage === "undefined") return DEFAULT_BOOKMARKS;
  try {
    const key = getUserScopedKey("careersetu_bookmarks");
    const raw = localStorage.getItem(key) || localStorage.getItem("careersetu_bookmarks");
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_BOOKMARKS;
}

export function saveBookmarks(bm: BookmarkStore) {
  if (typeof localStorage === "undefined") return;
  const key = getUserScopedKey("careersetu_bookmarks");
  localStorage.setItem(key, JSON.stringify(bm));
}

export function toggleBookmark(
  type: keyof BookmarkStore,
  id: string
): boolean {
  const current = getBookmarks();
  const list = current[type];
  const exists = list.includes(id);
  const updated = exists ? list.filter((item) => item !== id) : [...list, id];
  const newStore = { ...current, [type]: updated };
  saveBookmarks(newStore);
  return !exists; // true if added, false if removed
}

export function isBookmarked(type: keyof BookmarkStore, id: string): boolean {
  const current = getBookmarks();
  return current[type].includes(id);
}

// STUDY PLANNER TASKS
export interface StudyTask {
  id: string;
  title: string;
  subject: string;
  date: string; // YYYY-MM-DD
  timeEstimateMins: number;
  completed: boolean;
  priority: "High" | "Medium" | "Normal";
  targetExamId?: string;
  rescheduledCount?: number;
}

const DEFAULT_STUDY_TASKS: StudyTask[] = [
  {
    id: "task-1",
    title: "Master Linear Algebra Matrix Decomposition & Eigenvalues",
    subject: "Mathematics & AI",
    date: new Date().toISOString().split("T")[0]!,
    timeEstimateMins: 60,
    completed: true,
    priority: "High",
    targetExamId: "gate-engineering",
  },
  {
    id: "task-2",
    title: "Solve 20 Dynamic Programming problems on LeetCode / Striver",
    subject: "DSA & Computer Science",
    date: new Date().toISOString().split("T")[0]!,
    timeEstimateMins: 90,
    completed: false,
    priority: "High",
  },
  {
    id: "task-3",
    title: "Read The Hindu editorial & make notes on Constitutional Bills",
    subject: "Current Affairs & Polity",
    date: new Date().toISOString().split("T")[0]!,
    timeEstimateMins: 45,
    completed: false,
    priority: "Medium",
    targetExamId: "upsc-cse",
  },
  {
    id: "task-4",
    title: "Practice Quantitative Aptitude (Time, Speed & Distance)",
    subject: "General Aptitude",
    date: new Date(Date.now() + 86400000).toISOString().split("T")[0]!,
    timeEstimateMins: 45,
    completed: false,
    priority: "Normal",
  },
  {
    id: "task-5",
    title: "Mock Test 1: Full-Length Sectional Evaluation",
    subject: "Mock Simulation",
    date: new Date(Date.now() + 172800000).toISOString().split("T")[0]!,
    timeEstimateMins: 120,
    completed: false,
    priority: "High",
  },
];

export function getStudyTasks(): StudyTask[] {
  if (typeof localStorage === "undefined") return DEFAULT_STUDY_TASKS;
  try {
    const key = getUserScopedKey("careersetu_study_tasks");
    const raw = localStorage.getItem(key) || localStorage.getItem("careersetu_study_tasks");
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_STUDY_TASKS;
}

export function saveStudyTasks(tasks: StudyTask[]) {
  if (typeof localStorage === "undefined") return;
  const key = getUserScopedKey("careersetu_study_tasks");
  localStorage.setItem(key, JSON.stringify(tasks));
}

// Auto-reschedule missed overdue tasks to today without destroying completed ones
export function rescheduleMissedTasks(): { rescheduledCount: number } {
  const tasks = getStudyTasks();
  const todayStr = new Date().toISOString().split("T")[0]!;
  let count = 0;

  const updated = tasks.map((t) => {
    if (!t.completed && t.date < todayStr) {
      count++;
      return {
        ...t,
        date: todayStr,
        rescheduledCount: (t.rescheduledCount || 0) + 1,
      };
    }
    return t;
  });

  if (count > 0) {
    saveStudyTasks(updated);
  }
  return { rescheduledCount: count };
}

// ASSESSMENT STATE
export function getStoredAssessmentAnswers(): Record<number, number> {
  if (typeof localStorage === "undefined") return {};
  try {
    const key = getUserScopedKey("careersetu_assessment_answers");
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

export function saveAssessmentAnswers(answers: Record<number, number>) {
  if (typeof localStorage === "undefined") return;
  const key = getUserScopedKey("careersetu_assessment_answers");
  localStorage.setItem(key, JSON.stringify(answers));
}

export interface CompletedAssessmentRecord {
  id: string;
  studentEmail: string;
  studentName: string;
  completedAt: string;
  primaryDomain: string;
  topCareer: string;
  score: number;
}

const DEFAULT_COMPLETED_ASSESSMENTS: CompletedAssessmentRecord[] = [
  {
    id: "assess-1",
    studentEmail: "aditi.kulkarni@gmail.com",
    studentName: "Aditi Kulkarni",
    completedAt: "2026-03-02T14:30:00.000Z",
    primaryDomain: "Technology",
    topCareer: "AI & Machine Learning Engineer",
    score: 94,
  },
  {
    id: "assess-2",
    studentEmail: "rahul.sharma@gmail.com",
    studentName: "Rahul Sharma",
    completedAt: "2026-03-06T16:00:00.000Z",
    primaryDomain: "Civil Services",
    topCareer: "IAS Officer (Civil Services)",
    score: 88,
  },
  {
    id: "assess-3",
    studentEmail: "priya.patil@outlook.com",
    studentName: "Priya Patil",
    completedAt: "2026-03-09T10:15:00.000Z",
    primaryDomain: "Technology",
    topCareer: "Full Stack Web Developer",
    score: 91,
  },
];

export function getCompletedAssessments(): CompletedAssessmentRecord[] {
  if (typeof localStorage === "undefined") return DEFAULT_COMPLETED_ASSESSMENTS;
  try {
    const raw = localStorage.getItem("careersetu_completed_assessments");
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_COMPLETED_ASSESSMENTS;
}

export function saveCompletedAssessments(records: CompletedAssessmentRecord[]) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem("careersetu_completed_assessments", JSON.stringify(records));
}

export function recordAssessmentCompletion(
  studentEmail: string,
  studentName: string,
  results: AssessmentResultData
) {
  const current = getCompletedAssessments();
  const sortedScores = Object.entries(results.categoryScores || {}).sort((a, b) => b[1] - a[1]);
  const primaryDomain = sortedScores[0]?.[0] || "Technology";
  const topCareerId = results.recommendedCareerIds?.[0] || "ai-ml-engineer";
  
  const existingIdx = current.findIndex((r) => r.studentEmail.toLowerCase() === studentEmail.toLowerCase());
  const newRecord: CompletedAssessmentRecord = {
    id: existingIdx !== -1 ? current[existingIdx]!.id : "assess-" + Date.now(),
    studentEmail,
    studentName,
    completedAt: new Date().toISOString(),
    primaryDomain,
    topCareer: topCareerId,
    score: Math.max(...Object.values(results.categoryScores || { tech: 85 })),
  };

  let updated: CompletedAssessmentRecord[];
  if (existingIdx !== -1) {
    updated = [...current];
    updated[existingIdx] = newRecord;
  } else {
    updated = [newRecord, ...current];
  }

  saveCompletedAssessments(updated);
  return updated;
}

export function getAssessmentResults(): AssessmentResultData {
  if (typeof localStorage === "undefined") {
    return calculateAssessmentResults({});
  }
  try {
    const key = getUserScopedKey("careersetu_assessment_results");
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {}
  // Default calculate from answers
  const answers = getStoredAssessmentAnswers();
  const result = calculateAssessmentResults(answers);
  return result;
}

export function saveAssessmentResults(results: AssessmentResultData) {
  if (typeof localStorage === "undefined") return;
  const key = getUserScopedKey("careersetu_assessment_results");
  localStorage.setItem(key, JSON.stringify(results));
}

// RESUME BUILDER STATE
export interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedinUrl: string;
    githubUrl: string;
    portfolioUrl: string;
    headline: string;
  };
  summary: string;
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate: string;
    grade: string;
  }>;
  experience: Array<{
    id: string;
    company: string;
    role: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
    bullets: string[];
  }>;
  projects: Array<{
    id: string;
    title: string;
    techStack: string;
    liveUrl: string;
    githubUrl: string;
    description: string;
    bullets: string[];
  }>;
  skills: {
    technical: string[];
    frameworks: string[];
    tools: string[];
    softSkills: string[];
  };
  certifications: Array<{
    id: string;
    name: string;
    issuer: string;
    issueDate: string;
    credentialUrl: string;
  }>;
  achievements: string[];
  languages: string[];
  templateId: "modern-minimal" | "executive" | "tech-clean" | "creative";
}

export const DEFAULT_RESUME_DATA: ResumeData = {
  personalInfo: {
    fullName: "Tushar Devendra",
    email: "tushar@careersetu.ai",
    phone: "+91 98765 43210",
    location: "Mumbai, Maharashtra, India",
    linkedinUrl: "https://linkedin.com/in/devtushar",
    githubUrl: "https://github.com/devtusharhq",
    portfolioUrl: "https://careersetu.ai",
    headline: "Aspiring AI & Software Engineer | Data & Cloud Specialist",
  },
  summary:
    "Driven and detail-oriented technologist with deep proficiency in full-stack architecture, machine learning models, and algorithm design. Proven track record of building production web applications, optimizing database latency, and delivering high-impact student guidance tools.",
  education: [
    {
      id: "edu-1",
      institution: "Mumbai University / National Institute of Technology",
      degree: "Bachelor of Technology (B.Tech)",
      fieldOfStudy: "Computer Science & Engineering",
      startDate: "2023",
      endDate: "2027",
      grade: "8.9 CGPA",
    },
    {
      id: "edu-2",
      institution: "Modern Junior Science College, Mumbai",
      degree: "Higher Secondary Certificate (Class 12 CBSE)",
      fieldOfStudy: "Physics, Chemistry, Mathematics (PCM)",
      startDate: "2021",
      endDate: "2023",
      grade: "94.2%",
    },
  ],
  experience: [
    {
      id: "exp-1",
      company: "CareerSetu AI Platform",
      role: "Lead Software & AI Engineering Intern",
      location: "Mumbai, India (Remote)",
      startDate: "Jan 2026",
      endDate: "Present",
      current: true,
      description: "Architected modern AI career counseling SaaS platform for Indian students.",
      bullets: [
        "Integrated multi-provider LLM orchestration supporting Google Gemini 2.5 Flash and Groq Llama 3.3.",
        "Built responsive 50-question adaptive assessment scoring engine with 99.4% deterministic accuracy.",
        "Engineered study plan rescheduling algorithms improving student task completion consistency by 40%.",
      ],
    },
  ],
  projects: [
    {
      id: "proj-1",
      title: "CareerSetu AI — Autonomous Career Guidance & Exam Finder",
      techStack: "React, TypeScript, TanStack Start, Tailwind CSS, Supabase",
      liveUrl: "https://careersetu.ai",
      githubUrl: "https://github.com/devtusharhq/careersetu-ai",
      description: "AI-driven SaaS helping students navigate 100+ careers, 20+ government exams, and personalized roadmaps.",
      bullets: [
        "Implemented real-time live search across 100+ careers, colleges, and scholarships with keyboard shortcuts.",
        "Designed interactive radar charts and multi-criteria comparison engine.",
      ],
    },
    {
      id: "proj-2",
      title: "Neural Vision & Document Intelligence Pipeline",
      techStack: "Python, PyTorch, FastAPI, OpenCV, Docker",
      liveUrl: "",
      githubUrl: "https://github.com/devtusharhq/neural-doc",
      description: "High-accuracy optical character recognition and semantic document parser.",
      bullets: [
        "Trained custom vision transformer models achieving 98.2% parsing accuracy on government notification PDFs.",
        "Deployed containerized microservice on AWS ECS with under 120ms p95 latency.",
      ],
    },
  ],
  skills: {
    technical: ["TypeScript", "Python", "JavaScript", "SQL", "C++", "HTML5/CSS3"],
    frameworks: ["React", "Next.js", "Node.js", "Tailwind CSS", "FastAPI", "PyTorch"],
    tools: ["Git", "Docker", "AWS", "PostgreSQL", "Supabase", "Figma", "Linux"],
    softSkills: ["Problem Solving", "Team Leadership", "Strategic Planning", "Technical Communication"],
  },
  certifications: [
    {
      id: "cert-1",
      name: "AWS Certified Cloud Practitioner",
      issuer: "Amazon Web Services (AWS)",
      issueDate: "2025",
      credentialUrl: "https://aws.amazon.com/verification",
    },
    {
      id: "cert-2",
      name: "Deep Learning Specialization",
      issuer: "DeepLearning.AI / Coursera",
      issueDate: "2025",
      credentialUrl: "https://coursera.org/verify",
    },
  ],
  achievements: [
    "Ranked in Top 1% in National Mathematics Olympiad.",
    "Winner of Inter-College Hackathon 2025 (1st place out of 120+ teams).",
    "Completed 250+ LeetCode algorithmic problem sets in C++ and Python.",
  ],
  languages: ["English (Fluent)", "Hindi (Native)", "Marathi (Fluent)"],
  templateId: "modern-minimal",
};

export function getResumeData(): ResumeData {
  if (typeof localStorage === "undefined") return DEFAULT_RESUME_DATA;
  try {
    const key = getUserScopedKey("careersetu_resume_data");
    const raw = localStorage.getItem(key) || localStorage.getItem("careersetu_resume_data");
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_RESUME_DATA;
}

export function saveResumeData(data: ResumeData) {
  if (typeof localStorage === "undefined") return;
  const key = getUserScopedKey("careersetu_resume_data");
  localStorage.setItem(key, JSON.stringify(data));
}

// SKILL GAP STATE
export type SkillStatus = "Not Started" | "Learning" | "Intermediate" | "Advanced";

export interface SkillGapStore {
  targetCareerId: string;
  skillStatuses: Record<string, SkillStatus>;
}

export function getSkillGapStore(): SkillGapStore {
  const defaultStore: SkillGapStore = {
    targetCareerId: "ai-ml-engineer",
    skillStatuses: {
      Python: "Advanced",
      SQL: "Intermediate",
      PyTorch: "Learning",
      Transformers: "Not Started",
      "Linear Algebra": "Intermediate",
      Docker: "Learning",
      MLOps: "Not Started",
    },
  };
  if (typeof localStorage === "undefined") return defaultStore;
  try {
    const key = getUserScopedKey("careersetu_skill_gap");
    const raw = localStorage.getItem(key) || localStorage.getItem("careersetu_skill_gap");
    if (raw) return JSON.parse(raw);
  } catch {}
  return defaultStore;
}

export function saveSkillGapStore(store: SkillGapStore) {
  if (typeof localStorage === "undefined") return;
  const key = getUserScopedKey("careersetu_skill_gap");
  localStorage.setItem(key, JSON.stringify(store));
}
