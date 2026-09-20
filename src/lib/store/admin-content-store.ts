import { CAREERS_DATA, CareerItem } from "../data/careers-data";
import { EXAMS_DATA, GovernmentExamItem } from "../data/exams-data";
import { SCHOLARSHIPS_DATA, ScholarshipItem } from "../data/scholarships-data";
import { COLLEGES_DATA, CollegeItem } from "../data/colleges-data";
import { RESOURCES_DATA, LearningResourceItem } from "../data/resources-data";
import { ASSESSMENT_QUESTIONS, AssessmentQuestion } from "../data/assessment-questions";
import { ContentStatus, logAuditEvent } from "../auth/rbac";

// Enhanced Admin Interfaces with lifecycle statuses
export interface ManagedCareerItem extends CareerItem {
  status?: ContentStatus;
  lastUpdated?: string;
  source?: string;
}

export interface ManagedExamItem extends GovernmentExamItem {
  status?: ContentStatus;
  lastUpdated?: string;
  source?: string;
}

export interface ManagedScholarshipItem extends ScholarshipItem {
  status?: ContentStatus;
  lastUpdated?: string;
  source?: string;
}

export interface ManagedCollegeItem extends CollegeItem {
  status?: ContentStatus;
  lastUpdated?: string;
  source?: string;
}

export interface ManagedResourceItem extends LearningResourceItem {
  status?: ContentStatus;
  lastUpdated?: string;
  source?: string;
}

export interface ManagedQuestionItem extends AssessmentQuestion {
  status?: ContentStatus;
  active?: boolean;
}

export interface SkillItem {
  id: string;
  name: string;
  category: string;
  demand: "High" | "Very High" | "Moderate";
  careers: string[];
  learningTimeWeeks: number;
}

export const INITIAL_SKILLS: SkillItem[] = [
  { id: "skill-1", name: "Python Programming", category: "Programming", demand: "Very High", careers: ["ai-ml-engineer", "data-scientist"], learningTimeWeeks: 8 },
  { id: "skill-2", name: "SQL & Data Warehousing", category: "Data", demand: "Very High", careers: ["data-analyst", "data-scientist", "backend-developer"], learningTimeWeeks: 6 },
  { id: "skill-3", name: "Indian Constitution & Polity", category: "Civil Services", demand: "High", careers: ["ias-officer", "ips-officer"], learningTimeWeeks: 12 },
  { id: "skill-4", name: "Machine Learning & Deep Learning", category: "AI", demand: "Very High", careers: ["ai-ml-engineer"], learningTimeWeeks: 16 },
  { id: "skill-5", name: "Financial Accounting & Valuation", category: "Finance", demand: "High", careers: ["investment-banker", "chartered-accountant"], learningTimeWeeks: 10 },
  { id: "skill-6", name: "Data Structures & Algorithms", category: "Computer Science", demand: "Very High", careers: ["full-stack-developer", "backend-developer"], learningTimeWeeks: 12 },
];

export interface AdminBroadcastNotification {
  id: string;
  title: string;
  message: string;
  category: "EXAM" | "SCHOLARSHIP" | "ADMISSION" | "SYSTEM" | "STUDY";
  priority: "HIGH" | "NORMAL" | "URGENT";
  targetAudience: "ALL" | "GRADUATES" | "CLASS_12" | "GOVT_ASPIRANTS";
  link?: string;
  publishedAt: string;
}

const INITIAL_BROADCASTS: AdminBroadcastNotification[] = [
  {
    id: "notif-1",
    title: "UPSC CSE 2026 Notification Released",
    message: "Union Public Service Commission has officially opened registration window. Apply online before deadline.",
    category: "EXAM",
    priority: "HIGH",
    targetAudience: "ALL",
    link: "/exams",
    publishedAt: "2026-03-10T10:00:00.000Z",
  },
  {
    id: "notif-2",
    title: "AICTE Pragati Scholarship Application Window Closing",
    message: "Annual ₹50,000 scholarship for female technical diploma/degree students closing in 7 days.",
    category: "SCHOLARSHIP",
    priority: "URGENT",
    targetAudience: "GRADUATES",
    link: "/scholarships",
    publishedAt: "2026-03-12T12:00:00.000Z",
  },
];

