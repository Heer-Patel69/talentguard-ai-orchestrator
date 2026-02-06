import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { VideoPanel, ConversationPanel, CodeEditorPanel, type Message } from "@/components/interview";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { GlassCard } from "@/components/ui/glass-card";
import { supabase } from "@/integrations/supabase/client";

type InterviewStatus = "preparing" | "in-progress" | "completing" | "completed";
type InterviewType = "technical" | "system-design" | "behavioral";

const INTERVIEW_DURATION = 45 * 60; // 45 minutes in seconds

export default function AIInterviewRoomPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  // Interview state
  const [status, setStatus] = useState<InterviewStatus>("preparing");
  const [interviewType] = useState<InterviewType>(
    (searchParams.get("type") as InterviewType) || "technical"
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(true);
  const [aiSpeaking, setAiSpeaking] = useState(false);

  // Timer state
  const [elapsedTime, setElapsedTime] = useState(0);
  const [remainingTime, setRemainingTime] = useState(INTERVIEW_DURATION);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Dialog state
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);

  // Scores
  const [currentScore, setCurrentScore] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);

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
  }, [toast]);

  // Send message to AI agent
  const sendToAgent = async (conversationMessages: Array<{ role: string; content: string }>) => {
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
          jobField: interviewType === "technical" ? "Data Structures and Algorithms" : interviewType,
          toughnessLevel: "medium",
          currentQuestionIndex: questionCount,
          candidateScore: currentScore,
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

      // Process line-by-line
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
      // Add user message
      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        // Build conversation history
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

          // Simulate AI speaking
          if (isSpeaking) {
            setAiSpeaking(true);
            setTimeout(() => setAiSpeaking(false), 3000);
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
    [messages, isSpeaking, toast]
  );

  // Handle code analysis completion
  const handleCodeAnalysis = useCallback((analysis: any) => {
    if (analysis.overallScore) {
      setCurrentScore((prev) => Math.round((prev + analysis.overallScore) / 2));
    }
  }, []);

  // End interview
  const handleEndInterview = useCallback(async () => {
    setStatus("completing");
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Send closing message
    try {
      const closingMessage = await sendToAgent([
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content: "The interview time is up. Please conclude the interview with a brief thank you and feedback." },
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
      }
    } catch (error) {
      console.error("Failed to get closing message:", error);
    }

    setStatus("completed");
    setShowCompletionDialog(true);
  }, [messages]);

  // Toggle listening (voice input)
  const toggleListening = useCallback(() => {
    setIsListening((prev) => !prev);
    if (!isListening) {
      toast({
        title: "Voice input",
        description: "Voice transcription will be available soon. Please type your response.",
      });
      setIsListening(false);
    }
  }, [isListening, toast]);

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
                You're about to start a {interviewType} interview with our AI interviewer.
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

              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <MessageSquare className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Voice & Text</p>
                  <p className="text-sm text-muted-foreground">Respond verbally or type your answers</p>
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
            </div>

            <div className="p-4 rounded-lg bg-warning/10 border border-warning/30 mb-6">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                <div className="text-left">
                  <p className="text-sm font-medium text-warning">Important</p>
                  <p className="text-sm text-muted-foreground">
                    Ensure your camera and microphone are working. The interview will be recorded for evaluation.
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
            <p className="text-xs text-muted-foreground capitalize">{interviewType}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Badge variant="outline" className="gap-1">
            <MessageSquare className="h-3 w-3" />
            Q{questionCount}
          </Badge>

          <div className="flex items-center gap-2">
            <Badge
              variant={remainingTime < 300 ? "destructive" : "secondary"}
              className="gap-1 tabular-nums"
            >
              <Clock className="h-3 w-3" />
              {Math.floor(remainingTime / 60)}:{(remainingTime % 60).toString().padStart(2, "0")}
            </Badge>
          </div>

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
        {/* Left Panel - Video */}
        <div className="col-span-3">
          <VideoPanel
            isRecording={status === "in-progress"}
            elapsedTime={elapsedTime}
            remainingTime={remainingTime}
            aiSpeaking={aiSpeaking}
            className="h-full"
          />
        </div>

        {/* Center Panel - Conversation */}
        <div className="col-span-4">
          <ConversationPanel
            messages={messages}
            isLoading={isLoading}
            isListening={isListening}
            isSpeaking={isSpeaking}
            onSendMessage={handleSendMessage}
            onToggleListening={toggleListening}
            onToggleSpeaking={() => setIsSpeaking(!isSpeaking)}
            className="h-full"
          />
        </div>

        {/* Right Panel - Code Editor (for technical) */}
        <div className="col-span-5">
          {interviewType === "technical" ? (
            <CodeEditorPanel
              problemStatement="Write a function to solve the problem described by the AI interviewer."
              onAnalysisComplete={handleCodeAnalysis}
              className="h-full"
            />
          ) : (
            <GlassCard className="h-full flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Conversation Mode</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  This is a {interviewType} interview. Focus on the conversation panel and provide thoughtful responses.
                </p>
              </div>
            </GlassCard>
          )}
        </div>
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
