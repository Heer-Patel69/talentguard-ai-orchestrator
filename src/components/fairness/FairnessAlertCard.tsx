import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  Bell,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Eye,
  X,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface FairnessAlert {
  id: string;
  category: string;
  groupName: string;
  alertType: string;
  deviationPercentage: number;
  severity: "low" | "medium" | "high" | "critical";
  status: "active" | "acknowledged" | "resolved" | "dismissed";
  description: string;
  suggestedActions: string[];
  createdAt: string;
}

interface FairnessAlertCardProps {
  alert: FairnessAlert;
  onAcknowledge?: (id: string) => void;
  onResolve?: (id: string) => void;
  onDismiss?: (id: string) => void;
  className?: string;
}

export function FairnessAlertCard({
  alert,
  onAcknowledge,
  onResolve,
  onDismiss,
  className,
}: FairnessAlertCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const severityConfig = {
    low: { color: "text-muted-foreground", bg: "bg-muted", border: "border-muted" },
    medium: { color: "text-warning", bg: "bg-warning/10", border: "border-warning/30" },
    high: { color: "text-danger", bg: "bg-danger/10", border: "border-danger/30" },
    critical: { color: "text-danger", bg: "bg-danger/20", border: "border-danger/50" },
  };

  const statusConfig = {
    active: { label: "Active", icon: Bell, color: "bg-danger text-danger-foreground" },
    acknowledged: { label: "Acknowledged", icon: Eye, color: "bg-warning text-warning-foreground" },
    resolved: { label: "Resolved", icon: Check, color: "bg-success text-success-foreground" },
    dismissed: { label: "Dismissed", icon: X, color: "bg-muted text-muted-foreground" },
  };

  const config = severityConfig[alert.severity];
  const statusInfo = statusConfig[alert.status];
  const StatusIcon = statusInfo.icon;

  const formatAlertType = (type: string) => {
    return type.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-xl border bg-card overflow-hidden",
        config.border,
        className
      )}
    >
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <div className={cn("p-4", config.bg)}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className={cn("mt-0.5 p-1.5 rounded-lg", config.bg)}>
                <AlertTriangle className={cn("h-5 w-5", config.color)} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold">{formatAlertType(alert.alertType)}</h4>
                  <Badge variant="outline" className={cn("text-xs", statusInfo.color)}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {statusInfo.label}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {alert.description}
                </p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="font-medium">{alert.category}: {alert.groupName}</span>
                  <span>•</span>
                  <span className={cn("font-semibold", config.color)}>
                    {alert.deviationPercentage > 0 ? "+" : ""}{alert.deviationPercentage.toFixed(1)}% deviation
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTimeAgo(alert.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          </div>
        </div>

        <CollapsibleContent>
          <div className="p-4 border-t border-border space-y-4">
            {alert.suggestedActions.length > 0 && (
              <div>
                <h5 className="text-sm font-medium mb-2">Suggested Actions</h5>
                <ul className="space-y-2">
                  {alert.suggestedActions.map((action, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {alert.status === "active" && (
              <div className="flex items-center gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onAcknowledge?.(alert.id)}
                >
                  <Eye className="h-4 w-4 mr-1.5" />
                  Acknowledge
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDismiss?.(alert.id)}
                >
                  <X className="h-4 w-4 mr-1.5" />
                  Dismiss
                </Button>
              </div>
            )}

            {alert.status === "acknowledged" && (
              <div className="flex items-center gap-2 pt-2">
                <Button
                  size="sm"
                  onClick={() => onResolve?.(alert.id)}
                >
                  <Check className="h-4 w-4 mr-1.5" />
                  Mark Resolved
                </Button>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </motion.div>
  );
}
