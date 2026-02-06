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

    console.log("Attempting to get connection for agent:", ELEVENLABS_AGENT_ID);

    // Method 1: Try to get signed URL for WebSocket connection
    try {
      const signedUrlResponse = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${ELEVENLABS_AGENT_ID}`,
        {
          method: "GET",
          headers: {
            "xi-api-key": ELEVENLABS_API_KEY,
          },
        }
      );

      if (signedUrlResponse.ok) {
        const data = await signedUrlResponse.json();
        console.log("Successfully obtained signed URL");
        return new Response(
          JSON.stringify({ 
            signedUrl: data.signed_url,
            agentId: ELEVENLABS_AGENT_ID 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const errorText = await signedUrlResponse.text();
      console.log("Signed URL endpoint response:", signedUrlResponse.status, errorText);
    } catch (e) {
      console.log("Signed URL request failed:", e.message);
    }

    // Method 2: Try to get conversation token
    try {
      const tokenResponse = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=${ELEVENLABS_AGENT_ID}`,
        {
          method: "GET",
          headers: {
            "xi-api-key": ELEVENLABS_API_KEY,
          },
        }
      );

      if (tokenResponse.ok) {
        const tokenData = await tokenResponse.json();
        console.log("Successfully obtained conversation token");
        return new Response(
          JSON.stringify({ 
            token: tokenData.token,
            agentId: ELEVENLABS_AGENT_ID 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const errorText = await tokenResponse.text();
      console.log("Token endpoint response:", tokenResponse.status, errorText);
    } catch (e) {
      console.log("Token request failed:", e.message);
    }

    // Method 3: Verify the API key is valid by checking user info
    try {
      const userResponse = await fetch(
        "https://api.elevenlabs.io/v1/user",
        {
          method: "GET",
          headers: {
            "xi-api-key": ELEVENLABS_API_KEY,
          },
        }
      );

      if (userResponse.ok) {
        const userData = await userResponse.json();
        console.log("API key is valid. User:", userData.xi_api_key ? "authenticated" : "unknown");
      } else {
        console.log("API key validation failed:", userResponse.status);
      }
    } catch (e) {
      console.log("User API check failed:", e.message);
    }

    // Fallback: Return agent ID for public mode connection
    // The client will connect directly to the agent if it's set to public
    console.log("Falling back to public agent mode - ensure agent is set to public in ElevenLabs dashboard");
    return new Response(
      JSON.stringify({ 
        agentId: ELEVENLABS_AGENT_ID,
        usePublicMode: true,
        message: "Using public agent mode. If voice doesn't work, ensure the agent is set to 'public' in your ElevenLabs dashboard."
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
