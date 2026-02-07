import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Eye,
  EyeOff,
  Maximize2,
  MonitorOff,
  Lock,
} from "lucide-react";
import type { AntiCheatState, AntiCheatEvent } from "@/hooks/useAntiCheat";

interface AntiCheatOverlayProps {
  state: AntiCheatState;
  onRequestFullscreen: () => void;
  showDetailedStatus?: boolean;
  className?: string;
}

export function AntiCheatOverlay({
  state,
  onRequestFullscreen,
  showDetailedStatus = true,
  className,
}: AntiCheatOverlayProps) {
  const getTrustScoreColor = () => {
    if (state.trustScore >= 80) return "text-success";
    if (state.trustScore >= 50) return "text-warning";
    return "text-danger";
  };

  const getTrustScoreBg = () => {
    if (state.trustScore >= 80) return "bg-success";
    if (state.trustScore >= 50) return "bg-warning";
    return "bg-danger";
  };

  const getStatusIcon = () => {
    if (!state.isActive) return <Shield className="h-4 w-4 text-muted-foreground" />;
    if (state.trustScore >= 80) return <ShieldCheck className="h-4 w-4 text-success" />;
    if (state.trustScore >= 50) return <ShieldAlert className="h-4 w-4 text-warning" />;
    return <ShieldAlert className="h-4 w-4 text-danger" />;
  };

  // Fullscreen enforcement overlay
  if (state.isActive && !state.isFullscreen) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-xl flex items-center justify-center"
      >
        <div className="max-w-md text-center p-8">
          <div className="h-20 w-20 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-6">
            <Maximize2 className="h-10 w-10 text-danger" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Fullscreen Required</h2>
          <p className="text-muted-foreground mb-6">
            This assessment requires fullscreen mode to prevent cheating. 
            Click below to enter fullscreen and continue.
          </p>
          <div className="p-4 rounded-lg bg-danger/10 border border-danger/30 mb-6 text-left">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-danger mt-0.5" />
              <div>
                <p className="text-sm font-medium text-danger">Warning</p>
                <p className="text-sm text-muted-foreground">
                  Exiting fullscreen during the assessment will be logged and may affect your score.
                </p>
              </div>
            </div>
          </div>
          <Button onClick={onRequestFullscreen} size="lg" className="w-full gap-2">
            <Maximize2 className="h-5 w-5" />
            Enter Fullscreen
          </Button>
        </div>
      </motion.div>
    );
  }

  // Status widget
  return (
    <div className={cn("relative", className)}>
      {/* Compact Trust Score Badge */}
      <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50 backdrop-blur-sm border border-border/50">
        {getStatusIcon()}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground flex items-center gap-1">
              <Lock className="h-3 w-3" />
              Trust Score
            </span>
            <span className={cn("font-medium tabular-nums", getTrustScoreColor())}>
              {state.trustScore}%
            </span>
          </div>
          <Progress value={state.trustScore} className={cn("h-1.5", getTrustScoreBg())} />
        </div>
      </div>

      {/* Event indicators */}
      {showDetailedStatus && state.isActive && (
        <div className="mt-2 flex flex-wrap gap-1">
          {/* Fullscreen status */}
          <Badge 
            variant="outline" 
            className={cn(
              "text-xs gap-1",
              state.isFullscreen 
                ? "text-success border-success/30" 
                : "text-danger border-danger/30"
            )}
          >
            {state.isFullscreen ? (
              <Eye className="h-3 w-3" />
            ) : (
              <EyeOff className="h-3 w-3" />
            )}
            {state.isFullscreen ? "Fullscreen" : "Not Fullscreen"}
          </Badge>

          {/* Tab switches */}
          {state.tabSwitchCount > 0 && (
            <Badge variant="outline" className="text-xs gap-1 text-warning border-warning/30">
              <MonitorOff className="h-3 w-3" />
              {state.tabSwitchCount} tab switch{state.tabSwitchCount > 1 ? "es" : ""}
            </Badge>
          )}

          {/* Focus loss */}
          {state.focusLossCount > 0 && (
            <Badge variant="outline" className="text-xs gap-1 text-warning border-warning/30">
              <AlertTriangle className="h-3 w-3" />
              {state.focusLossCount} focus loss
            </Badge>
          )}

          {/* Violations */}
          {state.violations > 3 && (
            <Badge variant="outline" className="text-xs gap-1 text-danger border-danger/30">
              <ShieldAlert className="h-3 w-3" />
              {state.violations} violations
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

// Compact inline status for headers
export function AntiCheatStatusBadge({
  trustScore,
  isActive,
}: {
  trustScore: number;
  isActive: boolean;
}) {
  if (!isActive) return null;

  const getColor = () => {
    if (trustScore >= 80) return "bg-success/10 text-success border-success/30";
    if (trustScore >= 50) return "bg-warning/10 text-warning border-warning/30";
    return "bg-danger/10 text-danger border-danger/30";
  };

  const getIcon = () => {
    if (trustScore >= 80) return <ShieldCheck className="h-3 w-3" />;
    return <ShieldAlert className="h-3 w-3" />;
  };

  return (
    <Badge variant="outline" className={cn("text-xs gap-1", getColor())}>
      {getIcon()}
      {trustScore}%
    </Badge>
  );
}