// CAREERS STORE
export function getManagedCareers(): ManagedCareerItem[] {
  if (typeof localStorage === "undefined") {
    return CAREERS_DATA.map((c) => ({ ...c, status: "PUBLISHED" as ContentStatus, lastUpdated: "2026-03-01", source: "Official Industry & UGC Data" }));
  }
  try {
    const raw = localStorage.getItem("careersetu_admin_careers");
    if (raw) return JSON.parse(raw);
  } catch {}
  const initial = CAREERS_DATA.map((c) => ({ ...c, status: "PUBLISHED" as ContentStatus, lastUpdated: "2026-03-01", source: "Official Industry & UGC Data" }));
  localStorage.setItem("careersetu_admin_careers", JSON.stringify(initial));
  return initial;
}

export function saveManagedCareers(careers: ManagedCareerItem[]) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem("careersetu_admin_careers", JSON.stringify(careers));
}

export function upsertManagedCareer(career: ManagedCareerItem) {
  const list = getManagedCareers();
  const idx = list.findIndex((c) => c.id === career.id);
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...career, lastUpdated: new Date().toISOString().split("T")[0] };
    logAuditEvent("CAREER_UPDATED", "Career", career.id, `Updated career ${career.name} (Status: ${career.status || "PUBLISHED"})`);
  } else {
    list.unshift({ ...career, lastUpdated: new Date().toISOString().split("T")[0] });
    logAuditEvent("CAREER_CREATED", "Career", career.id, `Created career profile ${career.name}`);
  }
  saveManagedCareers(list);
}

export function archiveCareer(careerId: string) {
  const list = getManagedCareers();
  const item = list.find((c) => c.id === careerId);
  if (item) {
    item.status = item.status === "ARCHIVED" ? "PUBLISHED" : "ARCHIVED";
    saveManagedCareers(list);
    logAuditEvent("CAREER_STATUS_CHANGE", "Career", careerId, `Changed status of ${item.name} to ${item.status}`);
  }
}

// EXAMS STORE
export function getManagedExams(): ManagedExamItem[] {
  if (typeof localStorage === "undefined") {
    return EXAMS_DATA.map((e) => ({ ...e, status: "PUBLISHED" as ContentStatus, lastUpdated: "2026-03-01", source: "Official Conducting Commission" }));
  }
  try {
    const raw = localStorage.getItem("careersetu_admin_exams");
    if (raw) return JSON.parse(raw);
  } catch {}
  const initial = EXAMS_DATA.map((e) => ({ ...e, status: "PUBLISHED" as ContentStatus, lastUpdated: "2026-03-01", source: "Official Conducting Commission" }));
  localStorage.setItem("careersetu_admin_exams", JSON.stringify(initial));
  return initial;
}

export function saveManagedExams(exams: ManagedExamItem[]) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem("careersetu_admin_exams", JSON.stringify(exams));
}

export function upsertManagedExam(exam: ManagedExamItem) {
  const list = getManagedExams();
  const idx = list.findIndex((e) => e.id === exam.id);
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...exam, lastUpdated: new Date().toISOString().split("T")[0] };
    logAuditEvent("EXAM_UPDATED", "Government Exam", exam.id, `Updated exam ${exam.name}`);
  } else {
    list.unshift({ ...exam, lastUpdated: new Date().toISOString().split("T")[0] });
    logAuditEvent("EXAM_CREATED", "Government Exam", exam.id, `Created exam profile ${exam.name}`);
  }
  saveManagedExams(list);
}

export function archiveExam(examId: string) {
  const list = getManagedExams();
  const item = list.find((e) => e.id === examId);
  if (item) {
    item.status = item.status === "ARCHIVED" ? "PUBLISHED" : "ARCHIVED";
    saveManagedExams(list);
    logAuditEvent("EXAM_STATUS_CHANGE", "Government Exam", examId, `Changed status of ${item.name} to ${item.status}`);
  }
}

// SCHOLARSHIPS STORE
export function getManagedScholarships(): ManagedScholarshipItem[] {
  if (typeof localStorage === "undefined") return SCHOLARSHIPS_DATA.map((s) => ({ ...s, status: "PUBLISHED" as ContentStatus }));
  try {
    const raw = localStorage.getItem("careersetu_admin_scholarships");
    if (raw) return JSON.parse(raw);
  } catch {}
  const initial = SCHOLARSHIPS_DATA.map((s) => ({ ...s, status: "PUBLISHED" as ContentStatus }));
  localStorage.setItem("careersetu_admin_scholarships", JSON.stringify(initial));
  return initial;
}

