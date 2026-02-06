import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { PageBackground, Container } from "@/components/ui/layout";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Briefcase,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Play,
  Shield,
  Github,
  Linkedin,
  Camera,
} from "lucide-react";

interface CandidateData {
  phone_number: string;
  github_url: string | null;
  linkedin_url: string | null;
  verification_status: string;
  verification_confidence: number | null;
}

export default function CandidateDashboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<{ full_name: string; email: string } | null>(null);
  const [candidateData, setCandidateData] = useState<CandidateData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      const [profileRes, candidateRes] = await Promise.all([
        supabase.from("profiles").select("full_name, email").eq("user_id", user.id).single(),
        supabase.from("candidate_profiles").select("*").eq("user_id", user.id).single(),
      ]);

      if (profileRes.data) setProfile(profileRes.data);
      if (candidateRes.data) setCandidateData(candidateRes.data);
      setIsLoading(false);
    }

    fetchData();
  }, [user]);

  const getVerificationBadge = () => {
    switch (candidateData?.verification_status) {
      case "verified":
        return (
          <span className="flex items-center gap-1 text-success bg-success/10 px-3 py-1 rounded-full text-sm">
            <CheckCircle2 className="h-4 w-4" />
            Verified ({candidateData.verification_confidence}%)
          </span>
        );
      case "manual_review":
        return (
          <span className="flex items-center gap-1 text-warning bg-warning/10 px-3 py-1 rounded-full text-sm">
            <Clock className="h-4 w-4" />
            Pending Review
          </span>
        );
      case "rejected":
        return (
          <span className="flex items-center gap-1 text-danger bg-danger/10 px-3 py-1 rounded-full text-sm">
            <AlertTriangle className="h-4 w-4" />
            Verification Failed
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-muted-foreground bg-secondary px-3 py-1 rounded-full text-sm">
            <Shield className="h-4 w-4" />
            Not Verified
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <PageBackground pattern="dots" />
      <Navbar />

      <Container className="pt-28 pb-12">
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {profile?.full_name?.split(" ")[0]}!
            </h1>
            <p className="text-muted-foreground">
              Manage your profile and track your interview progress
            </p>
          </motion.div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <GlassCard className="h-full">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-primary text-xl font-bold">
                  {profile?.full_name?.split(" ").map(n => n[0]).join("") || "?"}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{profile?.full_name}</h3>
                  <p className="text-sm text-muted-foreground">{profile?.email}</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {getVerificationBadge()}
              </div>

              {candidateData?.verification_status === "pending" && (
                <Button variant="hero" className="w-full" asChild>
                  <Link to="/verify-face">
                    <Camera className="mr-2 h-4 w-4" />
                    Complete Verification
                  </Link>
                </Button>
              )}

              {candidateData?.verification_status === "rejected" && (
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/verify-face">
                    <Camera className="mr-2 h-4 w-4" />
                    Retry Verification
                  </Link>
                </Button>
              )}

              <div className="mt-6 pt-6 border-t border-border space-y-3">
                {candidateData?.github_url && (
                  <a
                    href={candidateData.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <Github className="h-4 w-4" />
                    GitHub Profile
                  </a>
                )}
                {candidateData?.linkedin_url && (
                  <a
                    href={candidateData.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <Linkedin className="h-4 w-4" />
                    LinkedIn Profile
                  </a>
                )}
              </div>
            </GlassCard>
          </motion.div>

          {/* Available Interviews */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <GlassCard>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Available Interviews
                </h3>
              </div>

              {candidateData?.verification_status !== "verified" ? (
                <div className="text-center py-12">
                  <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h4 className="font-medium mb-2">Complete Verification First</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    You need to verify your identity before accessing interviews
                  </p>
                  <Button variant="hero" asChild>
                    <Link to="/verify-face">
                      <Camera className="mr-2 h-4 w-4" />
                      Verify Now
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Mock interview cards */}
                  {[
                    { company: "TechCorp Inc", role: "Senior Frontend Developer", type: "Technical" },
                    { company: "DataFlow AI", role: "Full Stack Engineer", type: "System Design" },
                  ].map((interview, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border"
                    >
                      <div>
                        <h4 className="font-medium">{interview.role}</h4>
                        <p className="text-sm text-muted-foreground">{interview.company}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          {interview.type}
                        </span>
                        <Button size="sm" variant="hero">
                          <Play className="mr-1 h-3 w-3" />
                          Start
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          </motion.div>
        </div>
      </Container>
    </div>
  );
}
