import { cn } from "@/lib/utils";

interface TrustScoreBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function TrustScoreBadge({
  score,
  size = "md",
  showLabel = true,
}: TrustScoreBadgeProps) {
  const getTrustLevel = (score: number) => {
    if (score >= 80) return { level: "high", label: "Trusted", color: "trust-high" };
    if (score >= 50) return { level: "medium", label: "Moderate", color: "trust-medium" };
    return { level: "low", label: "At Risk", color: "trust-low" };
  };

  const { label, color } = getTrustLevel(score);

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border font-medium",
        color,
        sizeClasses[size]
      )}
    >
      <span className="font-bold">{score}%</span>
      {showLabel && <span className="opacity-80">{label}</span>}
    </span>
  );
}

interface RiskMeterProps {
  value: number;
  className?: string;
}

export function RiskMeter({ value, className }: RiskMeterProps) {
  const getColor = (value: number) => {
    if (value <= 30) return "bg-success";
    if (value <= 60) return "bg-warning";
    return "bg-danger";
  };

  return (
    <div className={cn("risk-meter", className)}>
      <div
        className={cn("risk-meter-fill", getColor(value))}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

interface ProctorStatusBadgeProps {
  status: "active" | "warning" | "alert";
  label: string;
}

export function ProctorStatusBadge({ status, label }: ProctorStatusBadgeProps) {
  const statusClasses = {
    active: "proctor-badge-active",
    warning: "proctor-badge-warning",
    alert: "proctor-badge-alert",
  };

  return (
    <span className={cn("proctor-badge", statusClasses[status])}>
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          status === "active" && "bg-success",
          status === "warning" && "bg-warning",
          status === "alert" && "bg-danger"
        )}
      />
      {label}
    </span>
  );
}
