const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ResumeData {
  fullName: string | null;
  email: string | null;
  phone: string | null;
  skills: string[];
  experience_years: number;
  education: Education[];
  projects: Project[];
  certifications: string[];
  summary: string | null;
}

interface Education {
  degree: string;
  institution: string;
  year: number;
  field?: string;
}

interface Project {
  name: string;
  description: string;
  technologies: string[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { base64Content } = await req.json();

    if (!base64Content) {
      return new Response(
        JSON.stringify({ error: "PDF content is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    
    if (!lovableApiKey) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use AI to extract information from resume
    const extractedData = await extractResumeData(base64Content, lovableApiKey);

    if (!extractedData) {
      return new Response(
        JSON.stringify({ error: "Failed to parse resume" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Resume parsed successfully:", {
      skills_count: extractedData.skills?.length || 0,
      education_count: extractedData.education?.length || 0,
      projects_count: extractedData.projects?.length || 0,
    });

    return new Response(
      JSON.stringify({ success: true, data: extractedData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Resume parsing error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function extractResumeData(base64Pdf: string, apiKey: string): Promise<ResumeData | null> {
  try {
    const prompt = `You are an expert resume parser. Analyze the provided PDF resume and extract the following information in a structured JSON format:

{
  "fullName": "Full name of the candidate",
  "email": "Email address if found",
  "phone": "Phone number if found",
  "skills": ["Array of technical and soft skills - be thorough, include programming languages, frameworks, tools, databases, cloud platforms, methodologies"],
  "experience_years": <estimated total years of professional experience as a number>,
  "education": [
    {
      "degree": "Degree name",
      "institution": "University/College name",
      "year": <graduation year as number>,
      "field": "Field of study"
    }
  ],
  "projects": [
    {
      "name": "Project name",
      "description": "Brief description",
      "technologies": ["Technologies used"]
    }
  ],
  "certifications": ["List of certifications"],
  "summary": "Brief professional summary"
}

Important instructions:
1. Extract ALL skills mentioned - programming languages, frameworks, libraries, tools, databases, cloud services, methodologies
2. Calculate experience_years by looking at work history dates
3. Include all education entries found
4. Extract key projects with their tech stacks
5. Return valid JSON only - no markdown, no explanations`;

    const response = await fetch("https://api.lovable.dev/api/v1/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "file",
                file: {
                  filename: "resume.pdf",
                  file_data: `data:application/pdf;base64,${base64Pdf}`,
                },
              },
            ],
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (content) {
      try {
        const parsed = JSON.parse(content);
        return {
          fullName: parsed.fullName || null,
          email: parsed.email || null,
          phone: parsed.phone || null,
          skills: Array.isArray(parsed.skills) ? parsed.skills : [],
          experience_years: typeof parsed.experience_years === "number" ? parsed.experience_years : 0,
          education: Array.isArray(parsed.education) ? parsed.education : [],
          projects: Array.isArray(parsed.projects) ? parsed.projects : [],
          certifications: Array.isArray(parsed.certifications) ? parsed.certifications : [],
          summary: parsed.summary || null,
        };
      } catch (parseError) {
        console.error("JSON parse error:", parseError, content);
        return null;
      }
    }

    return null;
  } catch (error) {
    console.error("Resume extraction error:", error);
    return null;
  }
}
