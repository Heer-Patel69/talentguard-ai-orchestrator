import { forwardRef } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  elevated?: boolean;
  hover?: boolean;
  glow?: "primary" | "success" | "danger";
  onClick?: () => void;
  animateOnScroll?: boolean;
  delay?: number;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  function GlassCard(
    {
      children,
      className,
      elevated = false,
      hover = false,
      glow,
      onClick,
      animateOnScroll = false,
      delay = 0,
    },
    ref
  ) {
    const glowClass = glow
      ? {
          primary: "glow-primary",
          success: "glow-success",
          danger: "glow-danger",
        }[glow]
      : "";

    const hoverProps = hover
      ? {
          whileHover: {
            y: -4,
            scale: 1.02,
            transition: { duration: 0.2, ease: [0.34, 1.56, 0.64, 1] as const },
          },
          whileTap: { scale: 0.98 },
        }
      : {};

    const animationProps = animateOnScroll
      ? {
          initial: { opacity: 0, y: 20 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-50px" },
          transition: {
            duration: 0.5,
            delay,
            ease: [0.34, 1.56, 0.64, 1] as const,
          },
        }
      : {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.3, delay },
        };

    return (
      <motion.div
        ref={ref}
        {...animationProps}
        {...hoverProps}
        onClick={onClick}
        className={cn(
          elevated ? "glass-card-elevated" : "glass-card",
          "rounded-xl p-6 transition-colors",
          onClick && "cursor-pointer",
          glowClass,
          className
        )}
      >
        {children}
      </motion.div>
    );
  }
);

// Variant with animated gradient border
interface GradientGlassCardProps extends GlassCardProps {
  gradientActive?: boolean;
}

export function GradientGlassCard({
  children,
  className,
  gradientActive = true,
  ...props
}: GradientGlassCardProps) {
  return (
    <div className={cn("relative", gradientActive && "animated-gradient-border")}>
      <GlassCard 
        className={cn("relative z-10", className)} 
        {...props}
      >
        {children}
      </GlassCard>
    </div>
  );
}

// Stat card with built-in animations
interface StatCardProps {
  title: string;
  value: React.ReactNode;
  description?: string;
  icon?: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <GlassCard 
      hover 
      className={cn("relative overflow-hidden", className)}
    >
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
          {icon && (
            <motion.div 
              whileHover={{ rotate: 10, scale: 1.1 }}
              className="text-primary"
            >
              {icon}
            </motion.div>
          )}
        </div>
        
        <div className="text-3xl font-bold mb-1">{value}</div>
        
        {(description || trend) && (
          <div className="flex items-center gap-2">
            {trend && (
              <span className={cn(
                "text-xs font-medium flex items-center",
                trend.isPositive ? "text-success" : "text-danger"
              )}>
                {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
              </span>
            )}
            {description && (
              <span className="text-sm text-muted-foreground">{description}</span>
            )}
          </div>
        )}
      </div>
    </GlassCard>
  );
}

// Feature card with icon animation
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}

export function FeatureCard({
  icon,
  title,
  description,
  className,
}: FeatureCardProps) {
  return (
    <GlassCard hover className={cn("group h-full", className)}>
      <motion.div 
        whileHover={{ rotate: 5, scale: 1.1 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20"
      >
        {icon}
      </motion.div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </GlassCard>
  );
}
