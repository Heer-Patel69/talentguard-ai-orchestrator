// =============================================
// AGENT 3: CODE JUDGE — Real-Time Code Evaluation
// =============================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CodeSubmission {
  code: string;
  language: string;
  problemId?: string;
  problemStatement?: string;
}

interface EvaluationRequest {
  application_id?: string;
  action?: "evaluate_single" | "evaluate_all" | "get_feedback";
  submission?: CodeSubmission;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json() as EvaluationRequest;
    const { application_id, action = "evaluate_all", submission } = body;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle real-time single code evaluation
    if (action === "evaluate_single" && submission) {
      const evaluation = await evaluateSingleCode(
        lovableApiKey,
        submission.code,
        submission.language,
        submission.problemStatement || "Solve the given problem"
      );

      return new Response(
        JSON.stringify({
          success: true,
          evaluation,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Full evaluation for application
    if (!application_id) {
      throw new Error("application_id is required for full evaluation");
    }

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

      // Get comprehensive AI code review
      const aiReview = await analyzeCodeWithAI(
        lovableApiKey,
        submission.code,
        problem,
        submission.language
      );

      // Calculate problem score with detailed breakdown
      const testScore = (submission.tests_passed / submission.tests_total) * 40;
      const qualityScore = (aiReview.code_quality || 70) * 0.2;
      const efficiencyScore = (aiReview.efficiency_score || 70) * 0.2;
      const edgeCaseScore = (aiReview.edge_case_score || 60) * 0.1;
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
        // Detailed feedback for candidate
        feedback: {
          summary: aiReview.summary,
          strengths: aiReview.strengths,
          issues: aiReview.issues,
          suggestions: aiReview.suggestions,
          score_breakdown: {
            correctness: Math.round(testScore * 2.5),
            code_quality: aiReview.code_quality,
            efficiency: aiReview.efficiency_score,
            edge_cases: aiReview.edge_case_score,
          }
        }
      });

      // Update submission with AI review in real-time
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

    // Generate comprehensive reasoning
    const reasoning = generateReasoning(decision, overallScore, passingScore, submissions, problemScores, languagesUsed);

    // Store agent result
    const agentResult = {
      application_id,
      agent_number: 3,
      agent_name: "Code Judge",
      score: overallScore,
      detailed_scores: problemScores.reduce((acc, p) => {
        acc[p.title] = {
          score: p.correctness_score,
          feedback: p.feedback,
        };
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

    // Update candidate score in real-time
    await updateCandidateScore(supabase, application_id, overallScore, problemScores);

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
  if (executionTimeMs < 100) return 100;
  if (executionTimeMs < 500) return 80;
  if (executionTimeMs < 1000) return 60;
  if (executionTimeMs < 2000) return 40;
  return 20;
}

function generateReasoning(
  decision: string,
  overallScore: number,
  passingScore: number,
  submissions: any[],
  problemScores: any[],
  languagesUsed: Set<string>
): string {
  const passedProblems = submissions.filter(s => s.tests_passed >= s.tests_total * 0.7).length;
  const avgQuality = Math.round(problemScores.reduce((sum, p) => sum + (p.ai_review?.code_quality || 70), 0) / problemScores.length);
  
  if (decision === "pass") {
    return `✅ **Passed with ${overallScore}% score**

📊 **Summary:**
- Problems solved: ${passedProblems}/${submissions.length}
- Languages: ${Array.from(languagesUsed).join(", ")}
- Code quality: ${avgQuality >= 80 ? "Excellent" : avgQuality >= 60 ? "Good" : "Needs improvement"}

💪 **Key Strengths:**
${problemScores.flatMap(p => p.ai_review?.strengths || []).slice(0, 3).map(s => `- ${s}`).join("\n")}

📈 **Areas for Growth:**
${problemScores.flatMap(p => p.ai_review?.suggestions || []).slice(0, 2).map(s => `- ${s}`).join("\n")}`;
  } else {
    const failedProblems = submissions.filter(s => s.tests_passed < s.tests_total * 0.5);
    return `❌ **Score ${overallScore}% below passing threshold (${passingScore}%)**

📊 **Summary:**
- Problems with <50% tests passing: ${failedProblems.length}/${submissions.length}
- Average code quality: ${avgQuality}%

🔍 **Main Issues:**
${problemScores.flatMap(p => p.ai_review?.issues || []).slice(0, 3).map(s => `- ${s}`).join("\n")}

💡 **Recommendations:**
${problemScores.flatMap(p => p.ai_review?.suggestions || []).slice(0, 3).map(s => `- ${s}`).join("\n")}`;
  }
}

async function updateCandidateScore(
  supabase: any,
  applicationId: string,
  codingScore: number,
  problemScores: any[]
) {
  // Get existing candidate score or create new one
  const { data: existingScore } = await supabase
    .from("candidate_scores")
    .select("*")
    .eq("application_id", applicationId)
    .single();

  const technicalScore = codingScore;
  const problemSolvingScore = Math.round(
    problemScores.reduce((sum, p) => sum + (p.ai_review?.efficiency_score || 70), 0) / problemScores.length
  );

  if (existingScore) {
    await supabase
      .from("candidate_scores")
      .update({
        technical_score: technicalScore,
        problem_solving_score: problemSolvingScore,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingScore.id);
  }
}

// Evaluate single code submission in real-time
async function evaluateSingleCode(
  apiKey: string,
  code: string,
  language: string,
  problemStatement: string
) {
  const prompt = `You are an expert code reviewer providing INSTANT, ACTIONABLE feedback during a live coding interview.

**PROBLEM:**
${problemStatement}

**CANDIDATE'S CODE (${language}):**
\`\`\`${language}
${code}
\`\`\`

Provide a JSON response with:
{
  "score": 0-100,
  "status": "correct" | "partial" | "incorrect" | "error",
  "summary": "1-sentence overall assessment",
  "correctness": {
    "status": "pass" | "fail" | "partial",
    "details": "What works/doesn't work"
  },
  "errors": ["list of bugs or issues found"],
  "efficiency": {
    "time_complexity": "O(?)",
    "space_complexity": "O(?)",
    "is_optimal": true/false,
    "suggestion": "how to optimize if not optimal"
  },
  "code_quality": {
    "score": 0-100,
    "issues": ["readability/style issues"],
    "positives": ["good practices used"]
  },
  "edge_cases": {
    "handled": ["edge cases that are handled"],
    "missing": ["edge cases that should be added"]
  },
  "quick_fix": "Most important thing to fix right now (1 sentence)"
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
          content: "You are a senior software engineer reviewing code in real-time. Be concise, specific, and constructive. Focus on correctness first, then efficiency, then style.",
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
    console.error("Failed to parse real-time code review:", e);
  }

  return {
    score: 50,
    status: "partial",
    summary: "Unable to fully analyze. Please check your code logic.",
    quick_fix: "Ensure your solution handles the basic test cases.",
  };
}

async function analyzeCodeWithAI(
  apiKey: string,
  code: string,
  problem: any,
  language: string
) {
  const prompt = `Perform a comprehensive code review for this coding interview submission.

**PROBLEM:** ${problem.title}
${problem.description}

**Expected Complexity:**
- Time: ${problem.expected_time_complexity || "Not specified"}
- Space: ${problem.expected_space_complexity || "Not specified"}

**CANDIDATE'S CODE (${language}):**
\`\`\`${language}
${code}
\`\`\`

Provide a detailed JSON analysis:
{
  "summary": "2-3 sentence overall assessment",
  "code_quality": 0-100,
  "efficiency_score": 0-100,
  "edge_case_score": 0-100,
  "detected_time_complexity": "O(?)",
  "detected_space_complexity": "O(?)",
  "is_optimal": true/false,
  "readability": 0-100,
  "best_practices": 0-100,
  "correctness_analysis": {
    "logic_correct": true/false,
    "handles_all_cases": true/false,
    "potential_bugs": ["list of potential bugs"]
  },
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "issues": ["issue 1", "issue 2"],
  "suggestions": ["actionable improvement 1", "actionable improvement 2"],
  "interview_notes": "What this code reveals about the candidate's skills"
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
          content: "You are an expert code reviewer for technical interviews. Provide fair, detailed, and constructive analysis. Focus on both correctness and code quality. Respond with valid JSON only.",
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
    summary: "Code review completed with limited analysis.",
    code_quality: 70,
    efficiency_score: 70,
    edge_case_score: 60,
    detected_time_complexity: "Unknown",
    detected_space_complexity: "Unknown",
    is_optimal: false,
    readability: 70,
    best_practices: 70,
    strengths: ["Code submitted successfully"],
    issues: ["Unable to perform detailed analysis"],
    suggestions: ["Review edge cases", "Consider optimization"],
  };
}
