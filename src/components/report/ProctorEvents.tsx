import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import {
  Shield,
  Eye,
  Users,
  MonitorOff,
  Copy,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProctorEvent {
  id: string;
  type: "gaze" | "face" | "tab" | "paste" | "warning" | "verified";
  timestamp: string;
  description: string;
  severity: "low" | "medium" | "high" | "info";
}

interface ProctorEventsProps {
  events: ProctorEvent[];
  className?: string;
}

export function ProctorEvents({ events, className }: ProctorEventsProps) {
  const getEventIcon = (type: ProctorEvent["type"]) => {
    switch (type) {
      case "gaze":
        return Eye;
      case "face":
        return Users;
      case "tab":
        return MonitorOff;
      case "paste":
        return Copy;
      case "warning":
        return AlertTriangle;
      case "verified":
        return CheckCircle2;
    }
  };

  const getSeverityStyles = (severity: ProctorEvent["severity"]) => {
    switch (severity) {
      case "high":
        return {
          bg: "bg-danger/20",
          border: "border-danger/30",
          icon: "text-danger",
          dot: "bg-danger",
        };
      case "medium":
        return {
          bg: "bg-warning/20",
          border: "border-warning/30",
          icon: "text-warning",
          dot: "bg-warning",
        };
      case "low":
        return {
          bg: "bg-muted/20",
          border: "border-muted/30",
          icon: "text-muted-foreground",
          dot: "bg-muted-foreground",
        };
      case "info":
        return {
          bg: "bg-success/20",
          border: "border-success/30",
          icon: "text-success",
          dot: "bg-success",
        };
    }
  };

  const highSeverityCount = events.filter((e) => e.severity === "high").length;
  const mediumSeverityCount = events.filter((e) => e.severity === "medium").length;

  return (
    <GlassCard className={className}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Proctoring Events</h3>
        </div>
        <div className="flex items-center gap-3 text-sm">
          {highSeverityCount > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-danger/20 px-2 py-0.5 text-danger">
              <AlertTriangle className="h-3 w-3" />
              {highSeverityCount} Critical
            </span>
          )}
          {mediumSeverityCount > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-warning/20 px-2 py-0.5 text-warning">
              <AlertTriangle className="h-3 w-3" />
              {mediumSeverityCount} Warnings
            </span>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-4 top-0 h-full w-px bg-border" />

        <div className="space-y-4">
          {events.map((event, idx) => {
            const Icon = getEventIcon(event.type);
            const styles = getSeverityStyles(event.severity);

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="relative flex gap-4 pl-8"
              >
                {/* Timeline Dot */}
                <div
                  className={cn(
                    "absolute left-2.5 top-2 h-3 w-3 rounded-full",
                    styles.dot
                  )}
                />

                {/* Event Card */}
                <div
                  className={cn(
                    "flex-1 rounded-lg border p-3",
                    styles.bg,
                    styles.border
                  )}
                >
                  <div className="mb-1 flex items-center gap-2">
                    <Icon className={cn("h-4 w-4", styles.icon)} />
                    <span className="font-medium">{event.description}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {event.timestamp}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {events.length === 0 && (
        <div className="py-8 text-center">
          <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-success" />
          <p className="text-sm text-muted-foreground">
            No proctoring issues detected
          </p>
        </div>
      )}
    </GlassCard>
  );
}
