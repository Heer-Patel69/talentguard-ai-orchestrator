// =============================================
// HIREMINDS AI: AGENT PIPELINE ORCHESTRATOR
// =============================================

import { supabase } from '@/integrations/supabase/client';
import type {
  AgentResult,
  PipelineState,
  CandidateData,
  JobData,
  FraudSignal,
  RoundConfig,
  ScoreWeights,
} from './agent-types';

export const AGENT_NAMES = {
  1: 'Gatekeeper',
  2: 'Quizmaster',
  3: 'Code Judge',
  4: 'Persona',
  5: 'Interviewer',
  6: 'Verdict',
} as const;

// Map agent numbers to application statuses that exist in the database
export const AGENT_TO_DB_STATUS = {
  1: 'screening',
  2: 'interviewing', // Using 'interviewing' for MCQ phase
  3: 'interviewing', // Using 'interviewing' for coding phase
  4: 'interviewing', // Using 'interviewing' for behavioral phase
  5: 'interviewing', // Using 'interviewing' for interview phase
  6: 'shortlisted',  // Using 'shortlisted' for completed
} as const;

// Initialize the pipeline when a candidate applies
export async function initializePipeline(applicationId: string): Promise<PipelineState> {
  const { data, error } = await supabase
    .from('applications')
    .update({
      current_agent: 1,
      agent_started_at: new Date().toISOString(),
      status: 'screening',
    })
    .eq('id', applicationId)
    .select()
    .single();

  if (error) throw error;

  return {
    application_id: applicationId,
    current_agent: 1,
    started_at: new Date(),
    results: [],
    fraud_signals: [],
    status: 'in_progress',
  };
}

// Trigger the next agent in the pipeline
export async function triggerAgent(
  applicationId: string,
  agentNumber: number
): Promise<void> {
  const functionName = getAgentFunctionName(agentNumber);
  
  const { error } = await supabase.functions.invoke(functionName, {
    body: { application_id: applicationId },
  });

  if (error) {
    console.error(`Failed to trigger agent ${agentNumber}:`, error);
    throw error;
  }
}

// Get the edge function name for an agent
function getAgentFunctionName(agentNumber: number): string {
  const functionMap: Record<number, string> = {
    1: 'agent-gatekeeper',
    2: 'agent-quizmaster',
    3: 'agent-codejudge',
    4: 'agent-persona',
    5: 'agent-interviewer',
    6: 'agent-verdict',
  };
  return functionMap[agentNumber] || 'agent-gatekeeper';
}

// Process agent result and determine next step
export async function processAgentResult(
  applicationId: string,
  agentNumber: number,
  result: AgentResult
): Promise<{ nextAgent: number | null; pipelineComplete: boolean }> {
  // Store the result
  await supabase.from('agent_results').insert({
    application_id: applicationId,
    agent_number: agentNumber,
    agent_name: AGENT_NAMES[agentNumber as keyof typeof AGENT_NAMES],
    score: result.score,
    detailed_scores: result.detailed_scores,
    decision: result.decision,
    reasoning: result.reasoning,
    raw_data: result.raw_data,
  });

  // Check if candidate passed
  if (result.decision === 'reject') {
    await supabase
      .from('applications')
      .update({
        status: 'rejected',
        current_agent: agentNumber,
      })
      .eq('id', applicationId);

    return { nextAgent: null, pipelineComplete: true };
  }

  // Determine next agent
  const nextAgent = agentNumber < 6 ? agentNumber + 1 : null;
  
  if (nextAgent) {
    const status = AGENT_TO_DB_STATUS[nextAgent as keyof typeof AGENT_TO_DB_STATUS];
    await supabase
      .from('applications')
      .update({
        current_agent: nextAgent,
        status,
        agent_started_at: new Date().toISOString(),
      })
      .eq('id', applicationId);

    return { nextAgent, pipelineComplete: false };
  }

  // Pipeline complete
  await supabase
    .from('applications')
    .update({
      status: 'shortlisted',
      current_agent: 6,
    })
    .eq('id', applicationId);

  return { nextAgent: null, pipelineComplete: true };
}

