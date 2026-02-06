import { cn } from "@/lib/utils";
import { CheckCircle, XCircle, HelpCircle, AlertTriangle } from "lucide-react";

type Decision = "shortlist" | "maybe" | "reject";

interface DecisionBadgeProps {
  decision: Decision;
  confidence?: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const decisionConfig = {
  shortlist: {
    label: "Shortlist",
    description: "Recommended for next stage",
    icon: CheckCircle,
    bgColor: "bg-success/10",
    textColor: "text-success",
    borderColor: "border-success/30",
  },
  maybe: {
    label: "Maybe",
    description: "Needs human review",
    icon: HelpCircle,
    bgColor: "bg-warning/10",
    textColor: "text-warning",
    borderColor: "border-warning/30",
  },
  reject: {
    label: "Reject",
    description: "Below threshold",
    icon: XCircle,
    bgColor: "bg-danger/10",
    textColor: "text-danger",
    borderColor: "border-danger/30",
  },
};

export function DecisionBadge({
  decision,
  confidence,
  size = "md",
  showLabel = true,
}: DecisionBadgeProps) {
  const config = decisionConfig[decision];
  const Icon = config.icon;

  const sizes = {
    sm: {
      padding: "px-2 py-1",
      iconSize: "h-4 w-4",
      textSize: "text-xs",
    },
    md: {
      padding: "px-3 py-1.5",
      iconSize: "h-5 w-5",
      textSize: "text-sm",
    },
    lg: {
      padding: "px-4 py-2",
      iconSize: "h-6 w-6",
      textSize: "text-base",
    },
  };

  const sizeConfig = sizes[size];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border",
        config.bgColor,
        config.borderColor,
        sizeConfig.padding
      )}
    >
      <Icon className={cn(sizeConfig.iconSize, config.textColor)} />
      {showLabel && (
        <span className={cn("font-medium", sizeConfig.textSize, config.textColor)}>
          {config.label}
        </span>
      )}
      {confidence !== undefined && (
        <span className={cn("text-xs opacity-80", config.textColor)}>
          ({(confidence * 100).toFixed(0)}% confident)
        </span>
      )}
    </div>
  );
}

export function DecisionCard({
  decision,
  reason,
  confidence,
}: {
  decision: Decision;
  reason: string;
  confidence?: number;
}) {
  const config = decisionConfig[decision];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "rounded-xl border p-6",
        config.bgColor,
        config.borderColor
      )}
    >
      <div className="flex items-center gap-4">
        <div className={cn("rounded-full p-3", config.bgColor)}>
          <Icon className={cn("h-8 w-8", config.textColor)} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className={cn("text-xl font-bold", config.textColor)}>
              {config.label}
            </h3>
            {confidence !== undefined && (
              <span className="text-sm text-muted-foreground">
                ({(confidence * 100).toFixed(0)}% confidence)
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">{config.description}</p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-current/10">
        <h4 className="text-sm font-medium mb-2">Recommendation Reason</h4>
        <p className="text-sm text-muted-foreground">{reason}</p>
      </div>
    </div>
  );
}
