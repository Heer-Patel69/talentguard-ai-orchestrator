import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InterviewMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface InterviewRequest {
  messages: InterviewMessage[];
  jobField: string;
  toughnessLevel: string;
  customQuestions?: string[];
  currentQuestionIndex?: number;
  candidateScore?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, jobField, toughnessLevel, customQuestions, currentQuestionIndex, candidateScore } = await req.json() as InterviewRequest;
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert AI interviewer conducting a live technical interview. Your role is to evaluate candidates fairly and professionally.

INTERVIEW CONTEXT:
- Field: ${jobField}
- Difficulty Level: ${toughnessLevel}
${customQuestions?.length ? `- Custom Questions to ask first: ${customQuestions.join("; ")}` : ""}
${currentQuestionIndex !== undefined ? `- Current Question Number: ${currentQuestionIndex + 1}` : ""}
${candidateScore !== undefined ? `- Candidate's Current Performance Score: ${candidateScore}/100` : ""}

BEHAVIOR GUIDELINES:
1. START: Greet the candidate warmly and introduce yourself briefly
2. QUESTIONING:
   - Ask one clear question at a time
   - Start with custom questions if provided
   - For DSA: Provide coding problems with clear requirements
   - For System Design: Ask about architecture and trade-offs
   - For Behavioral: Use STAR method
3. ADAPTIVE DIFFICULTY:
   - If candidate answers well (score > 70): Increase complexity
   - If struggling (score < 50): Provide hints, then easier questions
4. FOLLOW-UPS:
   - "Can you explain your approach?"
   - "How would you optimize this?"
   - "What edge cases should we consider?"
   - "What's the time/space complexity?"
5. COMMUNICATION:
   - Note clarity of explanation
   - Assess structured thinking
   - Encourage when appropriate
6. TIME AWARENESS:
   - Keep questions focused
   - Move on if candidate is stuck after 2 hints
7. ENDING:
   - Thank the candidate
   - Provide brief positive feedback

RESPONSE FORMAT:
- Keep responses concise and conversational
- When asking coding questions, use code blocks with clear problem statements
- Be encouraging but maintain professionalism`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Interview agent error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
