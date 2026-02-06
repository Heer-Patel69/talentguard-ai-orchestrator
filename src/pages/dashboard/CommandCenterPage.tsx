import { useState } from "react";
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
import { GlassCard } from "@/components/ui/glass-card";
import {
  LayoutDashboard,
  Brain,
  ShieldAlert,
  GitCompare,
  History,
  RefreshCw,
  Filter,
  Briefcase,
  Users,
  TrendingUp,
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Mock data for demonstration
const mockFunnelStages = [
  { name: "Applied", count: 523, color: "bg-primary", status: "applied" },
  { name: "Screened", count: 387, color: "bg-primary/80", status: "screened" },
  { name: "Round 1", count: 245, color: "bg-primary/60", status: "round_1" },
  { name: "Round 2", count: 156, color: "bg-primary/50", status: "round_2" },
  { name: "Final Round", count: 89, color: "bg-primary/40", status: "final" },
  { name: "Shortlisted", count: 42, color: "bg-success", status: "shortlisted" },
];

const mockConfidenceCandidates = [
  { id: "1", name: "Rahul Sharma", confidence: 92, recommendation: "shortlist" as const, jobTitle: "Senior Developer" },
  { id: "2", name: "Priya Patel", confidence: 88, recommendation: "shortlist" as const, jobTitle: "Data Scientist" },
  { id: "3", name: "Amit Kumar", confidence: 75, recommendation: "maybe" as const, jobTitle: "DevOps Engineer" },
  { id: "4", name: "Sneha Gupta", confidence: 65, recommendation: "maybe" as const, jobTitle: "Senior Developer" },
  { id: "5", name: "Vikram Singh", confidence: 58, recommendation: "reject" as const, jobTitle: "Frontend Developer" },
  { id: "6", name: "Anjali Desai", confidence: 94, recommendation: "shortlist" as const, jobTitle: "Tech Lead" },
  { id: "7", name: "Rajesh Nair", confidence: 45, recommendation: "reject" as const, jobTitle: "Junior Developer" },
  { id: "8", name: "Kavita Mehta", confidence: 82, recommendation: "shortlist" as const, jobTitle: "Data Scientist" },
];

const mockRiskCandidates = [
  { id: "1", name: "Rahul Sharma", riskScore: 5, riskLevel: "low" as const, fraudFlags: [], jobTitle: "Senior Developer" },
  { id: "2", name: "Priya Patel", riskScore: 12, riskLevel: "low" as const, fraudFlags: [], jobTitle: "Data Scientist" },
  { id: "3", name: "Amit Kumar", riskScore: 35, riskLevel: "medium" as const, fraudFlags: ["Inconsistent answers"], jobTitle: "DevOps Engineer" },
  { id: "4", name: "Sneha Gupta", riskScore: 8, riskLevel: "low" as const, fraudFlags: [], jobTitle: "Senior Developer" },
  { id: "5", name: "Vikram Singh", riskScore: 72, riskLevel: "high" as const, fraudFlags: ["Tab switching", "Eye movement"], jobTitle: "Frontend Developer" },
  { id: "6", name: "Anjali Desai", riskScore: 3, riskLevel: "low" as const, fraudFlags: [], jobTitle: "Tech Lead" },
  { id: "7", name: "Rajesh Nair", riskScore: 88, riskLevel: "critical" as const, fraudFlags: ["Audio anomaly", "Face mismatch", "Tab switching"], jobTitle: "Junior Developer" },
  { id: "8", name: "Kavita Mehta", riskScore: 15, riskLevel: "low" as const, fraudFlags: [], jobTitle: "Data Scientist" },
];

const mockComparisonCandidates = [
  {
    id: "1",
    name: "Rahul Sharma",
    email: "rahul@email.com",
    score: 85,
    technicalScore: 92,
    communicationScore: 78,
    problemSolvingScore: 88,
    experienceYears: 6,
    recommendation: "shortlist" as const,
    aiConfidence: 92,
    strengths: ["DSA", "System Design", "Leadership"],
    weaknesses: ["Communication", "Documentation"],
  },
  {
    id: "2",
    name: "Priya Patel",
    email: "priya@email.com",
    score: 82,
    technicalScore: 88,
    communicationScore: 85,
    problemSolvingScore: 80,
    experienceYears: 5,
    recommendation: "shortlist" as const,
    aiConfidence: 88,
    strengths: ["ML/AI", "Python", "Communication"],
    weaknesses: ["System Design", "Low-level coding"],
  },
  {
    id: "6",
    name: "Anjali Desai",
    email: "anjali@email.com",
    score: 91,
    technicalScore: 94,
    communicationScore: 90,
    problemSolvingScore: 92,
    experienceYears: 8,
    recommendation: "shortlist" as const,
    aiConfidence: 94,
    strengths: ["Architecture", "Mentoring", "Full Stack"],
    weaknesses: ["DevOps"],
  },
];

const mockOverrideHistory = [
  {
    id: "1",
    candidateName: "Vikram Singh",
    originalDecision: "reject",
    newDecision: "hold",
    reason: "Strong referral from existing employee. Recommend second technical interview to verify skills.",
    overriddenBy: "HR Manager",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    candidateName: "Amit Kumar",
    originalDecision: "maybe",
    newDecision: "shortlist",
    reason: "Exceptional problem-solving in final round compensates for lower communication score.",
    overriddenBy: "Tech Lead",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

export default function CommandCenterPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedJob, setSelectedJob] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [overrideDialogOpen, setOverrideDialogOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [comparisonCandidates, setComparisonCandidates] = useState(mockComparisonCandidates);
  const navigate = useNavigate();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsRefreshing(false);
  };

  const handleStageClick = (stage: any) => {
    console.log("View candidates at stage:", stage.name);
    navigate(`/dashboard/candidates?status=${stage.status}`);
  };

  const handleViewCandidate = (id: string) => {
    navigate(`/dashboard/candidates/${id}`);
  };

  const handleOverride = async (data: any) => {
    console.log("Override:", data);
    // In a real implementation, this would save to the database
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const removeFromComparison = (id: string) => {
    setComparisonCandidates((prev) => prev.filter((c) => c.id !== id));
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
              <SelectItem value="senior-dev">Senior Developer</SelectItem>
              <SelectItem value="data-scientist">Data Scientist</SelectItem>
              <SelectItem value="devops">DevOps Engineer</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <ExportPanel />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Candidates</p>
              <p className="text-2xl font-bold">523</p>
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
              <p className="text-2xl font-bold text-success">8.03%</p>
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
              <p className="text-2xl font-bold">24</p>
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
              <p className="text-2xl font-bold text-danger">3</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 max-w-2xl">
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
          <TabsTrigger value="history" className="flex items-center gap-1.5">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">Overrides</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <HiringFunnel stages={mockFunnelStages} onStageClick={handleStageClick} />
            <AIConfidenceDashboard
              candidates={mockConfidenceCandidates}
              onViewCandidate={handleViewCandidate}
            />
          </div>
          <RiskHeatmap candidates={mockRiskCandidates} onViewCandidate={handleViewCandidate} />
        </TabsContent>

        {/* AI Confidence Tab */}
        <TabsContent value="confidence" className="mt-6">
          <AIConfidenceDashboard
            candidates={mockConfidenceCandidates}
            onViewCandidate={handleViewCandidate}
            className="max-w-3xl"
          />
        </TabsContent>

        {/* Risk Map Tab */}
        <TabsContent value="risk" className="mt-6">
          <RiskHeatmap candidates={mockRiskCandidates} onViewCandidate={handleViewCandidate} />
        </TabsContent>

        {/* Compare Tab */}
        <TabsContent value="compare" className="mt-6">
          <CandidateComparison
            candidates={comparisonCandidates}
            onRemoveCandidate={removeFromComparison}
          />
        </TabsContent>

        {/* Override History Tab */}
        <TabsContent value="history" className="mt-6">
          <GlassCard>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                Override History
              </h3>
              <Badge variant="secondary">{mockOverrideHistory.length} overrides</Badge>
            </div>

            <div className="space-y-4">
              {mockOverrideHistory.map((override) => (
                <motion.div
                  key={override.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg border border-border bg-secondary/30"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">{override.candidateName}</h4>
                      <p className="text-sm text-muted-foreground">
                        Overridden by {override.overriddenBy} • {formatTimeAgo(override.timestamp)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={
                          override.originalDecision === "reject"
                            ? "bg-danger/10 text-danger"
                            : "bg-warning/10 text-warning"
                        }
                      >
                        {override.originalDecision}
                      </Badge>
                      <span className="text-muted-foreground">→</span>
                      <Badge
                        variant="outline"
                        className={
                          override.newDecision === "shortlist"
                            ? "bg-success/10 text-success"
                            : "bg-warning/10 text-warning"
                        }
                      >
                        {override.newDecision}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    "{override.reason}"
                  </p>
                </motion.div>
              ))}

              {mockOverrideHistory.length === 0 && (
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
