import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  BookOpen,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Save,
  Sparkles,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { getCurrentUser, setCurrentUser, AppUser } from "@/lib/auth/rbac";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — CareerSetu" },
      {
        name: "description",
        content: "Manage your student academic profile, current education level, target career interests, and contact details.",
      },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const currentUser = getCurrentUser();
  const [profile, setProfile] = useState({
    fullName: currentUser.full_name || "Student User",
    email: currentUser.email || "student@careersetu.ai",
    phone: currentUser.phone || "+91 98765 43210",
    city: currentUser.city || "Mumbai",
    state: currentUser.state || "Maharashtra",
    educationLevel: currentUser.current_education || "Graduate (B.Tech CS)",
    stream: "Computer Science & AI",
    targetCareer: "AI & Machine Learning Engineer",
    preferredLanguage: currentUser.preferred_language || "English",
  });

  useEffect(() => {
    const user = getCurrentUser();
    setProfile({
      fullName: user.full_name || "Student User",
      email: user.email || "student@careersetu.ai",
      phone: user.phone || "+91 98765 43210",
      city: user.city || "Mumbai",
      state: user.state || "Maharashtra",
      educationLevel: user.current_education || "Graduate (B.Tech CS)",
      stream: "Computer Science & AI",
      targetCareer: "AI & Machine Learning Engineer",
      preferredLanguage: user.preferred_language || "English",
    });
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser: AppUser = {
      ...currentUser,
      full_name: profile.fullName,
      phone: profile.phone,
      city: profile.city,
      state: profile.state,
      current_education: profile.educationLevel,
      preferred_language: profile.preferredLanguage,
    };
    setCurrentUser(updatedUser);
    toast.success("Profile updated successfully!");
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto py-2">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-foreground flex items-center gap-2">
            <User className="size-5 text-primary" /> My Student Profile
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Personalize your academic background to optimize AI recommendations.
          </p>
        </div>
      </div>

      {/* Profile Completion Bar */}
      <Card className="glass p-5 rounded-3xl border-border/80 shadow-xs bg-card/90 space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Profile Completeness</span>
          <strong className="text-emerald-500 font-bold">92% Completed</strong>
        </div>
        <Progress value={92} className="h-2 rounded-full" />
      </Card>

      {/* Edit Form */}
      <form onSubmit={handleSave}>
        <Card className="glass p-6 sm:p-8 rounded-3xl border-border/80 shadow-md bg-card/90 space-y-5">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
            <GraduationCap className="size-4 text-primary" /> Academic & Personal Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-muted-foreground block mb-1">Full Legal Name</label>
              <Input
                value={profile.fullName}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                className="rounded-xl h-10"
                required
              />
            </div>

            <div>
              <label className="font-semibold text-muted-foreground block mb-1">Email Address</label>
              <Input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="rounded-xl h-10"
                required
              />
            </div>

            <div>
              <label className="font-semibold text-muted-foreground block mb-1">Phone Number</label>
              <Input
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="rounded-xl h-10"
              />
            </div>

            <div>
              <label className="font-semibold text-muted-foreground block mb-1">Current Education Level</label>
              <Select
                value={profile.educationLevel}
                onValueChange={(val) => setProfile({ ...profile, educationLevel: val })}
              >
                <SelectTrigger className="rounded-xl h-10 bg-background text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="class_10" className="text-xs">Class 10 (Secondary)</SelectItem>
                  <SelectItem value="class_12" className="text-xs">Class 12 (Higher Secondary)</SelectItem>
                  <SelectItem value="diploma" className="text-xs">Polytechnic Diploma</SelectItem>
                  <SelectItem value="graduate" className="text-xs">Undergraduate / Bachelor's</SelectItem>
                  <SelectItem value="post_graduate" className="text-xs">Postgraduate / Master's</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="font-semibold text-muted-foreground block mb-1">City</label>
              <Input
                value={profile.city}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                className="rounded-xl h-10"
              />
            </div>

            <div>
              <label className="font-semibold text-muted-foreground block mb-1">State</label>
              <Input
                value={profile.state}
                onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                className="rounded-xl h-10"
              />
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-border">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Sparkles className="size-4 text-primary" /> Career Aspirations
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">Academic Stream</label>
                <Input
                  value={profile.stream}
                  onChange={(e) => setProfile({ ...profile, stream: e.target.value })}
                  className="rounded-xl h-10"
                />
              </div>

              <div>
                <label className="font-semibold text-muted-foreground block mb-1">Primary Target Career</label>
                <Input
                  value={profile.targetCareer}
                  onChange={(e) => setProfile({ ...profile, targetCareer: e.target.value })}
                  className="rounded-xl h-10"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border">
            <Button
              type="submit"
              size="sm"
              className="gradient-brand text-primary-foreground font-bold rounded-xl shadow-glow cursor-pointer gap-1.5"
            >
              <Save className="size-4" /> Save Profile Changes
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
