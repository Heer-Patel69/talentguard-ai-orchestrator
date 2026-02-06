// =============================================
// AGENT 5: INTERVIEWER — Real-Time Voice AI Interview
// =============================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { application_id, action, message, phase, code_submission } = await req.json();

    if (!application_id) {
      throw new Error("application_id is required");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch application with all context
    const { data: application } = await supabase
      .from("applications")
      .select(`
        *,
        job:jobs!applications_job_id_fkey(*),
        candidate:candidate_profiles!applications_candidate_id_fkey(
          *,
          profile:profiles!candidate_profiles_user_id_fkey(*)
        )
      `)
      .eq("id", application_id)
      .single();

    if (!application) {
      throw new Error("Application not found");
    }

    // Fetch previous agent results for context
    const { data: previousResults } = await supabase
      .from("agent_results")
      .select("*")
      .eq("application_id", application_id)
      .order("agent_number");

    const job = application.job;
    const candidate = application.candidate;
    const profile = candidate?.profile;

    // Handle different actions
    if (action === "start_interview") {
      const greeting = await generateInterviewGreeting(
        lovableApiKey,
        job,
        profile?.full_name || "there"
      );

      // Store transcript entry
      await supabase.from("interview_transcripts").insert({
        application_id,
        role: "ai",
        content: greeting,
        phase: "warmup",
        timestamp_ms: 0,
      });

      return new Response(
        JSON.stringify({
          success: true,
          response: greeting,
          phase: "warmup",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "chat") {
      // Fetch existing transcript
      const { data: transcript } = await supabase
        .from("interview_transcripts")
        .select("*")
        .eq("application_id", application_id)
        .order("created_at");

      // Store candidate message
      await supabase.from("interview_transcripts").insert({
        application_id,
        role: "candidate",
        content: message,
        phase,
        timestamp_ms: Date.now(),
      });

      // Generate AI response
      const aiResponse = await generateInterviewResponse(
        lovableApiKey,
        job,
        candidate,
        previousResults || [],
        transcript || [],
        message,
        phase
      );

      // Store AI response
      await supabase.from("interview_transcripts").insert({
        application_id,
        role: "ai",
        content: aiResponse.response,
        phase: aiResponse.nextPhase || phase,
        timestamp_ms: Date.now(),
      });

      return new Response(
        JSON.stringify({
          success: true,
          response: aiResponse.response,
          phase: aiResponse.nextPhase || phase,
          shouldShowCode: aiResponse.shouldShowCode,
          codingQuestion: aiResponse.codingQuestion,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "submit_code") {
      // Store code submission
      await supabase.from("interview_recordings").upsert({
        application_id,
        code_submissions: [
          ...(application.code_submissions || []),
          code_submission,
        ],
      }, { onConflict: "application_id" });

      const feedback = await evaluateInterviewCode(
        lovableApiKey,
        code_submission.code,
        code_submission.problem,
        code_submission.language
      );

      return new Response(
        JSON.stringify({
          success: true,
          feedback,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "end_interview") {
      // Fetch full transcript
      const { data: fullTranscript } = await supabase
        .from("interview_transcripts")
        .select("*")
        .eq("application_id", application_id)
        .order("created_at");

      // Calculate interview duration
      const startTime = new Date(application.agent_started_at || application.created_at).getTime();
      const endTime = Date.now();
      const durationMinutes = Math.round((endTime - startTime) / 60000);

      // Evaluate entire interview
      const evaluation = await evaluateFullInterview(
        lovableApiKey,
        job,
        candidate,
        previousResults || [],
        fullTranscript || []
      );

      // Get fraud signals for this application
      const { data: fraudLogs } = await supabase
        .from("fraud_logs")
        .select("*")
        .eq("application_id", application_id);

      const fraudRiskScore = calculateFraudRisk(fraudLogs || []);
      const fraudFlags = (fraudLogs || []).map((l: any) => l.flag_type);

      const roundConfig = job.round_config?.interview || { passing_score: 60 };
      const overallScore = evaluation.overall_score;
      
      let decision: "strong_pass" | "pass" | "borderline" | "reject";
      if (overallScore >= 80) decision = "strong_pass";
      else if (overallScore >= roundConfig.passing_score) decision = "pass";
      else if (overallScore >= roundConfig.passing_score - 10) decision = "borderline";
      else decision = "reject";

      // Store agent result
      const agentResult = {
        application_id,
        agent_number: 5,
        agent_name: "Interviewer",
        score: overallScore,
        detailed_scores: {
          technical: evaluation.technical_score,
          communication: evaluation.communication_score,
          problem_solving: evaluation.problem_solving_score,
          depth: evaluation.depth_score,
          pressure_handling: evaluation.pressure_handling_score,
        },
        decision: decision === "strong_pass" ? "pass" : decision,
        reasoning: evaluation.reasoning,
        raw_data: {
          interview_duration_minutes: durationMinutes,
          phases_completed: getCompletedPhases(fullTranscript || []),
          technical_score: evaluation.technical_score,
          communication_score: evaluation.communication_score,
          problem_solving_score: evaluation.problem_solving_score,
          depth_score: evaluation.depth_score,
          pressure_handling_score: evaluation.pressure_handling_score,
          fraud_risk_score: fraudRiskScore,
          fraud_flags: fraudFlags,
          interviewer_decision: decision,
        },
      };

      await supabase.from("agent_results").insert(agentResult);

      // Store interview recording metadata
      await supabase.from("interview_recordings").upsert({
        application_id,
        transcript: fullTranscript,
        duration_minutes: durationMinutes,
        fraud_flags: fraudFlags,
      }, { onConflict: "application_id" });

      // Update application status
      if (decision === "strong_pass" || decision === "pass" || decision === "borderline") {
        await supabase
          .from("applications")
          .update({
            status: "completed",
            current_agent: 6,
          })
          .eq("id", application_id);

        // Note: Agent 6 (Verdict) runs at job level, not per application
      } else {
        await supabase
          .from("applications")
          .update({ status: "rejected" })
          .eq("id", application_id);
      }

      return new Response(
        JSON.stringify({
          success: true,
          result: agentResult,
          evaluation: {
            ...evaluation,
            fraud_risk_score: fraudRiskScore,
            fraud_flags: fraudFlags,
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    throw new Error("Invalid action");
  } catch (error) {
    console.error("Interviewer agent error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function getCompletedPhases(transcript: any[]): string[] {
  const phases = new Set<string>();
  for (const entry of transcript) {
    if (entry.phase) phases.add(entry.phase);
  }
  return Array.from(phases);
}

function calculateFraudRisk(fraudLogs: any[]): number {
  const weights = { low: 5, medium: 15, high: 30, critical: 50 };
  let risk = 0;
  for (const log of fraudLogs) {
    risk += weights[log.severity as keyof typeof weights] || 0;
  }
  return Math.min(100, risk);
}

async function generateInterviewGreeting(
  apiKey: string,
  job: any,
  candidateName: string
) {
  const prompt = `Generate a warm, professional greeting for an AI technical interview.

JOB TITLE: ${job.title}
CANDIDATE NAME: ${candidateName}

The greeting should:
- Be warm and welcoming
- Introduce yourself as the AI interviewer
- Briefly mention what to expect (30-45 min interview)
- Ask them to start by telling about themselves

Keep it conversational and natural, like a human interviewer. 2-3 sentences max.`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: "You are a friendly, professional AI interviewer. Be warm but professional." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) throw new Error(`AI API error: ${response.status}`);
  const data = await response.json();
  return data.choices?.[0]?.message?.content || `Hello ${candidateName}! Welcome to your interview for the ${job.title} position. I'm your AI interviewer today. Let's start by having you tell me a bit about yourself.`;
}

async function generateInterviewResponse(
  apiKey: string,
  job: any,
  candidate: any,
  previousResults: any[],
  transcript: any[],
  message: string,
  currentPhase: string
) {
  const conversationHistory = transcript.map((t: any) => ({
    role: t.role === "ai" ? "assistant" : "user",
    content: t.content,
  }));

  const systemPrompt = `You are an expert AI technical interviewer conducting a real interview for ${job.title}.

CANDIDATE INFO:
- Name: ${candidate?.profile?.full_name || "Candidate"}
- Experience: ${candidate?.experience_years || 0} years
- Skills: ${(candidate?.skills || []).join(", ")}

PREVIOUS ROUND SCORES:
${previousResults.map((r: any) => `- ${r.agent_name}: ${r.score}%`).join("\n")}

JOB REQUIREMENTS: ${(job.skills_required || []).join(", ")}

CURRENT PHASE: ${currentPhase}

INTERVIEW PHASES:
1. warmup: Introduction and background (3-5 min)
2. technical: Deep technical questions (15-20 min)
3. scenario: Real-world problem solving (5-10 min)
4. candidate_questions: Their questions (3-5 min)
5. closing: Wrap up

RULES:
- Be conversational and natural
- Ask follow-up questions based on their answers
- Probe deeper when answers are vague
- Occasionally use filler words like "Hmm, interesting..." or "I see..."
- If they struggle, give gentle hints
- For technical phase, you can give them a coding problem
- Transition phases naturally

Respond in JSON:
{
  "response": "your conversational response",
  "nextPhase": "phase name if transitioning, null otherwise",
  "shouldShowCode": true/false (only in technical phase),
  "codingQuestion": "optional coding problem description"
}`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: systemPrompt },
        ...conversationHistory,
        { role: "user", content: message },
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) throw new Error(`AI API error: ${response.status}`);
  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";

  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    // Return as plain response
  }

  return {
    response: content || "That's interesting. Could you tell me more?",
    nextPhase: null,
    shouldShowCode: false,
  };
}

async function evaluateInterviewCode(
  apiKey: string,
  code: string,
  problem: string,
  language: string
) {
  const prompt = `Briefly evaluate this code as an interviewer would during a live interview.

PROBLEM: ${problem}
LANGUAGE: ${language}
CODE:
${code}

Give brief, conversational feedback (2-3 sentences) as if speaking to the candidate. Mention what's good and any issues.`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: "You are a friendly technical interviewer giving real-time feedback." },
        { role: "user", content: prompt },
      ],
      temperature: 0.5,
    }),
  });

  if (!response.ok) throw new Error(`AI API error: ${response.status}`);
  const data = await response.json();
  return data.choices?.[0]?.message?.content || "I see your approach. Let me review that.";
}

async function evaluateFullInterview(
  apiKey: string,
  job: any,
  candidate: any,
  previousResults: any[],
  transcript: any[]
) {
  const conversationText = transcript.map((t: any) => 
    `${t.role.toUpperCase()}: ${t.content}`
  ).join("\n\n");

  const prompt = `Evaluate this complete technical interview.

JOB: ${job.title}
CANDIDATE: ${candidate?.profile?.full_name}
EXPERIENCE: ${candidate?.experience_years} years

FULL TRANSCRIPT:
${conversationText}

Evaluate on these criteria (0-100):
1. technical_score: Accuracy and depth of technical answers
2. communication_score: Clarity and articulation
3. problem_solving_score: Approach to problems
4. depth_score: Surface vs deep understanding
5. pressure_handling_score: Composure when challenged

Provide JSON:
{
  "technical_score": 0-100,
  "communication_score": 0-100,
  "problem_solving_score": 0-100,
  "depth_score": 0-100,
  "pressure_handling_score": 0-100,
  "overall_score": 0-100,
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "reasoning": "Detailed evaluation paragraph"
}`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: "You are an expert interview evaluator. Be fair and thorough. Respond with valid JSON." },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
    }),
  });

  if (!response.ok) throw new Error(`AI API error: ${response.status}`);
  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";

  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error("Failed to parse interview evaluation:", e);
  }

  return {
    technical_score: 60,
    communication_score: 60,
    problem_solving_score: 60,
    depth_score: 60,
    pressure_handling_score: 60,
    overall_score: 60,
    strengths: [],
    weaknesses: [],
    reasoning: "Interview completed and evaluated.",
  };
}
