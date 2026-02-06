import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Mail,
  Phone,
  Github,
  Linkedin,
  FileText,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Upload,
  Save,
  Loader2,
  ExternalLink,
  Zap,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface Profile {
  full_name: string;
  email: string;
}

interface CandidateProfile {
  phone_number: string;
  github_url: string | null;
  linkedin_url: string | null;
  resume_url: string | null;
  verification_status: string;
  verification_confidence: number | null;
}

export default function CandidateProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [candidateProfile, setCandidateProfile] = useState<CandidateProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  // AI-extracted skills (mock data for now)
  const extractedSkills = [
    "JavaScript",
    "TypeScript",
    "React",
    "Node.js",
    "Python",
    "SQL",
    "Git",
    "Docker",
    "AWS",
    "REST APIs",
  ];

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      // Fetch base profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("user_id", user!.id)
        .maybeSingle();

      // Fetch candidate profile
      const { data: candidateData } = await supabase
        .from("candidate_profiles")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();

      setProfile(profileData);
      setCandidateProfile(candidateData);

      if (profileData) {
        setFullName(profileData.full_name);
      }
      if (candidateData) {
        setPhoneNumber(candidateData.phone_number);
        setGithubUrl(candidateData.github_url || "");
        setLinkedinUrl(candidateData.linkedin_url || "");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      // Update base profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ full_name: fullName })
        .eq("user_id", user.id);

      if (profileError) throw profileError;

      // Update candidate profile
      const updateData: any = {
        phone_number: phoneNumber,
        github_url: githubUrl || null,
        linkedin_url: linkedinUrl || null,
      };

      // Handle resume upload
      if (resumeFile) {
        const fileExt = resumeFile.name.split(".").pop();
        const filePath = `${user.id}/resume.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("resumes")
          .upload(filePath, resumeFile, { upsert: true });

        if (uploadError) throw uploadError;
        updateData.resume_url = filePath;
      }

      const { error: candidateError } = await supabase
        .from("candidate_profiles")
        .update(updateData)
        .eq("user_id", user.id);

      if (candidateError) throw candidateError;

      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully.",
      });

      fetchProfile();
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Resume must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setResumeFile(file);
  };

  const getVerificationBadge = () => {
    if (!candidateProfile) return null;

    const badges = {
      verified: {
        icon: ShieldCheck,
        label: "Identity Verified",
        description: "Your identity has been verified",
        color: "text-success bg-success/10 border-success/30",
      },
      pending: {
        icon: Shield,
        label: "Verification Pending",
        description: "Complete verification to apply for jobs",
        color: "text-warning bg-warning/10 border-warning/30",
      },
      manual_review: {
        icon: ShieldAlert,
        label: "Under Review",
        description: "Your verification is being reviewed manually",
        color: "text-info bg-info/10 border-info/30",
      },
      rejected: {
        icon: ShieldAlert,
        label: "Verification Failed",
        description: "Please try verifying again",
        color: "text-danger bg-danger/10 border-danger/30",
      },
    };

    return badges[candidateProfile.verification_status as keyof typeof badges] || badges.pending;
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-success border-t-transparent" />
      </div>
    );
  }

  const verificationBadge = getVerificationBadge();
  const VerificationIcon = verificationBadge?.icon || Shield;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">
          Manage your personal information and preferences
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <GlassCard>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-success" />
              Personal Information
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    value={profile?.email || ""}
                    disabled
                    className="pl-9 bg-secondary/50"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="phone"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Professional Links */}
          <GlassCard>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ExternalLink className="h-5 w-5 text-success" />
              Professional Links
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="github">GitHub Profile</Label>
                <div className="relative mt-1">
                  <Github className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="github"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/username"
                    className="pl-9"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="linkedin">LinkedIn Profile</Label>
                <div className="relative mt-1">
                  <Linkedin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="linkedin"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Resume */}
          <GlassCard>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-success" />
              Resume
            </h2>

            <div className="space-y-4">
              {candidateProfile?.resume_url && (
                <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-success" />
                    <div>
                      <p className="font-medium">Current Resume</p>
                      <p className="text-sm text-muted-foreground">
                        {candidateProfile.resume_url.split("/").pop()}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={supabase.storage
                        .from("resumes")
                        .getPublicUrl(candidateProfile.resume_url).data.publicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View
                    </a>
                  </Button>
                </div>
              )}

              <label className="cursor-pointer block">
                <div
                  className={cn(
                    "flex items-center justify-center gap-3 p-6 rounded-lg border-2 border-dashed transition-colors",
                    resumeFile
                      ? "border-success bg-success/10"
                      : "border-border hover:border-success hover:bg-success/5"
                  )}
                >
                  {resumeFile ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-success" />
                      <span className="text-sm">{resumeFile.name}</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Upload new resume (PDF only, max 5MB)
                      </span>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleResumeChange}
                />
              </label>
            </div>
          </GlassCard>

          {/* Save Button */}
          <Button
            className="w-full bg-success hover:bg-success/90"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Verification Status */}
          <GlassCard>
            <h2 className="text-lg font-semibold mb-4">Verification Status</h2>
            <div
              className={cn(
                "rounded-lg border p-4",
                verificationBadge?.color
              )}
            >
              <div className="flex items-center gap-3">
                <VerificationIcon className="h-6 w-6" />
                <div>
                  <p className="font-medium">{verificationBadge?.label}</p>
                  <p className="text-sm opacity-80">{verificationBadge?.description}</p>
                </div>
              </div>
              {candidateProfile?.verification_confidence && (
                <div className="mt-3 pt-3 border-t border-current/20">
                  <div className="flex items-center justify-between text-sm">
                    <span>Confidence Score</span>
                    <span className="font-semibold">
                      {(candidateProfile.verification_confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
            {candidateProfile?.verification_status !== "verified" && (
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link to="/verify-face">Complete Verification</Link>
              </Button>
            )}
          </GlassCard>

          {/* Skills */}
          <GlassCard>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-success" />
              Skills (AI Extracted)
            </h2>
            <p className="text-xs text-muted-foreground mb-3">
              These skills were automatically extracted from your resume.
            </p>
            <div className="flex flex-wrap gap-2">
              {extractedSkills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-success/10 px-3 py-1 text-sm font-medium text-success"
                >
                  {skill}
                </span>
              ))}
            </div>
          </GlassCard>

          {/* Profile Completion */}
          <GlassCard>
            <h2 className="text-lg font-semibold mb-4">Profile Completion</h2>
            <div className="space-y-3">
              {[
                { label: "Basic Info", completed: !!fullName && !!phoneNumber },
                { label: "Resume Uploaded", completed: !!candidateProfile?.resume_url },
                { label: "GitHub Connected", completed: !!githubUrl },
                { label: "LinkedIn Connected", completed: !!linkedinUrl },
                { label: "Identity Verified", completed: candidateProfile?.verification_status === "verified" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-sm">
                  {item.completed ? (
                    <CheckCircle className="h-4 w-4 text-success" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className={item.completed ? "text-foreground" : "text-muted-foreground"}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
