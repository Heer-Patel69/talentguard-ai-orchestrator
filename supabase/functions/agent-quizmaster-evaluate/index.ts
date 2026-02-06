// =============================================
// AGENT 2: QUIZMASTER — MCQ Evaluation
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
    const { application_id, tab_switches = 0 } = await req.json();

    if (!application_id) {
      throw new Error("application_id is required");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

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
    const passingScore = job.round_config?.mcq?.passing_score || 60;

    // Fetch all MCQ responses for this application
    const { data: responses } = await supabase
      .from("mcq_responses")
      .select(`*, question:mcq_questions!mcq_responses_question_id_fkey(*)`)
      .eq("application_id", application_id);

    if (!responses || responses.length === 0) {
      throw new Error("No MCQ responses found");
    }

    // Calculate scores
    let totalPoints = 0;
    let earnedPoints = 0;
    let correct = 0;
    let wrong = 0;
    let skipped = 0;
    const topicScores: Record<string, { correct: number; total: number }> = {};
    let totalTime = 0;
    let highestDifficulty = "easy";
    const difficultyOrder = ["easy", "medium", "hard", "expert"];

    for (const response of responses) {
      const question = response.question;
      if (!question) continue;

      const points = question.points || 1;
      totalPoints += points;
      totalTime += response.time_taken_seconds || 0;

      // Track topic scores
      const topic = question.topic || "General";
      if (!topicScores[topic]) {
        topicScores[topic] = { correct: 0, total: 0 };
      }
      topicScores[topic].total++;

      if (response.is_correct) {
        earnedPoints += points;
        correct++;
        topicScores[topic].correct++;

        // Track highest difficulty reached with correct answer
        if (difficultyOrder.indexOf(question.difficulty) > difficultyOrder.indexOf(highestDifficulty)) {
          highestDifficulty = question.difficulty;
        }
      } else if (response.selected_answers?.length === 0) {
        skipped++;
      } else {
        wrong++;
        // Apply negative marking
        earnedPoints -= points * 0.25;
      }
    }

    // Normalize score to 0-100
    const normalizedScore = Math.max(0, Math.round((earnedPoints / totalPoints) * 100));

    // Calculate topic breakdown percentages
    const topicBreakdown: Record<string, number> = {};
    for (const [topic, scores] of Object.entries(topicScores)) {
      topicBreakdown[topic] = Math.round((scores.correct / scores.total) * 100);
    }

    // Determine decision
    let decision: "pass" | "reject" = normalizedScore >= passingScore ? "pass" : "reject";
    
    // Record fraud if too many tab switches
    if (tab_switches > 5) {
      await supabase.from("fraud_logs").insert({
        application_id,
        agent_number: 2,
        flag_type: "excessive_tab_switches",
        severity: tab_switches > 10 ? "high" : "medium",
        evidence: { tab_switches },
      });
    }

    const reasoning = decision === "pass"
      ? `Candidate scored ${normalizedScore}% (passing: ${passingScore}%). Strong areas: ${Object.entries(topicBreakdown)
          .filter(([_, score]) => score >= 70)
          .map(([topic]) => topic)
          .join(", ") || "None"}. Reached ${highestDifficulty} difficulty questions.`
      : `Score ${normalizedScore}% below passing threshold of ${passingScore}%. Weak areas: ${Object.entries(topicBreakdown)
          .filter(([_, score]) => score < 50)
          .map(([topic]) => topic)
          .join(", ") || "None"}.`;

    // Store agent result
    const agentResult = {
      application_id,
      agent_number: 2,
      agent_name: "Quizmaster",
      score: normalizedScore,
      detailed_scores: topicBreakdown,
      decision,
      reasoning,
      raw_data: {
        total_questions: responses.length,
        correct,
        wrong,
        skipped,
        topic_breakdown: topicBreakdown,
        difficulty_reached: highestDifficulty,
        avg_time_per_question: Math.round(totalTime / responses.length),
        tab_switches,
        adaptive_path: [], // Would be populated with actual adaptive tracking
      },
    };

    await supabase.from("agent_results").insert(agentResult);

    // Update application status
    if (decision === "pass") {
      await supabase
        .from("applications")
        .update({
          status: "coding",
          current_agent: 3,
          agent_started_at: new Date().toISOString(),
        })
        .eq("id", application_id);

      // Trigger Agent 3 (Code Judge) - generate problems
      await supabase.functions.invoke("agent-codejudge-init", {
        body: { application_id },
      });
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
        next_agent: decision === "pass" ? 3 : null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Quizmaster evaluation error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
