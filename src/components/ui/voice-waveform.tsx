import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface VoiceWaveformProps {
  isActive?: boolean;
  barCount?: number;
  className?: string;
  color?: "primary" | "success" | "danger" | "muted";
  size?: "sm" | "md" | "lg";
}

const colorClasses = {
  primary: "bg-primary",
  success: "bg-success",
  danger: "bg-danger",
  muted: "bg-muted-foreground",
};

const sizeConfig = {
  sm: { height: 16, barWidth: 2, gap: 1 },
  md: { height: 24, barWidth: 3, gap: 2 },
  lg: { height: 40, barWidth: 4, gap: 3 },
};

export function VoiceWaveform({
  isActive = false,
  barCount = 5,
  className,
  color = "primary",
  size = "md",
}: VoiceWaveformProps) {
  const { height, barWidth, gap } = sizeConfig[size];

  return (
    <div 
      className={cn("flex items-center", className)}
      style={{ gap: `${gap}px`, height: `${height}px` }}
    >
      {Array.from({ length: barCount }).map((_, i) => (
        <motion.div
          key={i}
          className={cn("rounded-full", colorClasses[color])}
          style={{ width: `${barWidth}px` }}
          animate={isActive ? {
            height: [
              `${height * 0.3}px`,
              `${height * (0.4 + Math.random() * 0.6)}px`,
              `${height * 0.3}px`,
            ],
          } : {
            height: `${height * 0.3}px`,
          }}
          transition={isActive ? {
            duration: 0.4 + Math.random() * 0.3,
            repeat: Infinity,
            repeatType: "loop",
            delay: i * 0.1,
            ease: "easeInOut",
          } : {
            duration: 0.3,
          }}
        />
      ))}
    </div>
  );
}

// Audio level meter (for real audio input)
interface AudioLevelMeterProps {
  audioLevel?: number; // 0-100
  className?: string;
  barCount?: number;
}

export function AudioLevelMeter({
  audioLevel = 0,
  className,
  barCount = 10,
}: AudioLevelMeterProps) {
  const normalizedLevel = Math.min(100, Math.max(0, audioLevel));
  const activeBars = Math.floor((normalizedLevel / 100) * barCount);

  return (
    <div className={cn("flex items-end gap-0.5 h-6", className)}>
      {Array.from({ length: barCount }).map((_, i) => {
        const isActive = i < activeBars;
        const intensity = i / barCount;
        
        return (
          <motion.div
            key={i}
            className={cn(
              "w-1 rounded-full transition-colors duration-150",
              isActive
                ? intensity < 0.6
                  ? "bg-success"
                  : intensity < 0.8
                    ? "bg-warning"
                    : "bg-danger"
                : "bg-muted"
            )}
            animate={{ 
              height: isActive ? `${40 + i * 6}%` : "20%",
              opacity: isActive ? 1 : 0.3,
            }}
            transition={{ duration: 0.1 }}
          />
        );
      })}
    </div>
  );
}

// Circular audio visualizer
interface CircularVisualizerProps {
  isActive?: boolean;
  className?: string;
  size?: number;
}

export function CircularVisualizer({
  isActive = false,
  className,
  size = 80,
}: CircularVisualizerProps) {
  return (
    <div 
      className={cn("relative flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      {/* Outer rings */}
      {[0, 1, 2].map((ring) => (
        <motion.div
          key={ring}
          className="absolute rounded-full border-2 border-primary/30"
          style={{
            width: size - ring * 16,
            height: size - ring * 16,
          }}
          animate={isActive ? {
            scale: [1, 1.1 + ring * 0.05, 1],
            opacity: [0.3, 0.6, 0.3],
          } : {
            scale: 1,
            opacity: 0.2,
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: ring * 0.2,
            ease: "easeInOut",
          }}
        />
      ))}
      
      {/* Center dot */}
      <motion.div
        className="absolute rounded-full bg-primary"
        style={{ width: size * 0.25, height: size * 0.25 }}
        animate={isActive ? {
          scale: [1, 1.2, 1],
        } : {
          scale: 1,
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

// Speaking indicator with avatar
interface SpeakingAvatarProps {
  src?: string;
  alt?: string;
  isSpeaking?: boolean;
  size?: number;
  className?: string;
}

export function SpeakingAvatar({
  src,
  alt = "Speaker",
  isSpeaking = false,
  size = 48,
  className,
}: SpeakingAvatarProps) {
  return (
    <div 
      className={cn("relative", className)}
      style={{ width: size, height: size }}
    >
      {/* Pulsing ring when speaking */}
      <motion.div
        className="absolute inset-0 rounded-full bg-primary"
        animate={isSpeaking ? {
          scale: [1, 1.15, 1],
          opacity: [0.5, 0.2, 0.5],
        } : {
          scale: 1,
          opacity: 0,
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Avatar */}
      <div className="absolute inset-0 rounded-full overflow-hidden border-2 border-background">
        {src ? (
          <img src={src} alt={alt} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-primary/20 flex items-center justify-center">
            <span className="text-lg font-semibold text-primary">
              {alt.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>
      
      {/* Speaking indicator dot */}
      {isSpeaking && (
        <motion.div
          className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-success border-2 border-background"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.6, repeat: Infinity }}
        />
      )}
    </div>
  );
}

// Real-time audio visualizer using Web Audio API
interface LiveAudioVisualizerProps {
  stream?: MediaStream;
  className?: string;
  barCount?: number;
}

export function LiveAudioVisualizer({
  stream,
  className,
  barCount = 32,
}: LiveAudioVisualizerProps) {
  const [levels, setLevels] = useState<number[]>(Array(barCount).fill(0));
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!stream) return;

    const audioContext = new AudioContext();
    const analyzer = audioContext.createAnalyser();
    analyzer.fftSize = barCount * 2;
    analyzerRef.current = analyzer;

    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyzer);

    const dataArray = new Uint8Array(analyzer.frequencyBinCount);

    const updateLevels = () => {
      analyzer.getByteFrequencyData(dataArray);
      const newLevels = Array.from(dataArray.slice(0, barCount)).map(
        (v) => v / 255
      );
      setLevels(newLevels);
      animationRef.current = requestAnimationFrame(updateLevels);
    };

    updateLevels();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      audioContext.close();
    };
  }, [stream, barCount]);

  return (
    <div className={cn("flex items-end justify-center gap-0.5 h-16", className)}>
      {levels.map((level, i) => (
        <motion.div
          key={i}
          className="w-1 rounded-full bg-primary"
          style={{ height: `${Math.max(4, level * 100)}%` }}
          transition={{ duration: 0.05 }}
        />
      ))}
    </div>
  );
}
