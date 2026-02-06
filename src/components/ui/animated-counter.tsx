import { useEffect, useRef, useState } from "react";
import { motion, useSpring, useTransform, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  formatValue?: (value: number) => string;
  delay?: number;
}

export function AnimatedCounter({
  value,
  duration = 1.5,
  decimals = 0,
  prefix = "",
  suffix = "",
  className,
  formatValue,
  delay = 0,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [hasAnimated, setHasAnimated] = useState(false);

  const spring = useSpring(0, {
    duration: duration * 1000,
    bounce: 0,
  });

  const display = useTransform(spring, (current) => {
    if (formatValue) {
      return formatValue(Math.round(current));
    }
    
    const fixed = current.toFixed(decimals);
    // Add thousand separators
    const parts = fixed.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  });

  useEffect(() => {
    if (isInView && !hasAnimated) {
      const timeout = setTimeout(() => {
        spring.set(value);
        setHasAnimated(true);
      }, delay * 1000);
      return () => clearTimeout(timeout);
    }
  }, [isInView, hasAnimated, spring, value, delay]);

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {prefix}
      <motion.span>{display}</motion.span>
      {suffix}
    </span>
  );
}

// Simplified version for percentages
interface AnimatedPercentageProps {
  value: number;
  className?: string;
  showSymbol?: boolean;
  decimals?: number;
}

export function AnimatedPercentage({
  value,
  className,
  showSymbol = true,
  decimals = 0,
}: AnimatedPercentageProps) {
  return (
    <AnimatedCounter
      value={value}
      decimals={decimals}
      suffix={showSymbol ? "%" : ""}
      className={className}
    />
  );
}

// Version with trend indicator
interface AnimatedStatProps {
  value: number;
  previousValue?: number;
  prefix?: string;
  suffix?: string;
  label?: string;
  className?: string;
  trendClassName?: string;
}

export function AnimatedStat({
  value,
  previousValue,
  prefix = "",
  suffix = "",
  label,
  className,
  trendClassName,
}: AnimatedStatProps) {
  const trend = previousValue !== undefined 
    ? ((value - previousValue) / previousValue) * 100 
    : 0;
  const isPositive = trend >= 0;

  return (
    <div className={cn("flex flex-col", className)}>
      <AnimatedCounter
        value={value}
        prefix={prefix}
        suffix={suffix}
        className="text-3xl font-bold"
      />
      {label && (
        <span className="text-sm text-muted-foreground">{label}</span>
      )}
      {previousValue !== undefined && (
        <motion.span
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={cn(
            "text-xs font-medium flex items-center gap-1 mt-1",
            isPositive ? "text-success" : "text-danger",
            trendClassName
          )}
        >
          <span>{isPositive ? "↑" : "↓"}</span>
          <AnimatedPercentage value={Math.abs(trend)} decimals={1} />
          <span className="text-muted-foreground ml-1">vs last period</span>
        </motion.span>
      )}
    </div>
  );
}

// Countdown timer
interface CountdownProps {
  seconds: number;
  onComplete?: () => void;
  className?: string;
  showMinutes?: boolean;
}

export function Countdown({
  seconds: initialSeconds,
  onComplete,
  className,
  showMinutes = true,
}: CountdownProps) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [onComplete]);

  const formatTime = (secs: number) => {
    if (showMinutes) {
      const mins = Math.floor(secs / 60);
      const remainingSecs = secs % 60;
      return `${mins}:${remainingSecs.toString().padStart(2, "0")}`;
    }
    return secs.toString();
  };

  const urgencyColor = seconds <= 10 
    ? "text-danger" 
    : seconds <= 30 
      ? "text-warning" 
      : "text-foreground";

  return (
    <motion.span
      key={seconds}
      initial={{ scale: 1.1 }}
      animate={{ scale: 1 }}
      className={cn(
        "tabular-nums font-mono font-bold",
        urgencyColor,
        seconds <= 10 && "animate-pulse",
        className
      )}
    >
      {formatTime(seconds)}
    </motion.span>
  );
}

// Large countdown for interview start
interface BigCountdownProps {
  from: number;
  onComplete?: () => void;
}

export function BigCountdown({ from, onComplete }: BigCountdownProps) {
  const [count, setCount] = useState(from);

  useEffect(() => {
    if (count <= 0) {
      onComplete?.();
      return;
    }

    const timer = setTimeout(() => {
      setCount(count - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [count, onComplete]);

  if (count <= 0) {
    return (
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-6xl md:text-8xl font-bold gradient-text"
      >
        GO!
      </motion.div>
    );
  }

  return (
    <motion.div
      key={count}
      initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      exit={{ scale: 1.5, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
      className="text-8xl md:text-[12rem] font-bold gradient-text"
    >
      {count}
    </motion.div>
  );
}
