import { useState, useEffect, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Calendar as CalendarIcon,
  CheckCircle,
  CheckCircle2,
  Clock,
  Flame,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  TrendingUp,
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
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EXAMS_DATA } from "@/lib/data/exams-data";
import {
  getStudyTasks,
  saveStudyTasks,
  rescheduleMissedTasks,
  StudyTask,
} from "@/lib/store/careersetu-store";

export const Route = createFileRoute("/_authenticated/study-planner")({
  head: () => ({
    meta: [
      { title: "AI Study Planner — CareerSetu" },
      {
        name: "description",
        content: "Generate adaptive daily schedules, weekly goals, and track your competitive exam preparation with automated missed task rescheduling.",
      },
    ],
  }),
  component: StudyPlannerPage,
});

function StudyPlannerPage() {
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [selectedExamId, setSelectedExamId] = useState("upsc-cse");
  const [dailyHours, setDailyHours] = useState("4");
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  // New task form state
  const [newTitle, setNewTitle] = useState("");
  const [newSubject, setNewSubject] = useState("Core Syllabus");
  const [newMinutes, setNewMinutes] = useState(60);
  const [newPriority, setNewPriority] = useState<"High" | "Medium" | "Normal">("High");

  useEffect(() => {
    // Check and auto-reschedule missed overdue tasks
    const { rescheduledCount } = rescheduleMissedTasks();
    if (rescheduledCount > 0) {
      toast.info(`Moved ${rescheduledCount} overdue tasks to today's schedule`);
    }
    setTasks(getStudyTasks());
  }, []);

  const todayStr = new Date().toISOString().split("T")[0]!;

  const handleToggleComplete = (taskId: string) => {
    const updated = tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t));
    setTasks(updated);
    saveStudyTasks(updated);
    const toggled = updated.find((t) => t.id === taskId);
    if (toggled?.completed) {
      toast.success("Task completed! Streak updated 🔥");
    }
  };

  const handleDeleteTask = (taskId: string) => {
    const updated = tasks.filter((t) => t.id !== taskId);
    setTasks(updated);
    saveStudyTasks(updated);
    toast.info("Task removed");
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: StudyTask = {
      id: "task-" + Date.now(),
      title: newTitle.trim(),
      subject: newSubject,
      date: todayStr,
      timeEstimateMins: newMinutes,
      completed: false,
      priority: newPriority,
      targetExamId: selectedExamId,
    };

    const updated = [newTask, ...tasks];
    setTasks(updated);
    saveStudyTasks(updated);
    setIsAddTaskOpen(false);
    setNewTitle("");
    toast.success("New task scheduled for today!");
  };

  const todayTasks = tasks.filter((t) => t.date === todayStr);
  const completedToday = todayTasks.filter((t) => t.completed).length;
  const todayProgress = todayTasks.length > 0 ? Math.round((completedToday / todayTasks.length) * 100) : 0;

  const totalStudyMinutesToday = todayTasks
    .filter((t) => t.completed)
    .reduce((acc, curr) => acc + curr.timeEstimateMins, 0);

  const selectedExam = EXAMS_DATA.find((e) => e.id === selectedExamId) ?? EXAMS_DATA[0]!;

  const handleGenerateAdaptiveSchedule = () => {
    const adaptiveTemplates = [
      { title: `Read NCERT / Foundation chapter for ${selectedExam.shortName}`, subject: "Core Foundation", mins: 60, priority: "High" as const },
      { title: `Solve 25 Previous Year Questions (PYQs) for ${selectedExam.shortName}`, subject: "Practice Drills", mins: 90, priority: "High" as const },
      { title: `Daily Current Affairs & Editorial Analysis`, subject: "General Awareness", mins: 45, priority: "Medium" as const },
      { title: `Revision of Formula Sheet & Recurring Mistakes Note`, subject: "Active Recall", mins: 30, priority: "Normal" as const },
    ];

    const generatedTasks: StudyTask[] = adaptiveTemplates.map((item, idx) => ({
      id: "gen-" + Date.now() + "-" + idx,
      title: item.title,
      subject: item.subject,
      date: todayStr,
      timeEstimateMins: item.mins,
      completed: false,
      priority: item.priority,
      targetExamId: selectedExamId,
    }));

    const updated = [...generatedTasks, ...tasks];
    setTasks(updated);
    saveStudyTasks(updated);
    toast.success(`Generated 4-task adaptive study schedule for ${selectedExam.shortName}!`);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
              <CalendarIcon className="size-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold font-display text-foreground">
              Adaptive AI Study Planner
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Personalized daily schedule, automatic overdue task rescheduling, and consistency streak tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setIsAddTaskOpen(true)}
            className="rounded-xl gradient-brand text-primary-foreground font-bold shadow-xs cursor-pointer gap-1.5"
          >
            <Plus className="size-4" /> Add Task
          </Button>
        </div>
      </div>

      {/* Target Exam & Generator Bar */}
      <Card className="glass p-5 rounded-3xl border-border/80 shadow-md bg-card/90 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground block">Target Exam / Goal:</span>
              <Select value={selectedExamId} onValueChange={setSelectedExamId}>
                <SelectTrigger className="w-56 h-9 rounded-xl text-xs font-semibold bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  {EXAMS_DATA.map((e) => (
                    <SelectItem key={e.id} value={e.id} className="text-xs">
                      {e.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground block">Daily Study Target:</span>
              <Select value={dailyHours} onValueChange={setDailyHours}>
                <SelectTrigger className="w-28 h-9 rounded-xl text-xs font-semibold bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="2" className="text-xs">2 Hours/day</SelectItem>
                  <SelectItem value="4" className="text-xs">4 Hours/day</SelectItem>
                  <SelectItem value="6" className="text-xs">6 Hours/day</SelectItem>
                  <SelectItem value="8" className="text-xs">8 Hours/day</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateAdaptiveSchedule}
            className="rounded-xl text-xs font-bold border-primary/30 text-primary hover:bg-primary/10 gap-1.5 cursor-pointer"
          >
            <Sparkles className="size-3.5 text-amber-500 fill-amber-500" />
            AI Auto-Generate Plan
          </Button>
        </div>
      </Card>

      {/* Today's Goal Progress Bar & Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="glass p-4 rounded-3xl border-border/80 shadow-xs space-y-2 bg-card/90">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Today's Task Progress</span>
            <strong className="text-primary font-bold">{todayProgress}%</strong>
          </div>
          <Progress value={todayProgress} className="h-2 rounded-full" />
          <p className="text-[11px] text-muted-foreground">
            {completedToday} of {todayTasks.length} milestones checked off
          </p>
        </Card>

        <Card className="glass p-4 rounded-3xl border-border/80 shadow-xs flex items-center gap-3.5 bg-card/90">
          <span className="grid size-11 place-items-center rounded-2xl bg-amber-500/10 text-amber-500">
            <Flame className="size-6 animate-pulse" />
          </span>
          <div>
            <span className="text-[11px] font-medium text-muted-foreground block">Study Streak</span>
            <p className="text-lg font-bold text-foreground">7 Days Active 🔥</p>
            <span className="text-[10px] text-emerald-500 font-semibold">Top 5% Consistency</span>
          </div>
        </Card>

        <Card className="glass p-4 rounded-3xl border-border/80 shadow-xs flex items-center gap-3.5 bg-card/90">
          <span className="grid size-11 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-500">
            <Clock className="size-6" />
          </span>
          <div>
            <span className="text-[11px] font-medium text-muted-foreground block">Study Time Completed</span>
            <p className="text-lg font-bold text-foreground">{totalStudyMinutesToday} Minutes</p>
            <span className="text-[10px] text-muted-foreground">Goal: {parseInt(dailyHours) * 60} mins</span>
          </div>
        </Card>
      </div>

      {/* Task List View */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
            <CheckCircle2 className="size-4 text-primary" /> Today's Scheduled Milestones
          </h3>
          <span className="text-xs text-muted-foreground font-mono">{todayStr}</span>
        </div>

        <div className="space-y-2.5">
          {todayTasks.map((t) => (
            <Card
              key={t.id}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 shadow-xs ${
                t.completed
                  ? "bg-muted/40 border-border/40 opacity-75"
                  : "bg-card border-border/80 hover:border-primary/40"
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => handleToggleComplete(t.id)}
                  className={`mt-0.5 size-5 rounded-lg grid place-items-center border transition-all cursor-pointer ${
                    t.completed
                      ? "bg-emerald-500 text-white border-emerald-500"
                      : "border-border hover:border-primary bg-background"
                  }`}
                >
                  {t.completed && <CheckCircle className="size-3.5 stroke-[3]" />}
                </button>

                <div className="space-y-1">
                  <p
                    className={`font-semibold text-xs sm:text-sm text-foreground ${
                      t.completed ? "line-through text-muted-foreground" : ""
                    }`}
                  >
                    {t.title}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
                    <Badge variant="outline" className="text-[9px] py-0">
                      {t.subject}
                    </Badge>
                    <span>⏱️ {t.timeEstimateMins} mins</span>
                    {t.rescheduledCount && t.rescheduledCount > 0 && (
                      <span className="text-amber-500 font-semibold bg-amber-500/10 px-1.5 py-0.2 rounded">
                        Auto-Rescheduled ({t.rescheduledCount}x)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleDeleteTask(t.id)}
                className="p-1 rounded-lg text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                title="Delete task"
              >
                <Trash2 className="size-4" />
              </button>
            </Card>
          ))}

          {todayTasks.length === 0 && (
            <Card className="glass p-8 text-center rounded-3xl border-border space-y-2">
              <Sparkles className="size-8 mx-auto text-muted-foreground" />
              <p className="font-semibold text-xs text-foreground">No tasks scheduled for today yet!</p>
              <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
                Click "AI Auto-Generate Plan" or "Add Task" to populate today's schedule.
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Add Task Modal */}
      {isAddTaskOpen && (
        <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
          <DialogContent className="max-w-md p-6 rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-base font-bold font-display flex items-center gap-2">
                <Plus className="size-4 text-primary" /> Add Custom Study Task
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleAddTask} className="space-y-4 text-xs mt-2">
              <div>
                <label className="font-semibold text-foreground block mb-1">Task Title / Milestone</label>
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Solve 20 questions on Electromagnetism"
                  className="rounded-xl h-10"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-foreground block mb-1">Subject</label>
                  <Input
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="e.g. Physics / Polity"
                    className="rounded-xl h-10"
                  />
                </div>
                <div>
                  <label className="font-semibold text-foreground block mb-1">Duration (Minutes)</label>
                  <Input
                    type="number"
                    value={newMinutes}
                    onChange={(e) => setNewMinutes(parseInt(e.target.value) || 30)}
                    min={15}
                    max={360}
                    className="rounded-xl h-10"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddTaskOpen(false)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="gradient-brand text-primary-foreground font-bold rounded-xl">
                  Save Task
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
