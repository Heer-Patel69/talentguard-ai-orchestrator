import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Default voice ID (Rachel - professional female voice)
const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    if (!ELEVENLABS_API_KEY) {
      throw new Error("ELEVENLABS_API_KEY is not configured");
    }

    const { jobField, toughnessLevel, jobTitle } = await req.json();

    // First, try to get or create an agent
    let agentId = await getOrCreateAgent(ELEVENLABS_API_KEY, jobField, toughnessLevel, jobTitle);

    if (!agentId) {
      throw new Error("Failed to get or create ElevenLabs agent");
    }

    // Get a conversation token for WebRTC connection
    const tokenResponse = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`,
      {
        method: "GET",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
        },
      }
    );

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("ElevenLabs signed URL error:", tokenResponse.status, errorText);
      throw new Error(`Failed to get signed URL: ${tokenResponse.status}`);
    }

    const data = await tokenResponse.json();

    return new Response(
      JSON.stringify({ 
        signedUrl: data.signed_url,
        agentId 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Token generation error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to generate token" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function getOrCreateAgent(
  apiKey: string, 
  jobField: string = "Technical",
  toughnessLevel: string = "medium",
  jobTitle: string = "Software Engineer"
): Promise<string | null> {
  // Check if we already have agents
  const listResponse = await fetch("https://api.elevenlabs.io/v1/convai/agents", {
    headers: { "xi-api-key": apiKey },
  });

  if (listResponse.ok) {
    const agents = await listResponse.json();
    // Look for our HireMinds agent
    const existingAgent = agents.agents?.find((a: any) => 
      a.name?.includes("HireMinds") || a.name?.includes("Interview")
    );
    
    if (existingAgent) {
      console.log("Using existing agent:", existingAgent.agent_id);
      return existingAgent.agent_id;
    }
  }

  // Create a new agent
  console.log("Creating new ElevenLabs agent...");
  
  const systemPrompt = `You are an expert AI interviewer having a LIVE VOICE CONVERSATION with a job candidate. 

INTERVIEW CONTEXT:
- Position: ${jobTitle}
- Field: ${jobField}
- Difficulty: ${toughnessLevel}

CRITICAL VOICE CONVERSATION RULES:
1. KEEP RESPONSES SHORT (2-3 sentences max) - you're speaking, not writing
2. Sound natural and conversational, like a friendly but professional interviewer
3. Ask ONE question at a time
4. Acknowledge their answer briefly before moving on ("Great point!", "I see, interesting approach.")
5. NO bullet points, NO numbered lists, NO markdown - speak naturally
6. Use natural transitions: "So tell me...", "Now let's discuss...", "Moving on..."
7. Listen actively and ask follow-up questions based on their answers

INTERVIEW FLOW:
- Start: "Hi! I'm your AI interviewer today. Thanks for joining. Let's start with a quick introduction - tell me a bit about yourself and your background."
- Ask mix of technical and behavioral questions
- If they're stuck, give gentle hints
- End positively: "Great talking with you! You did well. Best of luck!"

Remember: This is a real-time voice conversation. Be concise, natural, and engaging.`;

  const createResponse = await fetch("https://api.elevenlabs.io/v1/convai/agents/create", {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "HireMinds Interview Agent",
      conversation_config: {
        agent: {
          prompt: {
            prompt: systemPrompt,
          },
          first_message: "Hi! I'm your AI interviewer today. Thanks for joining. Before we dive in, tell me a bit about yourself and your background.",
          language: "en",
        },
        tts: {
          voice_id: DEFAULT_VOICE_ID,
        },
      },
    }),
  });

  if (!createResponse.ok) {
    const errorText = await createResponse.text();
    console.error("Failed to create agent:", createResponse.status, errorText);
    return null;
  }

  const newAgent = await createResponse.json();
  console.log("Created new agent:", newAgent.agent_id);
  return newAgent.agent_id;
}
