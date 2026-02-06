import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    if (!ELEVENLABS_API_KEY) {
      throw new Error("ELEVENLABS_API_KEY is not configured");
    }

    const ELEVENLABS_AGENT_ID = Deno.env.get("ELEVENLABS_AGENT_ID");
    if (!ELEVENLABS_AGENT_ID) {
      throw new Error("ELEVENLABS_AGENT_ID is not configured. Please create an agent at elevenlabs.io/app/conversational-ai and add the agent ID as a secret.");
    }

    // Get a conversation token for WebRTC connection (doesn't require convai_write permission)
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${ELEVENLABS_AGENT_ID}`,
      {
        method: "GET",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
        },
      }
    );

    // If signed URL fails, try the token endpoint for WebRTC
    if (!response.ok) {
      console.log("Signed URL failed, trying token endpoint...");
      
      // Use the token endpoint which has different permission requirements
      const tokenResponse = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversation/get_token?agent_id=${ELEVENLABS_AGENT_ID}`,
        {
          method: "GET",
          headers: {
            "xi-api-key": ELEVENLABS_API_KEY,
          },
        }
      );

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error("ElevenLabs token error:", tokenResponse.status, errorText);
        
        // Return the agent ID so client can try direct connection with public agent
        return new Response(
          JSON.stringify({ 
            agentId: ELEVENLABS_AGENT_ID,
            usePublicMode: true,
            message: "Using public agent mode - ensure agent is set to public in ElevenLabs dashboard"
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const tokenData = await tokenResponse.json();
      return new Response(
        JSON.stringify({ 
          token: tokenData.token,
          agentId: ELEVENLABS_AGENT_ID 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();

    return new Response(
      JSON.stringify({ 
        signedUrl: data.signed_url,
        agentId: ELEVENLABS_AGENT_ID 
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
