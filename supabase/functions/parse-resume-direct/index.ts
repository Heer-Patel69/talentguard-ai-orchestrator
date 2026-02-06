const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FieldWithConfidence<T> {
  value: T;
  confidence: "high" | "medium" | "low";
}

interface ResumeData {
  fullName: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  skills: string[];
  experience_years: number;
  education: Education[];
  workExperience: WorkExperience[];
  projects: Project[];
  certifications: string[];
  languages: string[];
  summary: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  confidence_scores: {
    fullName: "high" | "medium" | "low";
    email: "high" | "medium" | "low";
    phone: "high" | "medium" | "low";
    skills: "high" | "medium" | "low";
    experience: "high" | "medium" | "low";
    education: "high" | "medium" | "low";
  };
  validation_warnings: string[];
  suggested_job_preferences: {
    fields: string[];
    experience_level: string;
    roles: string[];
    work_type: string[];
  };
}

interface Education {
  degree: string;
  institution: string;
  year: number;
  field?: string;
  gpa?: string;
}

interface WorkExperience {
  company: string;
  title: string;
  duration: string;
  startDate?: string;
  endDate?: string;
  description: string;
  technologies?: string[];
}

interface Project {
  name: string;
  description: string;
  technologies: string[];
  url?: string;
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

    // Check file size (base64 is ~4/3 larger than binary)
    const estimatedSizeBytes = (base64Content.length * 3) / 4;
    const maxSizeMB = 10;
    if (estimatedSizeBytes > maxSizeMB * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: `File too large. Maximum size is ${maxSizeMB}MB.` }),
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

    // Use AI to extract information from resume with enhanced prompting
    const extractedData = await extractResumeData(base64Content, lovableApiKey);

    if (!extractedData) {
      return new Response(
        JSON.stringify({ error: "Failed to parse resume. Please ensure the PDF is readable and not password-protected." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate extracted data
    const validationWarnings = validateExtractedData(extractedData);
    extractedData.validation_warnings = validationWarnings;

    console.log("Resume parsed successfully:", {
      skills_count: extractedData.skills?.length || 0,
      education_count: extractedData.education?.length || 0,
      projects_count: extractedData.projects?.length || 0,
      experience_count: extractedData.workExperience?.length || 0,
      warnings_count: validationWarnings.length,
    });

    return new Response(
      JSON.stringify({ success: true, data: extractedData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Resume parsing error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An unexpected error occurred while parsing the resume." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function validateExtractedData(data: ResumeData): string[] {
  const warnings: string[] = [];

  // Validate email format
  if (data.email && !isValidEmail(data.email)) {
    warnings.push("Email format appears invalid");
  }

  // Validate phone format
  if (data.phone && !isValidPhone(data.phone)) {
    warnings.push("Phone number format may be incorrect");
  }

  // Check for missing critical fields
  if (!data.fullName) {
    warnings.push("Full name could not be extracted");
  }

  if (!data.email) {
    warnings.push("Email address could not be extracted");
  }

  if (data.skills.length === 0) {
    warnings.push("No skills were detected in the resume");
  }

  if (data.education.length === 0) {
    warnings.push("No education history was detected");
  }

  if (data.workExperience.length === 0 && data.experience_years > 0) {
    warnings.push("Experience years detected but no work history details found");
  }

  // Check for date consistency in work experience
  // (simplified check - just flag if something seems off)
  if (data.experience_years > 30) {
    warnings.push("Experience years seems unusually high - please verify");
  }

  return warnings;
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone: string): boolean {
  // Allow various phone formats - just check for reasonable length and digits
  const digitsOnly = phone.replace(/\D/g, '');
  return digitsOnly.length >= 7 && digitsOnly.length <= 15;
}

async function extractResumeData(base64Pdf: string, apiKey: string): Promise<ResumeData | null> {
  try {
    const prompt = `You are an expert resume parser with OCR capabilities. Analyze the provided PDF resume document carefully. If the document is a scanned image, use OCR to read the text.

Extract ALL information and return it in this exact JSON structure:

{
  "fullName": "Full name of the candidate (string or null)",
  "email": "Email address (string or null)",
  "phone": "Phone number with country code if available (string or null)",
  "location": "City, State/Country (string or null)",
  "skills": ["Comprehensive array of ALL skills - include programming languages, frameworks, libraries, tools, databases, cloud platforms, soft skills, methodologies, etc."],
  "experience_years": <total years of professional experience as a number>,
  "education": [
    {
      "degree": "Degree name (e.g., Bachelor of Science, MBA)",
      "institution": "University/College name",
      "year": <graduation year as number>,
      "field": "Field of study (e.g., Computer Science)",
      "gpa": "GPA if mentioned (string or null)"
    }
  ],
  "workExperience": [
    {
      "company": "Company name",
      "title": "Job title",
      "duration": "Duration string (e.g., 'Jan 2020 - Dec 2022')",
      "startDate": "Start date if clear (e.g., '2020-01')",
      "endDate": "End date or 'Present' (e.g., '2022-12')",
      "description": "Brief description of role and responsibilities",
      "technologies": ["Technologies used in this role"]
    }
  ],
  "projects": [
    {
      "name": "Project name",
      "description": "Brief description",
      "technologies": ["Technologies used"],
      "url": "Project URL if available (string or null)"
    }
  ],
  "certifications": ["List of professional certifications"],
  "languages": ["Languages spoken (e.g., English, Spanish)"],
  "summary": "Professional summary or objective statement (string or null)",
  "github_url": "GitHub profile URL if found (string or null)",
  "linkedin_url": "LinkedIn profile URL if found (string or null)",
  "portfolio_url": "Portfolio/personal website URL if found (string or null)",
  "confidence_scores": {
    "fullName": "<high/medium/low based on clarity of extraction>",
    "email": "<high/medium/low>",
    "phone": "<high/medium/low>",
    "skills": "<high/medium/low based on how clearly skills were listed>",
    "experience": "<high/medium/low based on clarity of work history>",
    "education": "<high/medium/low>"
  },
  "suggested_job_preferences": {
    "fields": ["Suggested job fields based on experience, e.g., 'Frontend Development', 'Data Science'"],
    "experience_level": "<entry/junior/mid/senior/lead/principal based on years and roles>",
    "roles": ["Suggested job titles the candidate would be suitable for"],
    "work_type": ["remote", "hybrid", "onsite - based on any preferences mentioned or infer from experience"]
  }
}

CRITICAL INSTRUCTIONS:
1. Be THOROUGH - extract every skill, technology, and tool mentioned anywhere in the resume
2. For scanned/image PDFs, perform OCR to read the text
3. If a field is unclear or not found, set it to null or empty array
4. Confidence scores should reflect how clearly the information was presented
5. Experience level: entry=0-1 years, junior=1-3, mid=3-5, senior=5-10, lead/principal=10+
6. Return ONLY valid JSON - no markdown, no explanations, no code blocks`;

    // Use Lovable AI Gateway with the correct endpoint
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
                type: "image_url",
                image_url: {
                  url: `data:application/pdf;base64,${base64Pdf}`,
                },
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      
      if (response.status === 429) {
        throw new Error("Service is busy. Please try again in a few seconds.");
      }
      if (response.status === 402) {
        throw new Error("Service temporarily unavailable. Please try again later.");
      }
      
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (content) {
      try {
        // Clean the content - remove any markdown code blocks if present
        let cleanContent = content.trim();
        if (cleanContent.startsWith("```json")) {
          cleanContent = cleanContent.slice(7);
        } else if (cleanContent.startsWith("```")) {
          cleanContent = cleanContent.slice(3);
        }
        if (cleanContent.endsWith("```")) {
          cleanContent = cleanContent.slice(0, -3);
        }
        cleanContent = cleanContent.trim();

        const parsed = JSON.parse(cleanContent);
        
        return {
          fullName: parsed.fullName || null,
          email: parsed.email || null,
          phone: parsed.phone || null,
          location: parsed.location || null,
          skills: Array.isArray(parsed.skills) ? parsed.skills : [],
          experience_years: typeof parsed.experience_years === "number" ? parsed.experience_years : 0,
          education: Array.isArray(parsed.education) ? parsed.education : [],
          workExperience: Array.isArray(parsed.workExperience) ? parsed.workExperience : [],
          projects: Array.isArray(parsed.projects) ? parsed.projects : [],
          certifications: Array.isArray(parsed.certifications) ? parsed.certifications : [],
          languages: Array.isArray(parsed.languages) ? parsed.languages : [],
          summary: parsed.summary || null,
          github_url: parsed.github_url || null,
          linkedin_url: parsed.linkedin_url || null,
          portfolio_url: parsed.portfolio_url || null,
          confidence_scores: parsed.confidence_scores || {
            fullName: "medium",
            email: "medium",
            phone: "medium",
            skills: "medium",
            experience: "medium",
            education: "medium",
          },
          validation_warnings: [],
          suggested_job_preferences: parsed.suggested_job_preferences || {
            fields: [],
            experience_level: "mid",
            roles: [],
            work_type: ["remote", "hybrid", "onsite"],
          },
        };
      } catch (parseError) {
        console.error("JSON parse error:", parseError, content);
        return null;
      }
    }

    return null;
  } catch (error) {
    console.error("Resume extraction error:", error);
    throw error;
  }
}
