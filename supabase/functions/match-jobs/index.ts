import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Job {
  id: string;
  title: string;
  required_skills: string[];
  field: string;
  experience_level: string;
}

interface MatchResult {
  job_id: string;
  match_score: number;
  matching_skills: string[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get candidate's skills
    const { data: profile, error: profileError } = await supabase
      .from("candidate_profiles")
      .select("skills, github_analysis")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: "Candidate profile not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const candidateSkills: string[] = profile.skills || [];
    const githubLanguages: string[] = profile.github_analysis?.top_languages || [];
    const allSkills = [...new Set([...candidateSkills, ...githubLanguages])].map(s => s.toLowerCase());

    // Get all active jobs
    const { data: jobs, error: jobsError } = await supabase
      .from("jobs")
      .select("id, title, required_skills, field, experience_level")
      .eq("status", "active");

    if (jobsError) {
      throw jobsError;
    }

    // Calculate match scores for each job
    const matches: MatchResult[] = (jobs || []).map((job: Job) => {
      const jobSkills = (job.required_skills || []).map(s => s.toLowerCase());
      const matchingSkills = jobSkills.filter(skill => 
        allSkills.some(cs => cs.includes(skill) || skill.includes(cs))
      );

      // Calculate match percentage
      const matchScore = jobSkills.length > 0 
        ? Math.round((matchingSkills.length / jobSkills.length) * 100)
        : 50; // Default score if no skills specified

      return {
        job_id: job.id,
        match_score: matchScore,
        matching_skills: matchingSkills,
      };
    });

    // Sort by match score
    matches.sort((a, b) => b.match_score - a.match_score);

    // Use service role to update job_priorities
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminSupabase = createClient(supabaseUrl, serviceRoleKey);

    // Update job priorities for top matches
    const topMatches = matches.slice(0, 20);
    
    for (const match of topMatches) {
      await adminSupabase
        .from("job_priorities")
        .upsert({
          candidate_id: user.id,
          job_id: match.job_id,
          match_score: match.match_score,
          matching_skills: match.matching_skills,
        }, {
          onConflict: "candidate_id,job_id",
        });
    }

    console.log(`Job matching completed for ${user.id}: ${matches.length} jobs analyzed`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        matches: matches.slice(0, 10),
        total_jobs: jobs?.length || 0,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Job matching error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
