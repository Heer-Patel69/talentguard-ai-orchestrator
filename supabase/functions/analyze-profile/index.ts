import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GitHubRepo {
  name: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  description: string | null;
}

interface GitHubUser {
  public_repos: number;
  followers: number;
  following: number;
  bio: string | null;
  company: string | null;
  location: string | null;
  created_at: string;
}

interface ProfileAnalysis {
  github_score: number;
  linkedin_score: number;
  profile_score: number;
  skills: string[];
  github_analysis: {
    repos_count: number;
    total_stars: number;
    total_forks: number;
    top_languages: string[];
    followers: number;
    account_age_years: number;
    activity_level: string;
  } | null;
  linkedin_analysis: {
    profile_strength: string;
    estimated_experience: string;
  } | null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { github_url, linkedin_url, candidate_id } = await req.json();

    if (!candidate_id) {
      return new Response(
        JSON.stringify({ error: "Candidate ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const analysis: ProfileAnalysis = {
      github_score: 0,
      linkedin_score: 0,
      profile_score: 0,
      skills: [],
      github_analysis: null,
      linkedin_analysis: null,
    };

    // Analyze GitHub profile
    if (github_url) {
      const githubData = await analyzeGitHub(github_url);
      if (githubData) {
        analysis.github_score = githubData.score;
        analysis.skills.push(...githubData.languages);
        analysis.github_analysis = githubData.analysis;
      }
    }

    // Analyze LinkedIn profile (basic analysis since we can't scrape without API)
    if (linkedin_url) {
      const linkedinData = await analyzeLinkedIn(linkedin_url);
      analysis.linkedin_score = linkedinData.score;
      analysis.linkedin_analysis = linkedinData.analysis;
    }

    // Calculate overall profile score
    const githubWeight = 0.6;
    const linkedinWeight = 0.4;
    
    if (github_url && linkedin_url) {
      analysis.profile_score = Math.round(
        analysis.github_score * githubWeight + analysis.linkedin_score * linkedinWeight
      );
    } else if (github_url) {
      analysis.profile_score = analysis.github_score;
    } else if (linkedin_url) {
      analysis.profile_score = analysis.linkedin_score;
    }

    // Use AI to enhance skills extraction and analysis
    const aiAnalysis = await getAIEnhancedAnalysis(analysis, github_url, linkedin_url);
    if (aiAnalysis.skills.length > 0) {
      analysis.skills = [...new Set([...analysis.skills, ...aiAnalysis.skills])];
    }

    // Update candidate profile
    const { error: updateError } = await supabase
      .from("candidate_profiles")
      .update({
        github_score: analysis.github_score,
        linkedin_score: analysis.linkedin_score,
        profile_score: analysis.profile_score,
        skills: analysis.skills,
        github_analysis: analysis.github_analysis,
        linkedin_analysis: analysis.linkedin_analysis,
        profile_analyzed_at: new Date().toISOString(),
      })
      .eq("user_id", candidate_id);

    if (updateError) {
      console.error("Error updating profile:", updateError);
      throw updateError;
    }

    console.log(`Profile analysis completed for candidate ${candidate_id}:`, {
      github_score: analysis.github_score,
      linkedin_score: analysis.linkedin_score,
      profile_score: analysis.profile_score,
      skills_count: analysis.skills.length,
    });

    return new Response(
      JSON.stringify({ success: true, analysis }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Profile analysis error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function analyzeGitHub(github_url: string) {
  try {
    // Extract username from URL
    const urlParts = github_url.replace(/\/$/, "").split("/");
    const username = urlParts[urlParts.length - 1];

    if (!username) {
      return null;
    }

    // Fetch user data
    const userResponse = await fetch(`https://api.github.com/users/${username}`, {
      headers: { "User-Agent": "HireMinds-AI" },
    });

    if (!userResponse.ok) {
      console.log("GitHub user not found:", username);
      return null;
    }

    const user: GitHubUser = await userResponse.json();

    // Fetch repositories
    const reposResponse = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`,
      { headers: { "User-Agent": "HireMinds-AI" } }
    );

    const repos: GitHubRepo[] = reposResponse.ok ? await reposResponse.json() : [];

    // Calculate metrics
    const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);
    
    // Extract languages
    const languageCounts: Record<string, number> = {};
    repos.forEach((repo) => {
      if (repo.language) {
        languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
      }
    });
    
    const topLanguages = Object.entries(languageCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([lang]) => lang);

    // Calculate account age
    const accountAge = (Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24 * 365);

    // Calculate score based on various factors
    let score = 0;
    
    // Repos count (max 25 points)
    score += Math.min(user.public_repos * 2, 25);
    
    // Stars (max 25 points)
    score += Math.min(totalStars * 2, 25);
    
    // Followers (max 20 points)
    score += Math.min(user.followers * 0.5, 20);
    
    // Forks (max 15 points)
    score += Math.min(totalForks, 15);
    
    // Language diversity (max 15 points)
    score += Math.min(Object.keys(languageCounts).length * 3, 15);

    // Determine activity level
    let activityLevel = "low";
    if (user.public_repos > 20 && totalStars > 10) {
      activityLevel = "high";
    } else if (user.public_repos > 10 || totalStars > 5) {
      activityLevel = "medium";
    }

    return {
      score: Math.min(Math.round(score), 100),
      languages: topLanguages,
      analysis: {
        repos_count: user.public_repos,
        total_stars: totalStars,
        total_forks: totalForks,
        top_languages: topLanguages,
        followers: user.followers,
        account_age_years: Math.round(accountAge * 10) / 10,
        activity_level: activityLevel,
      },
    };
  } catch (error) {
    console.error("GitHub analysis error:", error);
    return null;
  }
}

async function analyzeLinkedIn(linkedin_url: string) {
  // Since we can't scrape LinkedIn without API access, we provide a baseline score
  // and use AI to estimate based on URL patterns
  
  // Check if URL looks valid
  const isValidUrl = linkedin_url.includes("linkedin.com/in/");
  
  if (!isValidUrl) {
    return {
      score: 20,
      analysis: {
        profile_strength: "unknown",
        estimated_experience: "unknown",
      },
    };
  }

  // Extract username for basic validation
  const urlParts = linkedin_url.split("/in/");
  const hasUsername = urlParts.length > 1 && urlParts[1].replace(/\//g, "").length > 2;

  return {
    score: hasUsername ? 50 : 25, // Base score for having a valid LinkedIn
    analysis: {
      profile_strength: hasUsername ? "present" : "incomplete",
      estimated_experience: "to_be_verified",
    },
  };
}

async function getAIEnhancedAnalysis(
  currentAnalysis: ProfileAnalysis,
  github_url: string | null,
  linkedin_url: string | null
) {
  try {
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) {
      return { skills: [] };
    }

    const prompt = `Based on the following GitHub analysis, extract a list of technical skills this developer likely possesses. Only return skills that are commonly recognized in software development.

GitHub Analysis:
- Top Languages: ${currentAnalysis.github_analysis?.top_languages?.join(", ") || "None"}
- Repository Count: ${currentAnalysis.github_analysis?.repos_count || 0}
- Activity Level: ${currentAnalysis.github_analysis?.activity_level || "unknown"}

Return a JSON object with a "skills" array containing 5-15 relevant technical skills based on the languages and activity. Example: {"skills": ["JavaScript", "React", "Node.js", "Git"]}`;

    const response = await fetch("https://api.lovable.dev/api/v1/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableApiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      return { skills: [] };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (content) {
      try {
        const parsed = JSON.parse(content);
        return { skills: parsed.skills || [] };
      } catch {
        return { skills: [] };
      }
    }

    return { skills: [] };
  } catch (error) {
    console.error("AI analysis error:", error);
    return { skills: [] };
  }
}
