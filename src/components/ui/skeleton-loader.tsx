import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface SkeletonProps {
  className?: string;
  variant?: "default" | "circular" | "text" | "card";
  animate?: boolean;
  style?: React.CSSProperties;
}

export function Skeleton({ 
  className, 
  variant = "default",
  animate = true,
  style,
}: SkeletonProps) {
  const baseClasses = "bg-muted";
  
  const variantClasses = {
    default: "rounded-md",
    circular: "rounded-full",
    text: "rounded h-4 w-full",
    card: "rounded-xl",
  };

  return (
    <motion.div
      className={cn(
        baseClasses,
        variantClasses[variant],
        animate && "animate-shimmer",
        className
      )}
      style={style}
      initial={animate ? { opacity: 0.5 } : undefined}
      animate={animate ? { opacity: [0.5, 1, 0.5] } : undefined}
      transition={animate ? { duration: 1.5, repeat: Infinity, ease: "linear" } : undefined}
    />
  );
}

// Skeleton text lines
interface SkeletonTextProps {
  lines?: number;
  className?: string;
  lastLineWidth?: string;
}

export function SkeletonText({ 
  lines = 3, 
  className,
  lastLineWidth = "60%",
}: SkeletonTextProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          variant="text" 
          className={cn(
            "h-4",
            i === lines - 1 && `w-[${lastLineWidth}]`
          )}
          style={i === lines - 1 ? { width: lastLineWidth } : undefined}
        />
      ))}
    </div>
  );
}

// Skeleton card
interface SkeletonCardProps {
  className?: string;
  showImage?: boolean;
  showAvatar?: boolean;
}

export function SkeletonCard({ 
  className,
  showImage = false,
  showAvatar = false,
}: SkeletonCardProps) {
  return (
    <div className={cn("glass-card rounded-xl p-6 space-y-4", className)}>
      {showImage && (
        <Skeleton className="w-full h-40 rounded-lg" />
      )}
      {showAvatar && (
        <div className="flex items-center gap-3">
          <Skeleton variant="circular" className="w-10 h-10" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      )}
      {!showAvatar && (
        <>
          <Skeleton className="h-6 w-3/4" />
          <SkeletonText lines={2} />
        </>
      )}
    </div>
  );
}

// Skeleton table row
export function SkeletonTableRow({ columns = 4 }: { columns?: number }) {
  return (
    <div className="flex items-center gap-4 py-4 border-b border-border">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton 
          key={i} 
          className={cn(
            "h-4",
            i === 0 ? "w-24" : i === columns - 1 ? "w-16" : "flex-1"
          )}
        />
      ))}
    </div>
  );
}

// Skeleton stat card
export function SkeletonStatCard({ className }: { className?: string }) {
  return (
    <div className={cn("glass-card rounded-xl p-6", className)}>
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton variant="circular" className="w-8 h-8" />
      </div>
      <Skeleton className="h-8 w-20 mb-2" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

// Skeleton chart
export function SkeletonChart({ className }: { className?: string }) {
  return (
    <div className={cn("glass-card rounded-xl p-6", className)}>
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="flex items-end justify-between gap-2 h-48">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton 
            key={i} 
            className="flex-1 rounded-t"
            style={{ height: `${30 + Math.random() * 70}%` }}
          />
        ))}
      </div>
    </div>
  );
}

// Skeleton avatar group
export function SkeletonAvatarGroup({ count = 3 }: { count?: number }) {
  return (
    <div className="flex -space-x-2">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton 
          key={i} 
          variant="circular" 
          className="w-8 h-8 border-2 border-background"
        />
      ))}
    </div>
  );
}

// Full page loader
export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <motion.div
          className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-primary flex items-center justify-center"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <svg
            className="w-8 h-8 text-primary-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        </motion.div>
        <motion.p
          className="text-muted-foreground"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Loading...
        </motion.p>
      </div>
    </div>
  );
}

// Inline loading dots
export function LoadingDots({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-current"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </span>
  );
}

// Overlay loading state for existing content
interface LoadingOverlayProps {
  isLoading?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function LoadingOverlay({ 
  isLoading, 
  children, 
  className 
}: LoadingOverlayProps) {
  return (
    <div className={cn("relative", className)}>
      {children}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center rounded-[inherit] z-10"
        >
          <LoadingDots className="text-primary" />
        </motion.div>
      )}
    </div>
  );
}
