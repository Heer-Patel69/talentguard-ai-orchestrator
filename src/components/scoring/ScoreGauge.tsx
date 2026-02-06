import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ScoreGaugeProps {
  score: number;
  maxScore?: number;
  size?: "sm" | "md" | "lg";
  label?: string;
  showPercentage?: boolean;
  className?: string;
}

export function ScoreGauge({
  score,
  maxScore = 100,
  size = "md",
  label,
  showPercentage = true,
  className,
}: ScoreGaugeProps) {
  const percentage = Math.min((score / maxScore) * 100, 100);
  
  const getColor = () => {
    if (percentage >= 80) return "text-success";
    if (percentage >= 60) return "text-warning";
    if (percentage >= 40) return "text-orange-500";
    return "text-danger";
  };

  const getStrokeColor = () => {
    if (percentage >= 80) return "stroke-success";
    if (percentage >= 60) return "stroke-warning";
    if (percentage >= 40) return "stroke-orange-500";
    return "stroke-danger";
  };

  const sizes = {
    sm: { width: 60, stroke: 6, fontSize: "text-sm" },
    md: { width: 100, stroke: 8, fontSize: "text-xl" },
    lg: { width: 140, stroke: 10, fontSize: "text-3xl" },
  };

  const config = sizes[size];
  const radius = (config.width - config.stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative" style={{ width: config.width, height: config.width }}>
        <svg className="transform -rotate-90" width={config.width} height={config.width}>
          {/* Background circle */}
          <circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={config.stroke}
            className="text-secondary"
          />
          {/* Progress circle */}
          <motion.circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            fill="none"
            strokeWidth={config.stroke}
            strokeLinecap="round"
            className={getStrokeColor()}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{
              strokeDasharray: circumference,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn("font-bold", config.fontSize, getColor())}>
            {showPercentage ? `${Math.round(percentage)}%` : Math.round(score)}
          </span>
        </div>
      </div>
      {label && (
        <span className="mt-2 text-sm text-muted-foreground text-center">{label}</span>
      )}
    </div>
  );
}