// Record a fraud signal
export async function recordFraudSignal(
  applicationId: string,
  signal: FraudSignal
): Promise<void> {
  await supabase.from('fraud_logs').insert({
    application_id: applicationId,
    agent_number: signal.agent_number,
    flag_type: signal.type,
    severity: signal.severity,
    evidence: signal.evidence,
  });

  // Update fraud risk score on application
  const { data: logs } = await supabase
    .from('fraud_logs')
    .select('severity')
    .eq('application_id', applicationId);

  if (logs) {
    const riskScore = calculateFraudRiskScore(logs);
    await supabase
      .from('applications')
      .update({ fraud_risk_score: riskScore })
      .eq('id', applicationId);
  }
}

// Calculate overall fraud risk score
function calculateFraudRiskScore(logs: { severity: string }[]): number {
  const weights = {
    low: 5,
    medium: 15,
    high: 30,
    critical: 50,
  };

  let totalRisk = 0;
  for (const log of logs) {
    totalRisk += weights[log.severity as keyof typeof weights] || 0;
  }

  return Math.min(100, totalRisk);
}

// Get application with all agent results
export async function getApplicationWithResults(applicationId: string) {
  const { data: application } = await supabase
    .from('applications')
    .select(`
      *,
      candidate:candidate_profiles!applications_candidate_id_fkey(
        *,
        profile:profiles!candidate_profiles_user_id_fkey(*)
      ),
      job:jobs!applications_job_id_fkey(*)
    `)
    .eq('id', applicationId)
    .single();

  const { data: results } = await supabase
    .from('agent_results')
    .select('*')
    .eq('application_id', applicationId)
    .order('agent_number');

  return { application, results };
}

// Get candidate data formatted for agents
export async function getCandidateData(candidateId: string): Promise<CandidateData | null> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', candidateId)
    .single();

  const { data: candidateProfile } = await supabase
    .from('candidate_profiles')
    .select('*')
    .eq('user_id', candidateId)
    .single();

  if (!profile || !candidateProfile) return null;

  // Parse education if it's a JSON array
  const education = Array.isArray(candidateProfile.education) 
    ? candidateProfile.education as unknown as CandidateData['education']
    : [];

  return {
    id: candidateId,
    name: profile.full_name || '',
    email: profile.email || '',
    phone: candidateProfile.phone_number || undefined,
    github_url: candidateProfile.github_url || undefined,
    linkedin_url: candidateProfile.linkedin_url || undefined,
    resume_url: candidateProfile.resume_url || undefined,
    skills: Array.isArray(candidateProfile.skills) ? candidateProfile.skills as string[] : [],
    experience_years: typeof candidateProfile.experience_years === 'number' 
      ? candidateProfile.experience_years 
      : 0,
    education,
    profile_score: typeof candidateProfile.profile_score === 'number' 
      ? candidateProfile.profile_score 
      : undefined,
    github_score: typeof candidateProfile.github_score === 'number' 
      ? candidateProfile.github_score 
      : undefined,
  };
}

// Get job data formatted for agents
export async function getJobData(jobId: string): Promise<JobData | null> {
  const { data: job } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (!job) return null;

  // Safely parse JSON fields with proper type checking
  const roundConfig = parseRoundConfig(job.round_config);
  const scoreWeights = parseScoreWeights(job.score_weights);
  const customQuestions = Array.isArray(job.custom_questions) 
    ? job.custom_questions as string[]
    : [];

  return {
    id: job.id,
    title: job.title,
    description: job.description || '',
    field: job.field || 'general',
    experience_level: job.experience_level || 'mid',
    toughness_level: typeof job.toughness_level === 'number' ? job.toughness_level : 3,
    requirements: [],
    skills_required: [],
    round_config: roundConfig,
    score_weights: scoreWeights,
    custom_questions: customQuestions,
  };
}

