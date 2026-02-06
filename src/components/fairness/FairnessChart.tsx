import { useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GroupData {
  name: string;
  passRate: number;
  totalCandidates: number;
  averageScore: number;
}

interface FairnessChartProps {
  data: GroupData[];
  title: string;
  category: string;
  averagePassRate?: number;
  className?: string;
}

export function FairnessChart({
  data,
  title,
  category,
  averagePassRate,
  className,
}: FairnessChartProps) {
  const maxPassRate = useMemo(() => Math.max(...data.map((d) => d.passRate), 1), [data]);
  const avgRate = averagePassRate ?? data.reduce((sum, d) => sum + d.passRate, 0) / data.length;

  const getDeviationColor = (passRate: number) => {
    const deviation = Math.abs(passRate - avgRate);
    if (deviation > 15) return "bg-danger";
    if (deviation > 10) return "bg-warning";
    return "bg-success";
  };

  const getDeviationTextColor = (passRate: number) => {
    const deviation = Math.abs(passRate - avgRate);
    if (deviation > 15) return "text-danger";
    if (deviation > 10) return "text-warning";
    return "text-success";
  };

  return (
    <div className={cn("rounded-xl border border-border bg-card p-6", className)}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">
          Distribution by {category} • Average pass rate: {(avgRate * 100).toFixed(1)}%
        </p>
      </div>

      <div className="space-y-4">
        {data.map((group, index) => {
          const deviation = ((group.passRate - avgRate) * 100).toFixed(1);
          const isPositive = group.passRate >= avgRate;

          return (
            <motion.div
              key={group.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{group.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">
                    {group.totalCandidates} candidates
                  </span>
                  <span className={cn("font-semibold", getDeviationTextColor(group.passRate))}>
                    {(group.passRate * 100).toFixed(1)}%
                    <span className="ml-1 text-xs font-normal">
                      ({isPositive ? "+" : ""}{deviation}%)
                    </span>
                  </span>
                </div>
              </div>

              <div className="relative h-3 w-full rounded-full bg-secondary overflow-hidden">
                {/* Average line indicator */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-foreground/50 z-10"
                  style={{ left: `${(avgRate / maxPassRate) * 100}%` }}
                />

                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(group.passRate / maxPassRate) * 100}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={cn("h-full rounded-full", getDeviationColor(group.passRate))}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Avg Score: {group.averageScore.toFixed(1)}</span>
                {Math.abs(group.passRate - avgRate) > 0.15 && (
                  <span className="text-danger font-medium">⚠️ Deviation Alert</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-border flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-success" />
          <span className="text-muted-foreground">Within threshold</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-warning" />
          <span className="text-muted-foreground">10-15% deviation</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-danger" />
          <span className="text-muted-foreground">&gt;15% deviation</span>
        </div>
      </div>
    </div>
  );
}
