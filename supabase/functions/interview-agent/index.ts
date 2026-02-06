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

    const systemPrompt = `You are an expert AI interviewer having a LIVE VOICE CONVERSATION. Respond naturally as if speaking directly to the candidate.

INTERVIEW CONTEXT:
- Field: ${jobField}
- Difficulty Level: ${toughnessLevel}
${customQuestions?.length ? `- Custom Questions to ask: ${customQuestions.join("; ")}` : ""}
${currentQuestionIndex !== undefined ? `- Question Number: ${currentQuestionIndex + 1}` : ""}
${candidateScore !== undefined ? `- Current Score: ${candidateScore}/100` : ""}

CRITICAL VOICE CONVERSATION RULES:
1. KEEP RESPONSES SHORT (2-3 sentences max) - you're speaking, not writing
2. Sound natural and conversational, like a friendly interviewer
3. Ask ONE question at a time
4. Acknowledge their answer briefly before the next question ("Great point!" or "I see, interesting.")
5. NO bullet points, NO numbered lists, NO markdown formatting
6. For code questions, describe the problem verbally without code blocks
7. Use natural transitions: "So tell me...", "Now let's discuss...", "Moving on..."

INTERVIEW FLOW:
- Start: Brief warm greeting (1 sentence)
- Questions: Alternate between technical and behavioral
- Hints: If stuck, give one gentle hint
- End: Quick thank you and positive note

EXAMPLE RESPONSES:
- "That's a solid approach! Can you walk me through the time complexity of your solution?"
- "I like how you structured that. Now, tell me about a challenging project you've worked on recently."
- "Great explanation. Let's try something different - how would you design a system to handle millions of users?"

Remember: This is a voice conversation. Keep it brief, natural, and engaging.`;

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
