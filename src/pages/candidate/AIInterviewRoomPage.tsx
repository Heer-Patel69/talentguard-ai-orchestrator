import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  VideoPanel,
  ContinuousVoicePanel,
  RealtimeVoiceAgent,
  CodeEditorPanel,
  WhiteboardPanel,
  ProctoringMonitor,
  useTextToSpeech,
  type Message,
} from "@/components/interview";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Brain,
  CheckCircle2,
  Clock,
  Code2,
  LogOut,
  MessageSquare,
  Sparkles,
  Trophy,
  AlertTriangle,
  Layout,
  Maximize2,
  Minimize2,
  Mic,
  Zap,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { GlassCard } from "@/components/ui/glass-card";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

type InterviewStatus = "preparing" | "in-progress" | "completing" | "completed";
type InterviewType = "technical" | "system-design" | "behavioral";
type WorkspaceMode = "code" | "whiteboard" | "conversation";

const DEFAULT_INTERVIEW_DURATION = 45 * 60; // 45 minutes in seconds

interface ProctoringEvent {
  type: string;
  timestamp: Date;
  severity: "low" | "medium" | "high";
  description: string;
}

export default function AIInterviewRoomPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { speak, stop: stopSpeaking, isSpeaking: ttsIsSpeaking } = useTextToSpeech();

  // Interview state
  const [status, setStatus] = useState<InterviewStatus>("preparing");
  const [interviewType] = useState<InterviewType>(
    (searchParams.get("type") as InterviewType) || "technical"
  );
  const [voiceMode, setVoiceMode] = useState<"standard" | "realtime">("realtime"); // Default to ElevenLabs realtime
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(true);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>(
    interviewType === "system-design" ? "whiteboard" : interviewType === "technical" ? "code" : "conversation"
  );
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Timer state
  const [elapsedTime, setElapsedTime] = useState(0);
  const [interviewDuration, setInterviewDuration] = useState(DEFAULT_INTERVIEW_DURATION);
  const [remainingTime, setRemainingTime] = useState(DEFAULT_INTERVIEW_DURATION);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Dialog state
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);

  // Scores & Proctoring
  const [currentScore, setCurrentScore] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [trustScore, setTrustScore] = useState(100);
  const [proctoringEvents, setProctoringEvents] = useState<ProctoringEvent[]>([]);
  
  // Job context for dynamic configuration
  const [jobContext, setJobContext] = useState<{
    toughnessLevel: number;
    jobField: string;
    jobTitle: string;
  } | null>(null);

  // Fetch job context on mount
  useEffect(() => {
    const fetchJobContext = async () => {
      const applicationId = searchParams.get("application");
      if (!applicationId) return;

      try {
        const { data: application } = await supabase
          .from("applications")
          .select(`
            job_id,
            current_round,
            jobs(id, title, field, toughness_level)
          `)
          .eq("id", applicationId)
          .maybeSingle();

        if (application?.jobs) {
          const job = application.jobs as any;
          setJobContext({
            toughnessLevel: job.toughness_level || 3,
            jobField: job.field || "General",
            jobTitle: job.title || "Unknown Position",
          });

          // Fetch round-specific duration
          const { data: round } = await supabase
            .from("job_rounds")
            .select("duration_minutes")
            .eq("job_id", job.id)
            .eq("round_number", (application.current_round || 0) + 1)
            .maybeSingle();

          if (round?.duration_minutes) {
            const durationSeconds = round.duration_minutes * 60;
            setInterviewDuration(durationSeconds);
            setRemainingTime(durationSeconds);
          }
        }
      } catch (error) {
        console.error("Error fetching job context:", error);
      }
    };

    fetchJobContext();
  }, [searchParams]);

  // Start interview timer
  useEffect(() => {
    if (status === "in-progress") {
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
        setRemainingTime((prev) => {
          if (prev <= 1) {
            handleEndInterview();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [status]);

  // Fullscreen handling
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Start interview with greeting
  const startInterview = useCallback(async () => {
    setStatus("in-progress");
    setIsLoading(true);

    try {
      const greeting = await sendToAgent([
        { role: "user", content: "Start the interview. Greet me and introduce yourself briefly." }
      ]);

      if (greeting) {
        setMessages([
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: greeting,
            timestamp: new Date(),
          },
        ]);
        setQuestionCount(1);

        // Speak the greeting
        if (isSpeaking) {
          speak(greeting);
          setAiSpeaking(true);
        }
      }
    } catch (error) {
      console.error("Failed to start interview:", error);
      toast({
        title: "Failed to start interview",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, isSpeaking, speak]);

  // Send message to AI agent
  const sendToAgent = async (conversationMessages: Array<{ role: string; content: string }>) => {
    // Map toughness level to string
    const toughnessMap: Record<number, string> = {
      1: "easy",
      2: "easy-medium",
      3: "medium",
      4: "medium-hard",
      5: "hard",
    };
    
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/interview-agent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: conversationMessages,
          jobField: jobContext?.jobField || (interviewType === "technical" ? "Data Structures and Algorithms" : 
                   interviewType === "system-design" ? "System Design" : "Behavioral"),
          toughnessLevel: toughnessMap[jobContext?.toughnessLevel || 3] || "medium",
          currentQuestionIndex: questionCount,
          candidateScore: currentScore,
          jobTitle: jobContext?.jobTitle,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to get response from AI");
    }

    // Handle streaming response
    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response body");

    const decoder = new TextDecoder();
    let fullContent = "";
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
        let line = buffer.slice(0, newlineIndex);
        buffer = buffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") break;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            fullContent += content;
          }
        } catch {
          buffer = line + "\n" + buffer;
          break;
        }
      }
    }

    return fullContent;
  };

  // Handle sending a message
  const handleSendMessage = useCallback(
    async (content: string) => {
      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      stopSpeaking();

      try {
        const conversationHistory = [
          ...messages.map((m) => ({ role: m.role, content: m.content })),
          { role: "user" as const, content },
        ];

        const response = await sendToAgent(conversationHistory);

        if (response) {
          const assistantMessage: Message = {
            id: crypto.randomUUID(),
            role: "assistant",
            content: response,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, assistantMessage]);
          setQuestionCount((prev) => prev + 1);

          // Speak the response
          if (isSpeaking) {
            speak(response);
            setAiSpeaking(true);
          }
        }
      } catch (error) {
        console.error("Failed to send message:", error);
        toast({
          title: "Failed to get response",
          description: "Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isSpeaking, toast, speak, stopSpeaking]
  );

  // Handle TTS state
  useEffect(() => {
    setAiSpeaking(ttsIsSpeaking);
  }, [ttsIsSpeaking]);

  // Handle code analysis completion
  const handleCodeAnalysis = useCallback((analysis: any) => {
    if (analysis.overallScore) {
      setCurrentScore((prev) => Math.round((prev + analysis.overallScore) / 2));
    }
  }, []);

  // Handle proctoring events
  const handleProctoringEvent = useCallback((event: ProctoringEvent) => {
    setProctoringEvents((prev) => [...prev, event]);
  }, []);

  // End interview
  const handleEndInterview = useCallback(async () => {
    setStatus("completing");
    stopSpeaking();
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    try {
      const closingMessage = await sendToAgent([
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content: "The interview time is up. Please conclude the interview with a brief thank you and feedback summary." },
      ]);

      if (closingMessage) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: closingMessage,
            timestamp: new Date(),
          },
        ]);

        if (isSpeaking) {
          speak(closingMessage);
        }
      }
    } catch (error) {
      console.error("Failed to get closing message:", error);
    }

    setStatus("completed");
    setShowCompletionDialog(true);
  }, [messages, isSpeaking, speak, stopSpeaking]);

  // Toggle listening
  const toggleListening = useCallback(() => {
    setIsListening((prev) => !prev);
  }, []);

  // Render preparing screen
  if (status === "preparing") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full"
        >
          <GlassCard className="text-center">
            <div className="mb-6">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Brain className="h-10 w-10 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mb-2">AI Interview Room</h1>
              <p className="text-muted-foreground">
                You're about to start a {interviewType.replace("-", " ")} interview with our AI interviewer.
              </p>
            </div>

            <div className="space-y-4 mb-6 text-left">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Duration: 45 minutes</p>
                  <p className="text-sm text-muted-foreground">Timer will start when you begin</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-success/10 border border-success/30">
                <Mic className="h-5 w-5 text-success" />
                <div>
                  <p className="font-medium flex items-center gap-2">
                    Real-time Voice
                    <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/30">
                      <Zap className="h-3 w-3 mr-1" />
                      AI-Powered
                    </Badge>
                  </p>
                  <p className="text-sm text-muted-foreground">Natural conversation — just speak, no buttons needed</p>
                </div>
              </div>

              {interviewType === "technical" && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <Code2 className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Code Editor</p>
                    <p className="text-sm text-muted-foreground">Write and run code for DSA problems</p>
                  </div>
                </div>
              )}

              {interviewType === "system-design" && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <Layout className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Whiteboard</p>
                    <p className="text-sm text-muted-foreground">Draw diagrams for system design</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 rounded-lg bg-warning/10 border border-warning/30 mb-6">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                <div className="text-left">
                  <p className="text-sm font-medium text-warning">Important</p>
                  <p className="text-sm text-muted-foreground">
                    Ensure your camera and microphone are working. The interview will be recorded and proctored.
                  </p>
                </div>
              </div>
            </div>

            <Button onClick={startInterview} variant="hero" className="w-full" size="lg">
              <Sparkles className="h-5 w-5 mr-2" />
              Start Interview
            </Button>
          </GlassCard>
        </motion.div>
      </div>
    );
  }

  // Render completed screen
  if (status === "completed" && showCompletionDialog) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full"
        >
          <GlassCard className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="mb-6"
            >
              <div className="h-24 w-24 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-12 w-12 text-success" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Interview Complete!</h1>
              <p className="text-muted-foreground">
                Thank you for completing the interview. Your responses are being analyzed.
              </p>
            </motion.div>

            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Preliminary Score</span>
                <Badge className="bg-primary text-primary-foreground">Processing...</Badge>
              </div>
              <div className="flex items-center gap-4">
                <Progress value={currentScore} className="flex-1" />
                <span className="text-2xl font-bold">{currentScore}%</span>
              </div>
            </div>

            <div className="space-y-3 mb-6 text-left">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>Interview recorded successfully</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>{questionCount} questions answered</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>Duration: {Math.floor(elapsedTime / 60)} minutes</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>Trust Score: {trustScore}%</span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              Detailed AI review will be available within 24 hours. Check your dashboard for updates.
            </p>

            <Button onClick={() => navigate("/candidate")} className="w-full">
              Return to Dashboard
            </Button>
          </GlassCard>
        </motion.div>
      </div>
    );
  }

  // Main interview room
  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Brain className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 className="font-semibold text-sm">AI Interview</h1>
            <p className="text-xs text-muted-foreground capitalize">{interviewType.replace("-", " ")}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Workspace mode tabs */}
          {interviewType !== "behavioral" && (
            <Tabs value={workspaceMode} onValueChange={(v) => setWorkspaceMode(v as WorkspaceMode)}>
              <TabsList className="h-8">
                <TabsTrigger value="code" className="text-xs px-3" disabled={interviewType === "system-design"}>
                  <Code2 className="h-3.5 w-3.5 mr-1" />
                  Code
                </TabsTrigger>
                <TabsTrigger value="whiteboard" className="text-xs px-3">
                  <Layout className="h-3.5 w-3.5 mr-1" />
                  Whiteboard
                </TabsTrigger>
                <TabsTrigger value="conversation" className="text-xs px-3">
                  <MessageSquare className="h-3.5 w-3.5 mr-1" />
                  Focus
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          <Badge variant="outline" className="gap-1">
            <MessageSquare className="h-3 w-3" />
            Q{questionCount}
          </Badge>

          <Badge
            variant={remainingTime < 300 ? "destructive" : "secondary"}
            className="gap-1 tabular-nums"
          >
            <Clock className="h-3 w-3" />
            {Math.floor(remainingTime / 60)}:{(remainingTime % 60).toString().padStart(2, "0")}
          </Badge>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => setShowExitDialog(true)}
          >
            <LogOut className="h-4 w-4" />
            End
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-12 gap-4 p-4 min-h-0">
        {/* Left Panel - Video + Proctoring */}
        <div className="col-span-3 flex flex-col gap-4">
          <VideoPanel
            isRecording={status === "in-progress"}
            elapsedTime={elapsedTime}
            remainingTime={remainingTime}
            aiSpeaking={aiSpeaking}
            className="flex-1"
          />
          <ProctoringMonitor
            isActive={status === "in-progress"}
            onEvent={handleProctoringEvent}
            onTrustScoreChange={setTrustScore}
          />
        </div>

        {/* Center Panel - Conversation */}
        <div className={cn(
          "flex flex-col",
          workspaceMode === "conversation" ? "col-span-9" : "col-span-4"
        )}>
          {voiceMode === "realtime" ? (
            <RealtimeVoiceAgent
              jobField={jobContext?.jobField}
              toughnessLevel={
                jobContext?.toughnessLevel 
                  ? ["easy", "easy-medium", "medium", "medium-hard", "hard"][jobContext.toughnessLevel - 1] || "medium"
                  : "medium"
              }
              jobTitle={jobContext?.jobTitle}
              onSpeakingChange={setAiSpeaking}
              className="h-full"
            />
          ) : (
            <ContinuousVoicePanel
              messages={messages}
              isLoading={isLoading}
              onSendMessage={handleSendMessage}
              aiSpeaking={aiSpeaking}
              autoListen={true}
              className="h-full"
            />
          )}
        </div>

        {/* Right Panel - Workspace */}
        {workspaceMode !== "conversation" && (
          <div className="col-span-5">
            <AnimatePresence mode="wait">
              {workspaceMode === "code" && (
                <motion.div
                  key="code"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="h-full"
                >
                  <CodeEditorPanel
                    problemStatement="Write a function to solve the problem described by the AI interviewer."
                    onAnalysisComplete={handleCodeAnalysis}
                    className="h-full"
                  />
                </motion.div>
              )}
              {workspaceMode === "whiteboard" && (
                <motion.div
                  key="whiteboard"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="h-full"
                >
                  <WhiteboardPanel className="h-full" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Exit Confirmation Dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End Interview?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to end the interview? Your progress will be saved and submitted for review.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Interview</AlertDialogCancel>
            <AlertDialogAction onClick={handleEndInterview}>
              End Interview
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
