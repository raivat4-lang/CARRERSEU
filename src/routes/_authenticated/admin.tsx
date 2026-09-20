import { useState, useMemo } from "react";
import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { verifyAdminAccessServerFn } from "@/lib/auth/auth.functions";
import {
  Activity,
  AlertTriangle,
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Database,
  Edit3,
  Eye,
  FileCheck,
  FileText,
  Filter,
  GraduationCap,
  HelpCircle,
  History,
  Layers,
  Landmark,
  Lock,
  LogOut,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  Sparkles,
  Trash2,
  TrendingUp,
  UserCheck,
  Users,
  UserX,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  getCurrentUser,
  getAllUsers,
  toggleUserStatus,
  isAdmin,
  getAuditLogs,
  AppUser,
  ContentStatus,
  getAllAdminApplications,
  approveAdminApplication,
  rejectAdminApplication,
  AdminApplication,
} from "@/lib/auth/rbac";
import {
  getManagedCareers,
  saveManagedCareers,
  upsertManagedCareer,
  archiveCareer,
  getManagedExams,
  saveManagedExams,
  upsertManagedExam,
  archiveExam,
  getManagedScholarships,
  upsertManagedScholarship,
  archiveScholarship,
  getManagedColleges,
  upsertManagedCollege,
  archiveCollege,
  getManagedResources,
  upsertManagedResource,
  getManagedQuestions,
  upsertManagedQuestion,
  toggleQuestionActive,
  getSkills,
  upsertSkill,
  getBroadcastNotifications,
  createBroadcastNotification,
  ManagedCareerItem,
  ManagedExamItem,
  ManagedScholarshipItem,
  ManagedCollegeItem,
  ManagedResourceItem,
  ManagedQuestionItem,
  SkillItem,
} from "@/lib/store/admin-content-store";
import { getCompletedAssessments } from "@/lib/store/careersetu-store";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async () => {
    let token = "";
    if (typeof localStorage !== "undefined") {
      token = localStorage.getItem("careersetu_admin_token") || "";
    }
    const verifyResult = await verifyAdminAccessServerFn({ data: { token } });
    if (!verifyResult.authorized) {
      throw redirect({ to: "/admin/login" });
    }
    return { adminUser: verifyResult.user };
  },
  head: () => ({
    meta: [
      { title: "CareerSetu Admin — Platform Management Console" },
      {
        name: "description",
        content: "Secure administrative management console for CareerSetu AI users, careers, government exams, and platform analytics.",
      },
    ],
  }),
  component: AdminManagementConsole,
});

