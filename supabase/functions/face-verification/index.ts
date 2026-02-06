import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableApiKey) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get candidate profile to find Aadhaar photo path
    const { data: profile, error: profileError } = await supabase
      .from("candidate_profiles")
      .select("aadhaar_front_url")
      .eq("user_id", userId)
      .single();

    if (profileError || !profile?.aadhaar_front_url) {
      return new Response(
        JSON.stringify({ error: "Aadhaar photo not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Download both images
    const { data: aadhaarData, error: aadhaarError } = await supabase.storage
      .from("aadhaar-documents")
      .download(profile.aadhaar_front_url);

    if (aadhaarError) {
      console.error("Aadhaar download error:", aadhaarError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch Aadhaar photo" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: liveData, error: liveError } = await supabase.storage
      .from("live-photos")
      .download(`${userId}/live-photo.jpg`);

    if (liveError) {
      console.error("Live photo download error:", liveError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch live photo" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Convert images to base64
    const aadhaarBase64 = btoa(
      new Uint8Array(await aadhaarData.arrayBuffer()).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ""
      )
    );

    const liveBase64 = btoa(
      new Uint8Array(await liveData.arrayBuffer()).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ""
      )
    );

    // Use Lovable AI with vision capabilities for face matching
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          {
            role: "system",
            content: `You are a face verification AI. Compare the two images provided:
1. First image: Aadhaar card photo (ID document)
2. Second image: Live photo of a person

Analyze both faces and determine if they belong to the same person.
Return a JSON response with:
- "match": boolean (true if same person, false otherwise)
- "confidence": number between 0-100 representing match confidence
- "reasoning": brief explanation of your analysis

Consider factors like:
- Facial structure and proportions
- Eye shape and spacing
- Nose shape
- Mouth and lip shape
- Overall face shape
- Age differences are acceptable if core features match

Be thorough but fair. A confidence of 85+ means high certainty of match.`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Compare these two face images. The first is from an Aadhaar card, the second is a live photo. Determine if they are the same person."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${aadhaarBase64}`
                }
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${liveBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 500,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service quota exceeded. Please contact support." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "AI verification failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResult = await aiResponse.json();
    const content = aiResult.choices?.[0]?.message?.content || "";

    // Parse the AI response
    let result = { match: false, confidence: 0, status: "failed" };
    
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        result = {
          match: parsed.match ?? false,
          confidence: parsed.confidence ?? 0,
          status: parsed.match && parsed.confidence >= 85 
            ? "verified" 
            : parsed.confidence >= 60 
            ? "manual_review" 
            : "rejected"
        };
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Fallback: check for keywords in the response
      const isMatch = content.toLowerCase().includes("same person") || 
                      content.toLowerCase().includes("match");
      result = {
        match: isMatch,
        confidence: isMatch ? 75 : 30,
        status: isMatch ? "manual_review" : "rejected"
      };
    }

    console.log("Face verification result:", result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Face verification error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
