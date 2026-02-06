import { useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MessageSquare,
  Bot,
  User,
  Search,
  Download,
  Clock,
  ChevronDown,
  ChevronUp,
  Flag,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TranscriptMessage {
  id: string;
  role: "ai" | "user";
  content: string;
  timestamp: string;
  round: string;
  flagged?: boolean;
  flagReason?: string;
}

interface InterviewTranscriptProps {
  messages: TranscriptMessage[];
  className?: string;
}

export function InterviewTranscript({ messages, className }: InterviewTranscriptProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRounds, setExpandedRounds] = useState<Set<string>>(new Set(["Technical Round"]));
  const [showFlaggedOnly, setShowFlaggedOnly] = useState(false);

  // Group messages by round
  const groupedMessages = messages.reduce((acc, msg) => {
    if (!acc[msg.round]) acc[msg.round] = [];
    acc[msg.round].push(msg);
    return acc;
  }, {} as Record<string, TranscriptMessage[]>);

  const filteredMessages = (msgs: TranscriptMessage[]) => {
    return msgs.filter((msg) => {
      const matchesSearch =
        !searchQuery ||
        msg.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFlag = !showFlaggedOnly || msg.flagged;
      return matchesSearch && matchesFlag;
    });
  };

  const toggleRound = (round: string) => {
    setExpandedRounds((prev) => {
      const next = new Set(prev);
      if (next.has(round)) {
        next.delete(round);
      } else {
        next.add(round);
      }
      return next;
    });
  };

  const handleExport = () => {
    const transcript = messages
      .map((m) => `[${m.timestamp}] ${m.role === "ai" ? "AI" : "Candidate"}: ${m.content}`)
      .join("\n\n");
    const blob = new Blob([transcript], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "interview-transcript.txt";
    a.click();
  };

  const flaggedCount = messages.filter((m) => m.flagged).length;

  return (
    <GlassCard className={className}>
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Interview Transcript</h3>
          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
            {messages.length} messages
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search transcript..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-48 pl-9"
            />
          </div>
          <Button
            variant={showFlaggedOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFlaggedOnly(!showFlaggedOnly)}
            className="gap-1"
          >
            <Flag className="h-3 w-3" />
            {flaggedCount}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-1 h-3 w-3" />
            Export
          </Button>
        </div>
      </div>

      {/* Rounds */}
      <div className="space-y-4">
        {Object.entries(groupedMessages).map(([round, msgs]) => {
          const filtered = filteredMessages(msgs);
          const isExpanded = expandedRounds.has(round);

          return (
            <div key={round} className="rounded-lg border border-border bg-secondary/20">
              <button
                onClick={() => toggleRound(round)}
                className="flex w-full items-center justify-between p-4 text-left hover:bg-secondary/30"
              >
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{round}</span>
                  <span className="text-sm text-muted-foreground">
                    {filtered.length} messages
                  </span>
                  {msgs.some((m) => m.flagged) && (
                    <span className="flex items-center gap-1 rounded-full bg-warning/20 px-2 py-0.5 text-xs text-warning">
                      <Flag className="h-3 w-3" />
                      {msgs.filter((m) => m.flagged).length}
                    </span>
                  )}
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>

              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="max-h-96 space-y-3 overflow-y-auto border-t border-border p-4"
                >
                  {filtered.length === 0 ? (
                    <p className="py-4 text-center text-sm text-muted-foreground">
                      No matching messages
                    </p>
                  ) : (
                    filtered.map((msg, idx) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.02 }}
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
                              : "bg-primary text-primary-foreground",
                            msg.flagged && "ring-2 ring-warning/50"
                          )}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="flex items-center gap-1 text-xs opacity-60">
                              <Clock className="h-3 w-3" />
                              {msg.timestamp}
                            </span>
                            {msg.flagged && (
                              <span className="text-xs text-warning">
                                ⚠ {msg.flagReason}
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
