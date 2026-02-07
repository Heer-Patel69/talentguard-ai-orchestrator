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
  jobTitle?: string;
  requiredSkills?: string[];
  experienceLevel?: string;
}

// Detect if candidate is ending the conversation
function isEndingConversation(message: string): boolean {
  const endPhrases = [
    "end", "goodbye", "bye", "finish", "done", "that's all", "i'm done",
    "end the interview", "stop", "quit", "exit", "leave", "close",
    "end meeting", "bye bye", "thanks bye", "thank you bye", "no more questions",
    "i want to leave", "please end", "can we end", "let's end"
  ];
  const lowerMessage = message.toLowerCase().trim();
  return endPhrases.some(phrase => lowerMessage.includes(phrase));
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      messages, 
      jobField, 
      toughnessLevel, 
      customQuestions, 
      currentQuestionIndex, 
      candidateScore,
      jobTitle,
      requiredSkills,
      experienceLevel 
    } = await req.json() as InterviewRequest;
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Check if candidate is ending the conversation
    const lastMessage = messages[messages.length - 1];
    const candidateEnding = lastMessage?.role === "user" && isEndingConversation(lastMessage.content);

    const systemPrompt = `You are Alex, an expert AI technical interviewer conducting a FOCUSED, ROLE-SPECIFIC interview. Be professional, concise, and evaluate technical competency accurately.

INTERVIEW CONTEXT:
- Position: ${jobTitle || jobField}
- Field: ${jobField}
- Experience Level: ${experienceLevel || "Not specified"}
- Required Skills: ${requiredSkills?.join(", ") || "General technical skills"}
- Difficulty Level: ${toughnessLevel}
${customQuestions?.length ? `- Company Questions (USE THESE FIRST): ${customQuestions.join("; ")}` : ""}
${currentQuestionIndex !== undefined ? `- Question Number: ${currentQuestionIndex + 1}` : ""}
${candidateScore !== undefined ? `- Current Performance: ${candidateScore}/100` : ""}

🎯 CRITICAL: ASK ONLY ROLE-RELEVANT QUESTIONS
- Questions MUST directly relate to: ${requiredSkills?.join(", ") || jobField}
- NO generic questions like "tell me about yourself" or "why do you want this job"
- Every question should assess a specific technical skill or problem-solving ability
- For ${jobField}: Focus on ${getFieldSpecificFocus(jobField)}

📝 CODING QUESTIONS FORMAT (when asking coding problems):
When presenting a coding problem, use this EXACT format:

"Here's your coding challenge:

**Problem:** [Clear, concise problem name]

**Description:** [2-3 sentence explanation of what to solve]

**Input:** [Describe input format with example]

**Output:** [Describe expected output with example]

**Example:**
Input: [example input]
Output: [example output]

**Constraints:** [Time/space requirements if applicable]

Take your time to think through this. Walk me through your approach before coding."

🔍 CODE EVALUATION (after submission):
When candidate says "done" or "finished" or submits code:
1. Analyze correctness: Does it solve the problem?
2. Check edge cases: Empty input, large input, boundary conditions
3. Evaluate efficiency: Time and space complexity
4. Review code quality: Naming, structure, readability
5. Provide score: Rate 0-100 with brief justification
6. Give constructive feedback: What's good, what could improve

Example feedback:
"Your solution scores 75/100. You correctly handled the main logic with O(n) time complexity. 
Strong points: Clean variable naming, good use of built-in methods.
Improvements: Consider edge case when array is empty. The nested loop could be optimized."

🎤 VOICE CONVERSATION RULES:
1. Keep responses SHORT (2-3 sentences max) - this is spoken conversation
2. Ask ONE question at a time, then WAIT
3. NO bullet points, NO markdown in spoken parts (only use formatting for coding problems)
4. NEVER repeat the same question or ask about topics already covered
5. Be encouraging but honest in feedback

🌍 LANGUAGE HANDLING:
- Focus on TECHNICAL ACCURACY, not language fluency
- If unclear, ask: "Could you elaborate on that?"
- Evaluate problem-solving ability, not English proficiency

${candidateEnding ? `
⚠️ CANDIDATE IS ENDING THE INTERVIEW
The candidate wants to end. Provide a brief, professional closing:
1. Thank them for their time (1 sentence)
2. Quick summary of their performance (1-2 sentences)
3. One key strength observed
4. One area for improvement
5. Wish them well

Keep it warm and under 4 sentences total. Example:
"Thank you for the interview! You demonstrated solid problem-solving skills, especially with data structures. To improve further, practice optimizing for edge cases. Best of luck with your application!"
` : ""}

🔄 QUESTION PROGRESSION:
1. Start with a focused technical question related to ${requiredSkills?.[0] || jobField}
2. Progress based on their answers - go deeper if they're strong, simplify if struggling
3. Include at least one coding problem (use the format above)
4. Ask scenario-based questions relevant to the role
5. End with a practical problem they might face in this job

Remember: Quality over quantity. Each question should reveal something meaningful about their technical ability.`;


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

function getFieldSpecificFocus(field: string): string {
  const focusMap: Record<string, string> = {
    "Data Structures and Algorithms": "arrays, trees, graphs, dynamic programming, complexity analysis",
    "Frontend Development": "React/Vue/Angular, CSS, state management, performance optimization, accessibility",
    "Backend Development": "API design, databases, system architecture, caching, security",
    "Full Stack": "end-to-end development, database design, API integration, deployment",
    "DevOps": "CI/CD, containerization, cloud services, monitoring, infrastructure as code",
    "Machine Learning": "algorithms, model training, data preprocessing, evaluation metrics",
    "Data Science": "statistics, data analysis, visualization, SQL, Python/R",
    "Mobile Development": "iOS/Android, React Native/Flutter, performance, offline support",
    "System Design": "scalability, reliability, distributed systems, trade-offs",
    "Security": "authentication, encryption, vulnerability assessment, secure coding",
    "Cloud": "AWS/GCP/Azure, serverless, microservices, cost optimization",
    "Database": "SQL, NoSQL, query optimization, data modeling, indexing",
  };
  
  return focusMap[field] || "core technical concepts, problem-solving, and practical application";
}