function parseRoundConfig(config: unknown): RoundConfig {
  const defaultConfig: RoundConfig = {
    mcq: { enabled: true, num_questions: 25, passing_score: 60, time_limit_minutes: 45 },
    coding: { enabled: true, num_problems: 3, passing_score: 55, time_limit_minutes: 90 },
    behavioral: { enabled: true, num_questions: 10, passing_score: 50 },
    interview: { enabled: true, duration_minutes: 45, passing_score: 60 },
  };

  if (!config || typeof config !== 'object') return defaultConfig;

  const c = config as Record<string, unknown>;
  
  return {
    mcq: {
      enabled: (c.mcq as any)?.enabled ?? true,
      num_questions: (c.mcq as any)?.num_questions ?? 25,
      passing_score: (c.mcq as any)?.passing_score ?? 60,
      time_limit_minutes: (c.mcq as any)?.time_limit_minutes ?? 45,
    },
    coding: {
      enabled: (c.coding as any)?.enabled ?? true,
      num_problems: (c.coding as any)?.num_problems ?? 3,
      passing_score: (c.coding as any)?.passing_score ?? 55,
      time_limit_minutes: (c.coding as any)?.time_limit_minutes ?? 90,
    },
    behavioral: {
      enabled: (c.behavioral as any)?.enabled ?? true,
      num_questions: (c.behavioral as any)?.num_questions ?? 10,
      passing_score: (c.behavioral as any)?.passing_score ?? 50,
    },
    interview: {
      enabled: (c.interview as any)?.enabled ?? true,
      duration_minutes: (c.interview as any)?.duration_minutes ?? 45,
      passing_score: (c.interview as any)?.passing_score ?? 60,
    },
  };
}

function parseScoreWeights(weights: unknown): ScoreWeights {
  const defaultWeights: ScoreWeights = {
    resume: 0.05,
    mcq: 0.15,
    coding: 0.30,
    behavioral: 0.15,
    interview: 0.30,
    fraud_adjustment: 0.05,
  };

  if (!weights || typeof weights !== 'object') return defaultWeights;

  const w = weights as Record<string, unknown>;
  
  return {
    resume: typeof w.resume === 'number' ? w.resume : 0.05,
    mcq: typeof w.mcq === 'number' ? w.mcq : 0.15,
    coding: typeof w.coding === 'number' ? w.coding : 0.30,
    behavioral: typeof w.behavioral === 'number' ? w.behavioral : 0.15,
    interview: typeof w.interview === 'number' ? w.interview : 0.30,
    fraud_adjustment: typeof w.fraud_adjustment === 'number' ? w.fraud_adjustment : 0.05,
  };
}

// Notify candidate about pipeline status
export async function notifyCandidate(
  candidateId: string,
  type: 'stage_passed' | 'stage_failed' | 'interview_ready' | 'final_result',
  data: Record<string, unknown>
): Promise<void> {
  console.log(`Notifying candidate ${candidateId}:`, type, data);
  
  // Only send email for final results
  if (type === 'final_result') {
    try {
      // Get candidate details
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('user_id', candidateId)
        .single();

      if (!profile?.email) {
        console.error('No email found for candidate:', candidateId);
        return;
      }

      // Send notification email
      await supabase.functions.invoke('send-candidate-notification', {
        body: {
          candidateEmail: profile.email,
          candidateName: profile.full_name || 'Candidate',
          jobTitle: data.jobTitle as string || 'Position',
          companyName: data.companyName as string || '',
          isSelected: data.isSelected as boolean,
          interviewScore: data.interviewScore as number,
          feedback: data.feedback as { strengths?: string[]; improvements?: string[]; overallComment?: string },
          nextSteps: data.nextSteps as string,
        },
      });

      console.log('Notification email sent to:', profile.email);
    } catch (error) {
      console.error('Failed to send notification email:', error);
    }
  }
}
