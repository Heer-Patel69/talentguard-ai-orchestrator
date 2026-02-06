import { useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface DataPoint {
  date: string;
  value: number;
  label?: string;
}

interface TrendChartProps {
  data: DataPoint[];
  title: string;
  unit?: string;
  threshold?: number;
  thresholdLabel?: string;
  className?: string;
}

export function TrendChart({
  data,
  title,
  unit = "%",
  threshold,
  thresholdLabel,
  className,
}: TrendChartProps) {
  const { minValue, maxValue, points, thresholdY } = useMemo(() => {
    const values = data.map((d) => d.value);
    const min = Math.min(...values, threshold ?? Infinity) * 0.9;
    const max = Math.max(...values, threshold ?? 0) * 1.1;
    const range = max - min;

    const chartWidth = 100;
    const chartHeight = 100;
    const padding = 10;

    const pts = data.map((d, i) => ({
      x: padding + (i / (data.length - 1)) * (chartWidth - 2 * padding),
      y: chartHeight - padding - ((d.value - min) / range) * (chartHeight - 2 * padding),
      value: d.value,
      date: d.date,
      label: d.label,
    }));

    const threshY = threshold
      ? chartHeight - padding - ((threshold - min) / range) * (chartHeight - 2 * padding)
      : null;

    return { minValue: min, maxValue: max, points: pts, thresholdY: threshY };
  }, [data, threshold]);

  // Generate path
  const linePath = useMemo(() => {
    if (points.length < 2) return "";
    return points.reduce((path, point, i) => {
      if (i === 0) return `M ${point.x} ${point.y}`;
      return `${path} L ${point.x} ${point.y}`;
    }, "");
  }, [points]);

  // Generate area path (for fill)
  const areaPath = useMemo(() => {
    if (points.length < 2) return "";
    const baseline = 90; // Bottom of chart area
    let path = `M ${points[0].x} ${baseline}`;
    points.forEach((point) => {
      path += ` L ${point.x} ${point.y}`;
    });
    path += ` L ${points[points.length - 1].x} ${baseline} Z`;
    return path;
  }, [points]);

  // Calculate trend
  const trend = useMemo(() => {
    if (data.length < 2) return 0;
    const firstValue = data[0].value;
    const lastValue = data[data.length - 1].value;
    return ((lastValue - firstValue) / firstValue) * 100;
  }, [data]);

  return (
    <div className={cn("rounded-xl border border-border bg-card p-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-sm font-medium",
            trend > 0 ? "text-success" : trend < 0 ? "text-danger" : "text-muted-foreground"
          )}>
            {trend > 0 ? "↑" : trend < 0 ? "↓" : "→"} {Math.abs(trend).toFixed(1)}%
          </span>
          <span className="text-xs text-muted-foreground">trend</span>
        </div>
      </div>

      <div className="relative h-48">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((y) => (
            <line
              key={y}
              x1="10"
              y1={10 + (y / 100) * 80}
              x2="90"
              y2={10 + (y / 100) * 80}
              stroke="currentColor"
              strokeWidth="0.2"
              className="text-border"
            />
          ))}

          {/* Threshold line */}
          {thresholdY !== null && (
            <line
              x1="10"
              y1={thresholdY}
              x2="90"
              y2={thresholdY}
              stroke="currentColor"
              strokeWidth="0.5"
              strokeDasharray="2,2"
              className="text-danger"
            />
          )}

          {/* Area fill */}
          <motion.path
            d={areaPath}
            fill="url(#areaGradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />

          {/* Line */}
          <motion.path
            d={linePath}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="0.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          />

          {/* Data points */}
          {points.map((point, i) => (
            <motion.circle
              key={i}
              cx={point.x}
              cy={point.y}
              r="1.5"
              fill="hsl(var(--background))"
              stroke="hsl(var(--primary))"
              strokeWidth="0.5"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1, duration: 0.2 }}
            />
          ))}
        </svg>

        {/* Y-axis labels */}
        <div className="absolute left-0 top-2 bottom-2 flex flex-col justify-between text-xs text-muted-foreground">
          <span>{maxValue.toFixed(0)}{unit}</span>
          <span>{((maxValue + minValue) / 2).toFixed(0)}{unit}</span>
          <span>{minValue.toFixed(0)}{unit}</span>
        </div>

        {/* Threshold label */}
        {threshold && thresholdLabel && (
          <div
            className="absolute right-0 text-xs text-danger font-medium"
            style={{ top: `${(thresholdY! / 100) * 100}%` }}
          >
            {thresholdLabel}
          </div>
        )}
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
        {data.length > 0 && (
          <>
            <span>{data[0].date}</span>
            {data.length > 2 && <span>{data[Math.floor(data.length / 2)].date}</span>}
            <span>{data[data.length - 1].date}</span>
          </>
        )}
      </div>
    </div>
  );
}
