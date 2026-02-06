import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrustScoreBadge, RiskMeter } from "@/components/ui/trust-indicators";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Users,
  Search,
  MoreVertical,
  Eye,
  FileText,
  Github,
  Linkedin,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Download,
  UserCheck,
  UserX,
  ChevronRight,
  Shield,
  Video,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  job: string;
  jobId: string;
  stage: string;
  status: string;
  score: number;
  aiConfidence: number;
  fraudFlags: number;
  verificationStatus: string;
  appliedAt: string;
  githubUrl: string | null;
  linkedinUrl: string | null;
  profileScore: number;
}

const statusLabels: Record<string, { label: string; color: string; icon: any }> = {
  applied: { label: "Applied", color: "bg-info/10 text-info", icon: Clock },
  screening: { label: "Screening", color: "bg-primary/10 text-primary", icon: Eye },
  interviewing: { label: "Interviewing", color: "bg-warning/10 text-warning", icon: Video },
  shortlisted: { label: "Shortlisted", color: "bg-success/10 text-success", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "bg-danger/10 text-danger", icon: XCircle },
  flagged: { label: "Flagged", color: "bg-danger/10 text-danger", icon: AlertTriangle },
  hired: { label: "Hired", color: "bg-success/10 text-success", icon: UserCheck },
  completed: { label: "Completed", color: "bg-primary/10 text-primary", icon: CheckCircle2 },
};

