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
  Filter,
  MoreVertical,
  Eye,
  FileText,
  Github,
  Linkedin,
  Mail,
  Phone,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  Download,
  UserCheck,
  UserX,
  ChevronRight,
  Shield,
  Video,
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

// Mock data for now
const mockCandidates = [
  {
    id: "1",
    name: "Sarah Chen",
    email: "sarah.chen@email.com",
    phone: "+91 9876543210",
    job: "Senior Frontend Developer",
    stage: "Technical Round",
    status: "interviewing",
    score: 94,
    aiConfidence: 92,
    fraudFlags: 0,
    verificationStatus: "verified",
    appliedAt: "2024-01-15",
    githubUrl: "https://github.com/sarahchen",
    linkedinUrl: "https://linkedin.com/in/sarahchen",
  },
  {
    id: "2",
    name: "Michael Park",
    email: "michael.park@email.com",
    phone: "+91 9876543211",
    job: "Backend Engineer",
    stage: "System Design",
    status: "interviewing",
    score: 87,
    aiConfidence: 85,
    fraudFlags: 1,
    verificationStatus: "verified",
    appliedAt: "2024-01-14",
    githubUrl: "https://github.com/michaelpark",
    linkedinUrl: "https://linkedin.com/in/michaelpark",
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    email: "emily.r@email.com",
    phone: "+91 9876543212",
    job: "Full Stack Developer",
    stage: "Behavioral",
    status: "flagged",
    score: 56,
    aiConfidence: 45,
    fraudFlags: 3,
    verificationStatus: "manual_review",
    appliedAt: "2024-01-13",
    githubUrl: null,
    linkedinUrl: "https://linkedin.com/in/emilyr",
  },
  {
    id: "4",
    name: "James Wilson",
    email: "james.w@email.com",
    phone: "+91 9876543213",
    job: "DevOps Engineer",
    stage: "Screening",
    status: "applied",
    score: 0,
    aiConfidence: 0,
    fraudFlags: 0,
    verificationStatus: "verified",
    appliedAt: "2024-01-16",
    githubUrl: "https://github.com/jameswilson",
    linkedinUrl: "https://linkedin.com/in/jameswilson",
  },
  {
    id: "5",
    name: "Priya Sharma",
    email: "priya.s@email.com",
    phone: "+91 9876543214",
    job: "Data Scientist",
    stage: "Completed",
    status: "shortlisted",
    score: 91,
    aiConfidence: 94,
    fraudFlags: 0,
    verificationStatus: "verified",
    appliedAt: "2024-01-12",
    githubUrl: "https://github.com/priyasharma",
    linkedinUrl: "https://linkedin.com/in/priyasharma",
  },
  {
    id: "6",
    name: "David Kim",
    email: "david.k@email.com",
    phone: "+91 9876543215",
    job: "ML Engineer",
    stage: "Terminated",
    status: "rejected",
    score: 42,
    aiConfidence: 38,
    fraudFlags: 5,
    verificationStatus: "rejected",
    appliedAt: "2024-01-11",
    githubUrl: null,
    linkedinUrl: null,
  },
];

const statusLabels: Record<string, { label: string; color: string; icon: any }> = {
  applied: { label: "Applied", color: "bg-info/10 text-info", icon: Clock },
  screening: { label: "Screening", color: "bg-primary/10 text-primary", icon: Eye },
  interviewing: { label: "Interviewing", color: "bg-warning/10 text-warning", icon: Video },
  shortlisted: { label: "Shortlisted", color: "bg-success/10 text-success", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "bg-danger/10 text-danger", icon: XCircle },
  flagged: { label: "Flagged", color: "bg-danger/10 text-danger", icon: AlertTriangle },
  hired: { label: "Hired", color: "bg-success/10 text-success", icon: UserCheck },
};

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState(mockCandidates);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [jobFilter, setJobFilter] = useState<string>("all");
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const { toast } = useToast();

  const jobs = [...new Set(mockCandidates.map(c => c.job))];

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = 
      candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.job.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || candidate.status === statusFilter;
    const matchesJob = jobFilter === "all" || candidate.job === jobFilter;
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

  const bulkAction = (action: string) => {
    toast({
      title: `Bulk ${action}`,
      description: `${selectedCandidates.length} candidates ${action}`,
    });
    setSelectedCandidates([]);
  };

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
              <SelectItem key={job} value={job}>{job}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Candidates Table */}
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
                          <Link to={`/report/${candidate.id}`}>
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
                              <Link to={`/report/${candidate.id}`}>
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
                            <DropdownMenuItem>
                              <UserCheck className="mr-2 h-4 w-4" />
                              Shortlist
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <ChevronRight className="mr-2 h-4 w-4" />
                              Move to Next Round
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-danger">
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
    </div>
  );
}
