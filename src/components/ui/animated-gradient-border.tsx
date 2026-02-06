import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedGradientBorderProps {
  children: ReactNode;
  className?: string;
  borderClassName?: string;
  borderWidth?: number;
  borderRadius?: string;
  gradientColors?: string[];
  animationDuration?: number;
  hover?: boolean;
}

export function AnimatedGradientBorder({
  children,
  className,
  borderClassName,
  borderWidth = 2,
  borderRadius = "0.75rem",
  gradientColors = [
    "hsl(226, 100%, 64%)",
    "hsl(280, 87%, 65%)",
    "hsl(160, 84%, 39%)",
    "hsl(226, 100%, 64%)",
  ],
  animationDuration = 4,
  hover = false,
}: AnimatedGradientBorderProps) {
  const gradient = `linear-gradient(270deg, ${gradientColors.join(", ")})`;

  return (
    <div
      className={cn("relative group", className)}
      style={{ borderRadius }}
    >
      {/* Animated gradient border */}
      <motion.div
        className={cn(
          "absolute inset-0 rounded-[inherit] -z-10",
          hover && "opacity-70 group-hover:opacity-100 transition-opacity",
          borderClassName
        )}
        style={{
          padding: borderWidth,
          background: gradient,
          backgroundSize: "400% 400%",
          borderRadius: "inherit",
        }}
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{
          duration: animationDuration,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {/* Inner mask */}
        <div
          className="w-full h-full bg-background rounded-[inherit]"
          style={{
            borderRadius: `calc(${borderRadius} - ${borderWidth}px)`,
          }}
        />
      </motion.div>

      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 -z-20 rounded-[inherit] opacity-50 blur-xl"
        style={{
          background: gradient,
          backgroundSize: "400% 400%",
        }}
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{
          duration: animationDuration,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Content */}
      <div className="relative bg-background rounded-[inherit]">
        {children}
      </div>
    </div>
  );
}

// Shimmer effect for buttons and cards
interface ShimmerEffectProps {
  children: ReactNode;
  className?: string;
  shimmerColor?: string;
  duration?: number;
}

export function ShimmerEffect({
  children,
  className,
  shimmerColor = "hsla(226, 100%, 64%, 0.3)",
  duration = 2,
}: ShimmerEffectProps) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {children}
      <motion.div
        className="absolute inset-0 -z-10"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${shimmerColor} 50%, transparent 100%)`,
          backgroundSize: "200% 100%",
        }}
        animate={{
          backgroundPosition: ["200% 0", "-200% 0"],
        }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
}

// Pulse border for active/live states
interface PulseBorderProps {
  children: ReactNode;
  className?: string;
  color?: "primary" | "success" | "danger" | "warning";
  active?: boolean;
}

const pulseColors = {
  primary: "hsla(226, 100%, 64%, 0.5)",
  success: "hsla(160, 84%, 39%, 0.5)",
  danger: "hsla(347, 77%, 50%, 0.5)",
  warning: "hsla(38, 92%, 50%, 0.5)",
};

export function PulseBorder({
  children,
  className,
  color = "primary",
  active = true,
}: PulseBorderProps) {
  return (
    <div className={cn("relative", className)}>
      {active && (
        <motion.div
          className="absolute inset-0 rounded-[inherit] -z-10"
          style={{
            boxShadow: `0 0 0 2px ${pulseColors[color]}`,
          }}
          animate={{
            boxShadow: [
              `0 0 0 2px ${pulseColors[color]}`,
              `0 0 0 6px transparent`,
            ],
            opacity: [1, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      )}
      {children}
    </div>
  );
}

// 3D tilt effect on hover
interface TiltCardProps {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
  scale?: number;
  perspective?: number;
}

export function TiltCard({
  children,
  className,
  maxTilt = 10,
  scale = 1.02,
  perspective = 1000,
}: TiltCardProps) {
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    card.style.transform = `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`;
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale(1)`;
  };

  return (
    <div
      className={cn(
        "transition-transform duration-200 ease-out will-change-transform",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transformStyle: "preserve-3d" }}
    >
      {children}
    </div>
  );
}

// Ripple effect for buttons
interface RippleButtonProps {
  children: ReactNode;
  className?: string;
  rippleColor?: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export function RippleButton({
  children,
  className,
  rippleColor = "hsla(226, 100%, 64%, 0.4)",
  onClick,
}: RippleButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ripple = document.createElement("span");
    ripple.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      width: 0;
      height: 0;
      border-radius: 50%;
      background: ${rippleColor};
      transform: translate(-50%, -50%);
      animation: ripple 0.6s ease-out forwards;
      pointer-events: none;
    `;

    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);

    onClick?.(e);
  };

  return (
    <div
      className={cn("relative overflow-hidden cursor-pointer", className)}
      onClick={handleClick}
    >
      {children}
      <style>{`
        @keyframes ripple {
          to {
            width: 400px;
            height: 400px;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

// Typewriter text effect
interface TypewriterTextProps {
  text: string;
  className?: string;
  speed?: number;
  delay?: number;
  showCursor?: boolean;
}

export function TypewriterText({
  text,
  className,
  speed = 50,
  delay = 0,
  showCursor = true,
}: TypewriterTextProps) {
  return (
    <motion.span
      className={cn("inline-block", className)}
      initial="hidden"
      animate="visible"
    >
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + i * (speed / 1000) }}
        >
          {char}
        </motion.span>
      ))}
      {showCursor && (
        <motion.span
          className="inline-block w-0.5 h-[1em] bg-current ml-1"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      )}
    </motion.span>
  );
}
