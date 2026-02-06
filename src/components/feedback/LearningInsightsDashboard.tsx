import { useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Target,
  Zap,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Lightbulb,
  RefreshCw,
} from "lucide-react";

interface LearningMetric {
  name: string;
  value: number;
  previousValue: number;
  unit: string;
  target?: number;
}

interface LearningInsightsDashboardProps {
  metrics: LearningMetric[];
  totalFeedback: number;
  modelVersion: string;
  lastTrainingDate: string;
  improvementRate: number;
  className?: string;
}

export function LearningInsightsDashboard({
  metrics,
  totalFeedback,
  modelVersion,
  lastTrainingDate,
  improvementRate,
  className,
}: LearningInsightsDashboardProps) {
  const overallTrend = useMemo(() => {
    const improvements = metrics.filter((m) => m.value > m.previousValue).length;
    return improvements >= metrics.length / 2 ? "positive" : "negative";
  }, [metrics]);

  return (
    <div className={cn("rounded-xl border border-border bg-card", className)}>
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">AI Learning Insights</h3>
              <p className="text-sm text-muted-foreground">Model performance over time</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="gap-1">
              <RefreshCw className="h-3 w-3" />
              {modelVersion}
            </Badge>
            <Badge
              variant="secondary"
              className={cn(
                overallTrend === "positive"
                  ? "bg-success/10 text-success"
                  : "bg-danger/10 text-danger"
              )}
            >
              {overallTrend === "positive" ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              {improvementRate > 0 ? "+" : ""}{improvementRate}%
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
        <div className="p-4 text-center">
          <p className="text-2xl font-bold">{totalFeedback.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Total Feedback</p>
        </div>
        <div className="p-4 text-center">
          <p className="text-2xl font-bold">{modelVersion}</p>
          <p className="text-xs text-muted-foreground">Model Version</p>
        </div>
        <div className="p-4 text-center">
          <p className="text-2xl font-bold">{lastTrainingDate}</p>
          <p className="text-xs text-muted-foreground">Last Training</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="p-6 grid gap-4">
        {metrics.map((metric, index) => {
          const change = metric.value - metric.previousValue;
          const changePercent = ((change / metric.previousValue) * 100).toFixed(1);
          const isPositive = change > 0;
          const progressToTarget = metric.target
            ? (metric.value / metric.target) * 100
            : null;

          return (
            <motion.div
              key={metric.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  <span className="font-medium">{metric.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">
                    {metric.value}{metric.unit}
                  </span>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-xs",
                      isPositive
                        ? "bg-success/10 text-success"
                        : "bg-danger/10 text-danger"
                    )}
                  >
                    {isPositive ? (
                      <ArrowUpRight className="h-3 w-3 mr-0.5" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 mr-0.5" />
                    )}
                    {changePercent}%
                  </Badge>
                </div>
              </div>

              {progressToTarget !== null && (
                <div className="space-y-1">
                  <Progress value={Math.min(progressToTarget, 100)} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progress to target</span>
                    <span>
                      {metric.value} / {metric.target}{metric.unit}
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Insights */}
      <div className="p-6 pt-0">
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium mb-1">Key Insight</p>
              <p className="text-sm text-muted-foreground">
                Based on {totalFeedback} feedback samples, the AI model shows a {improvementRate}% improvement 
                in recommendation accuracy. Continue providing feedback to further optimize predictions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
