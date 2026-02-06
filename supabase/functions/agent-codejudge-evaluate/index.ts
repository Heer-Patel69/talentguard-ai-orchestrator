// =============================================
// AGENT 3: CODE JUDGE — Code Evaluation
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
    const { application_id } = await req.json();

    if (!application_id) {
      throw new Error("application_id is required");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch application with job
    const { data: application } = await supabase
      .from("applications")
      .select(`*, job:jobs!applications_job_id_fkey(*)`)
      .eq("id", application_id)
      .single();

    if (!application) {
      throw new Error("Application not found");
    }

    const job = application.job;
    const passingScore = job.round_config?.coding?.passing_score || 55;

    // Fetch all code submissions for this application
    const { data: submissions } = await supabase
      .from("code_submissions")
      .select(`*, problem:coding_problems!code_submissions_problem_id_fkey(*)`)
      .eq("application_id", application_id);

    if (!submissions || submissions.length === 0) {
      throw new Error("No code submissions found");
    }

    // Analyze each submission with AI
    let totalScore = 0;
    let totalPasteEvents = 0;
    const languagesUsed = new Set<string>();
    const problemScores: any[] = [];

    for (const submission of submissions) {
      const problem = submission.problem;
      languagesUsed.add(submission.language);
      totalPasteEvents += submission.paste_events || 0;

      // Get AI code review
      const aiReview = await analyzeCodeWithAI(
        lovableApiKey,
        submission.code,
        problem,
        submission.language
      );

      // Calculate problem score
      const testScore = (submission.tests_passed / submission.tests_total) * 40;
      const qualityScore = (aiReview.code_quality || 70) * 0.2;
      const efficiencyScore = aiReview.efficiency_score * 0.2;
      const edgeCaseScore = aiReview.edge_case_score * 0.1;
      const timeBonus = calculateTimeBonus(submission.execution_time_ms) * 0.1;

      const problemScore = testScore + qualityScore + efficiencyScore + edgeCaseScore + timeBonus;
      totalScore += problemScore;

      problemScores.push({
        problem_id: problem.id,
        title: problem.title,
        difficulty: problem.difficulty,
        tests_passed: submission.tests_passed,
        tests_total: submission.tests_total,
        time_complexity: aiReview.detected_time_complexity,
        space_complexity: aiReview.detected_space_complexity,
        code_quality_score: aiReview.code_quality,
        correctness_score: Math.round(testScore * 2.5),
        time_taken_minutes: Math.round((new Date(submission.submitted_at).getTime() - new Date(application.agent_started_at).getTime()) / 60000),
        language: submission.language,
        paste_events: submission.paste_events,
        ai_review: aiReview,
      });

      // Update submission with AI review
      await supabase
        .from("code_submissions")
        .update({
          ai_review: aiReview,
          time_complexity: aiReview.detected_time_complexity,
          space_complexity: aiReview.detected_space_complexity,
          code_quality_score: aiReview.code_quality,
        })
        .eq("id", submission.id);
    }

    // Calculate overall score
    const overallScore = Math.round(totalScore / submissions.length);

    // Determine typing pattern
    const typingPattern = totalPasteEvents > submissions.length * 2 ? "suspicious" : "natural";

    // Record fraud if suspicious
    if (typingPattern === "suspicious") {
      await supabase.from("fraud_logs").insert({
        application_id,
        agent_number: 3,
        flag_type: "excessive_paste_events",
        severity: totalPasteEvents > submissions.length * 5 ? "high" : "medium",
        evidence: { total_paste_events: totalPasteEvents, submissions_count: submissions.length },
      });
    }

    // Make decision
    const decision: "pass" | "reject" = overallScore >= passingScore ? "pass" : "reject";

    const reasoning = decision === "pass"
      ? `Candidate achieved ${overallScore}% overall coding score. Problems solved: ${submissions.length}. Languages used: ${Array.from(languagesUsed).join(", ")}. Code quality was ${overallScore >= 70 ? "excellent" : "acceptable"}.`
      : `Coding score ${overallScore}% below passing threshold of ${passingScore}%. ${submissions.filter(s => s.tests_passed < s.tests_total / 2).length} problems had less than 50% test cases passing.`;

    // Store agent result
    const agentResult = {
      application_id,
      agent_number: 3,
      agent_name: "Code Judge",
      score: overallScore,
      detailed_scores: problemScores.reduce((acc, p) => {
        acc[p.title] = p.correctness_score;
        return acc;
      }, {}),
      decision,
      reasoning,
      raw_data: {
        problems: problemScores,
        overall_coding_score: overallScore,
        typing_pattern_analysis: typingPattern,
        total_paste_events: totalPasteEvents,
        languages_used: Array.from(languagesUsed),
      },
    };

    await supabase.from("agent_results").insert(agentResult);

    // Update application status
    if (decision === "pass") {
      await supabase
        .from("applications")
        .update({
          status: "behavioral",
          current_agent: 4,
          agent_started_at: new Date().toISOString(),
        })
        .eq("id", application_id);
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
        next_agent: decision === "pass" ? 4 : null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Code Judge evaluation error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function calculateTimeBonus(executionTimeMs: number): number {
  // Faster execution = higher bonus (max 100)
  if (executionTimeMs < 100) return 100;
  if (executionTimeMs < 500) return 80;
  if (executionTimeMs < 1000) return 60;
  if (executionTimeMs < 2000) return 40;
  return 20;
}

async function analyzeCodeWithAI(
  apiKey: string,
  code: string,
  problem: any,
  language: string
) {
  const prompt = `Analyze this ${language} code solution for the coding problem.

PROBLEM: ${problem.title}
${problem.description}

Expected Time Complexity: ${problem.expected_time_complexity}
Expected Space Complexity: ${problem.expected_space_complexity}

CANDIDATE'S CODE:
\`\`\`${language}
${code}
\`\`\`

Provide a JSON analysis:
{
  "code_quality": 0-100,
  "efficiency_score": 0-100,
  "edge_case_score": 0-100,
  "detected_time_complexity": "O(?)",
  "detected_space_complexity": "O(?)",
  "is_optimal": true/false,
  "readability": 0-100,
  "best_practices": 0-100,
  "suggestions": ["improvement 1", "improvement 2"],
  "issues": ["issue 1", "issue 2"],
  "strengths": ["strength 1", "strength 2"]
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
        {
          role: "system",
          content: "You are an expert code reviewer. Analyze code quality, efficiency, and correctness. Respond with valid JSON only.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";

  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error("Failed to parse AI code review:", e);
  }

  // Default review if parsing fails
  return {
    code_quality: 70,
    efficiency_score: 70,
    edge_case_score: 60,
    detected_time_complexity: "Unknown",
    detected_space_complexity: "Unknown",
    is_optimal: false,
    readability: 70,
    best_practices: 70,
    suggestions: ["Unable to fully analyze code"],
    issues: [],
    strengths: [],
  };
}
