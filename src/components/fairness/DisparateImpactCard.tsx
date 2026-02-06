import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DisparateImpactCardProps {
  category: string;
  referenceGroup: string;
  comparedGroup: string;
  impactRatio: number;
  threshold?: number;
  className?: string;
}

export function DisparateImpactCard({
  category,
  referenceGroup,
  comparedGroup,
  impactRatio,
  threshold = 0.8,
  className,
}: DisparateImpactCardProps) {
  const isCompliant = impactRatio >= threshold;
  const isCritical = impactRatio < 0.6;
  const isWarning = impactRatio >= 0.6 && impactRatio < threshold;

  const getStatus = () => {
    if (isCompliant) return { icon: CheckCircle2, color: "text-success", bg: "bg-success/10", label: "Compliant" };
    if (isCritical) return { icon: XCircle, color: "text-danger", bg: "bg-danger/10", label: "Critical" };
    return { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10", label: "Needs Review" };
  };

  const status = getStatus();
  const StatusIcon = status.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "rounded-xl border border-border bg-card p-5 transition-all hover:shadow-md",
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold">{category}</h4>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-sm">
                  Disparate Impact Ratio measures if the selection rate for one group is at least 80% of the rate for the reference group.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <p className="text-sm text-muted-foreground">
            {comparedGroup} vs {referenceGroup}
          </p>
        </div>
        <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", status.bg, status.color)}>
          <StatusIcon className="h-3.5 w-3.5" />
          {status.label}
        </div>
      </div>

      <div className="flex items-end gap-2 mb-4">
        <span className={cn("text-4xl font-bold tabular-nums", status.color)}>
          {(impactRatio * 100).toFixed(1)}%
        </span>
        <span className="text-sm text-muted-foreground mb-1">
          impact ratio
        </span>
      </div>

      {/* Visual gauge */}
      <div className="relative h-2 w-full rounded-full bg-secondary overflow-hidden mb-2">
        {/* Threshold marker */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-foreground z-10"
          style={{ left: `${threshold * 100}%` }}
        />
        
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(impactRatio, 1) * 100}%` }}
          transition={{ duration: 0.5 }}
          className={cn(
            "h-full rounded-full",
            isCompliant ? "bg-success" : isCritical ? "bg-danger" : "bg-warning"
          )}
        />
      </div>

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>0%</span>
        <span className="font-medium">{(threshold * 100).toFixed(0)}% threshold</span>
        <span>100%</span>
      </div>

      {!isCompliant && (
        <div className={cn("mt-4 p-3 rounded-lg", status.bg)}>
          <p className="text-sm">
            <span className="font-medium">Recommended Action:</span>{" "}
            {isCritical
              ? "Review selection criteria immediately. Consider blind evaluation mode."
              : "Monitor closely and consider adjusting scoring weights."}
          </p>
        </div>
      )}
    </motion.div>
  );
}
