import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Loader2, AlertCircle } from "lucide-react";

interface VoiceRecognitionProps {
  onTranscript: (transcript: string, isFinal: boolean) => void;
  onListeningChange?: (isListening: boolean) => void;
  isEnabled?: boolean;
  className?: string;
}

export function VoiceRecognition({
  onTranscript,
  onListeningChange,
  isEnabled = true,
  className,
}: VoiceRecognitionProps) {
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  
  // Refs for callbacks and state to avoid stale closures
  const onTranscriptRef = useRef(onTranscript);
  const onListeningChangeRef = useRef(onListeningChange);
  const isListeningRef = useRef(false);
  const isEnabledRef = useRef(isEnabled);
  const isRestartingRef = useRef(false);

  // Sync refs with props/state
  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => {
    onListeningChangeRef.current = onListeningChange;
  }, [onListeningChange]);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    isEnabledRef.current = isEnabled;
  }, [isEnabled]);

  // Initialize speech recognition - ONE TIME ONLY
  useEffect(() => {
    // Check for browser support
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setIsSupported(false);
      setError("Speech recognition not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      if (final) {
        onTranscriptRef.current(final, true);
        setInterimTranscript("");
      } else {
        setInterimTranscript(interim);
        onTranscriptRef.current(interim, false);
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === "not-allowed") {
        setError("Microphone access denied");
      } else if (event.error === "no-speech") {
        // This is normal, just restart
      } else {
        setError(`Recognition error: ${event.error}`);
      }
      setIsListening(false);
      onListeningChangeRef.current?.(false);
    };

    recognition.onend = () => {
      // Restart if still supposed to be listening
      if (isListeningRef.current && isEnabledRef.current && !isRestartingRef.current) {
        isRestartingRef.current = true;
        setTimeout(() => {
          // Verify instance is still current before restarting
          if (recognitionRef.current === recognition && isListeningRef.current && isEnabledRef.current) {
            try {
              recognition.start();
            } catch (e) {
              console.error("Failed to restart recognition:", e);
            }
          }
          isRestartingRef.current = false;
        }, 250);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, []); // Empty dependency array - initialize once only

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current || !isSupported) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setInterimTranscript("");
      onListeningChange?.(false);
    } else {
      setError(null);
      try {
        recognitionRef.current.start();
        setIsListening(true);
        onListeningChange?.(true);
      } catch (e) {
        console.error("Failed to start recognition:", e);
        setError("Failed to start listening");
      }
    }
  }, [isListening, isSupported, onListeningChange]);

  // Stop when disabled
  useEffect(() => {
    if (!isEnabled && isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      setInterimTranscript("");
      onListeningChange?.(false);
    }
  }, [isEnabled, isListening, onListeningChange]);

  return (
    <div className={cn("relative", className)}>
      <Button
        type="button"
        size="icon"
        variant={isListening ? "default" : "outline"}
        className={cn(
          "relative transition-all",
          isListening && "bg-primary animate-pulse"
        )}
        onClick={toggleListening}
        disabled={!isSupported || !isEnabled}
      >
        {isListening ? (
          <MicOff className="h-4 w-4" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
        {isListening && (
          <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-danger animate-pulse" />
        )}
      </Button>

      {/* Listening indicator */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap"
          >
            <Badge className="bg-primary text-primary-foreground gap-1">
              <span className="h-2 w-2 rounded-full bg-danger animate-pulse" />
              Listening...
            </Badge>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interim transcript preview */}
      <AnimatePresence>
        {interimTranscript && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute bottom-full left-0 right-0 mb-12 p-3 rounded-lg bg-secondary/90 backdrop-blur-sm border border-border shadow-lg max-w-sm"
          >
            <p className="text-sm text-muted-foreground italic">"{interimTranscript}"</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error display */}
      {error && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2">
          <Badge variant="destructive" className="gap-1 whitespace-nowrap">
            <AlertCircle className="h-3 w-3" />
            {error}
          </Badge>
        </div>
      )}
    </div>
  );
}