export function saveManagedScholarships(items: ManagedScholarshipItem[]) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem("careersetu_admin_scholarships", JSON.stringify(items));
}

export function upsertManagedScholarship(s: ManagedScholarshipItem) {
  const list = getManagedScholarships();
  const idx = list.findIndex((item) => item.id === s.id);
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...s, lastUpdated: new Date().toISOString().split("T")[0] };
    logAuditEvent("SCHOLARSHIP_UPDATED", "Scholarship", s.id, `Updated scholarship ${s.name}`);
  } else {
    list.unshift({ ...s, lastUpdated: new Date().toISOString().split("T")[0] });
    logAuditEvent("SCHOLARSHIP_CREATED", "Scholarship", s.id, `Created scholarship ${s.name}`);
  }
  saveManagedScholarships(list);
}

export function archiveScholarship(id: string) {
  const list = getManagedScholarships();
  const item = list.find((s) => s.id === id);
  if (item) {
    item.status = item.status === "ARCHIVED" ? "PUBLISHED" : "ARCHIVED";
    saveManagedScholarships(list);
    logAuditEvent("SCHOLARSHIP_STATUS_CHANGE", "Scholarship", id, `Changed status of ${item.name} to ${item.status}`);
  }
}

// COLLEGES STORE
export function getManagedColleges(): ManagedCollegeItem[] {
  if (typeof localStorage === "undefined") return COLLEGES_DATA.map((c) => ({ ...c, status: "PUBLISHED" as ContentStatus }));
  try {
    const raw = localStorage.getItem("careersetu_admin_colleges");
    if (raw) return JSON.parse(raw);
  } catch {}
  const initial = COLLEGES_DATA.map((c) => ({ ...c, status: "PUBLISHED" as ContentStatus }));
  localStorage.setItem("careersetu_admin_colleges", JSON.stringify(initial));
  return initial;
}

export function saveManagedColleges(items: ManagedCollegeItem[]) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem("careersetu_admin_colleges", JSON.stringify(items));
}

export function upsertManagedCollege(c: ManagedCollegeItem) {
  const list = getManagedColleges();
  const idx = list.findIndex((item) => item.id === c.id);
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...c, lastUpdated: new Date().toISOString().split("T")[0] };
    logAuditEvent("COLLEGE_UPDATED", "College", c.id, `Updated college ${c.name}`);
  } else {
    list.unshift({ ...c, lastUpdated: new Date().toISOString().split("T")[0] });
    logAuditEvent("COLLEGE_CREATED", "College", c.id, `Created college entry ${c.name}`);
  }
  saveManagedColleges(list);
}

export function archiveCollege(id: string) {
  const list = getManagedColleges();
  const item = list.find((c) => c.id === id);
  if (item) {
    item.status = item.status === "ARCHIVED" ? "PUBLISHED" : "ARCHIVED";
    saveManagedColleges(list);
    logAuditEvent("COLLEGE_STATUS_CHANGE", "College", id, `Changed status of ${item.name} to ${item.status}`);
  }
}

// RESOURCES STORE
export function getManagedResources(): ManagedResourceItem[] {
  if (typeof localStorage === "undefined") return RESOURCES_DATA.map((r) => ({ ...r, status: "PUBLISHED" as ContentStatus }));
  try {
    const raw = localStorage.getItem("careersetu_admin_resources");
    if (raw) return JSON.parse(raw);
  } catch {}
  const initial = RESOURCES_DATA.map((r) => ({ ...r, status: "PUBLISHED" as ContentStatus }));
  localStorage.setItem("careersetu_admin_resources", JSON.stringify(initial));
  return initial;
}

export function saveManagedResources(items: ManagedResourceItem[]) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem("careersetu_admin_resources", JSON.stringify(items));
}

