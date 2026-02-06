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
  const [volume, setVolume] = useState(0.8);
  const [connectionState, setConnectionState] = useState<"idle" | "connecting" | "connected" | "disconnecting" | "error">("idle");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Connection stability tracking
  const reconnectAttemptRef = useRef(0);
  const maxReconnectAttempts = 3;
  const isIntentionalDisconnectRef = useRef(false);
  const connectionLockRef = useRef(false); // Prevent concurrent connection attempts
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasAutoConnectedRef = useRef(false); // Prevent multiple auto-connects
  const sessionActiveRef = useRef(false); // Track if session is truly active
  const lastConnectionAttemptRef = useRef<number>(0); // Debounce connection attempts
  const cleanupInProgressRef = useRef(false); // Prevent cleanup race conditions

  // Store callbacks in refs to avoid dependency issues
  const onMessageRef = useRef(onMessage);
  const onConnectionChangeRef = useRef(onConnectionChange);
  const onSpeakingChangeRef = useRef(onSpeakingChange);
  
  useEffect(() => {
    onMessageRef.current = onMessage;
    onConnectionChangeRef.current = onConnectionChange;
    onSpeakingChangeRef.current = onSpeakingChange;
  }, [onMessage, onConnectionChange, onSpeakingChange]);

  // Cleanup function for reconnect timeouts
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      // Mark session as inactive on unmount
      sessionActiveRef.current = false;
      cleanupInProgressRef.current = true;
    };
  }, []);

  const conversation = useConversation({
    onConnect: () => {
      console.log("✅ Connected to ElevenLabs agent successfully");
      reconnectAttemptRef.current = 0;
      connectionLockRef.current = false;
      sessionActiveRef.current = true;
      cleanupInProgressRef.current = false;
      setIsConnecting(false);
      onConnectionChangeRef.current?.(true);
      toast({
        title: "Connected",
        description: "Voice interview started. Speak naturally - the AI is listening!",
      });
    },
    onDisconnect: () => {
      console.log("Disconnected from ElevenLabs agent");
      const wasActive = sessionActiveRef.current;
      sessionActiveRef.current = false;
      connectionLockRef.current = false;
      cleanupInProgressRef.current = false;
      setIsConnecting(false);
      onConnectionChangeRef.current?.(false);
      
      // Only attempt reconnect if:
      // 1. It wasn't intentional
      // 2. We haven't exceeded attempts  
      // 3. The session was previously active (not a failed initial connection)
      if (
        !isIntentionalDisconnectRef.current && 
        reconnectAttemptRef.current < maxReconnectAttempts &&
        wasActive
      ) {
        reconnectAttemptRef.current++;
        // Exponential backoff with jitter to prevent thundering herd
        const baseDelay = Math.min(1000 * Math.pow(2, reconnectAttemptRef.current - 1), 5000);
        const jitter = Math.random() * 500;
        const delay = baseDelay + jitter;
        
        console.log(`🔄 Auto-reconnecting in ${Math.round(delay)}ms (attempt ${reconnectAttemptRef.current}/${maxReconnectAttempts})`);
        
        toast({
          title: "Reconnecting...",
          description: `Connection lost. Attempting to reconnect (${reconnectAttemptRef.current}/${maxReconnectAttempts})`,
        });
        
        // Clear any existing timeout first
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        
        reconnectTimeoutRef.current = setTimeout(() => {
          // Double-check we should still reconnect
          if (!isIntentionalDisconnectRef.current && !sessionActiveRef.current && !cleanupInProgressRef.current) {
            startConversationInternal();
          }
        }, delay);
      } else if (isIntentionalDisconnectRef.current) {
        console.log("✅ Intentional disconnect, not reconnecting");
      }
    },
    onMessage: (message: any) => {
      // Ignore messages if session is not active
      if (!sessionActiveRef.current) {
        console.log("Ignoring message - session not active");
        return;
      }
      
      console.log("Agent message:", message);
      
      // Handle user transcripts
      if (message?.type === "user_transcript") {
        const userTranscript = message?.user_transcription_event?.user_transcript;
        if (userTranscript && userTranscript.trim().length > 2) {
          const voiceMessage: VoiceMessage = {
            id: crypto.randomUUID(),
            role: "user",
            content: userTranscript,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, voiceMessage]);
          onMessageRef.current?.(voiceMessage);
          
          // Check if user wants to end the interview
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
            setTimeout(async () => {
              // Verify session is still active before ending
              if (!sessionActiveRef.current) return;
              
              try {
                isIntentionalDisconnectRef.current = true;
                sessionActiveRef.current = false;
                await conversation.endSession();
                toast({
                  title: "Interview Ended",
                  description: "Thank you for completing the interview!",
                });
              } catch (e) {
                console.error("Error ending session:", e);
              }
            }, 3000);
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
          onMessageRef.current?.(voiceMessage);
        }
      }
    },
    onError: (error) => {
      console.error("❌ Conversation error:", error);
      connectionLockRef.current = false;
      
      const errorMessage = error?.message || String(error);
      
      // Handle WebSocket state errors (CLOSING/CLOSED) - these are expected during cleanup
      if (errorMessage.includes("CLOSING") || errorMessage.includes("CLOSED") || errorMessage.includes("already in")) {
        console.log("⚠️ WebSocket state error detected - cleaning up stale connection");
        sessionActiveRef.current = false;
        // Don't show toast - let onDisconnect handle recovery
        return;
      }
      
      if (errorMessage.includes("permission") || errorMessage.includes("denied")) {
        toast({
          title: "Microphone Permission Required",
          description: "Please allow microphone access to use voice interview.",
          variant: "destructive",
        });
        setIsConnecting(false);
        sessionActiveRef.current = false;
        return;
      }
      
      // Handle connection issues - let onDisconnect handle reconnection
      if (errorMessage.includes("connection") || errorMessage.includes("WebSocket") || errorMessage.includes("network")) {
        console.log("⚠️ Connection error - onDisconnect will handle recovery");
        // onDisconnect will handle reconnection logic
        return;
      }
      
      // Generic error handling
      setIsConnecting(false);
      sessionActiveRef.current = false;
      toast({
        title: "Voice Error",
        description: "There was an issue with the voice connection. Please try again.",
        variant: "default",
      });
    },
  });

  // Track speaking state
  useEffect(() => {
    onSpeakingChangeRef.current?.(conversation.isSpeaking);
  }, [conversation.isSpeaking]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Internal connection function without state conflicts
  const startConversationInternal = useCallback(async () => {
    // Debounce rapid connection attempts (min 500ms between attempts)
    const now = Date.now();
    if (now - lastConnectionAttemptRef.current < 500) {
      console.log("⏳ Connection attempt too soon, debouncing...");
      return;
    }
    lastConnectionAttemptRef.current = now;
    
    // Prevent concurrent connection attempts
    if (connectionLockRef.current) {
      console.log("⏳ Connection already in progress, skipping...");
      return;
    }
    
    // Check if cleanup is in progress
    if (cleanupInProgressRef.current) {
      console.log("⏳ Cleanup in progress, waiting...");
      await new Promise(resolve => setTimeout(resolve, 200));
      if (cleanupInProgressRef.current) {
        console.log("⏳ Cleanup still in progress, aborting connection");
        return;
      }
    }
    
    if (conversation.status === "connected") {
      console.log("✅ Already connected, skipping...");
      return;
    }
    
    if (sessionActiveRef.current) {
      console.log("⚠️ Session still active, skipping new connection...");
      return;
    }
    
    connectionLockRef.current = true;
    isIntentionalDisconnectRef.current = false;
    setIsConnecting(true);
    
    try {
      // Verify microphone permission
      try {
        const testStream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          } 
        });
        testStream.getTracks().forEach(track => track.stop());
        console.log("✅ Microphone permission verified");
      } catch (micError) {
        console.error("❌ Microphone permission denied:", micError);
        toast({
          title: "Microphone Access Required",
          description: "Please allow microphone access to start the voice interview.",
          variant: "destructive",
        });
        connectionLockRef.current = false;
        setIsConnecting(false);
        return;
      }

      // Get connection info from edge function
      console.log("🔄 Fetching connection credentials...");
      const { data, error } = await supabase.functions.invoke(
        "elevenlabs-conversation-token",
        { body: { jobField, toughnessLevel, jobTitle } }
      );

      if (error) {
        console.error("❌ Edge function error:", error);
        throw new Error(error.message || "Failed to connect to voice server");
      }

      console.log("📡 Connection data received:", { 
        hasSignedUrl: !!data?.signedUrl, 
        hasToken: !!data?.token,
        usePublicMode: data?.usePublicMode,
        agentId: data?.agentId ? `${data.agentId.substring(0, 10)}...` : null
      });

      // Verify we should still connect (check again after async operations)
      if (isIntentionalDisconnectRef.current || cleanupInProgressRef.current) {
        console.log("⚠️ Connection cancelled during setup");
        connectionLockRef.current = false;
        setIsConnecting(false);
        return;
      }

      // Try different connection methods based on what the server returned
      if (data?.signedUrl) {
        console.log("🔗 Connecting with signed URL (WebSocket)...");
        await conversation.startSession({
          signedUrl: data.signedUrl,
        });
      } else if (data?.token) {
        console.log("🔗 Connecting with conversation token (WebRTC)...");
        await conversation.startSession({
          conversationToken: data.token,
        });
      } else if (data?.agentId) {
        console.log("🔗 Connecting to public agent:", data.agentId);
        if (data?.message) {
          console.warn("⚠️", data.message);
        }
        await conversation.startSession({
          agentId: data.agentId as string,
        } as any);
      } else {
        throw new Error("No valid connection method available. Please check your ElevenLabs configuration.");
      }
      
      console.log("✅ Session started successfully");
    } catch (error) {
      console.error("❌ Failed to start conversation:", error);
      connectionLockRef.current = false;
      sessionActiveRef.current = false;
      setIsConnecting(false);
      
      const errorMessage = error instanceof Error ? error.message : "Could not start voice interview";
      
      // Don't show toast for WebSocket state errors
      if (errorMessage.includes("CLOSING") || errorMessage.includes("CLOSED")) {
        console.log("⚠️ WebSocket state error during connection - will retry");
        return;
      }
      
      if (errorMessage.includes("public") || errorMessage.includes("agent")) {
        toast({
          title: "Voice Agent Not Available",
          description: "Please ensure the ElevenLabs agent is set to 'public' mode in the dashboard.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Failed to Start",
          description: errorMessage,
          variant: "destructive",
        });
      }
    }
  }, [jobField, toughnessLevel, jobTitle, conversation, toast]);

  // Public start function
  const startConversation = useCallback(async () => {
    reconnectAttemptRef.current = 0;
    await startConversationInternal();
  }, [startConversationInternal]);

  const stopConversation = useCallback(async () => {
    // Prevent multiple stop calls
    if (cleanupInProgressRef.current) {
      console.log("⏳ Stop already in progress, skipping...");
      return;
    }
    
    try {
      cleanupInProgressRef.current = true;
      
      // Mark as intentional to prevent auto-reconnect
      isIntentionalDisconnectRef.current = true;
      reconnectAttemptRef.current = maxReconnectAttempts;
      sessionActiveRef.current = false;
      
      // Clear any pending reconnect
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      setMessages([]);
      
      // Only try to end session if connected
      if (conversation.status === "connected") {
        // Wait a brief moment to ensure any pending operations complete
        await new Promise(resolve => setTimeout(resolve, 50));
        await conversation.endSession();
      }
      
      toast({
        title: "Interview Ended",
        description: "The voice interview has been disconnected.",
      });
    } catch (error) {
      console.error("Error ending conversation:", error);
      // Still mark as ended even if error
      setMessages([]);
      toast({
        title: "Interview Ended",
        description: "The voice interview has been disconnected.",
      });
    } finally {
      cleanupInProgressRef.current = false;
      connectionLockRef.current = false;
    }
  }, [conversation, toast]);

  const adjustVolume = useCallback(async (newVolume: number) => {
    setVolume(newVolume);
    await conversation.setVolume({ volume: newVolume });
  }, [conversation]);

  // Auto-connect only once on mount if enabled
  useEffect(() => {
    if (autoConnect && !hasAutoConnectedRef.current && conversation.status === "disconnected") {
      hasAutoConnectedRef.current = true;
      // Small delay to ensure component is fully mounted
      const timer = setTimeout(() => {
        startConversation();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoConnect]); // Intentionally minimal dependencies

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
