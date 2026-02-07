import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Loader2,
  Sparkles,
  Lightbulb,
} from "lucide-react";
import type { ValidationSuggestion } from "@/hooks/useJobValidation";

interface ValidationIndicatorProps {
  status: "validating" | "empty" | "excellent" | "good" | "fair" | "poor";
  score?: number;
  suggestions?: ValidationSuggestion[];
  className?: string;
  showScore?: boolean;
  compact?: boolean;
}

const statusConfig = {
  validating: {
    icon: Loader2,
    color: "text-muted-foreground",
    bgColor: "bg-muted",
    label: "Validating...",
    animate: true,
  },
  empty: {
    icon: AlertCircle,
    color: "text-muted-foreground",
    bgColor: "bg-muted",
    label: "Not started",
    animate: false,
  },
  excellent: {
    icon: CheckCircle2,
    color: "text-success",
    bgColor: "bg-success/10",
    label: "Excellent",
    animate: false,
  },
  good: {
    icon: CheckCircle2,
    color: "text-primary",
    bgColor: "bg-primary/10",
    label: "Good",
    animate: false,
  },
  fair: {
    icon: AlertTriangle,
    color: "text-warning",
    bgColor: "bg-warning/10",
    label: "Needs work",
    animate: false,
  },
  poor: {
    icon: AlertCircle,
    color: "text-danger",
    bgColor: "bg-danger/10",
    label: "Issues found",
    animate: false,
  },
};

export function ValidationIndicator({
  status,
  score,
  suggestions = [],
  className,
  showScore = true,
  compact = false,
}: ValidationIndicatorProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  const highSeverity = suggestions.filter((s) => s.severity === "high");
  const mediumSeverity = suggestions.filter((s) => s.severity === "medium");

  if (compact) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-full",
              config.bgColor,
              className
            )}
          >
            <Icon
              className={cn(
                "h-3.5 w-3.5",
                config.color,
                config.animate && "animate-spin"
              )}
            />
          </motion.div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <p className="font-medium">{config.label}</p>
            {showScore && score !== undefined && score > 0 && (
              <p className="text-muted-foreground">Score: {score}%</p>
            )}
            {suggestions.length > 0 && (
              <p className="text-muted-foreground">
                {suggestions.length} suggestion{suggestions.length !== 1 && "s"}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("space-y-2", className)}
    >
      {/* Status badge */}
      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className={cn(
            "gap-1.5 px-2 py-0.5",
            config.bgColor,
            config.color,
            "border-transparent"
          )}
        >
          <Icon
            className={cn("h-3 w-3", config.animate && "animate-spin")}
          />
          <span className="text-xs">{config.label}</span>
        </Badge>

        {showScore && score !== undefined && score > 0 && (
          <span className="text-xs text-muted-foreground">{score}% complete</span>
        )}
      </div>

      {/* Suggestions */}
      <AnimatePresence>
        {suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-1.5"
          >
            {highSeverity.map((suggestion, idx) => (
              <SuggestionItem key={`high-${idx}`} suggestion={suggestion} />
            ))}
            {mediumSeverity.slice(0, 2).map((suggestion, idx) => (
              <SuggestionItem key={`med-${idx}`} suggestion={suggestion} />
            ))}
            {mediumSeverity.length > 2 && (
              <p className="text-xs text-muted-foreground">
                +{mediumSeverity.length - 2} more suggestions
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SuggestionItem({ suggestion }: { suggestion: ValidationSuggestion }) {
  const iconMap = {
    spelling: Lightbulb,
    grammar: Lightbulb,
    content: Sparkles,
    seo: Sparkles,
    format: AlertTriangle,
    warning: AlertCircle,
  };

  const Icon = iconMap[suggestion.type] || Lightbulb;

  const colorMap = {
    high: "text-danger bg-danger/10 border-danger/30",
    medium: "text-warning bg-warning/10 border-warning/30",
    low: "text-muted-foreground bg-muted border-border",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "flex items-start gap-2 rounded-lg border p-2 text-xs",
        colorMap[suggestion.severity]
      )}
    >
      <Icon className="h-3.5 w-3.5 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p>{suggestion.message}</p>
        {suggestion.suggestion && (
          <p className="mt-0.5 text-muted-foreground">
            💡 {suggestion.suggestion}
          </p>
        )}
      </div>
    </motion.div>
  );
}

// Completeness score component
interface CompletenessScoreProps {
  score: number;
  className?: string;
}

export function CompletenessScore({ score, className }: CompletenessScoreProps) {
  const getScoreColor = () => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-primary";
    if (score >= 40) return "text-warning";
    return "text-danger";
  };

  const getScoreLabel = () => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs work";
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative h-12 w-12">
        <svg className="h-12 w-12 -rotate-90 transform">
          <circle
            cx="24"
            cy="24"
            r="20"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            className="text-muted"
          />
          <circle
            cx="24"
            cy="24"
            r="20"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            strokeDasharray={`${(score / 100) * 125.6} 125.6`}
            strokeLinecap="round"
            className={cn("transition-all duration-500", getScoreColor())}
          />
        </svg>
        <span
          className={cn(
            "absolute inset-0 flex items-center justify-center text-sm font-bold",
            getScoreColor()
          )}
        >
          {score}
        </span>
      </div>
      <div>
        <p className="text-sm font-medium">{getScoreLabel()}</p>
        <p className="text-xs text-muted-foreground">Completeness</p>
      </div>
    </div>
  );
}