export function upsertManagedResource(r: ManagedResourceItem) {
  const list = getManagedResources();
  const idx = list.findIndex((item) => item.id === r.id);
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...r, lastUpdated: new Date().toISOString().split("T")[0] };
    logAuditEvent("RESOURCE_UPDATED", "Learning Resource", r.id, `Updated resource ${r.title}`);
  } else {
    list.unshift({ ...r, lastUpdated: new Date().toISOString().split("T")[0] });
    logAuditEvent("RESOURCE_CREATED", "Learning Resource", r.id, `Created resource ${r.title}`);
  }
  saveManagedResources(list);
}

// ASSESSMENT QUESTIONS STORE
export function getManagedQuestions(): ManagedQuestionItem[] {
  if (typeof localStorage === "undefined") return ASSESSMENT_QUESTIONS.map((q) => ({ ...q, active: true }));
  try {
    const raw = localStorage.getItem("careersetu_admin_questions");
    if (raw) return JSON.parse(raw);
  } catch {}
  const initial = ASSESSMENT_QUESTIONS.map((q) => ({ ...q, active: true }));
  localStorage.setItem("careersetu_admin_questions", JSON.stringify(initial));
  return initial;
}

export function saveManagedQuestions(questions: ManagedQuestionItem[]) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem("careersetu_admin_questions", JSON.stringify(questions));
}

export function upsertManagedQuestion(q: ManagedQuestionItem) {
  const list = getManagedQuestions();
  const idx = list.findIndex((item) => item.id === q.id);
  if (idx >= 0) {
    list[idx] = q;
    logAuditEvent("QUESTION_UPDATED", "Assessment Question", String(q.id), `Updated Question #${q.order} (${q.category})`);
  } else {
    list.push(q);
    logAuditEvent("QUESTION_CREATED", "Assessment Question", String(q.id), `Added Question #${q.order} (${q.category})`);
  }
  saveManagedQuestions(list);
}

export function toggleQuestionActive(questionId: number) {
  const list = getManagedQuestions();
  const item = list.find((q) => q.id === questionId);
  if (item) {
    item.active = !item.active;
    saveManagedQuestions(list);
    logAuditEvent("QUESTION_STATUS_CHANGE", "Assessment Question", String(questionId), `Toggled active state of Q#${item.order} (${item.category}) to ${item.active}`);
  }
}

// SKILLS STORE
export function getSkills(): SkillItem[] {
  if (typeof localStorage === "undefined") return INITIAL_SKILLS;
  try {
    const raw = localStorage.getItem("careersetu_admin_skills");
    if (raw) return JSON.parse(raw);
  } catch {}
  return INITIAL_SKILLS;
}

export function saveSkills(skills: SkillItem[]) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem("careersetu_admin_skills", JSON.stringify(skills));
}

export function upsertSkill(skill: SkillItem) {
  const list = getSkills();
  const idx = list.findIndex((s) => s.id === skill.id);
  if (idx >= 0) {
    list[idx] = skill;
    logAuditEvent("SKILL_UPDATED", "Skill", skill.id, `Updated skill ${skill.name}`);
  } else {
    list.unshift(skill);
    logAuditEvent("SKILL_CREATED", "Skill", skill.id, `Created skill ${skill.name}`);
  }
  saveSkills(list);
}

// NOTIFICATIONS BROADCAST STORE
export function getBroadcastNotifications(): AdminBroadcastNotification[] {
  if (typeof localStorage === "undefined") return INITIAL_BROADCASTS;
  try {
    const raw = localStorage.getItem("careersetu_broadcast_notifs");
    if (raw) return JSON.parse(raw);
  } catch {}
  return INITIAL_BROADCASTS;
}

export function saveBroadcastNotifications(notifs: AdminBroadcastNotification[]) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem("careersetu_broadcast_notifs", JSON.stringify(notifs));
}

export function createBroadcastNotification(notif: Omit<AdminBroadcastNotification, "id" | "publishedAt">) {
  const list = getBroadcastNotifications();
  const newEntry: AdminBroadcastNotification = {
    ...notif,
    id: "broadcast-" + Date.now(),
    publishedAt: new Date().toISOString(),
  };
  list.unshift(newEntry);
  saveBroadcastNotifications(list);
  logAuditEvent("NOTIFICATION_BROADCAST", "Notification", newEntry.id, `Broadcasted alert: "${newEntry.title}" to target ${newEntry.targetAudience}`);
  return newEntry;
}
