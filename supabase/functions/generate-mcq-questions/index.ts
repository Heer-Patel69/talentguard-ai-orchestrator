import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GenerateRequest {
  applicationId: string;
  field: string;
  toughnessLevel: number;
  numQuestions: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { field, toughnessLevel, numQuestions } = await req.json() as GenerateRequest;
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const difficultyMap: Record<number, string> = {
      1: "easy",
      2: "easy to medium",
      3: "medium",
      4: "medium to hard",
      5: "hard to expert",
    };

    const difficulty = difficultyMap[toughnessLevel] || "medium";

    const prompt = `Generate ${numQuestions} multiple-choice questions for a technical assessment in the field of "${field}" at ${difficulty} difficulty level.

For each question, provide:
1. A clear, concise question
2. 4 answer options (exactly one correct for single-choice, or multiple correct for multi-select)
3. The type (single or multiple)
4. Difficulty (easy/medium/hard/expert)
5. Topic/category
6. Points (1-5 based on difficulty)
7. Time limit in seconds (30-120 based on complexity)

Return ONLY valid JSON in this exact format:
{
  "questions": [
    {
      "id": "q-1",
      "question": "What is the time complexity of binary search?",
      "options": ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
      "type": "single",
      "difficulty": "easy",
      "topic": "Algorithms",
      "points": 1,
      "timeLimit": 45,
      "correctAnswers": [1]
    }
  ]
}

Make questions progressively harder. Include a mix of topics within the field.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const questions = JSON.parse(content);

    return new Response(JSON.stringify(questions), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Generate MCQ error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error",
      questions: [] 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
