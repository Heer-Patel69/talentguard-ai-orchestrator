import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModernCandidateCard } from "@/components/dashboard/ModernCandidateCard";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Search,
  Download,
  UserCheck,
  UserX,
  ChevronRight,
  Loader2,
  LayoutGrid,
  List,
  FileDown,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

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
  // New fields for test tracking
  testsCompleted: number;
  testsPassed: number;
  currentRound: number;
  totalRounds: number;
  hasProfile: boolean;
}

const getRoundName = (round: number) => {
  const rounds = ["Applied", "MCQ Assessment", "Coding Challenge", "System Design", "Behavioral", "Final Review", "Completed"];
  return rounds[Math.min(round, rounds.length - 1)] || "Applied";
};

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [jobFilter, setJobFilter] = useState<string>("all");
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [jobs, setJobs] = useState<{ id: string; title: string }[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchCandidates();
    }
  }, [user]);

  const fetchCandidates = async () => {
    try {
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

      const candidateIds = [...new Set((applications || []).map(a => a.candidate_id))];
      
      // Fetch profiles and candidate profiles in parallel
      const [profilesResult, candidateProfilesResult, jobRoundsResult] = await Promise.all([
        supabase
          .from("profiles")
          .select("user_id, full_name, email")
          .in("user_id", candidateIds),
        supabase
          .from("candidate_profiles")
          .select("user_id, phone_number, github_url, linkedin_url, verification_status, profile_score")
          .in("user_id", candidateIds),
        supabase
          .from("job_rounds")
          .select("job_id, round_number")
          .in("job_id", jobIds),
      ]);

      const profiles = profilesResult.data;
      const candidateProfiles = candidateProfilesResult.data;
      const jobRounds = jobRoundsResult.data;

      // Build maps for quick lookup
      const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));
      const candidateProfileMap = new Map((candidateProfiles || []).map(p => [p.user_id, p]));
      
      // Count total rounds per job
      const jobRoundCountMap = new Map<string, number>();
      (jobRounds || []).forEach(jr => {
        const current = jobRoundCountMap.get(jr.job_id) || 0;
        jobRoundCountMap.set(jr.job_id, Math.max(current, jr.round_number));
      });

      const formattedCandidates: Candidate[] = (applications || []).map(app => {
        const profile = profileMap.get(app.candidate_id);
        const candProfile = candidateProfileMap.get(app.candidate_id);
        const fraudFlagsCount = Array.isArray(app.fraud_flags) ? app.fraud_flags.length : 0;
        const totalRounds = jobRoundCountMap.get(app.job_id) || 5;
        const currentRound = app.current_round || 0;
        
        // Calculate tests completed and passed based on current_round
        // Round 0 = just applied, Round 1 = passed 1 assessment, etc.
        const testsCompleted = Math.max(0, currentRound);
        // If still interviewing, passed = completed - 1; if status is shortlisted/hired, passed = completed
        const testsPassed = app.status === 'rejected' 
          ? Math.max(0, testsCompleted - 1) 
          : testsCompleted;

        // Determine name - prioritize profile data, then candidate profile, then email extraction
        let candidateName = profile?.full_name?.trim();
        
        // If no name in profiles, check if we can get it from candidate_profiles
        if (!candidateName && candProfile) {
          // Some systems store name in phone_number field comments or other places
          // For now, try email extraction as fallback
        }
        
        if (!candidateName && profile?.email) {
          // Extract name from email if no full_name - make it more readable
          const emailName = profile.email.split('@')[0];
          // Handle common email patterns: john.doe, john_doe, johndoe
          candidateName = emailName
            .replace(/[._-]/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
        }
        
        // Final check - if still no name, use a more descriptive placeholder
        const displayName = candidateName && candidateName.length > 0 
          ? candidateName 
          : `Applicant #${app.id.slice(0, 6).toUpperCase()}`;
        
        const hasProfile = !!(profile?.full_name?.trim());

        return {
          id: app.id,
          name: displayName,
          email: profile?.email || "No email provided",
          phone: candProfile?.phone_number || "",
          job: (app.jobs as any)?.title || "Unknown",
          jobId: app.job_id,
          stage: getRoundName(currentRound),
          status: app.status || "applied",
          score: app.overall_score || 0,
          aiConfidence: app.ai_confidence || 0,
          fraudFlags: fraudFlagsCount,
          verificationStatus: candProfile?.verification_status || "pending",
          appliedAt: app.applied_at,
          githubUrl: candProfile?.github_url || null,
          linkedinUrl: candProfile?.linkedin_url || null,
          profileScore: candProfile?.profile_score || 0,
          testsCompleted,
          testsPassed,
          currentRound,
          totalRounds,
          hasProfile,
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

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("applications")
        .update({ status: newStatus as any })
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

  const stats = [
    { label: "Total", value: candidates.length, color: "text-foreground" },
    { label: "Interviewing", value: candidates.filter(c => c.status === "interviewing").length, color: "text-warning" },
    { label: "Shortlisted", value: candidates.filter(c => c.status === "shortlisted").length, color: "text-success" },
    { label: "Flagged", value: candidates.filter(c => c.status === "flagged" || c.fraudFlags > 0).length, color: "text-danger" },
    { label: "Rejected", value: candidates.filter(c => c.status === "rejected").length, color: "text-muted-foreground" },
  ];

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
          <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Candidate Review
          </h1>
          <p className="text-muted-foreground">
            Review and manage all candidate applications
          </p>
        </div>
        {selectedCandidates.length > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{selectedCandidates.length} selected</Badge>
            <Button variant="outline" size="sm" onClick={() => bulkAction("shortlisted")}>
              <UserCheck className="mr-1 h-3 w-3" />
              Shortlist
            </Button>
            <Button variant="outline" size="sm" onClick={() => bulkAction("rejected")}>
              <UserX className="mr-1 h-3 w-3" />
              Reject
            </Button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <GlassCard className="text-center py-4">
              <div className={cn("text-3xl font-bold", stat.color)}>{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </GlassCard>
          </motion.div>
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
        <div className="flex items-center gap-1 border rounded-lg p-1">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className="h-8 w-8 p-0"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="h-8 w-8 p-0"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline">
          <FileDown className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Candidates */}
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
        <div className={cn(
          viewMode === "grid" 
            ? "grid gap-4 md:grid-cols-2 xl:grid-cols-3" 
            : "space-y-3"
        )}>
          {filteredCandidates.map((candidate, index) => (
            <ModernCandidateCard
              key={candidate.id}
              id={candidate.id}
              name={candidate.name}
              email={candidate.email}
              job={candidate.job}
              stage={candidate.stage}
              status={candidate.status}
              score={candidate.score}
              profileScore={candidate.profileScore}
              verificationStatus={candidate.verificationStatus}
              githubUrl={candidate.githubUrl}
              linkedinUrl={candidate.linkedinUrl}
              onStatusChange={updateApplicationStatus}
              delay={index * 0.03}
              testsCompleted={candidate.testsCompleted}
              testsPassed={candidate.testsPassed}
              currentRound={candidate.currentRound}
              totalRounds={candidate.totalRounds}
              hasProfile={candidate.hasProfile}
              fraudFlags={candidate.fraudFlags}
            />
          ))}
        </div>
      )}
    </div>
  );
}
