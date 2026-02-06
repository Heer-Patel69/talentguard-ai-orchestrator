import { useState, useCallback, useEffect, useRef } from "react";
import { useConversation } from "@elevenlabs/react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import {
  Brain,
  User,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Loader2,
  Sparkles,
  Phone,
  PhoneOff,
  Waves,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface VoiceMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
  timestamp: Date;
}

interface RealtimeVoiceAgentProps {
  jobField?: string;
  toughnessLevel?: string;
  jobTitle?: string;
  onMessage?: (message: VoiceMessage) => void;
  onConnectionChange?: (connected: boolean) => void;
  onSpeakingChange?: (isSpeaking: boolean) => void;
  className?: string;
  autoConnect?: boolean;
}

export function RealtimeVoiceAgent({
  jobField = "Technical",
  toughnessLevel = "medium",
  jobTitle = "Software Engineer",
  onMessage,
  onConnectionChange,
  onSpeakingChange,
  className,
  autoConnect = false,
}: RealtimeVoiceAgentProps) {
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Reconnection tracking
  const reconnectAttemptRef = useRef(0);
  const maxReconnectAttempts = 3;

  const conversation = useConversation({
    onConnect: () => {
      console.log("Connected to ElevenLabs agent");
      reconnectAttemptRef.current = 0; // Reset on successful connect
      onConnectionChange?.(true);
      toast({
        title: "Connected",
        description: "Voice interview started. Speak naturally!",
      });
    },
    onDisconnect: () => {
      console.log("Disconnected from ElevenLabs agent");
      onConnectionChange?.(false);
      
      // Only show disconnect toast if it wasn't intentional (we didn't call endSession manually)
      // If still expecting connection, this might be a glitch - don't alarm user
    },
    onMessage: (message: any) => {
      console.log("Agent message:", message);
      
      // Handle user transcripts
      if (message?.type === "user_transcript") {
        const userTranscript = message?.user_transcription_event?.user_transcript;
        if (userTranscript && userTranscript.trim().length > 2) {
          // Ignore very short transcripts (likely noise)
          const voiceMessage: VoiceMessage = {
            id: crypto.randomUUID(),
            role: "user",
            content: userTranscript,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, voiceMessage]);
          onMessage?.(voiceMessage);
          
          // Check if user wants to end the interview - only for clear, intentional phrases
          const endPhrases = [
            "end the meeting", "end meeting", "end the interview", "end interview",
            "stop the interview", "stop interview", "finish interview", "finish the interview",
            "that's all for today", "i'm done with the interview", "goodbye and thank you",
            "thank you and goodbye", "end call", "end the call", "leave meeting", "leave the meeting",
            "i want to end", "please end"
          ];
          const lowerTranscript = userTranscript.toLowerCase().trim();
          const shouldEnd = endPhrases.some(phrase => lowerTranscript.includes(phrase));
          
          if (shouldEnd) {
            console.log("User requested to end interview:", userTranscript);
            // Give AI a moment to respond gracefully, then end
            setTimeout(async () => {
              try {
                await conversation.endSession();
                toast({
                  title: "Interview Ended",
                  description: "Thank you for completing the interview!",
                });
              } catch (e) {
                console.error("Error ending session:", e);
              }
            }, 3000); // Wait 3 seconds for AI to say goodbye
          }
        }
      }
      
      // Handle agent responses
      if (message?.type === "agent_response") {
        const agentResponse = message?.agent_response_event?.agent_response;
        if (agentResponse) {
          const voiceMessage: VoiceMessage = {
            id: crypto.randomUUID(),
            role: "assistant",
            content: agentResponse,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, voiceMessage]);
          onMessage?.(voiceMessage);
        }
      }
    },
    onError: (error) => {
      console.error("Conversation error:", error);
      
      // Don't show error for minor glitches - only for actual failures
      if (error?.message?.includes("connection") || error?.message?.includes("WebSocket")) {
        // Attempt auto-reconnect for connection issues
        if (reconnectAttemptRef.current < maxReconnectAttempts) {
          reconnectAttemptRef.current++;
          console.log(`Attempting reconnection ${reconnectAttemptRef.current}/${maxReconnectAttempts}`);
          
          setTimeout(() => {
            startConversation();
          }, 1000 * reconnectAttemptRef.current); // Exponential backoff
          return;
        }
      }
      
      toast({
        title: "Connection Issue",
        description: "The voice connection experienced a minor hiccup. You can continue speaking normally.",
        variant: "default",
      });
    },
  });

  // Track speaking state
  useEffect(() => {
    onSpeakingChange?.(conversation.isSpeaking);
  }, [conversation.isSpeaking, onSpeakingChange]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const startConversation = useCallback(async () => {
    setIsConnecting(true);
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Get connection info from edge function
      const { data, error } = await supabase.functions.invoke(
        "elevenlabs-conversation-token",
        { body: { jobField, toughnessLevel, jobTitle } }
      );

      if (error) {
        throw new Error(error.message || "Failed to connect");
      }

      // Try different connection methods based on what the server returned
      if (data?.signedUrl) {
        // Use WebSocket with signed URL
        await conversation.startSession({
          signedUrl: data.signedUrl,
        });
      } else if (data?.token) {
        // Use WebRTC with conversation token
        await conversation.startSession({
          conversationToken: data.token,
          connectionType: "webrtc",
        });
      } else if (data?.agentId && data?.usePublicMode) {
        // Fallback to public agent mode (agent must be public in ElevenLabs dashboard)
        await conversation.startSession({
          agentId: data.agentId,
          connectionType: "webrtc",
        });
      } else {
        throw new Error("No valid connection method received from server");
      }
    } catch (error) {
      console.error("Failed to start conversation:", error);
      toast({
        title: "Failed to Start",
        description: error instanceof Error ? error.message : "Could not start voice interview",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  }, [jobField, toughnessLevel, jobTitle, conversation, toast]);

  const stopConversation = useCallback(async () => {
    try {
      // Immediately clear state to show disconnected status
      setMessages([]);
      reconnectAttemptRef.current = maxReconnectAttempts; // Prevent auto-reconnect
      
      // Then end the session
      await conversation.endSession();
      
      toast({
        title: "Interview Ended",
        description: "The voice interview has been disconnected.",
      });
    } catch (error) {
      console.error("Error ending conversation:", error);
      // Force clear state even on error
      setMessages([]);
      toast({
        title: "Interview Ended",
        description: "The voice interview has been disconnected.",
      });
    }
  }, [conversation, toast]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
    // Note: ElevenLabs SDK doesn't have direct mute - we'd need to handle this differently
  }, []);

  const adjustVolume = useCallback(async (newVolume: number) => {
    setVolume(newVolume);
    await conversation.setVolume({ volume: newVolume });
  }, [conversation]);

  // Auto-connect if enabled
  useEffect(() => {
    if (autoConnect && conversation.status === "disconnected") {
      startConversation();
    }
  }, [autoConnect, conversation.status, startConversation]);

  const isConnected = conversation.status === "connected";
  const isAgentSpeaking = conversation.isSpeaking;

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
          <div className={cn(
            "h-8 w-8 rounded-full flex items-center justify-center transition-colors",
            isConnected ? "bg-success/10" : "bg-primary/10"
          )}>
            <Brain className={cn(
              "h-4 w-4",
              isConnected ? "text-success" : "text-primary"
            )} />
          </div>
          <div>
            <h3 className="font-semibold text-sm">AI Interviewer</h3>
            <div className="flex items-center gap-1">
              {isConnected ? (
                <Badge variant="outline" className="text-xs gap-1 bg-success/10 text-success border-success/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                  {isAgentSpeaking ? "Speaking..." : "Listening"}
                </Badge>
              ) : (
                <span className="text-xs text-muted-foreground">
                  {isConnecting ? "Connecting..." : "Ready to start"}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isConnected && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => adjustVolume(volume > 0 ? 0 : 0.8)}
              >
                {volume > 0 ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <VolumeX className="h-4 w-4" />
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Messages / Conversation area */}
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="space-y-4">
          {!isConnected && messages.length === 0 && (
            <div className="text-center py-12">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Waves className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Real-time Voice Interview</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Start the conversation to speak naturally with the AI interviewer. 
                No need to press any buttons — just talk!
              </p>
            </div>
          )}

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
                  </div>
                  <p className="text-xs text-muted-foreground px-1">
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Speaking indicator */}
          {isConnected && isAgentSpeaking && (
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
                  <div className="flex gap-1">
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
                  <span className="text-sm text-muted-foreground">Speaking...</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Listening indicator when connected but not speaking */}
          {isConnected && !isAgentSpeaking && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center py-4"
            >
              <Badge variant="outline" className="gap-2 bg-success/5 border-success/20">
                <Mic className="h-3 w-3 text-success" />
                <span className="text-success">Listening to you...</span>
                <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
              </Badge>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Control Area */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-center gap-4">
          {!isConnected ? (
            <Button
              onClick={startConversation}
              disabled={isConnecting}
              className="gap-2 bg-success hover:bg-success/90"
              size="lg"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Phone className="h-5 w-5" />
                  Start Voice Interview
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={stopConversation}
              variant="destructive"
              className="gap-2"
              size="lg"
            >
              <PhoneOff className="h-5 w-5" />
              End Interview
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center mt-3">
          <Sparkles className="h-3 w-3 inline mr-1" />
          {isConnected 
            ? "Speak naturally — the AI will listen and respond in real-time"
            : "Click to start a natural voice conversation with the AI interviewer"
          }
        </p>
      </div>
    </div>
  );
}
