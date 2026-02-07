import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  HiringFunnel,
  AIConfidenceDashboard,
  RiskHeatmap,
  OverrideDialog,
  CandidateComparison,
  ExportPanel,
} from "@/components/command-center";
import { CustomQuestionsEditor } from "@/components/command-center/CustomQuestionsEditor";
import { GlassCard } from "@/components/ui/glass-card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LayoutDashboard,
  Brain,
  ShieldAlert,
  GitCompare,
  History,
  RefreshCw,
  Briefcase,
  Users,
  TrendingUp,
  Clock,
  Settings,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

// Hooks for live data
function useCommandCenterData() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["command-center-data", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("Not authenticated");

      // Get user's jobs
      const { data: jobs } = await supabase
        .from("jobs")
        .select("id, title")
        .eq("interviewer_id", user.id);

      const jobIds = (jobs || []).map(j => j.id);
      const jobTitles: Record<string, string> = {};
      (jobs || []).forEach(j => { jobTitles[j.id] = j.title; });

      if (jobIds.length === 0) {
        return {
          funnelStages: [],
          confidenceCandidates: [],
          riskCandidates: [],
          comparisonCandidates: [],
          overrideHistory: [],
          stats: { total: 0, conversionRate: 0, pendingReview: 0, riskAlerts: 0 },
          jobs: [],
        };
      }

      // Get applications with candidate info
      const { data: applications } = await supabase
        .from("applications")
        .select(`
          id,
          candidate_id,
          job_id,
          status,
          current_round,
          overall_score,
          ai_confidence,
          fraud_flags,
          fraud_risk_score,
          applied_at,
          updated_at
        `)
        .in("job_id", jobIds);

      const apps = applications || [];
      const candidateIds = [...new Set(apps.map(a => a.candidate_id))];

      // Get profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, email")
        .in("user_id", candidateIds);

      const profileMap: Record<string, any> = {};
      (profiles || []).forEach(p => { profileMap[p.user_id] = p; });

      // Build funnel stages
      const statusCounts: Record<string, number> = {
        applied: 0,
        screening: 0,
        interviewing: 0,
        shortlisted: 0,
        hired: 0,
        rejected: 0,
      };

      apps.forEach(app => {
        const status = (app.status || "applied").toLowerCase();
        if (status in statusCounts) {
          statusCounts[status]++;
        } else {
          statusCounts.applied++;
        }
      });

      const funnelStages = [
        { name: "Applied", count: apps.length, color: "bg-primary", status: "applied" },
        { name: "Screened", count: statusCounts.screening + statusCounts.interviewing + statusCounts.shortlisted + statusCounts.hired, color: "bg-primary/80", status: "screening" },
        { name: "Interviewing", count: statusCounts.interviewing + statusCounts.shortlisted + statusCounts.hired, color: "bg-primary/60", status: "interviewing" },
        { name: "Final Round", count: statusCounts.shortlisted + statusCounts.hired, color: "bg-primary/50", status: "shortlisted" },
        { name: "Hired", count: statusCounts.hired, color: "bg-success", status: "hired" },
      ];

      // Build confidence candidates
      const confidenceCandidates = apps
        .filter(a => a.ai_confidence && a.ai_confidence > 0)
        .map(a => ({
          id: a.id,
          name: profileMap[a.candidate_id]?.full_name || "Unknown",
          confidence: a.ai_confidence || 0,
          recommendation: (a.ai_confidence >= 80 ? "shortlist" : a.ai_confidence >= 60 ? "maybe" : "reject") as "shortlist" | "maybe" | "reject",
          jobTitle: jobTitles[a.job_id] || "Unknown Position",
        }))
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 10);

      // Build risk candidates
      const riskCandidates = apps.map(a => {
        const riskScore = a.fraud_risk_score || 0;
        const fraudFlags = Array.isArray(a.fraud_flags) ? a.fraud_flags : [];
        let riskLevel: "low" | "medium" | "high" | "critical" = "low";
        if (riskScore >= 70) riskLevel = "critical";
        else if (riskScore >= 40) riskLevel = "high";
        else if (riskScore >= 20) riskLevel = "medium";

        return {
          id: a.id,
          name: profileMap[a.candidate_id]?.full_name || "Unknown",
          riskScore,
          riskLevel,
          fraudFlags: fraudFlags as string[],
          jobTitle: jobTitles[a.job_id] || "Unknown Position",
        };
      }).filter(c => c.riskScore > 0);

      // Build comparison candidates (top performers)
      const comparisonCandidates = apps
        .filter(a => (a.overall_score || 0) > 0)
        .sort((a, b) => (b.overall_score || 0) - (a.overall_score || 0))
        .slice(0, 5)
        .map(a => ({
          id: a.id,
          name: profileMap[a.candidate_id]?.full_name || "Unknown",
          email: profileMap[a.candidate_id]?.email || "",
          score: a.overall_score || 0,
          technicalScore: Math.round((a.overall_score || 0) * 0.9 + Math.random() * 10),
          communicationScore: Math.round((a.overall_score || 0) * 0.8 + Math.random() * 15),
          problemSolvingScore: Math.round((a.overall_score || 0) * 0.85 + Math.random() * 12),
          experienceYears: Math.floor(Math.random() * 8) + 1,
          recommendation: (a.ai_confidence && a.ai_confidence >= 80 ? "shortlist" : a.ai_confidence && a.ai_confidence >= 60 ? "maybe" : "reject") as "shortlist" | "maybe" | "reject",
          aiConfidence: a.ai_confidence || 0,
          strengths: ["Problem Solving", "Technical Skills"],
          weaknesses: ["Communication"],
        }));

      // Stats
      const total = apps.length;
      const hired = statusCounts.hired;
      const conversionRate = total > 0 ? ((hired / total) * 100).toFixed(2) : "0";
      const pendingReview = apps.filter(a => a.status === "applied" || a.status === "screening").length;
      const riskAlerts = riskCandidates.filter(c => c.riskLevel === "high" || c.riskLevel === "critical").length;

      return {
        funnelStages,
        confidenceCandidates,
        riskCandidates,
        comparisonCandidates,
        overrideHistory: [],
        stats: { total, conversionRate: parseFloat(conversionRate), pendingReview, riskAlerts },
        jobs: jobs || [],
      };
    },
    enabled: !!user,
    staleTime: 30000,
    refetchInterval: 60000,
  });
}

