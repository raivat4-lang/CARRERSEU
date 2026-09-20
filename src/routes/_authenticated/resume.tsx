import { useState, useEffect, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Briefcase,
  Download,
  Eye,
  FileText,
  GraduationCap,
  Layout,
  Plus,
  Printer,
  RotateCcw,
  Save,
  Sparkles,
  Trash2,
  User,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  getResumeData,
  saveResumeData,
  ResumeData,
  DEFAULT_RESUME_DATA,
} from "@/lib/store/careersetu-store";

export const Route = createFileRoute("/_authenticated/resume")({
  head: () => ({
    meta: [
      { title: "AI Resume & CV Builder — CareerSetu" },
      {
        name: "description",
        content: "Build professional ATS-optimized resumes with AI summary enhancement, real-time preview, and PDF export.",
      },
    ],
  }),
  component: ResumeBuilderPage,
});

function ResumeBuilderPage() {
  const [resume, setResume] = useState<ResumeData>(getResumeData());
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [selectedTemplate, setSelectedTemplate] = useState<"modern-minimal" | "executive" | "tech-clean">("modern-minimal");
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setResume(getResumeData());
  }, []);

  const handleSave = () => {
    saveResumeData(resume);
    toast.success("Resume saved successfully!");
  };

  const handleReset = () => {
    if (window.confirm("Reset resume to sample template data?")) {
      setResume(DEFAULT_RESUME_DATA);
      saveResumeData(DEFAULT_RESUME_DATA);
      toast.info("Reset to default resume template");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // AI Summary Enhancement
  const handleAiEnhanceSummary = () => {
    setIsAiGenerating(true);
    setTimeout(() => {
      const enhanced = `Results-oriented technologist and strategist with proven expertise in modern full-stack development, scalable system architectures, and data-driven problem solving. Skilled in collaborating across multidisciplinary teams, optimizing algorithmic pipelines, and building user-centric digital applications.`;
      setResume((prev) => ({ ...prev, summary: enhanced }));
      setIsAiGenerating(false);
      toast.success("AI enhanced professional summary!");
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
              <FileText className="size-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold font-display text-foreground">
              ATS-Optimized Resume Builder
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Build clean, recruiter-tested resumes with live layout preview, AI copy enhancement, and PDF export.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="rounded-xl text-xs cursor-pointer"
          >
            <RotateCcw className="size-3.5 mr-1" /> Reset
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            className="rounded-xl text-xs cursor-pointer"
          >
            <Save className="size-3.5 mr-1 text-primary" /> Save
          </Button>

          <Button
            size="sm"
            onClick={handlePrint}
            className="gradient-brand text-primary-foreground font-bold rounded-xl shadow-glow cursor-pointer gap-1.5"
          >
            <Download className="size-3.5" /> Download PDF / Print
          </Button>
        </div>
      </div>

      {/* Main Tabs: Edit vs Preview */}
      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
        <TabsList className="rounded-2xl p-1 bg-accent/60 w-full sm:w-auto">
          <TabsTrigger value="edit" className="rounded-xl text-xs font-semibold">
            ✏️ Edit Content
          </TabsTrigger>
          <TabsTrigger value="preview" className="rounded-xl text-xs font-semibold">
            <Eye className="size-3.5 mr-1" /> Live Resume Preview
          </TabsTrigger>
        </TabsList>

        {/* ---------------- EDIT MODE ---------------- */}
        <TabsContent value="edit" className="space-y-6 mt-4">
          {/* 1. Personal Information */}
          <Card className="glass p-5 rounded-3xl border-border/80 shadow-xs space-y-4 bg-card/90">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <User className="size-4 text-primary" /> 1. Contact & Personal Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">Full Name</label>
                <Input
                  value={resume.personalInfo.fullName}
                  onChange={(e) =>
                    setResume({
                      ...resume,
                      personalInfo: { ...resume.personalInfo, fullName: e.target.value },
                    })
                  }
                  className="rounded-xl h-9"
                />
              </div>

              <div>
                <label className="font-semibold text-muted-foreground block mb-1">Email Address</label>
                <Input
                  value={resume.personalInfo.email}
                  onChange={(e) =>
                    setResume({
                      ...resume,
                      personalInfo: { ...resume.personalInfo, email: e.target.value },
                    })
                  }
                  className="rounded-xl h-9"
                />
              </div>

              <div>
                <label className="font-semibold text-muted-foreground block mb-1">Phone Number</label>
                <Input
                  value={resume.personalInfo.phone}
                  onChange={(e) =>
                    setResume({
                      ...resume,
                      personalInfo: { ...resume.personalInfo, phone: e.target.value },
                    })
                  }
                  className="rounded-xl h-9"
                />
              </div>

              <div>
                <label className="font-semibold text-muted-foreground block mb-1">Location (City, State)</label>
                <Input
                  value={resume.personalInfo.location}
                  onChange={(e) =>
                    setResume({
                      ...resume,
                      personalInfo: { ...resume.personalInfo, location: e.target.value },
                    })
                  }
                  className="rounded-xl h-9"
                />
              </div>

              <div>
                <label className="font-semibold text-muted-foreground block mb-1">Professional Title / Headline</label>
                <Input
                  value={resume.personalInfo.headline}
                  onChange={(e) =>
                    setResume({
                      ...resume,
                      personalInfo: { ...resume.personalInfo, headline: e.target.value },
                    })
                  }
                  className="rounded-xl h-9"
                />
              </div>

              <div>
                <label className="font-semibold text-muted-foreground block mb-1">LinkedIn / Portfolio URL</label>
                <Input
                  value={resume.personalInfo.linkedinUrl}
                  onChange={(e) =>
                    setResume({
                      ...resume,
                      personalInfo: { ...resume.personalInfo, linkedinUrl: e.target.value },
                    })
                  }
                  className="rounded-xl h-9"
                />
              </div>
            </div>
          </Card>

          {/* 2. Professional Summary */}
          <Card className="glass p-5 rounded-3xl border-border/80 shadow-xs space-y-3 bg-card/90">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Sparkles className="size-4 text-primary" /> 2. Professional Summary
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAiEnhanceSummary}
                disabled={isAiGenerating}
                className="rounded-xl text-xs font-semibold border-primary/30 text-primary hover:bg-primary/10 gap-1.5 cursor-pointer"
              >
                <Wand2 className="size-3.5 text-amber-500" />
                {isAiGenerating ? "Enhancing..." : "AI Enhance Summary"}
              </Button>
            </div>

            <Textarea
              value={resume.summary}
              onChange={(e) => setResume({ ...resume, summary: e.target.value })}
              rows={3}
              className="rounded-xl text-xs leading-relaxed"
            />
          </Card>

          {/* 3. Education Section */}
          <Card className="glass p-5 rounded-3xl border-border/80 shadow-xs space-y-4 bg-card/90">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <GraduationCap className="size-4 text-primary" /> 3. Education
              </h3>
            </div>

            <div className="space-y-3">
              {resume.education.map((edu, idx) => (
                <div key={edu.id} className="p-3.5 rounded-2xl bg-accent/30 border border-border space-y-2 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="font-semibold text-muted-foreground block mb-1">Institution Name</label>
                      <Input
                        value={edu.institution}
                        onChange={(e) => {
                          const updated = [...resume.education];
                          updated[idx]!.institution = e.target.value;
                          setResume({ ...resume, education: updated });
                        }}
                        className="rounded-xl h-8 text-xs"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-muted-foreground block mb-1">Degree & Stream</label>
                      <Input
                        value={edu.degree}
                        onChange={(e) => {
                          const updated = [...resume.education];
                          updated[idx]!.degree = e.target.value;
                          setResume({ ...resume, education: updated });
                        }}
                        className="rounded-xl h-8 text-xs"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-muted-foreground block mb-1">Graduation Year / Grade</label>
                      <Input
                        value={`${edu.startDate} - ${edu.endDate} (${edu.grade})`}
                        onChange={(e) => {
                          const updated = [...resume.education];
                          updated[idx]!.grade = e.target.value;
                          setResume({ ...resume, education: updated });
                        }}
                        className="rounded-xl h-8 text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* 4. Experience & Projects */}
          <Card className="glass p-5 rounded-3xl border-border/80 shadow-xs space-y-4 bg-card/90">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Briefcase className="size-4 text-primary" /> 4. Projects & Internships
            </h3>

            <div className="space-y-3">
              {resume.projects.map((proj, idx) => (
                <div key={proj.id} className="p-3.5 rounded-2xl bg-accent/30 border border-border space-y-2 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="font-semibold text-muted-foreground block mb-1">Project Title</label>
                      <Input
                        value={proj.title}
                        onChange={(e) => {
                          const updated = [...resume.projects];
                          updated[idx]!.title = e.target.value;
                          setResume({ ...resume, projects: updated });
                        }}
                        className="rounded-xl h-8 text-xs"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-muted-foreground block mb-1">Tech Stack</label>
                      <Input
                        value={proj.techStack}
                        onChange={(e) => {
                          const updated = [...resume.projects];
                          updated[idx]!.techStack = e.target.value;
                          setResume({ ...resume, projects: updated });
                        }}
                        className="rounded-xl h-8 text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="font-semibold text-muted-foreground block mb-1">Description & Impact</label>
                    <Textarea
                      value={proj.description}
                      onChange={(e) => {
                        const updated = [...resume.projects];
                        updated[idx]!.description = e.target.value;
                        setResume({ ...resume, projects: updated });
                      }}
                      rows={2}
                      className="rounded-xl text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* 5. Technical Skills */}
          <Card className="glass p-5 rounded-3xl border-border/80 shadow-xs space-y-3 bg-card/90">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Wand2 className="size-4 text-primary" /> 5. Core Technical Skills
            </h3>
            <Input
              value={resume.skills?.technical?.join(", ") || ""}
              onChange={(e) =>
                setResume({
                  ...resume,
                  skills: {
                    ...resume.skills,
                    technical: e.target.value.split(",").map((s) => s.trim()),
                  },
                })
              }
              placeholder="e.g. Python, TypeScript, React, SQL, PyTorch, Git"
              className="rounded-xl text-xs h-9"
            />
          </Card>
        </TabsContent>

        {/* ---------------- PREVIEW & PRINT READY VIEW ---------------- */}
        <TabsContent value="preview" className="space-y-4 mt-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>A4 Document Preview</span>
            <Button
              size="sm"
              onClick={handlePrint}
              className="gradient-brand text-primary-foreground font-bold rounded-xl shadow-glow cursor-pointer gap-1.5"
            >
              <Printer className="size-3.5" /> Print / Save as PDF
            </Button>
          </div>

          {/* Clean White A4 Printable Sheet */}
          <div
            ref={printRef}
            className="w-full max-w-3xl mx-auto bg-white text-slate-900 p-8 sm:p-12 rounded-2xl shadow-2xl border border-slate-200 font-sans space-y-6 text-left leading-relaxed text-xs sm:text-sm print:p-0 print:border-0 print:shadow-none"
          >
            {/* Resume Header */}
            <div className="border-b border-slate-300 pb-4 space-y-1 text-center">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 uppercase">
                {resume.personalInfo.fullName}
              </h1>
              <p className="text-xs font-semibold text-slate-600">
                {resume.personalInfo.headline}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2.5 text-[11px] text-slate-500 pt-1">
                <span>{resume.personalInfo.location}</span>
                <span>•</span>
                <span>{resume.personalInfo.email}</span>
                <span>•</span>
                <span>{resume.personalInfo.phone}</span>
                {resume.personalInfo.linkedinUrl && (
                  <>
                    <span>•</span>
                    <a href={resume.personalInfo.linkedinUrl} className="text-blue-600 underline">
                      LinkedIn
                    </a>
                  </>
                )}
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-1">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-0.5">
                Professional Summary
              </h2>
              <p className="text-xs text-slate-700 leading-relaxed pt-1">{resume.summary}</p>
            </div>

            {/* Education */}
            <div className="space-y-2">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-0.5">
                Education
              </h2>
              <div className="space-y-2 pt-1">
                {resume.education.map((edu) => (
                  <div key={edu.id} className="flex justify-between items-start text-xs">
                    <div>
                      <strong className="text-slate-900 block font-semibold">{edu.institution}</strong>
                      <span className="text-slate-600">{edu.degree} — {edu.fieldOfStudy}</span>
                    </div>
                    <div className="text-right font-medium text-slate-500 text-[11px]">
                      <span>{edu.startDate} – {edu.endDate}</span>
                      <span className="block font-bold text-slate-700">{edu.grade}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Experience / Projects */}
            <div className="space-y-3">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-0.5">
                Projects & Experience
              </h2>
              <div className="space-y-3 pt-1">
                {resume.projects.map((proj) => (
                  <div key={proj.id} className="space-y-1 text-xs">
                    <div className="flex justify-between items-center">
                      <strong className="text-slate-900 font-semibold">{proj.title}</strong>
                      <span className="text-[11px] font-mono text-slate-500">{proj.techStack}</span>
                    </div>
                    <p className="text-slate-700">{proj.description}</p>
                    {proj.bullets && proj.bullets.length > 0 && (
                      <ul className="list-disc pl-4 space-y-0.5 text-slate-600 text-[11px]">
                        {proj.bullets.map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-1">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-0.5">
                Skills & Competencies
              </h2>
              <div className="text-xs text-slate-700 space-y-1 pt-1">
                <p>
                  <strong className="text-slate-900 font-semibold">Technical: </strong>
                  {resume.skills?.technical?.join(", ") || "Python, React, SQL"}
                </p>
                <p>
                  <strong className="text-slate-900 font-semibold">Languages: </strong>
                  {resume.languages?.join(", ") || "English, Hindi"}
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
