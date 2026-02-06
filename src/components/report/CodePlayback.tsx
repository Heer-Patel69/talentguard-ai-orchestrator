import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Clock,
  Code,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeSnapshot {
  timestamp: number;
  code: string;
  event: "type" | "paste" | "delete" | "autocomplete";
}

interface CodePlaybackProps {
  snapshots: CodeSnapshot[];
  className?: string;
}

export function CodePlayback({ snapshots, className }: CodePlaybackProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentSnapshot = snapshots[currentIndex];
  const progress = snapshots.length > 1 ? (currentIndex / (snapshots.length - 1)) * 100 : 0;

  useEffect(() => {
    if (isPlaying && currentIndex < snapshots.length - 1) {
      intervalRef.current = setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
      }, 500 / playbackSpeed);
    } else if (currentIndex >= snapshots.length - 1) {
      setIsPlaying(false);
    }

    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
    };
  }, [isPlaying, currentIndex, snapshots.length, playbackSpeed]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSliderChange = (value: number[]) => {
    setCurrentIndex(Math.round((value[0] / 100) * (snapshots.length - 1)));
    setIsPlaying(false);
  };

  const reset = () => {
    setCurrentIndex(0);
    setIsPlaying(false);
  };

  const skipBack = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 10));
  };

  const skipForward = () => {
    setCurrentIndex((prev) => Math.min(snapshots.length - 1, prev + 10));
  };

  const getEventBadge = (event: CodeSnapshot["event"]) => {
    const styles = {
      type: "bg-primary/20 text-primary",
      paste: "bg-warning/20 text-warning",
      delete: "bg-danger/20 text-danger",
      autocomplete: "bg-success/20 text-success",
    };
    return (
      <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", styles[event])}>
        {event.charAt(0).toUpperCase() + event.slice(1)}
      </span>
    );
  };

  return (
    <GlassCard className={className}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Code Playback</h3>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {formatTime(currentSnapshot?.timestamp || 0)}
          </span>
          {currentSnapshot && getEventBadge(currentSnapshot.event)}
        </div>
      </div>

      {/* Code Display */}
      <div className="mb-4 h-64 overflow-auto rounded-lg bg-background/50 font-mono text-sm">
        <pre className="p-4">
          <code className="text-foreground">{currentSnapshot?.code || ""}</code>
        </pre>
      </div>

      {/* Playback Controls */}
      <div className="space-y-4">
        <Slider
          value={[progress]}
          onValueChange={handleSliderChange}
          max={100}
          step={1}
          className="w-full"
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={reset}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={skipBack}>
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button
              variant="hero"
              size="icon"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            <Button variant="outline" size="icon" onClick={skipForward}>
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Speed:</span>
            {[0.5, 1, 2, 4].map((speed) => (
              <Button
                key={speed}
                variant={playbackSpeed === speed ? "default" : "outline"}
                size="sm"
                onClick={() => setPlaybackSpeed(speed)}
                className="h-7 px-2 text-xs"
              >
                {speed}x
              </Button>
            ))}
          </div>
        </div>

        {/* Event Timeline */}
        <div className="flex gap-1 overflow-x-auto py-2">
          {snapshots.map((snapshot, idx) => (
            <motion.button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={cn(
                "h-6 w-1.5 rounded-full transition-colors",
                idx === currentIndex
                  ? "bg-primary"
                  : snapshot.event === "paste"
                  ? "bg-warning/50"
                  : snapshot.event === "delete"
                  ? "bg-danger/50"
                  : "bg-secondary"
              )}
              whileHover={{ scale: 1.5 }}
              title={`${formatTime(snapshot.timestamp)} - ${snapshot.event}`}
            />
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
