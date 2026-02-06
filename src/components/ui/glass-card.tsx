import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  elevated?: boolean;
  hover?: boolean;
  glow?: "primary" | "success" | "danger";
  onClick?: () => void;
}

export function GlassCard({
  children,
  className,
  elevated = false,
  hover = false,
  glow,
  onClick,
}: GlassCardProps) {
  const glowClass = glow
    ? {
        primary: "glow-primary",
        success: "glow-success",
        danger: "glow-danger",
      }[glow]
    : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className={cn(
        elevated ? "glass-card-elevated" : "glass-card",
        "rounded-xl p-6",
        hover && "transition-all duration-300 hover:scale-[1.02] hover:border-primary/30",
        onClick && "cursor-pointer",
        glowClass,
        className
      )}
    >
      {children}
    </motion.div>
  );
}
