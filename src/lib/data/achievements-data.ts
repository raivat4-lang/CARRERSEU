export interface AchievementItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "Assessment" | "Study" | "Career" | "Exam" | "Resume";
  unlocked: boolean;
  unlockedDate?: string;
  progressPercent: number;
}

export const DEFAULT_ACHIEVEMENTS: AchievementItem[] = [
  {
    id: "assessment-master",
    title: "Assessment Master",
    description: "Completed the 50-question AI Career Assessment and unlocked personalized career compatibility.",
    icon: "Target",
    category: "Assessment",
    unlocked: true,
    unlockedDate: "Recently",
    progressPercent: 100,
  },
  {
    id: "career-explorer",
    title: "Career Explorer",
    description: "Explored 5+ detailed career roadmaps and compared high-growth industry opportunities.",
    icon: "Compass",
    category: "Career",
    unlocked: true,
    unlockedDate: "Today",
    progressPercent: 100,
  },
  {
    id: "first-career-saved",
    title: "First Career Bookmarked",
    description: "Bookmarked your primary target career to track its roadmaps and required skills.",
    icon: "Bookmark",
    category: "Career",
    unlocked: true,
    unlockedDate: "Today",
    progressPercent: 100,
  },
  {
    id: "study-starter",
    title: "Study Starter",
    description: "Generated an adaptive study plan and checked off your first scheduled daily task.",
    icon: "CalendarCheck",
    category: "Study",
    unlocked: true,
    unlockedDate: "Today",
    progressPercent: 100,
  },
  {
    id: "seven-day-streak",
    title: "7-Day Study Streak",
    description: "Completed study tasks consistently for 7 consecutive days without missing goals.",
    icon: "Flame",
    category: "Study",
    unlocked: false,
    progressPercent: 71,
  },
  {
    id: "exam-explorer",
    title: "Exam Explorer",
    description: "Tracked official eligibility, patterns, and deadlines for 3+ National/Government exams.",
    icon: "Landmark",
    category: "Exam",
    unlocked: true,
    unlockedDate: "Yesterday",
    progressPercent: 100,
  },
  {
    id: "skill-builder",
    title: "Skill Builder",
    description: "Identified skill gaps for your dream career and marked 2+ skills as Intermediate/Advanced.",
    icon: "Zap",
    category: "Career",
    unlocked: false,
    progressPercent: 50,
  },
  {
    id: "resume-ready",
    title: "Resume Ready",
    description: "Created and exported a professional ATS-friendly resume using the AI Resume Builder.",
    icon: "FileText",
    category: "Resume",
    unlocked: false,
    progressPercent: 80,
  },
  {
    id: "scholarship-hunter",
    title: "Scholarship Hunter",
    description: "Checked eligibility and saved high-value financial grants matching your profile.",
    icon: "GraduationCap",
    category: "Exam",
    unlocked: true,
    unlockedDate: "Today",
    progressPercent: 100,
  },
];
