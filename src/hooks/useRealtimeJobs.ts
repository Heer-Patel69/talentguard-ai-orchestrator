import { useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

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
  interviewer_id?: string;
  applications_count?: number;
}

interface UseRealtimeJobsOptions {
  userId?: string;
  onInsert?: (job: Job) => void;
  onUpdate?: (job: Job) => void;
  onDelete?: (id: string) => void;
  showToasts?: boolean;
}

export function useRealtimeJobs(options: UseRealtimeJobsOptions = {}) {
  const { userId, onInsert, onUpdate, onDelete, showToasts = true } = options;
  const { toast } = useToast();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const handleChanges = useCallback(
    (payload: RealtimePostgresChangesPayload<Job>) => {
      const { eventType, new: newRecord, old: oldRecord } = payload;

      switch (eventType) {
        case "INSERT":
          if (newRecord && (!userId || newRecord.interviewer_id === userId)) {
            onInsert?.(newRecord as Job);
            if (showToasts) {
              toast({
                title: "New Job Posted",
                description: `"${(newRecord as Job).title}" is now live`,
              });
            }
          }
          break;

        case "UPDATE":
          if (newRecord && (!userId || newRecord.interviewer_id === userId)) {
            onUpdate?.(newRecord as Job);
            if (showToasts) {
              toast({
                title: "Job Updated",
                description: `"${(newRecord as Job).title}" has been updated`,
              });
            }
          }
          break;

        case "DELETE":
          if (oldRecord) {
            onDelete?.((oldRecord as { id: string }).id);
            if (showToasts) {
              toast({
                title: "Job Deleted",
                description: "Job has been removed",
              });
            }
          }
          break;
      }
    },
    [userId, onInsert, onUpdate, onDelete, showToasts, toast]
  );

  useEffect(() => {
    // Create channel with filter if userId is provided
    const channelName = userId ? `jobs-${userId}` : "jobs-all";

    channelRef.current = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "jobs",
          ...(userId ? { filter: `interviewer_id=eq.${userId}` } : {}),
        },
        handleChanges
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("✅ Realtime jobs subscription active");
        }
        if (status === "CHANNEL_ERROR") {
          console.error("❌ Realtime jobs subscription error");
        }
      });

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [userId, handleChanges]);

  return {
    isSubscribed: !!channelRef.current,
  };
}

// Hook for real-time applications updates
interface Application {
  id: string;
  job_id: string;
  candidate_id: string;
  status: string;
  current_round: number | null;
  overall_score: number | null;
  applied_at: string;
}

interface UseRealtimeApplicationsOptions {
  jobId?: string;
  candidateId?: string;
  onInsert?: (app: Application) => void;
  onUpdate?: (app: Application) => void;
  showToasts?: boolean;
}

export function useRealtimeApplications(options: UseRealtimeApplicationsOptions = {}) {
  const { jobId, candidateId, onInsert, onUpdate, showToasts = true } = options;
  const { toast } = useToast();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    const filter = jobId
      ? `job_id=eq.${jobId}`
      : candidateId
      ? `candidate_id=eq.${candidateId}`
      : undefined;

    const channelName = `applications-${jobId || candidateId || "all"}`;

    channelRef.current = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "applications",
          ...(filter ? { filter } : {}),
        },
        (payload) => {
          const { eventType, new: newRecord } = payload;

          if (eventType === "INSERT" && newRecord) {
            onInsert?.(newRecord as Application);
            if (showToasts) {
              toast({
                title: "New Application",
                description: "A candidate has applied",
              });
            }
          }

          if (eventType === "UPDATE" && newRecord) {
            onUpdate?.(newRecord as Application);
          }
        }
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [jobId, candidateId, onInsert, onUpdate, showToasts, toast]);

  return {
    isSubscribed: !!channelRef.current,
  };
}
