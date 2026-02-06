import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Brain,
  User,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Loader2,
  Sparkles,
} from "lucide-react";

export interface Message {
  id: string;
  role: "assistant" | "user";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface ConversationPanelProps {
  messages: Message[];
  isLoading: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  onSendMessage: (message: string) => void;
  onToggleListening: () => void;
  onToggleSpeaking: () => void;
  className?: string;
}

export function ConversationPanel({
  messages,
  isLoading,
  isListening,
  isSpeaking,
  onSendMessage,
  onToggleListening,
  onToggleSpeaking,
  className,
}: ConversationPanelProps) {
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (inputValue.trim() && !isLoading) {
        onSendMessage(inputValue.trim());
        setInputValue("");
      }
    },
    [inputValue, isLoading, onSendMessage]
  );

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={cn("flex flex-col h-full rounded-xl border border-border bg-card", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Brain className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">AI Interview</h3>
            <p className="text-xs text-muted-foreground">
              {isLoading ? "Thinking..." : isListening ? "Listening..." : "Ready"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={isSpeaking ? "default" : "outline"}
            className="h-8"
            onClick={onToggleSpeaking}
          >
            {isSpeaking ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={cn(
                  "flex gap-3",
                  message.role === "user" && "flex-row-reverse"
                )}
              >
                <div
                  className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                    message.role === "assistant"
                      ? "bg-primary/10"
                      : "bg-success/10"
                  )}
                >
                  {message.role === "assistant" ? (
                    <Brain className="h-4 w-4 text-primary" />
                  ) : (
                    <User className="h-4 w-4 text-success" />
                  )}
                </div>

                <div
                  className={cn(
                    "flex-1 space-y-1",
                    message.role === "user" && "text-right"
                  )}
                >
                  <div
                    className={cn(
                      "inline-block rounded-xl px-4 py-2.5 text-sm max-w-[85%]",
                      message.role === "assistant"
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-primary text-primary-foreground"
                    )}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    {message.isStreaming && (
                      <span className="inline-block w-1.5 h-4 bg-current ml-0.5 animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground px-1">
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Brain className="h-4 w-4 text-primary" />
              </div>
              <div className="bg-secondary rounded-xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t border-border">
        {isListening && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 p-3 rounded-lg bg-primary/5 border border-primary/20"
          >
            <div className="flex items-center gap-2">
              <div className="relative">
                <Mic className="h-5 w-5 text-primary" />
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-danger animate-pulse" />
              </div>
              <span className="text-sm text-primary">Listening... Speak now</span>
              <div className="flex-1 flex items-center justify-end gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ height: [8, 16, 8] }}
                    transition={{
                      duration: 0.5,
                      repeat: Infinity,
                      delay: i * 0.1,
                    }}
                    className="w-1 bg-primary rounded-full"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Button
            type="button"
            size="icon"
            variant={isListening ? "default" : "outline"}
            className="shrink-0"
            onClick={onToggleListening}
          >
            {isListening ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>

          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your answer or use voice..."
            className="flex-1"
            disabled={isLoading || isListening}
          />

          <Button
            type="submit"
            size="icon"
            disabled={!inputValue.trim() || isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-2">
          <Sparkles className="h-3 w-3 inline mr-1" />
          AI is evaluating your responses in real-time
        </p>
      </div>
    </div>
  );
}