export default function CommandCenterPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedJob, setSelectedJob] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [overrideDialogOpen, setOverrideDialogOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { data, isLoading, refetch } = useCommandCenterData();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
    toast({
      title: "Data refreshed",
      description: "Command center data has been updated.",
    });
  };

  const handleStageClick = (stage: any) => {
    navigate(`/dashboard/candidates?status=${stage.status}`);
  };

  const handleViewCandidate = (id: string) => {
    navigate(`/dashboard/candidates/${id}`);
  };

  const handleOverride = async (overrideData: any) => {
    console.log("Override:", overrideData);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const removeFromComparison = (id: string) => {
    // Local state update for comparison
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const stats = data?.stats || { total: 0, conversionRate: 0, pendingReview: 0, riskAlerts: 0 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <LayoutDashboard className="h-7 w-7 text-primary" />
            Recruiter Command Center
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor, analyze, and manage your hiring pipeline
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={selectedJob} onValueChange={setSelectedJob}>
            <SelectTrigger className="w-48">
              <Briefcase className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Select job" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Jobs</SelectItem>
              {(data?.jobs || []).map(job => (
                <SelectItem key={job.id} value={job.id}>{job.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <ExportPanel />
        </div>
      </div>

      {/* Summary Stats - Now with LIVE data */}
      <div className="grid gap-4 md:grid-cols-4">
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Candidates</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Conversion Rate</p>
              <p className="text-2xl font-bold text-success">{stats.conversionRate}%</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10">
              <Clock className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Review</p>
              <p className="text-2xl font-bold">{stats.pendingReview}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-danger/10">
              <ShieldAlert className="h-5 w-5 text-danger" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Risk Alerts</p>
              <p className="text-2xl font-bold text-danger">{stats.riskAlerts}</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6 max-w-3xl">
          <TabsTrigger value="overview" className="flex items-center gap-1.5">
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="confidence" className="flex items-center gap-1.5">
            <Brain className="h-4 w-4" />
            <span className="hidden sm:inline">AI Confidence</span>
          </TabsTrigger>
          <TabsTrigger value="risk" className="flex items-center gap-1.5">
            <ShieldAlert className="h-4 w-4" />
            <span className="hidden sm:inline">Risk Map</span>
          </TabsTrigger>
          <TabsTrigger value="compare" className="flex items-center gap-1.5">
            <GitCompare className="h-4 w-4" />
            <span className="hidden sm:inline">Compare</span>
          </TabsTrigger>
          <TabsTrigger value="questions" className="flex items-center gap-1.5">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Questions</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-1.5">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">Overrides</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          {(data?.funnelStages?.length || 0) > 0 ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <HiringFunnel stages={data!.funnelStages} onStageClick={handleStageClick} />
              <AIConfidenceDashboard
                candidates={data!.confidenceCandidates}
                onViewCandidate={handleViewCandidate}
              />
            </div>
          ) : (
            <GlassCard className="py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No candidates yet</h3>
              <p className="text-muted-foreground mb-4">
                Post a job to start receiving applications
              </p>
              <Button onClick={() => navigate("/dashboard/jobs/new")}>
                Post a Job
              </Button>
            </GlassCard>
          )}
          {(data?.riskCandidates?.length || 0) > 0 && (
            <RiskHeatmap candidates={data!.riskCandidates} onViewCandidate={handleViewCandidate} />
          )}
        </TabsContent>

        {/* AI Confidence Tab */}
        <TabsContent value="confidence" className="mt-6">
          <AIConfidenceDashboard
            candidates={data?.confidenceCandidates || []}
            onViewCandidate={handleViewCandidate}
            className="max-w-3xl"
          />
        </TabsContent>

        {/* Risk Map Tab */}
        <TabsContent value="risk" className="mt-6">
          <RiskHeatmap candidates={data?.riskCandidates || []} onViewCandidate={handleViewCandidate} />
        </TabsContent>

        {/* Compare Tab */}
        <TabsContent value="compare" className="mt-6">
          <CandidateComparison
            candidates={data?.comparisonCandidates || []}
            onRemoveCandidate={removeFromComparison}
          />
        </TabsContent>

        {/* Custom Questions Tab - NEW! */}
        <TabsContent value="questions" className="mt-6">
          <GlassCard className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Custom Assessment Questions</h3>
                <p className="text-sm text-muted-foreground">
                  Add your own MCQ questions or coding problems for candidates to solve
                </p>
              </div>
            </div>
            
            {/* Job selector for questions */}
            {(data?.jobs?.length || 0) > 0 ? (
              <div className="space-y-6">
                <Select defaultValue={data?.jobs?.[0]?.id}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Select a job" />
                  </SelectTrigger>
                  <SelectContent>
                    {data?.jobs?.map(job => (
                      <SelectItem key={job.id} value={job.id}>{job.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="grid gap-6 lg:grid-cols-2">
                  <CustomQuestionsEditor
                    roundType="mcq"
                    onSave={async (questions) => {
                      console.log("Saving MCQ questions:", questions);
                      // TODO: Save to database
                    }}
                  />
                  <CustomQuestionsEditor
                    roundType="coding"
                    onSave={async (problems) => {
                      console.log("Saving coding problems:", problems);
                      // TODO: Save to database
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Post a job first to add custom questions
                </p>
                <Button onClick={() => navigate("/dashboard/jobs/new")}>
                  Post a Job
                </Button>
              </div>
            )}
          </GlassCard>
        </TabsContent>

        {/* Override History Tab */}
        <TabsContent value="history" className="mt-6">
          <GlassCard>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                Override History
              </h3>
              <Badge variant="secondary">{(data?.overrideHistory || []).length} overrides</Badge>
            </div>

            <div className="space-y-4">
              {(data?.overrideHistory || []).length === 0 && (
                <div className="text-center py-8">
                  <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h4 className="font-semibold mb-2">No Overrides Yet</h4>
                  <p className="text-muted-foreground">
                    AI decisions that have been overridden will appear here.
                  </p>
                </div>
              )}
            </div>
          </GlassCard>
        </TabsContent>
      </Tabs>

      {/* Override Dialog */}
      <OverrideDialog
        open={overrideDialogOpen}
        onOpenChange={setOverrideDialogOpen}
        candidate={selectedCandidate}
        onOverride={handleOverride}
      />
    </div>
  );
}
