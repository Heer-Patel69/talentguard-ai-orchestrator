import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  Zap,
  Target,
  Clock,
  Shield,
  TrendingUp,
  Activity,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

interface LearningMetric {
  id: string;
  name: string;
  description: string;
  currentValue: number;
  previousValue: number;
  target: number;
  unit: string;
  category: "strategy" | "timing" | "fraud" | "quality";
}

interface ReinforcementLearningPanelProps {
  metrics: LearningMetric[];
  lastUpdateTime: string;
  totalIterations: number;
  convergenceRate: number;
  className?: string;
}

export function ReinforcementLearningPanel({
  metrics,
  lastUpdateTime,
  totalIterations,
  convergenceRate,
  className,
}: ReinforcementLearningPanelProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "strategy":
        return <Brain className="h-4 w-4" />;
      case "timing":
        return <Clock className="h-4 w-4" />;
      case "fraud":
        return <Shield className="h-4 w-4" />;
      case "quality":
        return <Target className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "strategy":
        return "text-primary bg-primary/10";
      case "timing":
        return "text-warning bg-warning/10";
      case "fraud":
        return "text-danger bg-danger/10";
      case "quality":
        return "text-success bg-success/10";
      default:
        return "text-muted-foreground bg-secondary";
    }
  };

  const getImprovementBadge = (current: number, previous: number) => {
    const diff = current - previous;
    const percent = ((diff / previous) * 100).toFixed(1);
    
    if (diff > 0) {
      return (
        <Badge className="bg-success/10 text-success border-success/30">
          <TrendingUp className="h-3 w-3 mr-1" />
          +{percent}%
        </Badge>
      );
    } else if (diff < 0) {
      return (
        <Badge className="bg-danger/10 text-danger border-danger/30">
          <AlertTriangle className="h-3 w-3 mr-1" />
          {percent}%
        </Badge>
      );
    }
    return (
      <Badge variant="secondary">
        <CheckCircle2 className="h-3 w-3 mr-1" />
        Stable
      </Badge>
    );
  };

  const groupedMetrics = metrics.reduce((acc, metric) => {
    if (!acc[metric.category]) acc[metric.category] = [];
    acc[metric.category].push(metric);
    return acc;
  }, {} as Record<string, LearningMetric[]>);

  const categoryLabels: Record<string, string> = {
    strategy: "Interview Strategy",
    timing: "Time Optimization",
    fraud: "Fraud Detection",
    quality: "Question Quality",
  };

  return (
    <div className={cn("rounded-xl border border-border bg-card", className)}>
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold">Reinforcement Learning</h3>
              <p className="text-sm text-muted-foreground">AI self-improvement metrics</p>
            </div>
          </div>
          <Badge variant="outline" className="gap-1">
            <RefreshCw className="h-3 w-3" />
            {lastUpdateTime}
          </Badge>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
        <div className="p-4 text-center">
          <p className="text-2xl font-bold text-primary">{totalIterations.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Training Iterations</p>
        </div>
        <div className="p-4 text-center">
          <p className="text-2xl font-bold text-success">{convergenceRate}%</p>
          <p className="text-xs text-muted-foreground">Convergence Rate</p>
        </div>
        <div className="p-4 text-center">
          <p className="text-2xl font-bold">
            {metrics.filter((m) => m.currentValue > m.previousValue).length}/{metrics.length}
          </p>
          <p className="text-xs text-muted-foreground">Metrics Improved</p>
        </div>
      </div>

      {/* Metrics by Category */}
      <div className="p-6 space-y-6">
        {Object.entries(groupedMetrics).map(([category, categoryMetrics]) => (
          <div key={category}>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <span className={cn("p-1.5 rounded", getCategoryColor(category))}>
                {getCategoryIcon(category)}
              </span>
              {categoryLabels[category] || category}
            </h4>

            <div className="space-y-3">
              {categoryMetrics.map((metric, index) => (
                <motion.div
                  key={metric.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 rounded-lg bg-secondary/30"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-sm">{metric.name}</p>
                      <p className="text-xs text-muted-foreground">{metric.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-bold">
                          {metric.currentValue}{metric.unit}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Target: {metric.target}{metric.unit}
                        </p>
                      </div>
                      {getImprovementBadge(metric.currentValue, metric.previousValue)}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Progress 
                      value={(metric.currentValue / metric.target) * 100} 
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0</span>
                      <span>{Math.round((metric.currentValue / metric.target) * 100)}% of target</span>
                      <span>{metric.target}{metric.unit}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Learning Summary */}
      <div className="p-6 pt-0">
        <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
          <div className="flex items-start gap-3">
            <Brain className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium mb-1">Continuous Learning Active</p>
              <p className="text-sm text-muted-foreground">
                The AI agent is continuously learning from interview outcomes. 
                Follow-up question effectiveness improved by 12% this week. 
                Fraud detection accuracy is at an all-time high of 97.3%.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
