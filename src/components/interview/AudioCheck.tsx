import { useState, useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";
import {
  Mic,
  MicOff,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AudioCheckResult {
  microphoneWorking: boolean;
  noiseLevel: "low" | "medium" | "high";
  volumeLevel: number;
  speakerWorking: boolean;
  recommendation: string;
}

interface AudioCheckProps {
  onComplete: (result: AudioCheckResult) => void;
  onSkip?: () => void;
  className?: string;
}

export function AudioCheck({ onComplete, onSkip, className }: AudioCheckProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<"idle" | "checking-mic" | "checking-noise" | "checking-speaker" | "complete">("idle");
  const [micPermission, setMicPermission] = useState<"pending" | "granted" | "denied">("pending");
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [noiseLevel, setNoiseLevel] = useState<"low" | "medium" | "high">("low");
  const [avgNoiseLevel, setAvgNoiseLevel] = useState(0);
  const [speakerTested, setSpeakerTested] = useState(false);
  const [result, setResult] = useState<AudioCheckResult | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  const noiseSamplesRef = useRef<number[]>([]);

  const cleanup = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
    }
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const startMicrophoneCheck = useCallback(async () => {
    setStep("checking-mic");
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      
      streamRef.current = stream;
      setMicPermission("granted");

      // Set up audio analysis
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      // Start checking noise level
      setStep("checking-noise");
      noiseSamplesRef.current = [];

      const checkVolume = () => {
        if (!analyserRef.current) return;
        
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        
        // Calculate average volume
        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        const normalizedVolume = Math.min(100, (average / 128) * 100);
        
        setVolumeLevel(normalizedVolume);
        noiseSamplesRef.current.push(normalizedVolume);

        // Keep collecting samples for 3 seconds
        if (noiseSamplesRef.current.length < 150) { // ~3 seconds at 60fps
          animationRef.current = requestAnimationFrame(checkVolume);
        } else {
          // Calculate average noise level
          const avgNoise = noiseSamplesRef.current.reduce((a, b) => a + b, 0) / noiseSamplesRef.current.length;
          setAvgNoiseLevel(avgNoise);
          
          // Determine noise category
          let level: "low" | "medium" | "high" = "low";
          if (avgNoise > 30) level = "high";
          else if (avgNoise > 15) level = "medium";
          
          setNoiseLevel(level);
          setStep("checking-speaker");
        }
      };

      animationRef.current = requestAnimationFrame(checkVolume);
      
    } catch (error) {
      console.error("Microphone access error:", error);
      setMicPermission("denied");
      toast({
        title: "Microphone Access Required",
        description: "Please allow microphone access to continue with the audio check.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const testSpeaker = useCallback(() => {
    // Create a simple test tone
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 440; // A4 note
    gainNode.gain.value = 0.3;
    
    oscillator.start();
    
    setTimeout(() => {
      oscillator.stop();
      audioContext.close();
      setSpeakerTested(true);
    }, 500);
  }, []);

  const completeCheck = useCallback(() => {
    cleanup();
    
    const checkResult: AudioCheckResult = {
      microphoneWorking: micPermission === "granted",
      noiseLevel,
      volumeLevel: avgNoiseLevel,
      speakerWorking: speakerTested,
      recommendation: getRecommendation(noiseLevel, micPermission === "granted"),
    };
    
    setResult(checkResult);
    setStep("complete");
    onComplete(checkResult);
  }, [micPermission, noiseLevel, avgNoiseLevel, speakerTested, cleanup, onComplete]);

  const getRecommendation = (noise: "low" | "medium" | "high", micWorking: boolean): string => {
    if (!micWorking) {
      return "Please enable microphone access to participate in the voice interview.";
    }
    if (noise === "high") {
      return "High background noise detected. Consider moving to a quieter location for better interview quality.";
    }
    if (noise === "medium") {
      return "Moderate background noise detected. The interview can proceed, but a quieter environment is recommended.";
    }
    return "Audio environment is good. You're ready for the interview!";
  };

  const resetCheck = useCallback(() => {
    cleanup();
    setStep("idle");
    setMicPermission("pending");
    setVolumeLevel(0);
    setNoiseLevel("low");
    setAvgNoiseLevel(0);
    setSpeakerTested(false);
    setResult(null);
    noiseSamplesRef.current = [];
  }, [cleanup]);

  const getNoiseColor = (level: "low" | "medium" | "high") => {
    switch (level) {
      case "low": return "text-success";
      case "medium": return "text-warning";
      case "high": return "text-danger";
    }
  };

  const getNoiseBg = (level: "low" | "medium" | "high") => {
    switch (level) {
      case "low": return "bg-success/10";
      case "medium": return "bg-warning/10";
      case "high": return "bg-danger/10";
    }
  };

  return (
    <GlassCard className={cn("max-w-md mx-auto", className)}>
      <div className="text-center mb-6">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Mic className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-xl font-bold mb-2">Audio Environment Check</h2>
        <p className="text-sm text-muted-foreground">
          Let's make sure your audio is set up correctly for the interview
        </p>
      </div>

      {step === "idle" && (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-secondary/50">
            <p className="text-sm text-muted-foreground">
              This check will:
            </p>
            <ul className="text-sm text-muted-foreground mt-2 space-y-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                Test your microphone
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                Check background noise levels
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                Verify speaker output
              </li>
            </ul>
          </div>

          <Button onClick={startMicrophoneCheck} className="w-full gap-2">
            <Mic className="h-4 w-4" />
            Start Audio Check
          </Button>

          {onSkip && (
            <Button variant="ghost" onClick={onSkip} className="w-full">
              Skip for now
            </Button>
          )}
        </div>
      )}

      {step === "checking-mic" && (
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
          <p className="text-muted-foreground">Requesting microphone access...</p>
        </div>
      )}

      {step === "checking-noise" && (
        <div className="space-y-4">
          <div className="text-center">
            <p className="font-medium mb-2">Checking background noise...</p>
            <p className="text-sm text-muted-foreground">
              Please remain quiet for a few seconds
            </p>
          </div>

          <div className="p-4 rounded-lg bg-secondary/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">Current Volume Level</span>
              <span className="text-sm font-mono">{Math.round(volumeLevel)}%</span>
            </div>
            <Progress value={volumeLevel} className="h-3" />
          </div>

          <motion.div
            className="flex justify-center gap-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ 
                  height: volumeLevel > i * 5 ? 20 + Math.random() * 20 : 8,
                }}
                transition={{ duration: 0.1 }}
                className="w-2 bg-primary rounded-full"
                style={{ minHeight: 8 }}
              />
            ))}
          </motion.div>
        </div>
      )}

      {step === "checking-speaker" && (
        <div className="space-y-4">
          <div className={cn("p-4 rounded-lg", getNoiseBg(noiseLevel))}>
            <div className="flex items-center gap-3 mb-2">
              {noiseLevel === "low" && <CheckCircle2 className={cn("h-5 w-5", getNoiseColor(noiseLevel))} />}
              {noiseLevel === "medium" && <AlertTriangle className={cn("h-5 w-5", getNoiseColor(noiseLevel))} />}
              {noiseLevel === "high" && <XCircle className={cn("h-5 w-5", getNoiseColor(noiseLevel))} />}
              <span className={cn("font-medium", getNoiseColor(noiseLevel))}>
                {noiseLevel === "low" && "Low background noise"}
                {noiseLevel === "medium" && "Moderate background noise"}
                {noiseLevel === "high" && "High background noise detected"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Average noise level: {Math.round(avgNoiseLevel)}%
            </p>
          </div>

          <div className="p-4 rounded-lg bg-secondary/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="h-5 w-5 text-primary" />
                <span className="font-medium">Speaker Test</span>
              </div>
              {speakerTested ? (
                <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Tested
                </Badge>
              ) : (
                <Button size="sm" variant="outline" onClick={testSpeaker}>
                  Play Test Sound
                </Button>
              )}
            </div>
          </div>

          <Button onClick={completeCheck} className="w-full gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Complete Check
          </Button>
        </div>
      )}

      {step === "complete" && result && (
        <div className="space-y-4">
          <div className={cn(
            "p-4 rounded-lg",
            result.noiseLevel === "low" ? "bg-success/10" : 
            result.noiseLevel === "medium" ? "bg-warning/10" : "bg-danger/10"
          )}>
            <div className="flex items-center gap-3 mb-3">
              {result.noiseLevel === "low" ? (
                <CheckCircle2 className="h-6 w-6 text-success" />
              ) : result.noiseLevel === "medium" ? (
                <AlertTriangle className="h-6 w-6 text-warning" />
              ) : (
                <XCircle className="h-6 w-6 text-danger" />
              )}
              <span className="font-semibold">
                {result.noiseLevel === "low" ? "Ready for Interview!" : 
                 result.noiseLevel === "medium" ? "Good to Go" : "Consider Quieter Location"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {result.recommendation}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-secondary/50 text-center">
              <Mic className={cn("h-5 w-5 mx-auto mb-1", 
                result.microphoneWorking ? "text-success" : "text-danger")} />
              <p className="text-xs text-muted-foreground">Microphone</p>
              <p className="text-sm font-medium">
                {result.microphoneWorking ? "Working" : "Not Available"}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/50 text-center">
              <Volume2 className={cn("h-5 w-5 mx-auto mb-1",
                result.speakerWorking ? "text-success" : "text-muted-foreground")} />
              <p className="text-xs text-muted-foreground">Speaker</p>
              <p className="text-sm font-medium">
                {result.speakerWorking ? "Tested" : "Not Tested"}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={resetCheck} className="flex-1 gap-2">
              <RefreshCw className="h-4 w-4" />
              Re-check
            </Button>
            <Button onClick={() => onComplete(result)} className="flex-1">
              Continue
            </Button>
          </div>
        </div>
      )}

      {micPermission === "denied" && (
        <div className="p-4 rounded-lg bg-danger/10 border border-danger/30">
          <div className="flex items-center gap-2 mb-2">
            <MicOff className="h-5 w-5 text-danger" />
            <span className="font-medium text-danger">Microphone Access Denied</span>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Please enable microphone access in your browser settings to continue.
          </p>
          <Button variant="outline" onClick={resetCheck} className="w-full">
            Try Again
          </Button>
        </div>
      )}
    </GlassCard>
  );
}
