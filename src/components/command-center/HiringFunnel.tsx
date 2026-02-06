import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ChevronRight, Users } from "lucide-react";

interface FunnelStage {
  name: string;
  count: number;
  color: string;
  status: string;
}

interface HiringFunnelProps {
  stages: FunnelStage[];
  onStageClick?: (stage: FunnelStage) => void;
  className?: string;
}

export function HiringFunnel({ stages, onStageClick, className }: HiringFunnelProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  const maxCount = Math.max(...stages.map(s => s.count), 1);

  const getConversionRate = (index: number): string => {
    if (index === 0) return "100%";
    const prevCount = stages[index - 1].count;
    if (prevCount === 0) return "0%";
    return `${((stages[index].count / prevCount) * 100).toFixed(1)}%`;
  };

  const getOverallConversion = (): string => {
    if (stages.length < 2 || stages[0].count === 0) return "0%";
    return `${((stages[stages.length - 1].count / stages[0].count) * 100).toFixed(1)}%`;
  };

  return (
    <div className={cn("rounded-xl border border-border bg-card p-6", className)}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Hiring Funnel</h3>
          <p className="text-sm text-muted-foreground">
            Click any stage to view candidates
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Overall Conversion</p>
          <p className="text-2xl font-bold text-primary">{getOverallConversion()}</p>
        </div>
      </div>

      <div className="space-y-3">
        {stages.map((stage, index) => {
          const widthPercent = (stage.count / maxCount) * 100;
          const isHovered = hoveredIndex === index;

          return (
            <motion.div
              key={stage.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <button
                onClick={() => onStageClick?.(stage)}
                className="w-full text-left group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{stage.name}</span>
                    {index > 0 && (
                      <span className="text-xs text-muted-foreground">
                        ({getConversionRate(index)} from prev)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold tabular-nums">{stage.count}</span>
                    <ChevronRight className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform",
                      isHovered && "translate-x-1"
                    )} />
                  </div>
                </div>

                <div className="relative h-10 w-full rounded-lg bg-secondary overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${widthPercent}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={cn(
                      "absolute inset-y-0 left-0 rounded-lg transition-all",
                      stage.color,
                      isHovered && "brightness-110"
                    )}
                  />
                  
                  {/* Funnel shape effect */}
                  <div 
                    className="absolute inset-y-0 right-0 bg-gradient-to-r from-transparent to-secondary"
                    style={{ 
                      width: `${100 - widthPercent + 5}%`,
                      clipPath: index < stages.length - 1 
                        ? 'polygon(0 0, 100% 0, 100% 100%, 10% 100%)' 
                        : undefined
                    }}
                  />
                </div>
              </button>

              {/* Connector arrow */}
              {index < stages.length - 1 && (
                <div className="flex justify-center my-1">
                  <div className="w-0.5 h-3 bg-border" />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex flex-wrap gap-4 text-xs">
          {stages.map((stage) => (
            <div key={stage.name} className="flex items-center gap-1.5">
              <div className={cn("h-3 w-3 rounded", stage.color)} />
              <span className="text-muted-foreground">{stage.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
