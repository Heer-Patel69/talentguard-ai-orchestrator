import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface ScanningOverlayProps {
  status?: "scanning" | "success" | "error" | "idle";
  message?: string;
  className?: string;
}

export function ScanningOverlay({
  status = "scanning",
  message,
  className,
}: ScanningOverlayProps) {
  return (
    <div className={cn("absolute inset-0 pointer-events-none", className)}>
      {/* Corner brackets */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-[80%] h-[80%] max-w-[400px] max-h-[400px]">
          {/* Top Left */}
          <motion.div
            className="absolute top-0 left-0 w-12 h-12 border-l-2 border-t-2 border-primary"
            animate={status === "scanning" ? {
              opacity: [0.5, 1, 0.5],
            } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          {/* Top Right */}
          <motion.div
            className="absolute top-0 right-0 w-12 h-12 border-r-2 border-t-2 border-primary"
            animate={status === "scanning" ? {
              opacity: [0.5, 1, 0.5],
            } : {}}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
          />
          {/* Bottom Left */}
          <motion.div
            className="absolute bottom-0 left-0 w-12 h-12 border-l-2 border-b-2 border-primary"
            animate={status === "scanning" ? {
              opacity: [0.5, 1, 0.5],
            } : {}}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
          />
          {/* Bottom Right */}
          <motion.div
            className="absolute bottom-0 right-0 w-12 h-12 border-r-2 border-b-2 border-primary"
            animate={status === "scanning" ? {
              opacity: [0.5, 1, 0.5],
            } : {}}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
          />

          {/* Scanning line */}
          {status === "scanning" && (
            <motion.div
              className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"
              animate={{
                top: ["10%", "90%", "10%"],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          )}
        </div>
      </div>

      {/* Center indicator */}
      <div className="absolute inset-0 flex items-center justify-center">
        {status === "scanning" && (
          <motion.div
            className="w-24 h-24 rounded-full border-2 border-primary/30"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}
        {status === "success" && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-24 h-24 rounded-full bg-success/20 flex items-center justify-center"
          >
            <CheckCircle2 className="w-12 h-12 text-success" />
          </motion.div>
        )}
        {status === "error" && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-24 h-24 rounded-full bg-danger/20 flex items-center justify-center"
          >
            <XCircle className="w-12 h-12 text-danger" />
          </motion.div>
        )}
      </div>

      {/* Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-8 left-0 right-0 text-center"
        >
          <span className={cn(
            "px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm",
            status === "success" && "bg-success/20 text-success",
            status === "error" && "bg-danger/20 text-danger",
            status === "scanning" && "bg-primary/20 text-primary"
          )}>
            {status === "scanning" && (
              <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
            )}
            {message}
          </span>
        </motion.div>
      )}
    </div>
  );
}

// Face detection overlay
interface FaceDetectionOverlayProps {
  detected?: boolean;
  faceBox?: { x: number; y: number; width: number; height: number };
  className?: string;
}

export function FaceDetectionOverlay({
  detected = false,
  faceBox,
  className,
}: FaceDetectionOverlayProps) {
  return (
    <div className={cn("absolute inset-0 pointer-events-none", className)}>
      {/* Face outline guide */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className={cn(
            "w-48 h-64 rounded-[50%] border-2",
            detected ? "border-success" : "border-primary/50"
          )}
          animate={!detected ? {
            borderColor: ["hsla(226, 100%, 64%, 0.5)", "hsla(226, 100%, 64%, 1)", "hsla(226, 100%, 64%, 0.5)"],
          } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>

      {/* Detected face box */}
      {faceBox && detected && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute border-2 border-success rounded-lg"
          style={{
            left: `${faceBox.x}%`,
            top: `${faceBox.y}%`,
            width: `${faceBox.width}%`,
            height: `${faceBox.height}%`,
          }}
        >
          {/* Corner dots */}
          <div className="absolute -top-1 -left-1 w-2 h-2 bg-success rounded-full" />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-success rounded-full" />
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-success rounded-full" />
          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-success rounded-full" />
        </motion.div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={cn(
            "text-sm font-medium",
            detected ? "text-success" : "text-muted-foreground"
          )}
        >
          {detected ? "Face detected ✓" : "Position your face within the oval"}
        </motion.p>
      </div>
    </div>
  );
}

// Progress ring for verification
interface VerificationProgressProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function VerificationProgress({
  progress,
  size = 120,
  strokeWidth = 4,
  className,
}: VerificationProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn("relative", className)} style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background circle */}
        <circle
          className="text-muted"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress circle */}
        <motion.circle
          className="text-primary"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span
          key={Math.round(progress)}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-2xl font-bold"
        >
          {Math.round(progress)}%
        </motion.span>
      </div>
    </div>
  );
}
