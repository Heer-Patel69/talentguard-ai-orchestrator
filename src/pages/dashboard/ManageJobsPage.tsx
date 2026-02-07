import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeJobs } from "@/hooks/useRealtimeJobs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Briefcase,
  Plus,
  Search,
  MoreVertical,
  Users,
  Clock,
  MapPin,
  Edit,
  Trash2,
  Pause,
  Play,
  Copy,
  Wifi,
  WifiOff,
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
import { Badge } from "@/components/ui/badge";

interface Job {
  id: string;
  title: string;
  field: string;
  experience_level: string;
  location_type: string;
  location_city: string | null;
  status: string;
  num_rounds: number;
  created_at: string;
  application_deadline: string | null;
  applications_count?: number;
}

const statusColors = {
  active: "bg-success/10 text-success border-success/30",
  draft: "bg-warning/10 text-warning border-warning/30",
  closed: "bg-secondary text-muted-foreground border-border",
  paused: "bg-info/10 text-info border-info/30",
};

export default function ManageJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { user } = useAuth();
  const { toast } = useToast();

  // Real-time subscription for live updates
  const handleJobInsert = useCallback((newJob: Job) => {
    setJobs((prev) => [{ ...newJob, applications_count: 0 }, ...prev]);
  }, []);

  const handleJobUpdate = useCallback((updatedJob: Job) => {
    setJobs((prev) =>
      prev.map((job) =>
        job.id === updatedJob.id ? { ...job, ...updatedJob } : job
      )
    );
  }, []);

  const handleJobDelete = useCallback((deletedId: string) => {
    setJobs((prev) => prev.filter((job) => job.id !== deletedId));
  }, []);

  const { isSubscribed } = useRealtimeJobs({
    userId: user?.id,
    onInsert: handleJobInsert,
    onUpdate: handleJobUpdate,
    onDelete: handleJobDelete,
    showToasts: false, // We handle toasts manually
  });

  useEffect(() => {
    fetchJobs();
  }, [user]);

  const fetchJobs = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("jobs")
        .select(`
          *,
          applications:applications(count)
        `)
        .eq("interviewer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const jobsWithCount = data.map((job: any) => ({
        ...job,
        applications_count: job.applications?.[0]?.count || 0,
      }));

      setJobs(jobsWithCount);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateJobStatus = async (jobId: string, newStatus: "active" | "closed" | "draft" | "paused") => {
    try {
      const { error } = await supabase
        .from("jobs")
        .update({ status: newStatus })
        .eq("id", jobId);

      if (error) throw error;

      setJobs(jobs.map(job => 
        job.id === jobId ? { ...job, status: newStatus } : job
      ));

      toast({
        title: "Job updated",
        description: `Job status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error("Error updating job:", error);
      toast({
        title: "Error",
        description: "Failed to update job status",
        variant: "destructive",
      });
    }
  };

  const deleteJob = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job?")) return;

    try {
      const { error } = await supabase
        .from("jobs")
        .delete()
        .eq("id", jobId);

      if (error) throw error;

      setJobs(jobs.filter(job => job.id !== jobId));

      toast({
        title: "Job deleted",
        description: "The job has been permanently deleted",
      });
    } catch (error) {
      console.error("Error deleting job:", error);
      toast({
        title: "Error",
        description: "Failed to delete job",
        variant: "destructive",
      });
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.field.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const experienceLevelLabels: Record<string, string> = {
    fresher: "Fresher",
    junior: "Junior",
    mid: "Mid-Level",
    senior: "Senior",
    architect: "Architect",
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Manage Jobs</h1>
            <Badge
              variant="outline"
              className={cn(
                "gap-1",
                isSubscribed
                  ? "text-success border-success/30"
                  : "text-muted-foreground"
              )}
            >
              {isSubscribed ? (
                <>
                  <Wifi className="h-3 w-3" />
                  Live
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3" />
                  Offline
                </>
              )}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            View and manage all your job postings (updates in real-time)
          </p>
        </div>
        <Button variant="hero" asChild>
          <Link to="/dashboard/jobs/new">
            <Plus className="mr-2 h-4 w-4" />
            Post New Job
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Total Jobs", value: jobs.length, icon: Briefcase },
          { label: "Active", value: jobs.filter(j => j.status === "active").length, icon: Play },
          { label: "Total Applications", value: jobs.reduce((acc, j) => acc + (j.applications_count || 0), 0), icon: Users },
          { label: "Draft", value: jobs.filter(j => j.status === "draft").length, icon: Edit },
        ].map((stat) => (
          <GlassCard key={stat.label} className="flex items-center gap-4">
            <div className="rounded-lg bg-primary/10 p-2">
              <stat.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search jobs..."
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
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Jobs List */}
      {filteredJobs.length === 0 ? (
        <GlassCard className="py-12 text-center">
          <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No jobs found</h3>
          <p className="mt-1 text-muted-foreground">
            {jobs.length === 0 
              ? "Get started by posting your first job"
              : "Try adjusting your search or filters"
            }
          </p>
          {jobs.length === 0 && (
            <Button variant="hero" className="mt-4" asChild>
              <Link to="/dashboard/jobs/new">
                <Plus className="mr-2 h-4 w-4" />
                Post a Job
              </Link>
            </Button>
          )}
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <GlassCard hover className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Briefcase className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{job.title}</h3>
                        <span className={cn(
                          "rounded-full border px-2 py-0.5 text-xs font-medium capitalize",
                          statusColors[job.status as keyof typeof statusColors] || statusColors.draft
                        )}>
                          {job.status}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span>{job.field}</span>
                        <span>•</span>
                        <span>{experienceLevelLabels[job.experience_level]}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {job.location_type === "remote" 
                            ? "Remote" 
                            : job.location_city || job.location_type
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <div className="font-semibold">{job.applications_count}</div>
                      <div className="text-muted-foreground">Applicants</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">{job.num_rounds}</div>
                      <div className="text-muted-foreground">Rounds</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-xs">{formatDate(job.created_at)}</div>
                      <div className="text-muted-foreground">Posted</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/dashboard/jobs/${job.id}/applicants`}>
                        <Users className="mr-1 h-3 w-3" />
                        View Applicants
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
                          <Link to={`/dashboard/jobs/${job.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Job
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {job.status === "active" ? (
                          <DropdownMenuItem onClick={() => updateJobStatus(job.id, "paused")}>
                            <Pause className="mr-2 h-4 w-4" />
                            Pause Job
                          </DropdownMenuItem>
                        ) : job.status === "paused" ? (
                          <DropdownMenuItem onClick={() => updateJobStatus(job.id, "active")}>
                            <Play className="mr-2 h-4 w-4" />
                            Activate Job
                          </DropdownMenuItem>
                        ) : null}
                        {job.status !== "closed" && (
                          <DropdownMenuItem onClick={() => updateJobStatus(job.id, "closed")}>
                            <Clock className="mr-2 h-4 w-4" />
                            Close Job
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => deleteJob(job.id)}
                          className="text-danger focus:text-danger"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Job
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
