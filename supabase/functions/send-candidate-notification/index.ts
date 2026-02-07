import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CandidateNotificationRequest {
  candidateEmail: string;
  candidateName: string;
  jobTitle: string;
  companyName: string;
  isSelected: boolean;
  interviewScore?: number;
  feedback?: {
    strengths?: string[];
    improvements?: string[];
    overallComment?: string;
  };
  nextSteps?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const body: CandidateNotificationRequest = await req.json();
    
    if (!RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not configured - email will be simulated");
      console.log("Simulated email to:", body.candidateEmail);
      return new Response(
        JSON.stringify({ success: true, simulated: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const {
      candidateEmail,
      candidateName,
      jobTitle,
      companyName,
      isSelected,
      interviewScore,
      feedback,
      nextSteps,
    } = body;

    // Validate required fields
    if (!candidateEmail || !candidateName || !jobTitle) {
      throw new Error("Missing required fields: candidateEmail, candidateName, or jobTitle");
    }

    const firstName = candidateName.split(" ")[0];
    const scoreDisplay = interviewScore ? `${Math.round(interviewScore)}%` : "N/A";

    // Generate email HTML based on selection status
    const emailHtml = isSelected
      ? generateSelectionEmail(firstName, jobTitle, companyName, scoreDisplay, feedback, nextSteps)
      : generateRejectionEmail(firstName, jobTitle, companyName, scoreDisplay, feedback);

    const subject = isSelected
      ? `🎉 Congratulations! You've been selected for ${jobTitle}`
      : `Update on your ${jobTitle} application`;

    // Use Resend API directly via fetch
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "HireMinds AI <noreply@hireminds.ai>",
        to: [candidateEmail],
        subject,
        html: emailHtml,
      }),
    });

    const emailResult = await emailResponse.json();
    
    if (!emailResponse.ok) {
      throw new Error(emailResult.message || "Failed to send email");
    }

    console.log("Email sent successfully:", emailResult);

    return new Response(JSON.stringify({ success: true, emailId: emailResult.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error sending candidate notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

function generateSelectionEmail(
  firstName: string,
  jobTitle: string,
  companyName: string,
  score: string,
  feedback?: CandidateNotificationRequest["feedback"],
  nextSteps?: string
): string {
  const strengthsList = feedback?.strengths?.map(s => `<li style="margin-bottom: 8px;">✅ ${s}</li>`).join("") || "";
  const improvementsList = feedback?.improvements?.map(i => `<li style="margin-bottom: 8px;">💡 ${i}</li>`).join("") || "";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Congratulations, ${firstName}!</h1>
  </div>
  
  <div style="background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; border-top: none;">
    <p style="font-size: 18px; margin-bottom: 20px;">
      We're thrilled to inform you that you've been <strong style="color: #10b981;">selected</strong> for the <strong>${jobTitle}</strong> position${companyName ? ` at <strong>${companyName}</strong>` : ""}.
    </p>
    
    <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <h2 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px;">📊 Your Interview Score</h2>
      <div style="font-size: 48px; font-weight: bold; color: #10b981; text-align: center; padding: 20px;">
        ${score}
      </div>
    </div>
    
    ${feedback?.strengths?.length ? `
    <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
      <h3 style="margin: 0 0 10px 0; color: #065f46;">Your Strengths</h3>
      <ul style="margin: 0; padding-left: 20px; color: #047857;">
        ${strengthsList}
      </ul>
    </div>
    ` : ""}
    
    ${feedback?.overallComment ? `
    <div style="background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
      <h3 style="margin: 0 0 10px 0; color: #0369a1;">Interviewer's Comment</h3>
      <p style="margin: 0; color: #0c4a6e;">${feedback.overallComment}</p>
    </div>
    ` : ""}
    
    ${nextSteps ? `
    <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
      <h3 style="margin: 0 0 10px 0; color: #92400e;">📋 Next Steps</h3>
      <p style="margin: 0; color: #78350f;">${nextSteps}</p>
    </div>
    ` : `
    <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
      <h3 style="margin: 0 0 10px 0; color: #92400e;">📋 Next Steps</h3>
      <p style="margin: 0; color: #78350f;">Our hiring team will reach out to you shortly with further details about the offer and onboarding process.</p>
    </div>
    `}
    
    <p style="margin-top: 30px; color: #6b7280;">
      Thank you for your time and effort throughout the interview process. We look forward to having you on board!
    </p>
  </div>
  
  <div style="background: #1f2937; padding: 20px; border-radius: 0 0 12px 12px; text-align: center;">
    <p style="color: #9ca3af; margin: 0; font-size: 14px;">
      Powered by HireMinds AI | Fair & Transparent Hiring
    </p>
  </div>
</body>
</html>
  `;
}

function generateRejectionEmail(
  firstName: string,
  jobTitle: string,
  companyName: string,
  score: string,
  feedback?: CandidateNotificationRequest["feedback"]
): string {
  const improvementsList = feedback?.improvements?.map(i => `<li style="margin-bottom: 8px;">💡 ${i}</li>`).join("") || "";
  const strengthsList = feedback?.strengths?.map(s => `<li style="margin-bottom: 8px;">✅ ${s}</li>`).join("") || "";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Hi ${firstName},</h1>
  </div>
  
  <div style="background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; border-top: none;">
    <p style="font-size: 16px; margin-bottom: 20px;">
      Thank you for taking the time to interview for the <strong>${jobTitle}</strong> position${companyName ? ` at <strong>${companyName}</strong>` : ""}. We appreciate your interest and the effort you put into the process.
    </p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      After careful consideration, we've decided to move forward with other candidates whose experience more closely matches our current needs. This was not an easy decision, and we want you to know that your application was thoroughly reviewed.
    </p>
    
    <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <h2 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px;">📊 Your Interview Score</h2>
      <div style="font-size: 36px; font-weight: bold; color: #6366f1; text-align: center; padding: 15px;">
        ${score}
      </div>
    </div>
    
    ${feedback?.strengths?.length ? `
    <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
      <h3 style="margin: 0 0 10px 0; color: #065f46;">What You Did Well</h3>
      <ul style="margin: 0; padding-left: 20px; color: #047857;">
        ${strengthsList}
      </ul>
    </div>
    ` : ""}
    
    ${feedback?.improvements?.length ? `
    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
      <h3 style="margin: 0 0 10px 0; color: #92400e;">Areas for Growth</h3>
      <ul style="margin: 0; padding-left: 20px; color: #78350f;">
        ${improvementsList}
      </ul>
    </div>
    ` : ""}
    
    ${feedback?.overallComment ? `
    <div style="background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
      <h3 style="margin: 0 0 10px 0; color: #0369a1;">Feedback</h3>
      <p style="margin: 0; color: #0c4a6e;">${feedback.overallComment}</p>
    </div>
    ` : ""}
    
    <div style="background: #ede9fe; border-left: 4px solid #8b5cf6; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
      <h3 style="margin: 0 0 10px 0; color: #5b21b6;">🚀 Keep Going!</h3>
      <p style="margin: 0; color: #6d28d9;">
        We encourage you to continue developing your skills and applying for positions that match your expertise. 
        Your profile will remain in our system, and we'll notify you of relevant opportunities.
      </p>
    </div>
    
    <p style="margin-top: 30px; color: #6b7280;">
      We wish you the best in your job search and future endeavors. Please don't hesitate to apply for other positions that match your skills.
    </p>
  </div>
  
  <div style="background: #1f2937; padding: 20px; border-radius: 0 0 12px 12px; text-align: center;">
    <p style="color: #9ca3af; margin: 0; font-size: 14px;">
      Powered by HireMinds AI | Fair & Transparent Hiring
    </p>
  </div>
</body>
</html>
  `;
}

serve(handler);
