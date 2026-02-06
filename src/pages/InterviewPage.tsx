import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { TrustScoreBadge, RiskMeter, ProctorStatusBadge } from "@/components/ui/trust-indicators";
import {
  Send,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Code,
  Layout,
  MessageSquare,
  Play,
  Settings,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Terminal,
  Maximize2,
  Bot,
  User,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

type InterviewMode = "technical" | "system-design" | "behavioral";

const mockMessages = [
  {
    role: "ai",
    content:
      "Hello! I'm your AI interviewer. Today we'll be working through a coding challenge. Are you ready to begin?",
    timestamp: "10:00",
  },
  {
    role: "user",
    content: "Yes, I'm ready. Let's do this!",
    timestamp: "10:01",
  },
  {
    role: "ai",
    content:
      "Great! Here's your challenge: Implement a function that finds the longest palindromic substring in a given string. Take your time to think about the approach before coding.",
    timestamp: "10:01",
  },
];

const defaultCode = `// Find the longest palindromic substring
function longestPalindrome(s: string): string {
  if (s.length < 2) return s;
  
  let start = 0;
  let maxLength = 1;
  
  // Your implementation here
  
  return s.substring(start, start + maxLength);
}

// Test cases
console.log(longestPalindrome("babad")); // Expected: "bab" or "aba"
console.log(longestPalindrome("cbbd"));  // Expected: "bb"
`;

export default function InterviewPage() {
  const [mode, setMode] = useState<InterviewMode>("technical");
  const [messages, setMessages] = useState(mockMessages);
  const [inputMessage, setInputMessage] = useState("");
  const [code, setCode] = useState(defaultCode);
  const [output, setOutput] = useState("");
  const [trustScore, setTrustScore] = useState(94);
  const [riskLevel, setRiskLevel] = useState(6);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: inputMessage,
        timestamp: formatTime(timeElapsed),
      },
    ]);
    setInputMessage("");

    // Simulate AI response
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content:
            "I see your approach. Can you explain the time complexity of your solution? Also, consider edge cases like empty strings or single characters.",
          timestamp: formatTime(timeElapsed + 3),
        },
      ]);
    }, 2000);
  };

  const handleRunCode = () => {
    setOutput("Running code...\n");
    setTimeout(() => {
      setOutput(
        `> longestPalindrome("babad")\n"bab"\n\n> longestPalindrome("cbbd")\n"bb"\n\n✓ All test cases passed!`
      );
    }, 1000);
  };

  const renderWorkspace = () => {
    switch (mode) {
      case "technical":
        return (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-border p-3">
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">solution.ts</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleRunCode}>
                  <Play className="mr-1 h-3 w-3" />
                  Run
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1">
              <Editor
                height="100%"
                defaultLanguage="typescript"
                value={code}
                onChange={(value) => setCode(value || "")}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  padding: { top: 16 },
                  scrollBeyondLastLine: false,
                }}
              />
            </div>
            <div className="border-t border-border">
              <div className="flex items-center gap-2 border-b border-border px-3 py-2">
                <Terminal className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Output</span>
              </div>
              <pre className="h-32 overflow-auto bg-background/50 p-3 font-mono text-sm">
                {output || "Click 'Run' to execute your code"}
              </pre>
            </div>
          </div>
        );

      case "system-design":
        return (
          <div className="flex h-full items-center justify-center bg-secondary/30">
            <div className="text-center">
              <Layout className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">Whiteboard Canvas</h3>
              <p className="text-muted-foreground">
                Draw your system design diagram here
              </p>
              <Button variant="outline" className="mt-4">
                <Maximize2 className="mr-2 h-4 w-4" />
                Open Full Canvas
              </Button>
            </div>
          </div>
        );

      case "behavioral":
        return (
          <div className="flex h-full flex-col items-center justify-center p-8">
            <div className="mx-auto w-full max-w-2xl space-y-4">
              {messages.slice(-3).map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-3",
                    msg.role === "user" ? "flex-row-reverse" : ""
                  )}
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                      msg.role === "ai" ? "bg-primary/20" : "bg-secondary"
                    )}
                  >
                    {msg.role === "ai" ? (
                      <Bot className="h-5 w-5 text-primary" />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </div>
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-3",
                      msg.role === "ai"
                        ? "bg-secondary/50"
                        : "bg-primary text-primary-foreground"
                    )}
                  >
                    <p className="text-sm">{msg.content}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Top Bar */}
      <header className="flex items-center justify-between border-b border-border px-6 py-3">
        <div className="flex items-center gap-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
            <Code className="h-4 w-4" />
          </div>
          <div>
            <h1 className="font-semibold">Technical Interview</h1>
            <p className="text-sm text-muted-foreground">
              Senior Frontend Developer
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-1.5">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono text-sm">{formatTime(timeElapsed)}</span>
          </div>
          <TrustScoreBadge score={trustScore} size="md" />
          <div className="flex items-center gap-2">
            <Button
              variant={isVideoOn ? "secondary" : "destructive"}
              size="icon"
              onClick={() => setIsVideoOn(!isVideoOn)}
            >
              {isVideoOn ? (
                <Video className="h-4 w-4" />
              ) : (
                <VideoOff className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant={isMicOn ? "secondary" : "destructive"}
              size="icon"
              onClick={() => setIsMicOn(!isMicOn)}
            >
              {isMicOn ? (
                <Mic className="h-4 w-4" />
              ) : (
                <MicOff className="h-4 w-4" />
              )}
            </Button>
          </div>
          <Button variant="danger">End Interview</Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - AI Chat */}
        <div className="flex w-96 flex-col border-r border-border">
          {/* Mode Selector */}
          <div className="flex border-b border-border p-2">
            {[
              { id: "technical", icon: Code, label: "Code" },
              { id: "system-design", icon: Layout, label: "Design" },
              { id: "behavioral", icon: MessageSquare, label: "Chat" },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id as InterviewMode)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                  mode === m.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary"
                )}
              >
                <m.icon className="h-4 w-4" />
                {m.label}
              </button>
            ))}
          </div>

          {/* Video Feed */}
          <div className="relative h-48 bg-secondary/50">
            <div className="absolute inset-0 flex items-center justify-center">
              {isVideoOn ? (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-secondary to-background">
                  <User className="h-16 w-16 text-muted-foreground/50" />
                </div>
              ) : (
                <VideoOff className="h-12 w-12 text-muted-foreground" />
              )}
            </div>
            <div className="absolute bottom-2 left-2 flex items-center gap-2">
              <ProctorStatusBadge status="active" label="Proctoring Active" />
            </div>
            <div className="absolute bottom-2 right-2 h-16 w-20 overflow-hidden rounded-lg border border-border bg-secondary">
              <div className="flex h-full w-full items-center justify-center">
                <Bot className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-auto p-4">
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-3",
                    msg.role === "user" ? "flex-row-reverse" : ""
                  )}
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                      msg.role === "ai" ? "bg-primary/20" : "bg-secondary"
                    )}
                  >
                    {msg.role === "ai" ? (
                      <Bot className="h-4 w-4 text-primary" />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                  </div>
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-2",
                      msg.role === "ai"
                        ? "bg-secondary/50"
                        : "bg-primary text-primary-foreground"
                    )}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <span className="mt-1 block text-xs opacity-60">
                      {msg.timestamp}
                    </span>
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="rounded-2xl bg-secondary/50 px-4 py-2">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-primary" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Chat Input */}
          <div className="border-t border-border p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type your response..."
                className="flex-1 rounded-lg border border-border bg-secondary/50 px-4 py-2 text-sm focus:border-primary focus:outline-none"
              />
              <Button size="icon" onClick={handleSendMessage}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Right Panel - Workspace */}
        <div className="flex-1 overflow-hidden">{renderWorkspace()}</div>

        {/* Right Sidebar - Proctoring Status */}
        <div className="w-64 border-l border-border p-4">
          <h3 className="mb-4 font-semibold">Proctoring Status</h3>

          <div className="space-y-4">
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-muted-foreground">Trust Score</span>
                <span className="font-medium">{trustScore}%</span>
              </div>
              <RiskMeter value={100 - trustScore} />
            </div>

            <div className="space-y-2">
              {[
                { label: "Face Detection", status: "active" },
                { label: "Gaze Tracking", status: "active" },
                { label: "Audio Monitoring", status: "active" },
                { label: "Tab Focus", status: "active" },
                { label: "Plagiarism Check", status: "active" },
              ].map((check) => (
                <div
                  key={check.label}
                  className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2"
                >
                  <span className="text-sm">{check.label}</span>
                  <CheckCircle2 className="h-4 w-4 text-success" />
                </div>
              ))}
            </div>

            <div className="rounded-lg border border-border bg-secondary/30 p-3">
              <h4 className="mb-2 flex items-center gap-2 text-sm font-medium">
                <AlertTriangle className="h-4 w-4 text-warning" />
                Recent Events
              </h4>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ChevronRight className="h-3 w-3" />
                  <span>Brief gaze deviation (0:23:15)</span>
                </div>
                <div className="flex items-center gap-2">
                  <ChevronRight className="h-3 w-3" />
                  <span>Session started (0:00:00)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
