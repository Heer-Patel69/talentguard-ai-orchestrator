import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface DashboardStats {
  jobsPosted: number;
  totalCandidates: number;
  interviewsCompleted: number;
  avgAIConfidence: number;
  fraudAlerts: number;
  verifiedCandidates: number;
}

export interface FunnelData {
  stage: string;
  count: number;
}

export interface LiveInterview {
  id: string;
  candidateName: string;
  role: string;
  stage: string;
  trustScore: number;
  timeElapsed: string;
  applicationId: string;
}

export interface RecentActivity {
  type: "hired" | "interview" | "applied" | "flagged";
  name: string;
  role: string;
  time: string;
}

export function useDashboardStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["dashboard-stats", user?.id],
    queryFn: async (): Promise<DashboardStats> => {
      if (!user) throw new Error("Not authenticated");

      // Get user's jobs first
      const { data: userJobs, count: jobsCount } = await supabase
        .from("jobs")
        .select("id", { count: "exact" })
        .eq("interviewer_id", user.id);

      const jobIds = (userJobs || []).map(j => j.id);

      if (jobIds.length === 0) {
        return {
          jobsPosted: 0,
          totalCandidates: 0,
          interviewsCompleted: 0,
          avgAIConfidence: 0,
          fraudAlerts: 0,
          verifiedCandidates: 0,
        };
      }

      // Fetch applications for these jobs
      const { data: applications, count: appsCount } = await supabase
        .from("applications")
        .select("id, status, candidate_id, ai_confidence, fraud_flags", { count: "exact" })
        .in("job_id", jobIds);

      const apps = applications || [];
      
      // Count completed interviews (status is 'shortlisted' or 'hired')
      const completedCount = apps.filter(a => 
        a.status === "shortlisted" || a.status === "hired"
      ).length;

      // Calculate average AI confidence
      const appsWithConfidence = apps.filter(a => a.ai_confidence != null);
      const avgConfidence = appsWithConfidence.length > 0
        ? Math.round(appsWithConfidence.reduce((sum, a) => sum + (a.ai_confidence || 0), 0) / appsWithConfidence.length)
        : 0;

      // Count fraud flags
      const fraudCount = apps.filter(a => 
        a.fraud_flags && Array.isArray(a.fraud_flags) && a.fraud_flags.length > 0
      ).length;

      // Get verified candidates
      const candidateIds = [...new Set(apps.map(a => a.candidate_id))];
      let verifiedCount = 0;
      
      if (candidateIds.length > 0) {
        const { data: profiles } = await supabase
          .from("candidate_profiles")
          .select("user_id")
          .in("user_id", candidateIds)
          .eq("verification_status", "verified");
        verifiedCount = profiles?.length || 0;
      }

      return {
        jobsPosted: jobsCount || 0,
        totalCandidates: appsCount || 0,
        interviewsCompleted: completedCount,
        avgAIConfidence: avgConfidence,
        fraudAlerts: fraudCount,
        verifiedCandidates: verifiedCount,
      };
    },
    enabled: !!user,
    staleTime: 30000,
  });
}

export function useHiringFunnel() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["hiring-funnel", user?.id],
    queryFn: async (): Promise<FunnelData[]> => {
      if (!user) throw new Error("Not authenticated");

      // Get user's jobs first
      const { data: userJobs } = await supabase
        .from("jobs")
        .select("id")
        .eq("interviewer_id", user.id);

      const jobIds = (userJobs || []).map(j => j.id);

      if (jobIds.length === 0) {
        return [
          { stage: "Applied", count: 0 },
          { stage: "Screening", count: 0 },
          { stage: "Technical", count: 0 },
          { stage: "Final", count: 0 },
          { stage: "Hired", count: 0 },
        ];
      }

      const { data: applications } = await supabase
        .from("applications")
        .select("status")
        .in("job_id", jobIds);

      const statusCounts: Record<string, number> = {
        applied: 0,
        screening: 0,
        interviewing: 0,
        shortlisted: 0,
        hired: 0,
        rejected: 0,
      };

      (applications || []).forEach((app) => {
        const status = (app.status || "applied").toLowerCase();
        if (status in statusCounts) {
          statusCounts[status]++;
        } else {
          statusCounts.applied++;
        }
      });

      const total = Object.values(statusCounts).reduce((a, b) => a + b, 0) - statusCounts.rejected;

      return [
        { stage: "Applied", count: total },
        { stage: "Screening", count: total - statusCounts.applied },
        { stage: "Technical", count: statusCounts.interviewing + statusCounts.shortlisted + statusCounts.hired },
        { stage: "Final", count: statusCounts.shortlisted + statusCounts.hired },
        { stage: "Hired", count: statusCounts.hired },
      ];
    },
    enabled: !!user,
    staleTime: 30000,
  });
}

