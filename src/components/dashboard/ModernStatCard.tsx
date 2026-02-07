import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface ModernStatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "primary" | "success" | "warning" | "danger" | "info";
  delay?: number;
}

const colorClasses = {
  primary: {
    bg: "bg-primary/10",
    text: "text-primary",
    glow: "shadow-[0_0_20px_-5px_hsl(var(--primary)/0.3)]",
  },
  success: {
    bg: "bg-success/10",
    text: "text-success",
    glow: "shadow-[0_0_20px_-5px_hsl(var(--success)/0.3)]",
  },
  warning: {
    bg: "bg-warning/10",
    text: "text-warning",
    glow: "shadow-[0_0_20px_-5px_hsl(var(--warning)/0.3)]",
  },
  danger: {
    bg: "bg-danger/10",
    text: "text-danger",
    glow: "shadow-[0_0_20px_-5px_hsl(var(--danger)/0.3)]",
  },
  info: {
    bg: "bg-info/10",
    text: "text-info",
    glow: "shadow-[0_0_20px_-5px_hsl(var(--info)/0.3)]",
  },
};

export function ModernStatCard({
  label,
  value,
  icon,
  trend,
  color = "primary",
  delay = 0,
}: ModernStatCardProps) {
  const colors = colorClasses[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
      whileHover={{ y: -4, scale: 1.02 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl p-5",
        "hover:border-border transition-all duration-300",
        colors.glow
      )}
    >
      {/* Background gradient */}
      <div className={cn(
        "absolute inset-0 opacity-30",
        "bg-gradient-to-br from-transparent via-transparent to-current",
        colors.text
      )} style={{ opacity: 0.05 }} />
      
      {/* Mesh overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.02),transparent_50%)]" />

      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <motion.div
            whileHover={{ rotate: 10, scale: 1.1 }}
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-xl",
              colors.bg
            )}
          >
            <div className={colors.text}>{icon}</div>
          </motion.div>

          {trend && (
            <div
              className={cn(
                "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
                trend.isPositive
                  ? "bg-success/10 text-success"
                  : "bg-danger/10 text-danger"
              )}
            >
              {trend.isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {Math.abs(trend.value)}%
            </div>
          )}
        </div>

        <div className="mt-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.2 }}
            className="text-3xl font-bold tracking-tight"
          >
            {value}
          </motion.div>
          <p className="mt-1 text-sm text-muted-foreground">{label}</p>
        </div>
      </div>
    </motion.div>
  );
}