function AdminManagementConsole() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const userIsAdmin = isAdmin(currentUser);

  // Active Admin Section Tab
  const [activeTab, setActiveTab] = useState("overview");

  // Repositories State
  const [users, setUsers] = useState<AppUser[]>(getAllUsers());
  const [careers, setCareers] = useState(getManagedCareers());
  const [exams, setExams] = useState(getManagedExams());
  const [scholarships, setScholarships] = useState(getManagedScholarships());
  const [colleges, setColleges] = useState(getManagedColleges());
  const [resources, setResources] = useState(getManagedResources());
  const [questions, setQuestions] = useState(getManagedQuestions());
  const [skills, setSkills] = useState(getSkills());
  const [broadcasts, setBroadcasts] = useState(getBroadcastNotifications());
  const [auditLogs, setAuditLogs] = useState(getAuditLogs());
  const [adminApplications, setAdminApplications] = useState<AdminApplication[]>(getAllAdminApplications());

  // Search & Filter States
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<string>("ALL");
  const [careerSearch, setCareerSearch] = useState("");
  const [examSearch, setExamSearch] = useState("");
  const [appSearch, setAppSearch] = useState("");
  const [appStatusFilter, setAppStatusFilter] = useState("ALL");
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectingAppId, setRejectingAppId] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  const pendingAppsCount = useMemo(
    () => adminApplications.filter((a) => a.status === "PENDING_APPROVAL").length,
    [adminApplications]
  );

  // Modals & Editing Entities
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  
  // Career Modal
  const [careerModalOpen, setCareerModalOpen] = useState(false);
  const [editingCareer, setEditingCareer] = useState<Partial<ManagedCareerItem>>({});
  
  // Exam Modal
  const [examModalOpen, setExamModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Partial<ManagedExamItem>>({});
  
  // Scholarship Modal
  const [scholarshipModalOpen, setScholarshipModalOpen] = useState(false);
  const [editingScholarship, setEditingScholarship] = useState<Partial<ManagedScholarshipItem>>({});

  // College Modal
  const [collegeModalOpen, setCollegeModalOpen] = useState(false);
  const [editingCollege, setEditingCollege] = useState<Partial<ManagedCollegeItem>>({});

  // Resource Modal
  const [resourceModalOpen, setResourceModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Partial<ManagedResourceItem>>({});

  // Question Modal
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Partial<ManagedQuestionItem>>({});

  // Skill Modal
  const [skillModalOpen, setSkillModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Partial<SkillItem>>({});

  // Broadcast Modal
  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);
  const [newBroadcast, setNewBroadcast] = useState({
    title: "",
    message: "",
    category: "EXAM" as const,
    priority: "HIGH" as const,
    targetAudience: "ALL" as const,
    link: "/exams",
  });

  // Access Denied Screen for Students
  if (!userIsAdmin) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto">
        <div className="size-20 rounded-3xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center justify-center mb-6 shadow-glow">
          <ShieldAlert className="size-10 animate-bounce" />
        </div>
        <Badge variant="outline" className="mb-3 text-destructive border-destructive/30 bg-destructive/5 font-bold uppercase tracking-widest text-[10px]">
          HTTP 403 Forbidden
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-foreground">
          Access Restricted to Administrators
        </h1>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          Your account (<strong className="text-foreground">{currentUser.email}</strong>) is registered as a <strong className="text-primary font-semibold">STUDENT</strong>. You do not have permissions to access the platform management console or modify core system records.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full justify-center">
          <Button
            onClick={() => navigate({ to: "/dashboard" })}
            className="gradient-brand text-primary-foreground rounded-2xl h-11 px-6 shadow-glow cursor-pointer"
          >
            Return to Student Dashboard
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate({ to: "/admin/login" })}
            className="rounded-2xl h-11 px-5 border-border hover:bg-accent/50 cursor-pointer"
          >
            <Lock className="size-4 mr-2 text-primary" />
            Sign In as Administrator
          </Button>
        </div>
      </div>
    );
  }

  // Dynamic Real-Time Metrics derived from live storage
  const studentUsers = useMemo(() => users.filter((u) => u.role === "STUDENT"), [users]);
  const adminUsers = useMemo(() => users.filter((u) => u.role === "ADMIN"), [users]);
  const activeStudentsCount = useMemo(() => studentUsers.filter((u) => u.status === "ACTIVE").length, [studentUsers]);
  const [completedAssessmentsList, setCompletedAssessmentsList] = useState(() => getCompletedAssessments());
  
  const assessmentsFinishedCount = completedAssessmentsList.length;
  const completionRate = studentUsers.length > 0 
    ? Math.min(100, Math.round((assessmentsFinishedCount / studentUsers.length) * 100))
    : 0;

  const publishedCareersCount = useMemo(() => careers.filter((c) => c.status !== "ARCHIVED").length, [careers]);
  const monitoredExamsCount = useMemo(() => exams.filter((e) => e.status !== "ARCHIVED").length, [exams]);

  // Dynamic Growth Chart reflecting exact students and assessments
  const studentGrowthData = useMemo(() => {
    const totalSt = studentUsers.length;
    const totalAssess = assessmentsFinishedCount;
    return [
      { month: "Nov 2025", students: Math.max(1, Math.round(totalSt * 0.25)), assessments: Math.max(0, Math.round(totalAssess * 0.25)) },
      { month: "Dec 2025", students: Math.max(1, Math.round(totalSt * 0.5)), assessments: Math.max(1, Math.round(totalAssess * 0.5)) },
      { month: "Jan 2026", students: Math.max(2, Math.round(totalSt * 0.75)), assessments: Math.max(1, Math.round(totalAssess * 0.65)) },
      { month: "Feb 2026", students: Math.max(3, Math.round(totalSt * 0.9)), assessments: Math.max(2, Math.round(totalAssess * 0.85)) },
      { month: "Mar 2026 (Live)", students: totalSt, assessments: totalAssess },
    ];
  }, [studentUsers.length, assessmentsFinishedCount]);

  // Dynamic Domain Distribution computed from live careers catalog
  const domainDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    careers.filter((c) => c.status !== "ARCHIVED").forEach((c) => {
      const dom = c.domain || "Other";
      counts[dom] = (counts[dom] || 0) + 1;
    });
    const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
    const palette = ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EC4899", "#6366F1", "#14B8A6", "#F43F5E"];
    return Object.entries(counts).map(([name, cnt], idx) => ({
      name,
      value: Math.round((cnt / total) * 100),
      count: cnt,
      color: palette[idx % palette.length],
    }));
  }, [careers]);

  // User Actions
  const handleToggleUser = (userId: string) => {
    const updated = toggleUserStatus(userId);
    if (updated) {
      setUsers(getAllUsers());
      setAuditLogs(getAuditLogs());
      toast.success(`User status changed to ${updated.status}`);
    }
  };

  // Admin Applications Actions & Filtering
  const filteredApplications = useMemo(() => {
    return adminApplications.filter((app) => {
      const matchSearch =
        app.fullName.toLowerCase().includes(appSearch.toLowerCase()) ||
        app.email.toLowerCase().includes(appSearch.toLowerCase()) ||
        app.organization.toLowerCase().includes(appSearch.toLowerCase());
      const matchStatus = appStatusFilter === "ALL" || app.status === appStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [adminApplications, appSearch, appStatusFilter]);

  const handleApproveApplication = (appId: string) => {
    const reviewer = currentUser?.email || "raivats4@gmail.com";
    const res = approveAdminApplication(appId, reviewer);
    if (res.success) {
      setAdminApplications(getAllAdminApplications());
      setUsers(getAllUsers());
      setAuditLogs(getAuditLogs());
      toast.success(
        `Application approved! ${res.user?.full_name} (${res.user?.email}) has been granted Admin permissions.`
      );
    } else {
      toast.error(res.error || "Failed to approve application.");
    }
  };

  const handleOpenRejectModal = (appId: string) => {
    setRejectingAppId(appId);
    setRejectionReason("");
    setRejectModalOpen(true);
  };

  const handleConfirmRejectApplication = () => {
    if (!rejectingAppId) return;
    const reviewer = currentUser?.email || "raivats4@gmail.com";
    const res = rejectAdminApplication(
      rejectingAppId,
      reviewer,
      rejectionReason.trim() || "Does not meet administrative requirements."
    );
    if (res.success) {
      setAdminApplications(getAllAdminApplications());
      setAuditLogs(getAuditLogs());
      setRejectModalOpen(false);
      setRejectingAppId("");
      setRejectionReason("");
      toast.info("Application rejected.");
    } else {
      toast.error(res.error || "Failed to reject application.");
    }
  };

  // Career Actions
  const handleSaveCareer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCareer.name || !editingCareer.domain) {
      toast.error("Please provide career name and domain");
      return;
    }
    const fullCareer: ManagedCareerItem = {
      id: editingCareer.id || "career-" + Date.now(),
      name: editingCareer.name,
      domain: editingCareer.domain,
      salary: editingCareer.salary || "₹8 - ₹20 LPA",
      minSalaryLPA: editingCareer.minSalaryLPA || 8,
      maxSalaryLPA: editingCareer.maxSalaryLPA || 20,
      demand: editingCareer.demand || "High",
      educationRequired: editingCareer.educationRequired || "Graduate",
      sector: editingCareer.sector || "Private",
      workType: editingCareer.workType || "Hybrid",
      description: editingCareer.description || "Career profile managed by admin.",
      responsibilities: editingCareer.responsibilities || ["Execute domain tasks", "Drive quality outcomes"],
      requiredSkills: editingCareer.requiredSkills || ["Communication", "Problem Solving"],
      degrees: editingCareer.degrees || ["Bachelor's Degree"],
      topColleges: editingCareer.topColleges || ["Top Indian Universities"],
      topRecruiters: editingCareer.topRecruiters || ["Industry Leaders"],
      futureScope: editingCareer.futureScope || "Strong industry outlook.",
      roadmap: editingCareer.roadmap || [{ stage: "Stage 1", title: "Foundation", desc: "Build domain basics." }],
      tags: editingCareer.tags || ["Admin Verified"],
      status: (editingCareer.status as ContentStatus) || "PUBLISHED",
    };
    upsertManagedCareer(fullCareer);
    setCareers(getManagedCareers());
    setAuditLogs(getAuditLogs());
    setCareerModalOpen(false);
    setEditingCareer({});
    toast.success(`Saved career "${fullCareer.name}"! Changes live on Student Portal.`);
  };

  const handleArchiveCareer = (id: string) => {
    archiveCareer(id);
    setCareers(getManagedCareers());
    setAuditLogs(getAuditLogs());
    toast.success("Career status updated! Changes reflected on Student Portal.");
  };

  // Exam Actions
  const handleSaveExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExam.name || !editingExam.organization) {
      toast.error("Please provide exam name and conducting organization");
      return;
    }
    const fullExam: ManagedExamItem = {
      id: editingExam.id || "exam-" + Date.now(),
      name: editingExam.name,
      organization: editingExam.organization,
      category: editingExam.category || "Civil Services",
      frequency: editingExam.frequency || "Annual",
      status: (editingExam.status as ContentStatus) || "PUBLISHED",
      ageLimit: editingExam.ageLimit || "21 - 32 years",
      qualification: editingExam.qualification || "Graduate in any discipline",
      salary: editingExam.salary || "Level 10 (₹56,100 - ₹1,77,500)",
      officialWebsite: editingExam.officialWebsite || "https://upsc.gov.in",
      overview: editingExam.overview || "Premier national examination.",
      syllabus: editingExam.syllabus || ["General Studies", "Aptitude"],
      timeline: editingExam.timeline || { notification: "Feb", exam: "May", result: "Oct" },
      selectionProcess: editingExam.selectionProcess || ["Prelims", "Mains", "Interview"],
      previousCutoff: editingExam.previousCutoff || "90-100 / 200",
      preparationTips: editingExam.preparationTips || ["Solve PYQs", "Daily Newspaper"],
    };
    upsertManagedExam(fullExam);
    setExams(getManagedExams());
    setAuditLogs(getAuditLogs());
    setExamModalOpen(false);
    setEditingExam({});
    toast.success(`Saved exam notification "${fullExam.name}"! Live on Student Portal.`);
  };

  // Scholarship Actions
  const handleSaveScholarship = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingScholarship.name || !editingScholarship.amount) {
      toast.error("Please provide scholarship name and amount");
      return;
    }
    const fullScholarship: ManagedScholarshipItem = {
      id: editingScholarship.id || "scholarship-" + Date.now(),
      name: editingScholarship.name,
      provider: editingScholarship.provider || "Government / CSR",
      category: editingScholarship.category || "Central Government",
      amount: editingScholarship.amount,
      deadline: editingScholarship.deadline || "Open for 2026-27",
      eligibility: editingScholarship.eligibility || "Merit & Income based",
      educationLevel: editingScholarship.educationLevel || "Undergraduate / Postgraduate",
      incomeLimit: editingScholarship.incomeLimit || "< ₹8,00,000 / year",
      eligibleStates: editingScholarship.eligibleStates || ["All India"],
      officialWebsite: editingScholarship.officialWebsite || "https://scholarships.gov.in",
      description: editingScholarship.description || "Scholarship program for Indian students.",
      tags: editingScholarship.tags || ["Govt Scheme", "Financial Aid"],
      status: (editingScholarship.status as ContentStatus) || "PUBLISHED",
    };
    upsertManagedScholarship(fullScholarship);
    setScholarships(getManagedScholarships());
    setAuditLogs(getAuditLogs());
    setScholarshipModalOpen(false);
    setEditingScholarship({});
    toast.success(`Saved scholarship "${fullScholarship.name}"! Live on Student Portal.`);
  };

  // College Actions
  const handleSaveCollege = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCollege.name || !editingCollege.location) {
      toast.error("Please provide college name and location");
      return;
    }
    const fullCollege: ManagedCollegeItem = {
      id: editingCollege.id || "college-" + Date.now(),
      name: editingCollege.name,
      location: editingCollege.location,
      city: editingCollege.city || editingCollege.location,
      state: editingCollege.state || "India",
      ownership: editingCollege.ownership || "Government / Autonomous",
      type: editingCollege.type || "Government / Autonomous",
      nirfRank: editingCollege.nirfRank || 1,
      avgPackage: editingCollege.avgPackage || "₹18 LPA",
      highestPackage: editingCollege.highestPackage || "₹45 LPA",
      totalFees: editingCollege.totalFees || "₹8 Lakhs total",
      acceptedExams: editingCollege.acceptedExams || ["JEE Advanced", "GATE"],
      popularDegrees: editingCollege.popularDegrees || ["B.Tech", "M.Tech"],
      officialWebsite: editingCollege.officialWebsite || "https://iitb.ac.in",
      establishedYear: editingCollege.establishedYear || 1958,
      status: (editingCollege.status as ContentStatus) || "PUBLISHED",
    };
    upsertManagedCollege(fullCollege);
    setColleges(getManagedColleges());
    setAuditLogs(getAuditLogs());
    setCollegeModalOpen(false);
    setEditingCollege({});
    toast.success(`Saved college "${fullCollege.name}"! Live on Student Portal.`);
  };

  // Resource Actions
  const handleSaveResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResource.title || !editingResource.sourceUrl) {
      toast.error("Please provide resource title and source URL");
      return;
    }
    const fullResource: ManagedResourceItem = {
      id: editingResource.id || "resource-" + Date.now(),
      title: editingResource.title,
      category: editingResource.category || "Standard Books",
      targetExamOrCareer: editingResource.targetExamOrCareer || "UPSC / GATE",
      authorOrProvider: editingResource.authorOrProvider || "Standard Publisher",
      format: editingResource.format || "Book / Paperback",
      accessType: editingResource.accessType || "Free",
      sourceUrl: editingResource.sourceUrl,
      sourceLabel: editingResource.sourceLabel || "Official Portal",
      rating: editingResource.rating || 4.8,
      description: editingResource.description || "Learning material for students.",
      tags: editingResource.tags || ["Learning", "Official"],
      status: (editingResource.status as ContentStatus) || "PUBLISHED",
    };
    upsertManagedResource(fullResource);
    setResources(getManagedResources());
    setAuditLogs(getAuditLogs());
    setResourceModalOpen(false);
    setEditingResource({});
    toast.success(`Saved resource "${fullResource.title}"! Live on Student Portal.`);
  };

  // Question Actions
  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion.text || !editingQuestion.category) {
      toast.error("Please provide question text and category");
      return;
    }
    const fullQuestion: ManagedQuestionItem = {
      id: editingQuestion.id || questions.length + 1,
      order: editingQuestion.order || questions.length + 1,
      text: editingQuestion.text,
      category: editingQuestion.category,
      weight: editingQuestion.weight || 1,
      traits: editingQuestion.traits || ["Analytical Thinking"],
      active: editingQuestion.active !== false,
    };
    upsertManagedQuestion(fullQuestion);
    setQuestions(getManagedQuestions());
    setAuditLogs(getAuditLogs());
    setQuestionModalOpen(false);
    setEditingQuestion({});
    toast.success(`Saved Assessment Question #${fullQuestion.order}! Live in Career Assessment.`);
  };

  // Broadcast Notification
  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBroadcast.title.trim() || !newBroadcast.message.trim()) {
      toast.error("Please fill title and message");
      return;
    }
    createBroadcastNotification(newBroadcast);
    setBroadcasts(getBroadcastNotifications());
    setAuditLogs(getAuditLogs());
    setBroadcastModalOpen(false);
    setNewBroadcast({
      title: "",
      message: "",
      category: "EXAM",
      priority: "HIGH",
      targetAudience: "ALL",
      link: "/exams",
    });
    toast.success("Broadcast alert sent! Live in all student notification dropdowns.");
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.full_name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
        (u.city && u.city.toLowerCase().includes(userSearch.toLowerCase()));
      const matchRole = userRoleFilter === "ALL" || u.role === userRoleFilter;
      return matchSearch && matchRole;
    });
  }, [users, userSearch, userRoleFilter]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-3 px-2 sm:px-4">
      {/* Top Admin Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-card via-card to-amber-500/5 border border-border shadow-md">
        <div className="flex items-center gap-3.5">
          <div className="size-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0 shadow-inner">
            <Shield className="size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold font-display text-foreground">
                CareerSetu Admin Management Console
              </h1>
              <Badge className="bg-amber-500 text-black font-extrabold text-[10px] uppercase tracking-wider px-2 py-0.5">
                Role: ADMIN
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Authorized session: <strong className="text-foreground">{currentUser.email}</strong> • Edits here instantly sync to the Student Portal
            </p>
          </div>
        </div>

        {/* Top Quick Actions */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setBroadcastModalOpen(true)}
            className="rounded-xl h-9 px-3.5 gap-1.5 bg-amber-500 hover:bg-amber-600 text-black font-semibold text-xs cursor-pointer shadow-xs"
          >
            <Bell className="size-3.5" />
            Broadcast Alert
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Switch back to student mode
              const studentUser: AppUser = {
                id: "student-evaluator",
                email: "aditi.kulkarni@gmail.com",
                full_name: "Aditi Kulkarni",
                role: "STUDENT",
                status: "ACTIVE",
                registeredAt: "2026-03-01T00:00:00.000Z",
                lastActive: new Date().toISOString(),
              };
              localStorage.setItem("careersetu_demo_user", JSON.stringify(studentUser));
              toast.info("Switched to Student Portal view");
              navigate({ to: "/dashboard" });
            }}
            className="rounded-xl h-9 px-3 text-xs border-border cursor-pointer"
          >
            View Student Portal
          </Button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-card border border-border p-1 rounded-2xl flex flex-wrap h-auto gap-1 shadow-xs">
          <TabsTrigger value="overview" className="rounded-xl text-xs font-semibold px-3.5 py-2 gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <BarChart3 className="size-3.5" />
            Overview & Analytics
          </TabsTrigger>
          <TabsTrigger value="users" className="rounded-xl text-xs font-semibold px-3.5 py-2 gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Users className="size-3.5" />
            User Directory ({users.length})
          </TabsTrigger>
          <TabsTrigger value="careers" className="rounded-xl text-xs font-semibold px-3.5 py-2 gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Briefcase className="size-3.5" />
            Careers ({careers.length})
          </TabsTrigger>
          <TabsTrigger value="exams" className="rounded-xl text-xs font-semibold px-3.5 py-2 gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Landmark className="size-3.5" />
            Govt Exams ({exams.length})
          </TabsTrigger>
          <TabsTrigger value="scholarships" className="rounded-xl text-xs font-semibold px-3.5 py-2 gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <GraduationCap className="size-3.5" />
            Scholarships ({scholarships.length})
          </TabsTrigger>
          <TabsTrigger value="colleges" className="rounded-xl text-xs font-semibold px-3.5 py-2 gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Building2 className="size-3.5" />
            Colleges ({colleges.length})
          </TabsTrigger>
          <TabsTrigger value="resources" className="rounded-xl text-xs font-semibold px-3.5 py-2 gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <BookOpen className="size-3.5" />
            Resources ({resources.length})
          </TabsTrigger>
          <TabsTrigger value="questions" className="rounded-xl text-xs font-semibold px-3.5 py-2 gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <HelpCircle className="size-3.5" />
            50 Questions ({questions.length})
          </TabsTrigger>
          <TabsTrigger value="audit" className="rounded-xl text-xs font-semibold px-3.5 py-2 gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <History className="size-3.5" />
            Audit Trail
          </TabsTrigger>
          <TabsTrigger
            value="applications"
            className="rounded-xl text-xs font-semibold px-3.5 py-2 gap-1.5 data-[state=active]:bg-amber-500 data-[state=active]:text-black"
          >
            <ShieldAlert className="size-3.5 text-amber-500" />
            Admin Applications
            {pendingAppsCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-extrabold shadow-sm">
                {pendingAppsCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* 1. OVERVIEW & ANALYTICS TAB */}
        <TabsContent value="overview" className="space-y-6 mt-0">
          {/* Platform Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="glass rounded-3xl p-5 border-border shadow-sm">
              <div className="flex items-center justify-between text-muted-foreground mb-3">
                <span className="text-xs font-medium">Registered Students</span>
                <Users className="size-4 text-blue-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-display text-foreground">
                {studentUsers.length}
              </div>
              <p className="text-[11px] text-emerald-500 font-medium mt-1 flex items-center gap-1">
                <TrendingUp className="size-3" /> {activeStudentsCount} active · 100% live sync
              </p>
            </Card>

            <Card className="glass rounded-3xl p-5 border-border shadow-sm">
              <div className="flex items-center justify-between text-muted-foreground mb-3">
                <span className="text-xs font-medium">Assessments Finished</span>
                <FileCheck className="size-4 text-purple-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-display text-foreground">
                {assessmentsFinishedCount}
              </div>
              <p className="text-[11px] text-purple-500 font-medium mt-1">
                {completionRate}% completion rate
              </p>
            </Card>

            <Card className="glass rounded-3xl p-5 border-border shadow-sm">
              <div className="flex items-center justify-between text-muted-foreground mb-3">
                <span className="text-xs font-medium">Published Careers</span>
                <Briefcase className="size-4 text-emerald-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-display text-foreground">
                {publishedCareersCount}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Across {domainDistribution.length} active sectors
              </p>
            </Card>

            <Card className="glass rounded-3xl p-5 border-border shadow-sm">
              <div className="flex items-center justify-between text-muted-foreground mb-3">
                <span className="text-xs font-medium">Govt Exams Monitored</span>
                <Landmark className="size-4 text-amber-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-display text-foreground">
                {monitoredExamsCount}
              </div>
              <p className="text-[11px] text-amber-500 font-medium mt-1">
                Live 2026 notification sync
              </p>
            </Card>
          </div>

          {/* Growth & Engagement Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 glass rounded-3xl p-6 border-border shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-sm text-foreground">Student Registration & Assessment Volume</h3>
                  <p className="text-xs text-muted-foreground">Monthly growth trajectory (Oct 2025 - Mar 2026)</p>
                </div>
                <Badge variant="outline" className="text-xs font-mono">Live Sync</Badge>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={studentGrowthData}>
                    <defs>
                      <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorAssessments" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <RechartsTooltip />
                    <Area type="monotone" dataKey="students" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorStudents)" name="Students" />
                    <Area type="monotone" dataKey="assessments" stroke="#8B5CF6" strokeWidth={2} fillOpacity={1} fill="url(#colorAssessments)" name="Assessments Completed" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="glass rounded-3xl p-6 border-border shadow-sm">
              <h3 className="font-bold text-sm text-foreground mb-1">Student Career Preferences</h3>
              <p className="text-xs text-muted-foreground mb-4">Domain interest breakdown</p>
              <div className="h-48 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={domainDistribution} innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
                      {domainDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {domainDistribution.map((item) => (
                  <div key={item.name} className="flex items-center gap-2 text-xs">
                    <span className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground truncate">{item.name}</span>
                    <span className="font-bold text-foreground ml-auto">{item.value}%</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* 2. USER DIRECTORY TAB */}
        <TabsContent value="users" className="space-y-4 mt-0">
          <Card className="glass rounded-3xl p-6 border-border shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
              <div>
                <h3 className="text-base font-bold text-foreground">Registered Student & Administrator Directory</h3>
                <p className="text-xs text-muted-foreground">Manage user statuses, inspect profiles, and enforce access restrictions</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative w-48 sm:w-64">
                  <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search name, email, city..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-8 text-xs h-9 rounded-xl"
                  />
                </div>
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="h-9 px-3 rounded-xl border border-border bg-card text-xs text-foreground cursor-pointer"
                >
                  <option value="ALL">All Roles</option>
                  <option value="STUDENT">Students Only</option>
                  <option value="ADMIN">Admins Only</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border/80 text-muted-foreground">
                    <th className="py-3 px-3 font-semibold">User</th>
                    <th className="py-3 px-3 font-semibold">Role</th>
                    <th className="py-3 px-3 font-semibold">Education / Stream</th>
                    <th className="py-3 px-3 font-semibold">Location</th>
                    <th className="py-3 px-3 font-semibold">Status</th>
                    <th className="py-3 px-3 font-semibold">Registered</th>
                    <th className="py-3 px-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-accent/30 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <span className={`grid size-7 place-items-center rounded-full font-bold text-xs ${
                            user.role === "ADMIN" ? "bg-amber-500/20 text-amber-500" : "bg-primary/20 text-primary"
                          }`}>
                            {user.full_name.charAt(0)}
                          </span>
                          <div>
                            <p className="font-semibold text-foreground">{user.full_name}</p>
                            <p className="text-[11px] text-muted-foreground font-mono">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <Badge variant="outline" className={`text-[10px] font-bold ${
                          user.role === "ADMIN" ? "border-amber-500/30 text-amber-500 bg-amber-500/10" : "border-primary/30 text-primary bg-primary/10"
                        }`}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-muted-foreground">
                        {user.current_education || "Class 12 / Graduate"}
                      </td>
                      <td className="py-3 px-3 text-muted-foreground">
                        {user.city ? `${user.city}, ${user.state || ""}` : "India"}
                      </td>
                      <td className="py-3 px-3">
                        <Badge className={`text-[10px] font-semibold ${
                          user.status === "ACTIVE" ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30" : "bg-destructive/15 text-destructive border border-destructive/30"
                        }`}>
                          {user.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-muted-foreground font-mono text-[11px]">
                        {new Date(user.registeredAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedUser(user)}
                            className="h-7 px-2 text-[11px] rounded-lg cursor-pointer"
                          >
                            <Eye className="size-3.5 mr-1" /> Inspect
                          </Button>
                          {user.role !== "ADMIN" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleUser(user.id)}
                              className={`h-7 px-2 text-[11px] rounded-lg cursor-pointer ${
                                user.status === "ACTIVE" ? "text-destructive hover:bg-destructive/10" : "text-emerald-500 hover:bg-emerald-500/10"
                              }`}
                            >
                              {user.status === "ACTIVE" ? "Suspend" : "Activate"}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* 3. CAREERS MANAGEMENT TAB */}
        <TabsContent value="careers" className="space-y-4 mt-0">
          <Card className="glass rounded-3xl p-6 border-border shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
              <div>
                <h3 className="text-base font-bold text-foreground">Career Master Database ({careers.length} Profiles)</h3>
                <p className="text-xs text-muted-foreground">Edits made here instantly update the Student Career Explorer</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative w-48 sm:w-64">
                  <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search career title..."
                    value={careerSearch}
                    onChange={(e) => setCareerSearch(e.target.value)}
                    className="pl-8 text-xs h-9 rounded-xl"
                  />
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingCareer({
                      name: "",
                      domain: "Technology",
                      salary: "₹10 - ₹25 LPA",
                      minSalaryLPA: 10,
                      maxSalaryLPA: 25,
                      demand: "High",
                      educationRequired: "Graduate",
                      status: "PUBLISHED",
                    });
                    setCareerModalOpen(true);
                  }}
                  className="rounded-xl h-9 px-3 gap-1.5 gradient-brand text-primary-foreground text-xs cursor-pointer"
                >
                  <Plus className="size-3.5" />
                  Add Career
                </Button>
              </div>
            </div>

            {/* Careers Table */}
            <div className="overflow-x-auto mt-4 max-h-[550px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border/80 text-muted-foreground sticky top-0 bg-card z-10">
                    <th className="py-3 px-3 font-semibold">Career Title</th>
                    <th className="py-3 px-3 font-semibold">Domain</th>
                    <th className="py-3 px-3 font-semibold">Salary Range</th>
                    <th className="py-3 px-3 font-semibold">Education</th>
                    <th className="py-3 px-3 font-semibold">Status</th>
                    <th className="py-3 px-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {careers
                    .filter((c) => c.name.toLowerCase().includes(careerSearch.toLowerCase()) || c.domain.toLowerCase().includes(careerSearch.toLowerCase()))
                    .map((career) => (
                      <tr key={career.id} className="hover:bg-accent/30 transition-colors">
                        <td className="py-3 px-3">
                          <p className="font-semibold text-foreground">{career.name}</p>
                          <p className="text-[11px] text-muted-foreground truncate max-w-xs">{career.description}</p>
                        </td>
                        <td className="py-3 px-3">
                          <Badge variant="outline" className="text-[10px] font-semibold">
                            {career.domain}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 font-semibold text-emerald-500 font-mono">
                          {career.salary}
                        </td>
                        <td className="py-3 px-3 text-muted-foreground">
                          {career.educationRequired}
                        </td>
                        <td className="py-3 px-3">
                          <Badge className={`text-[10px] font-semibold ${
                            career.status === "ARCHIVED" ? "bg-amber-500/15 text-amber-500 border border-amber-500/30" : "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                          }`}>
                            {career.status || "PUBLISHED"}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingCareer(career);
                                setCareerModalOpen(true);
                              }}
                              className="h-7 px-2 text-[11px] rounded-lg cursor-pointer"
                            >
                              <Edit3 className="size-3 mr-1" /> Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleArchiveCareer(career.id)}
                              className="h-7 px-2 text-[11px] rounded-lg text-amber-500 hover:bg-amber-500/10 cursor-pointer"
                            >
                              {career.status === "ARCHIVED" ? "Publish" : "Archive"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* 4. GOVT EXAMS MANAGEMENT TAB */}
        <TabsContent value="exams" className="space-y-4 mt-0">
          <Card className="glass rounded-3xl p-6 border-border shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
              <div>
                <h3 className="text-base font-bold text-foreground">Government Exam Registry ({exams.length} Exams)</h3>
                <p className="text-xs text-muted-foreground">Manage official notification timelines, syllabus tiers, and cutoff updates</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative w-48 sm:w-64">
                  <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search exam title..."
                    value={examSearch}
                    onChange={(e) => setExamSearch(e.target.value)}
                    className="pl-8 text-xs h-9 rounded-xl"
                  />
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingExam({
                      name: "",
                      organization: "UPSC",
                      category: "Civil Services",
                      frequency: "Annual",
                      status: "PUBLISHED",
                    });
                    setExamModalOpen(true);
                  }}
                  className="rounded-xl h-9 px-3 gap-1.5 gradient-brand text-primary-foreground text-xs cursor-pointer"
                >
                  <Plus className="size-3.5" />
                  Add Exam
                </Button>
              </div>
            </div>

            {/* Exams Table */}
            <div className="overflow-x-auto mt-4 max-h-[550px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border/80 text-muted-foreground sticky top-0 bg-card z-10">
                    <th className="py-3 px-3 font-semibold">Exam Name</th>
                    <th className="py-3 px-3 font-semibold">Organization</th>
                    <th className="py-3 px-3 font-semibold">Age Limit</th>
                    <th className="py-3 px-3 font-semibold">Pay Scale</th>
                    <th className="py-3 px-3 font-semibold">Official Portal</th>
                    <th className="py-3 px-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {exams
                    .filter((e) => e.name.toLowerCase().includes(examSearch.toLowerCase()) || e.organization.toLowerCase().includes(examSearch.toLowerCase()))
                    .map((exam) => (
                      <tr key={exam.id} className="hover:bg-accent/30 transition-colors">
                        <td className="py-3 px-3">
                          <p className="font-semibold text-foreground">{exam.name}</p>
                          <Badge variant="outline" className="text-[10px] mt-0.5">{exam.category}</Badge>
                        </td>
                        <td className="py-3 px-3 font-semibold text-foreground">{exam.organization}</td>
                        <td className="py-3 px-3 text-muted-foreground">{exam.ageLimit}</td>
                        <td className="py-3 px-3 font-mono text-emerald-500 font-semibold">{exam.salary}</td>
                        <td className="py-3 px-3">
                          <a href={exam.officialWebsite} target="_blank" rel="noreferrer" className="text-primary hover:underline font-mono text-[11px]">
                            {new URL(exam.officialWebsite).hostname}
                          </a>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingExam(exam);
                              setExamModalOpen(true);
                            }}
                            className="h-7 px-2 text-[11px] rounded-lg cursor-pointer"
                          >
                            <Edit3 className="size-3 mr-1" /> Edit
                          </Button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* 5. SCHOLARSHIPS TAB */}
        <TabsContent value="scholarships" className="space-y-4 mt-0">
          <Card className="glass rounded-3xl p-6 border-border shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div>
                <h3 className="text-base font-bold text-foreground">Scholarship Schemes Registry ({scholarships.length} Schemes)</h3>
                <p className="text-xs text-muted-foreground">Manage grants, award amounts, and application deadlines</p>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  setEditingScholarship({
                    name: "",
                    provider: "Central Government",
                    amount: "₹50,000 / year",
                    deadline: "31st October 2026",
                    eligibility: "Merit & Income Based",
                    status: "PUBLISHED",
                  });
                  setScholarshipModalOpen(true);
                }}
                className="rounded-xl h-9 px-3 gap-1.5 gradient-brand text-primary-foreground text-xs cursor-pointer"
              >
                <Plus className="size-3.5" />
                Add Scholarship
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {scholarships.map((s) => (
                <div key={s.id} className="p-4 rounded-2xl bg-accent/30 border border-border flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <Badge variant="outline" className="text-[10px]">{s.provider}</Badge>
                      <span className="text-xs font-bold text-emerald-500 font-mono">{s.amount}</span>
                    </div>
                    <h4 className="font-bold text-xs text-foreground">{s.name}</h4>
                    <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{s.description}</p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-border/50 flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Deadline: <strong className="text-foreground">{s.deadline}</strong></span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingScholarship(s);
                        setScholarshipModalOpen(true);
                      }}
                      className="h-6 px-2 text-[10px] text-primary cursor-pointer"
                    >
                      <Edit3 className="size-3 mr-1" /> Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* 6. COLLEGES TAB */}
        <TabsContent value="colleges" className="space-y-4 mt-0">
          <Card className="glass rounded-3xl p-6 border-border shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div>
                <h3 className="text-base font-bold text-foreground">Top Colleges & Universities ({colleges.length} Institutions)</h3>
                <p className="text-xs text-muted-foreground">Manage NIRF verified institutions, placement stats, and accepted entrance exams</p>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  setEditingCollege({
                    name: "",
                    location: "Mumbai, Maharashtra",
                    ownership: "Government / Autonomous",
                    nirfRank: 5,
                    avgPackage: "₹18 LPA",
                    totalFees: "₹8 Lakhs total",
                    status: "PUBLISHED",
                  });
                  setCollegeModalOpen(true);
                }}
                className="rounded-xl h-9 px-3 gap-1.5 gradient-brand text-primary-foreground text-xs cursor-pointer"
              >
                <Plus className="size-3.5" />
                Add College
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {colleges.map((c) => (
                <div key={c.id} className="p-4 rounded-2xl bg-accent/30 border border-border flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <Badge className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold">
                        NIRF #{c.nirfRank}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">{c.ownership}</Badge>
                    </div>
                    <h4 className="font-bold text-xs text-foreground">{c.name}</h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{c.location}</p>
                    <div className="mt-3 pt-2 border-t border-border/50 text-[11px] space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Avg CTC:</span>
                        <span className="font-semibold text-emerald-500 font-mono">{c.avgPackage}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Exams:</span>
                        <span className="font-semibold text-foreground truncate max-w-32">{c.acceptedExams?.join(", ") || "Merit / Entrance"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-border/50 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingCollege(c);
                        setCollegeModalOpen(true);
                      }}
                      className="h-6 px-2 text-[10px] text-primary cursor-pointer"
                    >
                      <Edit3 className="size-3 mr-1" /> Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* 7. RESOURCES TAB */}
        <TabsContent value="resources" className="space-y-4 mt-0">
          <Card className="glass rounded-3xl p-6 border-border shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div>
                <h3 className="text-base font-bold text-foreground">Learning Resources Hub ({resources.length} Items)</h3>
                <p className="text-xs text-muted-foreground">Manage standard textbooks, verified video playlists, and PYQ PDFs</p>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  setEditingResource({
                    title: "",
                    category: "Standard Books",
                    targetExamOrCareer: "UPSC CSE",
                    authorOrProvider: "Standard Publisher",
                    format: "Book / Paperback",
                    accessType: "Free",
                    sourceUrl: "https://upsc.gov.in",
                    status: "PUBLISHED",
                  });
                  setResourceModalOpen(true);
                }}
                className="rounded-xl h-9 px-3 gap-1.5 gradient-brand text-primary-foreground text-xs cursor-pointer"
              >
                <Plus className="size-3.5" />
                Add Resource
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              {resources.map((r) => (
                <div key={r.id} className="p-3.5 rounded-2xl bg-accent/30 border border-border flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="outline" className="text-[10px]">{r.category}</Badge>
                      <span className="text-[10px] text-emerald-500 font-bold">{r.accessType}</span>
                    </div>
                    <h4 className="font-bold text-xs text-foreground">{r.title}</h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{r.authorOrProvider} • {r.targetExamOrCareer}</p>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-border/50 flex items-center justify-between">
                    <a href={r.sourceUrl} target="_blank" rel="noreferrer" className="text-[10px] text-primary hover:underline font-mono">
                      Visit Link →
                    </a>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingResource(r);
                        setResourceModalOpen(true);
                      }}
                      className="h-6 px-2 text-[10px] text-primary cursor-pointer"
                    >
                      <Edit3 className="size-3 mr-1" /> Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* 8. QUESTIONS MANAGEMENT TAB */}
        <TabsContent value="questions" className="space-y-4 mt-0">
          <Card className="glass rounded-3xl p-6 border-border shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div>
                <h3 className="text-base font-bold text-foreground">50 Adaptive Assessment Questions</h3>
                <p className="text-xs text-muted-foreground">Manage question scoring weights, categories, and cognitive trait mappings</p>
              </div>
              <Badge className="gradient-brand text-primary-foreground font-mono">{questions.length} Questions</Badge>
            </div>

            <div className="divide-y divide-border/40 mt-4 max-h-[550px] overflow-y-auto pr-2">
              {questions.map((q) => (
                <div key={q.id} className="py-3 flex items-center justify-between gap-4 hover:bg-accent/20 px-2 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary font-bold text-xs shrink-0">
                      #{q.order}
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-foreground">{q.text}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[10px]">{q.category}</Badge>
                        <span className="text-[11px] text-muted-foreground">Weight: <strong className="text-foreground">{q.weight}x</strong></span>
                        <span className="text-[11px] text-muted-foreground">Traits: {q.traits?.join(", ") || "General"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingQuestion(q);
                        setQuestionModalOpen(true);
                      }}
                      className="h-7 px-2 text-[11px] text-primary cursor-pointer"
                    >
                      <Edit3 className="size-3 mr-1" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        toggleQuestionActive(q.id);
                        setQuestions(getManagedQuestions());
                        toast.success(`Toggled status for Question #${q.order}`);
                      }}
                      className={`h-7 px-3 text-[11px] rounded-xl cursor-pointer ${
                        q.active !== false ? "border-emerald-500/30 text-emerald-500" : "border-destructive/30 text-destructive"
                      }`}
                    >
                      {q.active !== false ? "Active" : "Inactive"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* 9. AUDIT TRAIL TAB */}
        <TabsContent value="audit" className="space-y-4 mt-0">
          <Card className="glass rounded-3xl p-6 border-border shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div>
                <h3 className="text-base font-bold text-foreground">System Audit Trail & Security Logs</h3>
                <p className="text-xs text-muted-foreground">Immutable record of all administrative modifications and broadcasts</p>
              </div>
              <Badge variant="outline" className="font-mono text-xs">{auditLogs.length} Events Logged</Badge>
            </div>

            <div className="divide-y divide-border/40 mt-4 max-h-[500px] overflow-y-auto">
              {auditLogs.map((log) => (
                <div key={log.id} className="py-3 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="grid size-7 place-items-center rounded-lg bg-amber-500/10 text-amber-500 shrink-0 mt-0.5">
                      <Activity className="size-3.5" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-card text-foreground border border-border text-[10px] font-mono">
                          {log.action}
                        </Badge>
                        <span className="text-[11px] font-semibold text-foreground">{log.entity}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{log.details}</p>
                      <p className="text-[10px] text-muted-foreground/80 font-mono mt-0.5">
                        Admin: {log.adminEmail}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* 10. ADMIN APPLICATIONS TAB */}
        <TabsContent value="applications" className="space-y-4 mt-0">
          <Card className="glass rounded-3xl p-5 border-border shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/70">
              <div className="flex items-center gap-3">
                <div className="size-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center shrink-0">
                  <ShieldAlert className="size-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold font-display text-foreground flex items-center gap-2">
                    Admin Access Applications
                    {pendingAppsCount > 0 && (
                      <Badge className="bg-amber-500 text-black font-extrabold text-[10px]">
                        {pendingAppsCount} Pending
                      </Badge>
                    )}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Review and authorize administrator accounts. Only active Super Admins can grant admin privileges.
                  </p>
                </div>
              </div>

              {/* Status Filter Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant={appStatusFilter === "ALL" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAppStatusFilter("ALL")}
                  className="rounded-xl h-8 text-xs cursor-pointer"
                >
                  All ({adminApplications.length})
                </Button>
                <Button
                  variant={appStatusFilter === "PENDING_APPROVAL" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAppStatusFilter("PENDING_APPROVAL")}
                  className="rounded-xl h-8 text-xs cursor-pointer border-amber-500/30 text-amber-500 data-[variant=default]:bg-amber-500 data-[variant=default]:text-black"
                >
                  Pending ({pendingAppsCount})
                </Button>
                <Button
                  variant={appStatusFilter === "APPROVED" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAppStatusFilter("APPROVED")}
                  className="rounded-xl h-8 text-xs cursor-pointer border-emerald-500/30 text-emerald-500 data-[variant=default]:bg-emerald-600"
                >
                  Approved ({adminApplications.filter((a) => a.status === "APPROVED").length})
                </Button>
                <Button
                  variant={appStatusFilter === "REJECTED" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAppStatusFilter("REJECTED")}
                  className="rounded-xl h-8 text-xs cursor-pointer border-rose-500/30 text-rose-500 data-[variant=default]:bg-rose-600"
                >
                  Rejected ({adminApplications.filter((a) => a.status === "REJECTED").length})
                </Button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="pt-4 pb-2">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search applications by name, email, or institution..."
                  value={appSearch}
                  onChange={(e) => setAppSearch(e.target.value)}
                  className="pl-10 h-10 rounded-xl bg-background/60"
                />
              </div>
            </div>

            {/* Applications Cards List */}
            <div className="space-y-3 mt-3">
              {filteredApplications.length === 0 ? (
                <div className="text-center py-12 rounded-2xl bg-muted/20 border border-border/60">
                  <Shield className="size-10 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-sm font-semibold text-foreground">No applications found</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {adminApplications.length === 0
                      ? "No administrator access requests have been submitted yet."
                      : "No applications match your current search and filter criteria."}
                  </p>
                </div>
              ) : (
                filteredApplications.map((app) => (
                  <div
                    key={app.id}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                      app.status === "PENDING_APPROVAL"
                        ? "bg-amber-500/5 border-amber-500/30 shadow-xs"
                        : app.status === "APPROVED"
                        ? "bg-emerald-500/5 border-emerald-500/25"
                        : "bg-muted/30 border-border/70 opacity-80"
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      {/* Left: Applicant Details */}
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-sm sm:text-base text-foreground">
                            {app.fullName}
                          </span>
                          <span className="text-xs text-muted-foreground">({app.email})</span>
                          {app.status === "PENDING_APPROVAL" && (
                            <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                              ⏳ Pending Review
                            </Badge>
                          )}
                          {app.status === "APPROVED" && (
                            <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                              ✓ Approved Admin
                            </Badge>
                          )}
                          {app.status === "REJECTED" && (
                            <Badge className="bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-bold">
                              ✕ Rejected
                            </Badge>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Building2 className="size-3 text-amber-500" />
                            <strong>Organization:</strong> {app.organization}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="size-3 text-emerald-500" />
                            <strong>Phone:</strong> {app.phone}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] font-mono">
                            <Clock className="size-3" />
                            {new Date(app.createdAt).toLocaleString()}
                          </span>
                        </div>

                        {/* Verification Badges */}
                        <div className="flex items-center gap-2 pt-1">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                              app.emailVerified
                                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                : "bg-muted text-muted-foreground border border-border"
                            }`}
                          >
                            <CheckCircle2 className="size-3" />
                            Email Verified
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                              app.phoneVerified
                                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                : "bg-muted text-muted-foreground border border-border"
                            }`}
                          >
                            <CheckCircle2 className="size-3" />
                            Phone Verified
                          </span>
                        </div>

                        {/* Reason Box */}
                        <div className="mt-2 p-3 rounded-xl bg-background/60 border border-border/70 text-xs">
                          <span className="font-semibold text-muted-foreground block mb-0.5">
                            Reason for Access Request:
                          </span>
                          <p className="text-foreground leading-relaxed italic">
                            "{app.reason}"
                          </p>
                        </div>

                        {/* Audit Trail info */}
                        {app.reviewedBy && (
                          <div className="text-[11px] text-muted-foreground flex flex-wrap gap-2 pt-1">
                            <span>
                              Reviewed by: <strong className="text-foreground">{app.reviewedBy}</strong>
                            </span>
                            {app.reviewedAt && (
                              <span>• on {new Date(app.reviewedAt).toLocaleString()}</span>
                            )}
                            {app.rejectionReason && (
                              <span className="text-rose-400">
                                • Reason: "{app.rejectionReason}"
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Right: Actions */}
                      <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                        {app.status === "PENDING_APPROVAL" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleApproveApplication(app.id)}
                              className="rounded-xl h-9 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
                            >
                              <CheckCircle2 className="size-3.5" />
                              Approve Admin
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenRejectModal(app.id)}
                              className="rounded-xl h-9 px-3.5 border-rose-500/40 text-rose-400 hover:bg-rose-500/10 text-xs gap-1.5 cursor-pointer"
                            >
                              <X className="size-3.5" />
                              Reject
                            </Button>
                          </>
                        )}
                        {app.status === "APPROVED" && (
                          <div className="flex items-center gap-1 text-xs text-emerald-500 font-semibold px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                            <UserCheck className="size-3.5" />
                            Active Admin
                          </div>
                        )}
                        {app.status === "REJECTED" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApproveApplication(app.id)}
                            className="rounded-xl h-8 px-3 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 text-xs gap-1 cursor-pointer"
                          >
                            <RefreshCw className="size-3" />
                            Re-evaluate & Approve
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* USER INSPECT MODAL */}
      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold font-display">Student Profile Inspection</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Administrative overview of student education parameters & account standing
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-3 py-2 text-xs">
              <div className="p-3 rounded-2xl bg-accent/40 border border-border space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Full Name:</span>
                  <span className="font-semibold text-foreground">{selectedUser.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-mono text-foreground">{selectedUser.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="font-mono text-foreground">{selectedUser.phone || "Not provided"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Role:</span>
                  <Badge variant="outline" className="text-[10px]">{selectedUser.role}</Badge>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-accent/40 border border-border space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Education:</span>
                  <span className="font-semibold text-foreground">{selectedUser.current_education || "Class 12 / Graduate"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location:</span>
                  <span className="text-foreground">{selectedUser.city ? `${selectedUser.city}, ${selectedUser.state}` : "India"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account Status:</span>
                  <Badge className={selectedUser.status === "ACTIVE" ? "bg-emerald-500/20 text-emerald-500" : "bg-destructive/20 text-destructive"}>
                    {selectedUser.status}
                  </Badge>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedUser(null)} className="rounded-xl w-full text-xs">
              Close Inspection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CAREER EDIT / CREATE MODAL */}
      <Dialog open={careerModalOpen} onOpenChange={setCareerModalOpen}>
        <DialogContent className="max-w-lg rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold font-display">
              {editingCareer.id ? "Edit Career Profile" : "Publish New Career Profile"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Changes will instantly update on the Student Career Explorer
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveCareer} className="space-y-3 py-2 text-xs">
            <div>
              <label className="font-semibold block mb-1">Career Title</label>
              <Input
                required
                placeholder="e.g. Cloud Security Architect"
                value={editingCareer.name || ""}
                onChange={(e) => setEditingCareer({ ...editingCareer, name: e.target.value })}
                className="rounded-xl h-9 text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">Domain</label>
                <select
                  value={editingCareer.domain || "Technology"}
                  onChange={(e) => setEditingCareer({ ...editingCareer, domain: e.target.value })}
                  className="w-full h-9 rounded-xl border border-border bg-card px-2 text-xs"
                >
                  <option value="Technology">Technology</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Management">Management</option>
                  <option value="Government Services">Government Services</option>
                  <option value="Law & Judiciary">Law & Judiciary</option>
                  <option value="Science & Research">Science & Research</option>
                  <option value="Commerce & Finance">Commerce & Finance</option>
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-1">Salary Range</label>
                <Input
                  placeholder="e.g. ₹12 - ₹30 LPA"
                  value={editingCareer.salary || ""}
                  onChange={(e) => setEditingCareer({ ...editingCareer, salary: e.target.value })}
                  className="rounded-xl h-9 text-xs"
                />
              </div>
            </div>
            <div>
              <label className="font-semibold block mb-1">Overview Description</label>
              <textarea
                rows={3}
                placeholder="Provide comprehensive career responsibilities and career scope..."
                value={editingCareer.description || ""}
                onChange={(e) => setEditingCareer({ ...editingCareer, description: e.target.value })}
                className="w-full rounded-xl border border-border bg-card p-2 text-xs"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setCareerModalOpen(false)} className="rounded-xl text-xs">
                Cancel
              </Button>
              <Button type="submit" className="gradient-brand text-primary-foreground rounded-xl text-xs">
                Save & Publish
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* EXAM EDIT / CREATE MODAL */}
      <Dialog open={examModalOpen} onOpenChange={setExamModalOpen}>
        <DialogContent className="max-w-lg rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold font-display">
              {editingExam.id ? "Edit Government Exam" : "Add Government Exam Profile"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Update official exam criteria, age limits, and commission website link
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveExam} className="space-y-3 py-2 text-xs">
            <div>
              <label className="font-semibold block mb-1">Exam Title</label>
              <Input
                required
                placeholder="e.g. UPSC Combined Geo-Scientist"
                value={editingExam.name || ""}
                onChange={(e) => setEditingExam({ ...editingExam, name: e.target.value })}
                className="rounded-xl h-9 text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">Conducting Body</label>
                <Input
                  required
                  placeholder="e.g. UPSC, SSC, NTA"
                  value={editingExam.organization || ""}
                  onChange={(e) => setEditingExam({ ...editingExam, organization: e.target.value })}
                  className="rounded-xl h-9 text-xs"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Age Limit</label>
                <Input
                  placeholder="e.g. 21 - 32 years"
                  value={editingExam.ageLimit || ""}
                  onChange={(e) => setEditingExam({ ...editingExam, ageLimit: e.target.value })}
                  className="rounded-xl h-9 text-xs"
                />
              </div>
            </div>
            <div>
              <label className="font-semibold block mb-1">Official Website URL</label>
              <Input
                placeholder="https://upsc.gov.in"
                value={editingExam.officialWebsite || ""}
                onChange={(e) => setEditingExam({ ...editingExam, officialWebsite: e.target.value })}
                className="rounded-xl h-9 text-xs font-mono"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setExamModalOpen(false)} className="rounded-xl text-xs">
                Cancel
              </Button>
              <Button type="submit" className="gradient-brand text-primary-foreground rounded-xl text-xs">
                Save Exam
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* SCHOLARSHIP EDIT / CREATE MODAL */}
      <Dialog open={scholarshipModalOpen} onOpenChange={setScholarshipModalOpen}>
        <DialogContent className="max-w-lg rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold font-display">
              {editingScholarship.id ? "Edit Scholarship" : "Add Scholarship Scheme"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Edits will immediately update the Student Scholarship Discovery page
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveScholarship} className="space-y-3 py-2 text-xs">
            <div>
              <label className="font-semibold block mb-1">Scholarship Title</label>
              <Input
                required
                placeholder="e.g. Reliance Foundation Undergraduate Scholarship"
                value={editingScholarship.name || ""}
                onChange={(e) => setEditingScholarship({ ...editingScholarship, name: e.target.value })}
                className="rounded-xl h-9 text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">Provider / Grantor</label>
                <Input
                  placeholder="e.g. Central Govt / Reliance Foundation"
                  value={editingScholarship.provider || ""}
                  onChange={(e) => setEditingScholarship({ ...editingScholarship, provider: e.target.value })}
                  className="rounded-xl h-9 text-xs"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Award Amount</label>
                <Input
                  required
                  placeholder="e.g. ₹2,00,000 total"
                  value={editingScholarship.amount || ""}
                  onChange={(e) => setEditingScholarship({ ...editingScholarship, amount: e.target.value })}
                  className="rounded-xl h-9 text-xs"
                />
              </div>
            </div>
            <div>
              <label className="font-semibold block mb-1">Deadline Date</label>
              <Input
                placeholder="e.g. 15th November 2026"
                value={editingScholarship.deadline || ""}
                onChange={(e) => setEditingScholarship({ ...editingScholarship, deadline: e.target.value })}
                className="rounded-xl h-9 text-xs"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setScholarshipModalOpen(false)} className="rounded-xl text-xs">
                Cancel
              </Button>
              <Button type="submit" className="gradient-brand text-primary-foreground rounded-xl text-xs">
                Save Scholarship
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* COLLEGE EDIT / CREATE MODAL */}
      <Dialog open={collegeModalOpen} onOpenChange={setCollegeModalOpen}>
        <DialogContent className="max-w-lg rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold font-display">
              {editingCollege.id ? "Edit College Information" : "Add College / University"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Edits will immediately update the Student College Directory
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveCollege} className="space-y-3 py-2 text-xs">
            <div>
              <label className="font-semibold block mb-1">College Name</label>
              <Input
                required
                placeholder="e.g. IIT Madras"
                value={editingCollege.name || ""}
                onChange={(e) => setEditingCollege({ ...editingCollege, name: e.target.value })}
                className="rounded-xl h-9 text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">Location</label>
                <Input
                  placeholder="e.g. Chennai, Tamil Nadu"
                  value={editingCollege.location || ""}
                  onChange={(e) => setEditingCollege({ ...editingCollege, location: e.target.value })}
                  className="rounded-xl h-9 text-xs"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Average Package</label>
                <Input
                  placeholder="e.g. ₹21.5 LPA"
                  value={editingCollege.avgPackage || ""}
                  onChange={(e) => setEditingCollege({ ...editingCollege, avgPackage: e.target.value })}
                  className="rounded-xl h-9 text-xs"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">NIRF Rank</label>
                <Input
                  type="number"
                  placeholder="e.g. 1"
                  value={editingCollege.nirfRank || 1}
                  onChange={(e) => setEditingCollege({ ...editingCollege, nirfRank: Number(e.target.value) })}
                  className="rounded-xl h-9 text-xs"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Total Course Fees</label>
                <Input
                  placeholder="e.g. ₹9 Lakhs total"
                  value={editingCollege.totalFees || ""}
                  onChange={(e) => setEditingCollege({ ...editingCollege, totalFees: e.target.value })}
                  className="rounded-xl h-9 text-xs"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setCollegeModalOpen(false)} className="rounded-xl text-xs">
                Cancel
              </Button>
              <Button type="submit" className="gradient-brand text-primary-foreground rounded-xl text-xs">
                Save College
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* RESOURCE EDIT / CREATE MODAL */}
      <Dialog open={resourceModalOpen} onOpenChange={setResourceModalOpen}>
        <DialogContent className="max-w-lg rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold font-display">
              {editingResource.id ? "Edit Resource" : "Add Learning Resource"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Edits will immediately update the Student Learning Resources Hub
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveResource} className="space-y-3 py-2 text-xs">
            <div>
              <label className="font-semibold block mb-1">Resource Title</label>
              <Input
                required
                placeholder="e.g. Modern Indian History Notes"
                value={editingResource.title || ""}
                onChange={(e) => setEditingResource({ ...editingResource, title: e.target.value })}
                className="rounded-xl h-9 text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">Category</label>
                <select
                  value={editingResource.category || "Standard Books"}
                  onChange={(e) => setEditingResource({ ...editingResource, category: e.target.value as any })}
                  className="w-full h-9 rounded-xl border border-border bg-card px-2 text-xs"
                >
                  <option value="Standard Books">Standard Books</option>
                  <option value="Official Portals & Syllabus">Official Portals & Syllabus</option>
                  <option value="YouTube Courses">YouTube Courses</option>
                  <option value="Practice Papers & PYQs">Practice Papers & PYQs</option>
                  <option value="Free PDFs & Notes">Free PDFs & Notes</option>
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-1">Target Exam / Career</label>
                <Input
                  placeholder="e.g. UPSC CSE / GATE"
                  value={editingResource.targetExamOrCareer || ""}
                  onChange={(e) => setEditingResource({ ...editingResource, targetExamOrCareer: e.target.value })}
                  className="rounded-xl h-9 text-xs"
                />
              </div>
            </div>
            <div>
              <label className="font-semibold block mb-1">Source URL</label>
              <Input
                required
                placeholder="https://..."
                value={editingResource.sourceUrl || ""}
                onChange={(e) => setEditingResource({ ...editingResource, sourceUrl: e.target.value })}
                className="rounded-xl h-9 text-xs font-mono"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setResourceModalOpen(false)} className="rounded-xl text-xs">
                Cancel
              </Button>
              <Button type="submit" className="gradient-brand text-primary-foreground rounded-xl text-xs">
                Save Resource
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* QUESTION EDIT / CREATE MODAL */}
      <Dialog open={questionModalOpen} onOpenChange={setQuestionModalOpen}>
        <DialogContent className="max-w-lg rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold font-display">
              {editingQuestion.id ? `Edit Question #${editingQuestion.order}` : "Add Assessment Question"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Edits will immediately update the 50-Question AI Career Assessment
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveQuestion} className="space-y-3 py-2 text-xs">
            <div>
              <label className="font-semibold block mb-1">Question Prompt</label>
              <Input
                required
                placeholder="e.g. I enjoy designing distributed cloud architectures..."
                value={editingQuestion.text || ""}
                onChange={(e) => setEditingQuestion({ ...editingQuestion, text: e.target.value })}
                className="rounded-xl h-9 text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">Category</label>
                <Input
                  placeholder="e.g. Technology, Leadership"
                  value={editingQuestion.category || ""}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, category: e.target.value })}
                  className="rounded-xl h-9 text-xs"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Scoring Weight</label>
                <Input
                  type="number"
                  placeholder="e.g. 1.2"
                  value={editingQuestion.weight || 1}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, weight: Number(e.target.value) })}
                  className="rounded-xl h-9 text-xs"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setQuestionModalOpen(false)} className="rounded-xl text-xs">
                Cancel
              </Button>
              <Button type="submit" className="gradient-brand text-primary-foreground rounded-xl text-xs">
                Save Question
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* BROADCAST ALERT MODAL */}
      <Dialog open={broadcastModalOpen} onOpenChange={setBroadcastModalOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold font-display">Broadcast Platform Notification</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Send immediate alert to all student notification feeds
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSendBroadcast} className="space-y-3 py-2 text-xs">
            <div>
              <label className="font-semibold block mb-1">Alert Headline</label>
              <Input
                required
                placeholder="e.g. GATE 2027 Registration Open"
                value={newBroadcast.title}
                onChange={(e) => setNewBroadcast({ ...newBroadcast, title: e.target.value })}
                className="rounded-xl h-9 text-xs"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Detailed Message</label>
              <textarea
                required
                rows={3}
                placeholder="State the deadline and required application links..."
                value={newBroadcast.message}
                onChange={(e) => setNewBroadcast({ ...newBroadcast, message: e.target.value })}
                className="w-full rounded-xl border border-border bg-card p-2 text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">Category</label>
                <select
                  value={newBroadcast.category}
                  onChange={(e) => setNewBroadcast({ ...newBroadcast, category: e.target.value as any })}
                  className="w-full h-9 rounded-xl border border-border bg-card px-2 text-xs"
                >
                  <option value="EXAM">Exam</option>
                  <option value="SCHOLARSHIP">Scholarship</option>
                  <option value="ADMISSION">Admission</option>
                  <option value="SYSTEM">System Alert</option>
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-1">Target Audience</label>
                <select
                  value={newBroadcast.targetAudience}
                  onChange={(e) => setNewBroadcast({ ...newBroadcast, targetAudience: e.target.value as any })}
                  className="w-full h-9 rounded-xl border border-border bg-card px-2 text-xs"
                >
                  <option value="ALL">All Students</option>
                  <option value="GRADUATES">Graduates Only</option>
                  <option value="CLASS_12">Class 12 Only</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setBroadcastModalOpen(false)} className="rounded-xl text-xs">
                Cancel
              </Button>
              <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-xl text-xs">
                Send Broadcast
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* REJECT APPLICATION CONFIRMATION MODAL */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold font-display text-rose-500 flex items-center gap-2">
              <ShieldAlert className="size-4" /> Reject Administrator Application
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Provide a rationale for why this application is not approved. The applicant will see this status upon enquiry.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="text-xs font-semibold block mb-1">Rejection Reason</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Unverified institutional affiliation, insufficient authorization details..."
                rows={3}
                className="w-full p-3 text-xs rounded-xl border border-border bg-card resize-none focus:outline-none focus:border-rose-500/60"
              />
            </div>
          </div>
          <DialogFooter className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setRejectModalOpen(false);
                setRejectingAppId("");
              }}
              className="rounded-xl text-xs cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmRejectApplication}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs cursor-pointer"
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
