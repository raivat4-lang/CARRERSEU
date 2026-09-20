import { createFileRoute, Link, Outlet, useNavigate, useLocation } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  BookOpen,
  Bookmark,
  Bot,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Compass,
  FileText,
  Flame,
  GraduationCap,
  Globe,
  Home,
  Landmark,
  Layers,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  Shield,
  Sparkles,
  Sun,
  Target,
  TrendingUp,
  User,
  X,
  Zap,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import { CareerChatbot } from "@/components/ai/CareerChatbot";
import { Logo } from "@/components/brand/Logo";
import { GlobalSearchModal } from "@/components/search/GlobalSearchModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { Language, getTranslation } from "@/lib/i18n/translations";
import { getCurrentUser, isAdmin, AppUser, logoutUser } from "@/lib/auth/rbac";
import { getBroadcastNotifications } from "@/lib/store/admin-content-store";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const user = getCurrentUser();
    return { user };
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const [showChatbot, setShowChatbot] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<Language>("english");
  const [unreadNotifications, setUnreadNotifications] = useState(3);

  const currentUser = getCurrentUser();
  const userIsAdmin = isAdmin(currentUser);
  const userName = currentUser.full_name || "Student";
  const broadcasts = getBroadcastNotifications();

  useEffect(() => {
    if (typeof localStorage !== "undefined") {
      const savedLang = localStorage.getItem("careersetu_language") as Language;
      if (savedLang) setCurrentLang(savedLang);
    }
  }, []);

  const changeLanguage = (lang: Language) => {
    setCurrentLang(lang);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("careersetu_language", lang);
    }
    toast.success(`Language set to ${lang.toUpperCase()}`);
  };

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    logoutUser();
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate({ to: "/student/login" as any, replace: true });
  }

  const currentPath = location.pathname;

  const NAV_ITEMS = [
    { label: getTranslation(currentLang, "dashboard"), path: "/dashboard", icon: Home, badge: "Home" },
    { label: getTranslation(currentLang, "assessment"), path: "/assessment", icon: Target, badge: "AI" },
    { label: getTranslation(currentLang, "careers"), path: "/careers", icon: Briefcase, badge: "100+" },
    { label: getTranslation(currentLang, "exams"), path: "/exams", icon: Landmark, badge: "20+" },
    { label: getTranslation(currentLang, "studyPlanner"), path: "/study-planner", icon: Calendar },
    { label: getTranslation(currentLang, "resources"), path: "/resources", icon: BookOpen },
    { label: getTranslation(currentLang, "scholarships"), path: "/scholarships", icon: GraduationCap },
    { label: getTranslation(currentLang, "colleges"), path: "/colleges", icon: Building2 },
    { label: getTranslation(currentLang, "resume"), path: "/resume", icon: FileText, badge: "ATS" },
    { label: getTranslation(currentLang, "skillGap"), path: "/skill-gap", icon: Zap },
    { label: getTranslation(currentLang, "progress"), path: "/progress", icon: TrendingUp },
    { label: getTranslation(currentLang, "bookmarks"), path: "/bookmarks", icon: Bookmark },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col antialiased selection:bg-primary/20">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-card/85 backdrop-blur-md">
        <div className="mx-auto flex w-full items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-accent text-muted-foreground hover:text-foreground cursor-pointer"
              aria-label="Toggle navigation"
            >
              {sidebarOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
            <Link to="/dashboard" aria-label="CareerSetu dashboard" className="flex items-center gap-2">
              <Logo />
            </Link>
            <Badge variant="outline" className="hidden xl:inline-flex border-primary/20 text-primary text-[11px] bg-primary/5 font-semibold">
              AI Student SaaS
            </Badge>
          </div>

          {/* Center Search Bar */}
          <button
            onClick={() => setShowSearch(true)}
            className="hidden md:flex items-center justify-between w-72 lg:w-96 h-9 px-3 rounded-xl bg-accent/40 hover:bg-accent/70 border border-border/70 text-xs text-muted-foreground transition-all cursor-pointer shadow-inner"
          >
            <div className="flex items-center gap-2 truncate">
              <Search className="size-3.5 text-primary" />
              <span className="truncate">{getTranslation(currentLang, "searchPlaceholder")}</span>
            </div>
            <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-card border border-border text-foreground/80">
              ⌘K
            </kbd>
          </button>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Ask AI Assistant Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowChatbot(true)}
              className="h-8 sm:h-9 rounded-xl gap-1.5 border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold shadow-xs cursor-pointer"
            >
              <Bot className="size-4 animate-bounce" />
              <span className="hidden sm:inline">{getTranslation(currentLang, "askAI")}</span>
              <Sparkles className="size-3 text-amber-500 fill-amber-500" />
            </Button>

            {/* Theme Toggler */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl text-muted-foreground hover:text-foreground cursor-pointer"
              aria-label="Toggle Theme"
              onClick={() => {
                const isDark = document.documentElement.classList.toggle("dark");
                if (typeof localStorage !== "undefined") {
                  localStorage.setItem("careersetu_theme", isDark ? "dark" : "light");
                }
              }}
            >
              <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
              <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-sky-400" />
            </Button>

            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 sm:h-9 px-2.5 rounded-xl gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer">
                  <Globe className="size-4" />
                  <span className="hidden md:inline uppercase text-[11px] font-semibold">{currentLang.slice(0, 2)}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 rounded-2xl p-1.5">
                <DropdownMenuLabel className="text-[10px] text-muted-foreground">Select Language</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => changeLanguage("english")}
                  className={`rounded-xl text-xs cursor-pointer ${currentLang === "english" ? "font-bold text-primary bg-primary/10" : ""}`}
                >
                  🇬🇧 English
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => changeLanguage("hindi")}
                  className={`rounded-xl text-xs cursor-pointer ${currentLang === "hindi" ? "font-bold text-primary bg-primary/10" : ""}`}
                >
                  🇮🇳 हिन्दी (Hindi)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => changeLanguage("marathi")}
                  className={`rounded-xl text-xs cursor-pointer ${currentLang === "marathi" ? "font-bold text-primary bg-primary/10" : ""}`}
                >
                  🇮🇳 मराठी (Marathi)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notifications Center */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl relative cursor-pointer" aria-label="Notifications">
                  <Bell className="size-4 text-muted-foreground" />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary animate-pulse" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 rounded-2xl p-4 shadow-xl border-border">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <span className="font-bold text-xs text-foreground">Exam & Deadline Alerts</span>
                  {unreadNotifications > 0 && (
                    <button
                      onClick={() => {
                        setUnreadNotifications(0);
                        toast.success("All notifications marked as read");
                      }}
                      className="text-[10px] text-primary hover:underline cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="space-y-2 text-xs mt-3 max-h-64 overflow-y-auto pr-1">
                  {broadcasts.map((b) => (
                    <div key={b.id} className="p-2.5 rounded-xl bg-primary/5 border border-primary/20">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <p className="font-semibold text-foreground text-xs">{b.title}</p>
                        <Badge variant="outline" className="text-[9px] px-1 py-0 border-primary/30 text-primary">{b.category}</Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground">{b.message}</p>
                    </div>
                  ))}
                  <div className="p-2.5 rounded-xl bg-accent/40 border border-border/50">
                    <p className="font-semibold text-foreground">Today's Study Goal: 2 Tasks Remaining</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Complete your daily scheduled milestones</p>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Profile Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 sm:h-9 rounded-xl gap-2 px-2 cursor-pointer">
                  <span className="grid size-6 place-items-center rounded-full bg-primary text-primary-foreground font-bold text-xs shadow-xs">
                    {userName.charAt(0).toUpperCase()}
                  </span>
                  <span className="hidden sm:inline text-xs font-semibold truncate max-w-24">{userName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 rounded-2xl p-2 shadow-xl border-border">
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                  Signed in as <strong className="text-foreground block font-medium truncate">{userName}</strong>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem onClick={() => navigate({ to: "/profile" as any })} className="rounded-xl cursor-pointer text-xs">
                  <User className="mr-2 size-3.5 text-primary" />
                  {getTranslation(currentLang, "profile")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: "/settings" as any })} className="rounded-xl cursor-pointer text-xs">
                  <Settings className="mr-2 size-3.5 text-primary" />
                  {getTranslation(currentLang, "settings")}
                </DropdownMenuItem>
                {userIsAdmin && (
                  <DropdownMenuItem onClick={() => navigate({ to: "/admin" as any })} className="rounded-xl cursor-pointer text-xs font-medium text-amber-500 bg-amber-500/10">
                    <Shield className="mr-2 size-3.5 text-amber-500" />
                    Admin Management Console
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem onSelect={signOut} className="rounded-xl text-destructive focus:text-destructive cursor-pointer text-xs">
                  <LogOut className="mr-2 size-3.5" />
                  {getTranslation(currentLang, "logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Layout Body: Sidebar + Main Content Area */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar */}
        <aside
          className={`fixed lg:sticky top-[57px] left-0 z-30 h-[calc(100vh-57px)] w-64 shrink-0 bg-card/95 backdrop-blur-xl border-r border-border/80 p-4 overflow-y-auto transition-transform duration-300 ${
            sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="space-y-6">
            {/* Quick Action Button */}
            <Link
              to="/assessment"
              onClick={() => setSidebarOpen(false)}
              className="gradient-brand flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-primary-foreground font-semibold text-xs shadow-glow hover:opacity-95 transition-opacity"
            >
              <div className="flex items-center gap-2">
                <Target className="size-4 animate-spin-slow" />
                <span>Take Assessment</span>
              </div>
              <ChevronRight className="size-3.5" />
            </Link>

            {/* Navigation Groups */}
            <div className="space-y-1">
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">Navigation</p>
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path || (item.path !== "/dashboard" && currentPath.startsWith(item.path));
                return (
                  <Link
                    key={item.path}
                    to={item.path as any}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="size-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-md ${
                          isActive ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Account Group */}
            <div className="space-y-1 pt-3 border-t border-border/60">
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">Account</p>
              <Link
                to="/profile"
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  currentPath === "/profile"
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                }`}
              >
                <User className="size-4" />
                <span>{getTranslation(currentLang, "profile")}</span>
              </Link>
              <Link
                to="/settings"
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  currentPath === "/settings"
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                }`}
              >
                <Settings className="size-4" />
                <span>{getTranslation(currentLang, "settings")}</span>
              </Link>
            </div>
          </div>
        </aside>

        {/* Backdrop for mobile drawer */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-20 bg-background/80 backdrop-blur-xs lg:hidden"
          />
        )}

        {/* Main Content Viewport */}
        <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 pb-24 lg:pb-12 max-w-5xl">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-card/95 backdrop-blur-xl border-t border-border flex items-center justify-around py-2 px-3 shadow-lg">
        <Link
          to="/dashboard"
          className={`flex flex-col items-center gap-1 text-[10px] font-medium ${
            currentPath === "/dashboard" ? "text-primary font-bold" : "text-muted-foreground"
          }`}
        >
          <Home className="size-4" />
          <span>Home</span>
        </Link>
        <Link
          to="/careers"
          className={`flex flex-col items-center gap-1 text-[10px] font-medium ${
            currentPath.startsWith("/careers") ? "text-primary font-bold" : "text-muted-foreground"
          }`}
        >
          <Briefcase className="size-4" />
          <span>Careers</span>
        </Link>
        <button
          onClick={() => setShowChatbot(true)}
          className="flex flex-col items-center justify-center -mt-5 size-12 rounded-full gradient-brand text-primary-foreground shadow-glow cursor-pointer"
        >
          <Bot className="size-5" />
        </button>
        <Link
          to="/exams"
          className={`flex flex-col items-center gap-1 text-[10px] font-medium ${
            currentPath.startsWith("/exams") ? "text-primary font-bold" : "text-muted-foreground"
          }`}
        >
          <Landmark className="size-4" />
          <span>Exams</span>
        </Link>
        <Link
          to="/study-planner"
          className={`flex flex-col items-center gap-1 text-[10px] font-medium ${
            currentPath.startsWith("/study-planner") ? "text-primary font-bold" : "text-muted-foreground"
          }`}
        >
          <Calendar className="size-4" />
          <span>Study</span>
        </Link>
      </nav>

      {/* Global Command Search Modal */}
      <GlobalSearchModal open={showSearch} onOpenChange={setShowSearch} />

      {/* Floating AI Career Assistant Dialog */}
      {showChatbot && (
        <Dialog open={showChatbot} onOpenChange={setShowChatbot}>
          <DialogContent className="max-w-md p-0 border-0 bg-transparent shadow-none">
            <CareerChatbot onClose={() => setShowChatbot(false)} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
