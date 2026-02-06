import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertTriangle, XCircle, Shield } from "lucide-react";

interface ComplianceIndicatorProps {
  score: number; // 0-100
  status: "compliant" | "needs_attention" | "non_compliant" | "pending";
  className?: string;
}

export function ComplianceIndicator({ score, status, className }: ComplianceIndicatorProps) {
  const statusConfig = {
    compliant: {
      icon: CheckCircle2,
      color: "text-success",
      bg: "bg-success/10",
      border: "border-success/30",
      label: "Compliant",
      description: "All fairness metrics are within acceptable thresholds.",
    },
    needs_attention: {
      icon: AlertTriangle,
      color: "text-warning",
      bg: "bg-warning/10",
      border: "border-warning/30",
      label: "Needs Attention",
      description: "Some metrics require review but are not critical.",
    },
    non_compliant: {
      icon: XCircle,
      color: "text-danger",
      bg: "bg-danger/10",
      border: "border-danger/30",
      label: "Non-Compliant",
      description: "Critical fairness issues detected. Immediate action required.",
    },
    pending: {
      icon: Shield,
      color: "text-muted-foreground",
      bg: "bg-muted",
      border: "border-muted",
      label: "Pending Analysis",
      description: "Awaiting sufficient data for fairness analysis.",
    },
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  // Calculate the circumference for the circular progress
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div
      className={cn(
        "rounded-xl border p-6",
        config.border,
        config.bg,
        className
      )}
    >
      <div className="flex items-center gap-6">
        {/* Circular Score Gauge */}
        <div className="relative h-28 w-28 shrink-0">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-secondary"
            />
            {/* Progress circle */}
            <motion.circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              className={config.color}
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("text-2xl font-bold", config.color)}>{score}</span>
            <span className="text-xs text-muted-foreground">/100</span>
          </div>
        </div>

        {/* Status Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <StatusIcon className={cn("h-5 w-5", config.color)} />
            <h3 className={cn("text-lg font-semibold", config.color)}>
              {config.label}
            </h3>
          </div>
          <p className="text-sm text-muted-foreground mb-3">{config.description}</p>
          
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-success" />
              <span>≥85 Compliant</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-warning" />
              <span>60-84 Review</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-danger" />
              <span>&lt;60 Critical</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
