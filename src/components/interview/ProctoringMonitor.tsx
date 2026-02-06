import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  Eye,
  EyeOff,
  Users,
  Volume2,
  MonitorOff,
  CheckCircle,
  Shield,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProctoringEvent {
  type: "tab_switch" | "face_not_visible" | "multiple_faces" | "looking_away" | "audio_anomaly" | "copy_paste";
  timestamp: Date;
  severity: "low" | "medium" | "high";
  description: string;
}

interface ProctoringMonitorProps {
  isActive: boolean;
  onEvent: (event: ProctoringEvent) => void;
  onTrustScoreChange?: (score: number) => void;
  className?: string;
}

export function ProctoringMonitor({
  isActive,
  onEvent,
  onTrustScoreChange,
  className,
}: ProctoringMonitorProps) {
  const [trustScore, setTrustScore] = useState(100);
  const [events, setEvents] = useState<ProctoringEvent[]>([]);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const { toast } = useToast();

  const tabSwitchCount = useRef(0);
  const lastTabSwitch = useRef<Date | null>(null);

  // Monitor tab visibility
  useEffect(() => {
    if (!isActive) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        tabSwitchCount.current += 1;
        const now = new Date();
        lastTabSwitch.current = now;

        const event: ProctoringEvent = {
          type: "tab_switch",
          timestamp: now,
          severity: tabSwitchCount.current > 3 ? "high" : tabSwitchCount.current > 1 ? "medium" : "low",
          description: `Tab switched away (${tabSwitchCount.current} times total)`,
        };

        setEvents((prev) => [...prev, event]);
        onEvent(event);

        // Reduce trust score
        const penalty = tabSwitchCount.current > 3 ? 10 : 5;
        setTrustScore((prev) => {
          const newScore = Math.max(0, prev - penalty);
          onTrustScoreChange?.(newScore);
          return newScore;
        });

        // Show warning
        setWarningMessage("Tab switch detected. Please stay focused on the interview.");
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 3000);

        toast({
          title: "⚠️ Tab Switch Detected",
          description: "Please do not switch tabs during the interview.",
          variant: "destructive",
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isActive, onEvent, onTrustScoreChange, toast]);

  // Monitor copy/paste
  useEffect(() => {
    if (!isActive) return;

    const handleCopy = (e: ClipboardEvent) => {
      const event: ProctoringEvent = {
        type: "copy_paste",
        timestamp: new Date(),
        severity: "medium",
        description: "Copy action detected",
      };
      setEvents((prev) => [...prev, event]);
      onEvent(event);
    };

    const handlePaste = (e: ClipboardEvent) => {
      const event: ProctoringEvent = {
        type: "copy_paste",
        timestamp: new Date(),
        severity: "high",
        description: "Paste action detected in code editor",
      };
      setEvents((prev) => [...prev, event]);
      onEvent(event);

      setTrustScore((prev) => {
        const newScore = Math.max(0, prev - 8);
        onTrustScoreChange?.(newScore);
        return newScore;
      });
    };

    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);

    return () => {
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
    };
  }, [isActive, onEvent, onTrustScoreChange]);

  // Monitor keyboard shortcuts that might indicate cheating
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Detect screenshot attempts
      if (e.key === "PrintScreen") {
        e.preventDefault();
        toast({
          title: "Screenshot Blocked",
          description: "Screenshots are not allowed during the interview.",
          variant: "destructive",
        });
      }

      // Detect developer tools
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C")) {
        e.preventDefault();
        const event: ProctoringEvent = {
          type: "tab_switch",
          timestamp: new Date(),
          severity: "high",
          description: "Developer tools shortcut detected",
        };
        setEvents((prev) => [...prev, event]);
        onEvent(event);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isActive, onEvent, toast]);

  const getTrustScoreColor = () => {
    if (trustScore >= 80) return "text-success";
    if (trustScore >= 50) return "text-warning";
    return "text-danger";
  };

  const getTrustScoreBg = () => {
    if (trustScore >= 80) return "bg-success";
    if (trustScore >= 50) return "bg-warning";
    return "bg-danger";
  };

  return (
    <div className={cn("relative", className)}>
      {/* Trust Score Badge */}
      <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50">
        <Shield className={cn("h-4 w-4", getTrustScoreColor())} />
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">Trust Score</span>
            <span className={cn("font-medium", getTrustScoreColor())}>{trustScore}%</span>
          </div>
          <Progress value={trustScore} className={cn("h-1.5", getTrustScoreBg())} />
        </div>
      </div>

      {/* Event indicators */}
      {events.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {tabSwitchCount.current > 0 && (
            <Badge variant="outline" className="text-xs gap-1 text-warning border-warning/30">
              <MonitorOff className="h-3 w-3" />
              {tabSwitchCount.current} tab switch{tabSwitchCount.current > 1 ? "es" : ""}
            </Badge>
          )}
          {events.filter((e) => e.type === "copy_paste").length > 0 && (
            <Badge variant="outline" className="text-xs gap-1 text-warning border-warning/30">
              <AlertTriangle className="h-3 w-3" />
              Paste detected
            </Badge>
          )}
        </div>
      )}

      {/* Warning overlay */}
      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 p-3 rounded-lg bg-danger/90 text-danger-foreground text-sm z-50"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              {warningMessage}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Hook for proctoring in interview context
export function useProctoring(isActive: boolean) {
  const [events, setEvents] = useState<ProctoringEvent[]>([]);
  const [trustScore, setTrustScore] = useState(100);

  const recordEvent = useCallback((event: ProctoringEvent) => {
    setEvents((prev) => [...prev, event]);
  }, []);

  const updateTrustScore = useCallback((score: number) => {
    setTrustScore(score);
  }, []);

  return {
    events,
    trustScore,
    recordEvent,
    updateTrustScore,
  };
}