export function useLiveInterviews() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["live-interviews", user?.id],
    queryFn: async (): Promise<LiveInterview[]> => {
      if (!user) throw new Error("Not authenticated");

      // Get user's jobs first
      const { data: userJobs } = await supabase
        .from("jobs")
        .select("id, title")
        .eq("interviewer_id", user.id);

      const jobIds = (userJobs || []).map(j => j.id);
      const jobTitles: Record<string, string> = {};
      (userJobs || []).forEach(j => { jobTitles[j.id] = j.title; });

      if (jobIds.length === 0) return [];

      // Get applications that are currently interviewing
      const { data: applications } = await supabase
        .from("applications")
        .select("id, job_id, candidate_id, current_round, ai_confidence, updated_at")
        .in("job_id", jobIds)
        .eq("status", "interviewing")
        .order("updated_at", { ascending: false })
        .limit(5);

      if (!applications?.length) return [];

      const candidateIds = [...new Set(applications.map(a => a.candidate_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", candidateIds);

      const profileMap: Record<string, string> = {};
      (profiles || []).forEach(p => { profileMap[p.user_id] = p.full_name || "Unknown"; });

      return applications.map((app) => {
        const startTime = new Date(app.updated_at);
        const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;

        return {
          id: app.id,
          candidateName: profileMap[app.candidate_id] || "Unknown",
          role: jobTitles[app.job_id] || "Unknown Position",
          stage: `Round ${app.current_round || 1}`,
          trustScore: app.ai_confidence || 85,
          timeElapsed: `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
          applicationId: app.id,
        };
      });
    },
    enabled: !!user,
    refetchInterval: 10000,
  });
}

export function useRecentActivity() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["recent-activity", user?.id],
    queryFn: async (): Promise<RecentActivity[]> => {
      if (!user) throw new Error("Not authenticated");

      // Get user's jobs first
      const { data: userJobs } = await supabase
        .from("jobs")
        .select("id, title")
        .eq("interviewer_id", user.id);

      const jobIds = (userJobs || []).map(j => j.id);
      const jobTitles: Record<string, string> = {};
      (userJobs || []).forEach(j => { jobTitles[j.id] = j.title; });

      if (jobIds.length === 0) return [];

      const { data: recentApps } = await supabase
        .from("applications")
        .select("id, status, updated_at, job_id, candidate_id")
        .in("job_id", jobIds)
        .order("updated_at", { ascending: false })
        .limit(10);

      if (!recentApps?.length) return [];

      const candidateIds = [...new Set(recentApps.map(a => a.candidate_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", candidateIds);

      const profileMap: Record<string, string> = {};
      (profiles || []).forEach(p => { profileMap[p.user_id] = p.full_name || "Unknown"; });

      return recentApps.map((app) => {
        const timeAgo = getTimeAgo(new Date(app.updated_at));
        let type: RecentActivity["type"] = "applied";
        
        if (app.status === "hired") type = "hired";
        else if (app.status === "interviewing") type = "interview";
        else if (app.status === "rejected") type = "flagged";

        return {
          type,
          name: profileMap[app.candidate_id] || "Unknown",
          role: jobTitles[app.job_id] || "Unknown Position",
          time: timeAgo,
        };
      });
    },
    enabled: !!user,
    staleTime: 30000,
  });
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