const getRoundName = (round: number) => {
  const rounds = ["Screening", "Technical Round", "System Design", "Behavioral", "Final Round", "Completed"];
  return rounds[Math.min(round - 1, rounds.length - 1)] || "Screening";
};

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [jobFilter, setJobFilter] = useState<string>("all");
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [jobs, setJobs] = useState<{ id: string; title: string }[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchCandidates();
    }
  }, [user]);

  const fetchCandidates = async () => {
    try {
      // Get interviewer's jobs
      const { data: jobsData } = await supabase
        .from("jobs")
        .select("id, title")
        .eq("interviewer_id", user!.id);

      setJobs(jobsData || []);
      const jobIds = (jobsData || []).map(j => j.id);

      if (jobIds.length === 0) {
        setCandidates([]);
        setIsLoading(false);
        return;
      }

      // Get applications for those jobs
      const { data: applications, error } = await supabase
        .from("applications")
        .select(`
          id,
          status,
          current_round,
          overall_score,
          ai_confidence,
          fraud_flags,
          applied_at,
          candidate_id,
          job_id,
          jobs!inner(id, title)
        `)
        .in("job_id", jobIds)
        .order("applied_at", { ascending: false });

      if (error) throw error;

      // Get candidate profiles
      const candidateIds = [...new Set((applications || []).map(a => a.candidate_id))];
      
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, email")
        .in("user_id", candidateIds);

      const { data: candidateProfiles } = await supabase
        .from("candidate_profiles")
        .select("user_id, phone_number, github_url, linkedin_url, verification_status, profile_score")
        .in("user_id", candidateIds);

      const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));
      const candidateProfileMap = new Map((candidateProfiles || []).map(p => [p.user_id, p]));

      const formattedCandidates: Candidate[] = (applications || []).map(app => {
        const profile = profileMap.get(app.candidate_id);
        const candProfile = candidateProfileMap.get(app.candidate_id);
        const fraudFlagsCount = Array.isArray(app.fraud_flags) ? app.fraud_flags.length : 0;

        return {
          id: app.id,
          name: profile?.full_name || "Unknown",
          email: profile?.email || "",
          phone: candProfile?.phone_number || "",
          job: (app.jobs as any)?.title || "Unknown",
          jobId: app.job_id,
          stage: getRoundName(app.current_round || 1),
          status: app.status || "applied",
          score: app.overall_score || 0,
          aiConfidence: app.ai_confidence || 0,
          fraudFlags: fraudFlagsCount,
          verificationStatus: candProfile?.verification_status || "pending",
          appliedAt: app.applied_at,
          githubUrl: candProfile?.github_url || null,
          linkedinUrl: candProfile?.linkedin_url || null,
          profileScore: candProfile?.profile_score || 0,
        };
      });

      setCandidates(formattedCandidates);
    } catch (error) {
      console.error("Error fetching candidates:", error);
      toast({
        title: "Error",
        description: "Failed to load candidates",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = 
      candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.job.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || candidate.status === statusFilter;
    const matchesJob = jobFilter === "all" || candidate.jobId === jobFilter;
    return matchesSearch && matchesStatus && matchesJob;
  });

  const toggleSelectAll = () => {
    if (selectedCandidates.length === filteredCandidates.length) {
      setSelectedCandidates([]);
    } else {
      setSelectedCandidates(filteredCandidates.map(c => c.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedCandidates.includes(id)) {
      setSelectedCandidates(selectedCandidates.filter(c => c !== id));
    } else {
      setSelectedCandidates([...selectedCandidates, id]);
    }
  };

  const updateApplicationStatus = async (applicationId: string, newStatus: "applied" | "hired" | "interviewing" | "rejected" | "screening" | "shortlisted" | "withdrawn") => {
    try {
      const { error } = await supabase
        .from("applications")
        .update({ status: newStatus })
        .eq("id", applicationId);

      if (error) throw error;

      setCandidates(prev => 
        prev.map(c => c.id === applicationId ? { ...c, status: newStatus } : c)
      );

      toast({
        title: "Status updated",
        description: `Application ${newStatus}`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const bulkAction = async (action: string) => {
    const newStatus = action === "shortlisted" ? "shortlisted" : action === "rejected" ? "rejected" : "interviewing";
    
    try {
      const { error } = await supabase
        .from("applications")
        .update({ status: newStatus })
        .in("id", selectedCandidates);

      if (error) throw error;

      await fetchCandidates();
      toast({
        title: `Bulk ${action}`,
        description: `${selectedCandidates.length} candidates ${action}`,
      });
      setSelectedCandidates([]);
    } catch (error) {
      console.error("Bulk action error:", error);
      toast({
        title: "Error",
        description: "Failed to perform bulk action",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Candidate Review</h1>
          <p className="text-muted-foreground">
            Review and manage all candidate applications
          </p>
        </div>
        {selectedCandidates.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedCandidates.length} selected
            </span>
            <Button variant="outline" size="sm" onClick={() => bulkAction("shortlisted")}>
              <UserCheck className="mr-1 h-3 w-3" />
              Shortlist
            </Button>
            <Button variant="outline" size="sm" onClick={() => bulkAction("rejected")}>
              <UserX className="mr-1 h-3 w-3" />
              Reject
            </Button>
            <Button variant="outline" size="sm" onClick={() => bulkAction("moved to next round")}>
              <ChevronRight className="mr-1 h-3 w-3" />
              Next Round
            </Button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        {[
          { label: "Total", value: candidates.length, color: "text-foreground" },
          { label: "Interviewing", value: candidates.filter(c => c.status === "interviewing").length, color: "text-warning" },
          { label: "Shortlisted", value: candidates.filter(c => c.status === "shortlisted").length, color: "text-success" },
          { label: "Flagged", value: candidates.filter(c => c.status === "flagged" || c.fraudFlags > 0).length, color: "text-danger" },
          { label: "Rejected", value: candidates.filter(c => c.status === "rejected").length, color: "text-muted-foreground" },
        ].map((stat) => (
          <GlassCard key={stat.label} className="text-center">
            <div className={cn("text-2xl font-bold", stat.color)}>{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </GlassCard>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search candidates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="applied">Applied</SelectItem>
            <SelectItem value="screening">Screening</SelectItem>
            <SelectItem value="interviewing">Interviewing</SelectItem>
            <SelectItem value="shortlisted">Shortlisted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="flagged">Flagged</SelectItem>
          </SelectContent>
        </Select>
        <Select value={jobFilter} onValueChange={setJobFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Job" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Jobs</SelectItem>
            {jobs.map(job => (
              <SelectItem key={job.id} value={job.id}>{job.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Candidates Table */}
      {candidates.length === 0 ? (
        <GlassCard className="py-12 text-center">
          <Users className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No candidates yet</h3>
          <p className="mt-1 text-muted-foreground">
            Candidates will appear here once they apply to your jobs
          </p>
          <Button variant="outline" className="mt-4" asChild>
            <Link to="/dashboard/jobs/new">Post a Job</Link>
          </Button>
        </GlassCard>
      ) : (
        <GlassCard className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-secondary/50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <Checkbox
                      checked={selectedCandidates.length === filteredCandidates.length && filteredCandidates.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Candidate</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Job</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Stage</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Score</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Risk</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCandidates.map((candidate) => {
                  const statusInfo = statusLabels[candidate.status];
                  const StatusIcon = statusInfo?.icon || Clock;

                  return (
                    <motion.tr
                      key={candidate.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-secondary/30"
                    >
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={selectedCandidates.includes(candidate.id)}
                          onCheckedChange={() => toggleSelect(candidate.id)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-primary text-sm font-bold">
                            {candidate.name.split(" ").map(n => n[0]).join("")}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{candidate.name}</span>
                              {candidate.verificationStatus === "verified" && (
                                <Shield className="h-3 w-3 text-success" />
                              )}
                              {candidate.profileScore > 0 && (
                                <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                                  {candidate.profileScore}pts
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{candidate.email}</span>
                              {candidate.githubUrl && (
                                <a href={candidate.githubUrl} target="_blank" rel="noopener noreferrer">
                                  <Github className="h-3 w-3 hover:text-foreground" />
                                </a>
                              )}
                              {candidate.linkedinUrl && (
                                <a href={candidate.linkedinUrl} target="_blank" rel="noopener noreferrer">
                                  <Linkedin className="h-3 w-3 hover:text-foreground" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm">{candidate.job}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm">{candidate.stage}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
                          statusInfo?.color
                        )}>
                          <StatusIcon className="h-3 w-3" />
                          {statusInfo?.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {candidate.score > 0 ? (
                          <TrustScoreBadge score={candidate.score} size="sm" />
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="w-20">
                          <RiskMeter value={candidate.fraudFlags * 20} />
                          {candidate.fraudFlags > 0 && (
                            <span className="text-xs text-danger">{candidate.fraudFlags} flags</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/dashboard/candidates/${candidate.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link to={`/dashboard/candidates/${candidate.id}`}>
                                  <FileText className="mr-2 h-4 w-4" />
                                  View Full Report
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Video className="mr-2 h-4 w-4" />
                                Watch Recording
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="mr-2 h-4 w-4" />
                                Download Resume
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => updateApplicationStatus(candidate.id, "shortlisted")}>
                                <UserCheck className="mr-2 h-4 w-4" />
                                Shortlist
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateApplicationStatus(candidate.id, "interviewing")}>
                                <ChevronRight className="mr-2 h-4 w-4" />
                                Move to Next Round
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-danger"
                                onClick={() => updateApplicationStatus(candidate.id, "rejected")}
                              >
                                <UserX className="mr-2 h-4 w-4" />
                                Reject
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
