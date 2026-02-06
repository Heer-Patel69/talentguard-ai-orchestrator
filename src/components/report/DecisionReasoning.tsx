import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { TrustScoreBadge } from "@/components/ui/trust-indicators";
import {
  Brain,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EvaluationCriteria {
  name: string;
  score: number;
  maxScore: number;
  trend: "up" | "down" | "neutral";
  feedback: string;
}

interface DecisionReasoningProps {
  decision: "hire" | "no-hire" | "borderline";
  confidence: number;
  overallScore: number;
  criteria: EvaluationCriteria[];
  summary: string;
  strengths: string[];
  weaknesses: string[];
  className?: string;
}

export function DecisionReasoning({
  decision,
  confidence,
  overallScore,
  criteria,
  summary,
  strengths,
  weaknesses,
  className,
}: DecisionReasoningProps) {
  const decisionStyles = {
    hire: {
      bg: "bg-success/10",
      border: "border-success/30",
      icon: CheckCircle2,
      iconColor: "text-success",
      label: "Recommend Hire",
    },
    "no-hire": {
      bg: "bg-danger/10",
      border: "border-danger/30",
      icon: XCircle,
      iconColor: "text-danger",
      label: "Not Recommended",
    },
    borderline: {
      bg: "bg-warning/10",
      border: "border-warning/30",
      icon: AlertTriangle,
      iconColor: "text-warning",
      label: "Borderline - Needs Review",
    },
  };

  const style = decisionStyles[decision];
  const DecisionIcon = style.icon;

  const getTrendIcon = (trend: "up" | "down" | "neutral") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-success" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-danger" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <GlassCard className={className}>
      <div className="mb-6 flex items-center gap-2">
        <Brain className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">AI Decision Reasoning</h3>
      </div>

      {/* Decision Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "mb-6 rounded-xl border p-6 text-center",
          style.bg,
          style.border
        )}
      >
        <DecisionIcon className={cn("mx-auto mb-3 h-12 w-12", style.iconColor)} />
        <h4 className="mb-2 text-xl font-bold">{style.label}</h4>
        <div className="flex items-center justify-center gap-4">
          <div>
            <span className="text-sm text-muted-foreground">Overall Score</span>
            <div className="text-2xl font-bold">{overallScore}%</div>
          </div>
          <div className="h-10 w-px bg-border" />
          <div>
            <span className="text-sm text-muted-foreground">Confidence</span>
            <div className="text-2xl font-bold">{confidence}%</div>
          </div>
        </div>
      </motion.div>

      {/* Summary */}
      <div className="mb-6 rounded-lg bg-secondary/30 p-4">
        <p className="text-sm leading-relaxed text-muted-foreground">{summary}</p>
      </div>

      {/* Evaluation Criteria */}
      <div className="mb-6">
        <h4 className="mb-4 font-semibold">Evaluation Breakdown</h4>
        <div className="space-y-3">
          {criteria.map((criterion, idx) => (
            <motion.div
              key={criterion.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="rounded-lg bg-secondary/30 p-3"
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{criterion.name}</span>
                  {getTrendIcon(criterion.trend)}
                </div>
                <TrustScoreBadge
                  score={Math.round((criterion.score / criterion.maxScore) * 100)}
                  size="sm"
                  showLabel={false}
                />
              </div>
              <div className="mb-2 h-2 overflow-hidden rounded-full bg-secondary">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(criterion.score / criterion.maxScore) * 100}%`,
                  }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className={cn(
                    "h-full rounded-full",
                    criterion.score / criterion.maxScore >= 0.7
                      ? "bg-success"
                      : criterion.score / criterion.maxScore >= 0.5
                      ? "bg-warning"
                      : "bg-danger"
                  )}
                />
              </div>
              <p className="text-xs text-muted-foreground">{criterion.feedback}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg bg-success/10 p-4">
          <div className="mb-3 flex items-center gap-2 text-success">
            <ThumbsUp className="h-4 w-4" />
            <h4 className="font-semibold">Strengths</h4>
          </div>
          <ul className="space-y-2">
            {strengths.map((strength, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-success" />
                {strength}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg bg-danger/10 p-4">
          <div className="mb-3 flex items-center gap-2 text-danger">
            <ThumbsDown className="h-4 w-4" />
            <h4 className="font-semibold">Areas for Improvement</h4>
          </div>
          <ul className="space-y-2">
            {weaknesses.map((weakness, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <XCircle className="mt-0.5 h-3 w-3 shrink-0 text-danger" />
                {weakness}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </GlassCard>
  );
}
