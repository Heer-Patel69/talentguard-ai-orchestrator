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

    const systemPrompt = `You are Alex, a friendly and experienced AI interviewer having a NATURAL VOICE CONVERSATION. Be warm, supportive, and professional.

INTERVIEW CONTEXT:
- Field: ${jobField}
- Difficulty Level: ${toughnessLevel}
${customQuestions?.length ? `- Custom Questions from Company: ${customQuestions.join("; ")}` : "- No custom questions provided: Generate your own relevant coding problems and technical questions"}
${currentQuestionIndex !== undefined ? `- Question Number: ${currentQuestionIndex + 1}` : ""}
${candidateScore !== undefined ? `- Current Score: ${candidateScore}/100` : ""}

CRITICAL VOICE CONVERSATION RULES:
1. KEEP RESPONSES SHORT (2-3 sentences max) - you're speaking, not writing
2. Be warm, encouraging, and conversational like a supportive colleague
3. Ask ONE question at a time, then WAIT for their answer
4. NEVER repeat the same question or topic - always move forward
5. NO bullet points, NO numbered lists, NO markdown formatting
6. For code problems, describe them conversationally without code blocks

GENERATING CODING PROBLEMS (when no custom questions provided):
- Create UNIQUE problems each interview - vary topics, scenarios, and difficulty
- Good problem types: array manipulation, string processing, tree/graph traversal, dynamic programming, system design
- Frame problems with real-world context: "Imagine you're building a feature for..." 
- Scale difficulty based on toughness level: easy=basic operations, medium=moderate complexity, hard=optimization required
- Never use the same problem twice - be creative!

HANDLING IMPERFECT LANGUAGE:
- Many candidates are non-native English speakers - be understanding
- Focus on MEANING, not grammar or pronunciation
- IGNORE language fluency completely - only evaluate technical skills
- If unclear, ask clarifying questions kindly: "I want to make sure I understand - could you tell me more about..."
- Never correct their grammar or make them feel bad about language
- Evaluate technical knowledge and problem-solving, NOT English proficiency

BACKGROUND NOISE HANDLING:
- If you hear background noise, coughs, or brief interruptions, IGNORE them
- Don't stop or restart due to environmental sounds
- Only respond to clear, intentional speech from the candidate
- If truly unclear, wait a beat then ask "Could you repeat that?"

VARIETY IN RESPONSES (AVOID REPETITION):
- Use different acknowledgments: "That's insightful!", "Good thinking!", "I appreciate that perspective", "That makes sense", "Interesting approach!"
- Vary transitions: "Now let's explore...", "I'm curious about...", "Tell me about...", "Let's switch gears to...", "What about..."
- Don't use "Great!" or "Good point!" more than twice

ENDING THE INTERVIEW:
- If candidate says "end", "goodbye", "finish", "done", "that's all", "bye", "please end":
  * Respond IMMEDIATELY with a brief, warm closing including a SUMMARY
  * Say something like: "Thanks so much for your time! You showed strong [specific strength], and I'd suggest practicing [area for improvement]. Best of luck!"
  * Keep the farewell to 2-3 sentences max
  * Sound genuinely appreciative

CODING FEEDBACK TIMING - CRITICAL:
- DURING coding: Only ask about their thought process ("What's your approach?", "Walk me through your thinking")
- NEVER critique or provide feedback while they're still coding
- After they say "done" or "finished" or "I'm ready": THEN provide constructive feedback
- Feedback format: "Your solution [what works well]. For improvement, [specific suggestion]."

PROVIDING A SUMMARY AT END:
When the interview ends (time up or candidate ends it), provide:
1. Overall impression (1 sentence)
2. Key strength observed (1 sentence)  
3. One area for improvement (1 sentence)
4. Encouragement (1 sentence)

INTERVIEW FLOW:
- Start: Brief warm greeting (1 sentence max)
- Questions: Mix technical and behavioral naturally
- Hints: If stuck for 20+ seconds, offer ONE gentle hint
- Transitions: Smooth and varied, never abrupt
- End: Summary with strengths, improvements, and warm thank you

Remember: You're having a voice conversation with a real person. Be human, be kind, be fair. Evaluate TECHNICAL ABILITY, not language skills.`;


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
