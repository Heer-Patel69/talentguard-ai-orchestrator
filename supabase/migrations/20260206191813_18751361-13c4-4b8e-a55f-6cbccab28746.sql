-- Create enum for decision recommendations
CREATE TYPE decision_recommendation AS ENUM ('shortlist', 'maybe', 'reject');

-- Create question_scores table for per-question scoring
CREATE TABLE public.question_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  round_result_id UUID NOT NULL REFERENCES public.round_results(id) ON DELETE CASCADE,
  question_number INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  candidate_answer TEXT,
  
  -- Individual scores (0-100)
  technical_accuracy NUMERIC(5,2) DEFAULT 0,
  code_quality NUMERIC(5,2) DEFAULT 0,
  communication_clarity NUMERIC(5,2) DEFAULT 0,
  problem_solving NUMERIC(5,2) DEFAULT 0,
  time_efficiency NUMERIC(5,2) DEFAULT 0,
  
  -- Weighted average
  weighted_score NUMERIC(5,2) DEFAULT 0,
  
  -- AI evaluation
  ai_evaluation TEXT,
  ai_reasoning TEXT,
  score_justification TEXT,
  
  -- Metadata
  time_taken_seconds INTEGER,
  hints_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(round_result_id, question_number)
);

-- Create round_scores table for per-round scoring
CREATE TABLE public.round_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  round_result_id UUID NOT NULL REFERENCES public.round_results(id) ON DELETE CASCADE UNIQUE,
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  
  -- Base score (average of question scores)
  base_score NUMERIC(5,2) DEFAULT 0,
  
  -- Bonus points
  clarifying_questions_bonus NUMERIC(5,2) DEFAULT 0,
  optimization_bonus NUMERIC(5,2) DEFAULT 0,
  edge_cases_bonus NUMERIC(5,2) DEFAULT 0,
  
  -- Penalties
  fraud_penalty NUMERIC(5,2) DEFAULT 0,
  hints_penalty NUMERIC(5,2) DEFAULT 0,
  
  -- Final round score
  final_score NUMERIC(5,2) DEFAULT 0,
  
  -- Round weight (configurable)
  weight NUMERIC(3,2) DEFAULT 1.0,
  
  -- AI summary
  strengths TEXT[],
  weaknesses TEXT[],
  improvement_suggestions TEXT[],
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create candidate_scores table for overall candidate scoring
CREATE TABLE public.candidate_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE UNIQUE,
  candidate_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  
  -- Overall scores
  final_score NUMERIC(5,2) DEFAULT 0,
  percentile_rank NUMERIC(5,2),
  
  -- Category scores
  technical_score NUMERIC(5,2) DEFAULT 0,
  communication_score NUMERIC(5,2) DEFAULT 0,
  problem_solving_score NUMERIC(5,2) DEFAULT 0,
  
  -- Decision
  recommendation decision_recommendation,
  recommendation_reason TEXT,
  recommendation_confidence NUMERIC(3,2),
  
  -- AI Report
  overall_summary TEXT,
  strengths TEXT[],
  weaknesses TEXT[],
  improvement_suggestions TEXT[],
  risk_flags TEXT[],
  risk_explanations TEXT[],
  
  -- Comparison data
  rank_among_applicants INTEGER,
  total_applicants INTEGER,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create audit_logs table for compliance
CREATE TABLE public.scoring_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES public.applications(id) ON DELETE SET NULL,
  candidate_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  
  -- Audit details
  action_type TEXT NOT NULL, -- 'score_calculated', 'decision_made', 'report_generated', 'export_requested'
  action_description TEXT NOT NULL,
  
  -- Decision factors
  decision_made TEXT,
  factors_considered JSONB,
  
  -- AI metadata
  model_version TEXT DEFAULT 'v1.0',
  confidence_score NUMERIC(3,2),
  
  -- User who triggered (if applicable)
  triggered_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.question_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.round_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scoring_audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for question_scores
CREATE POLICY "Interviewers can view question scores for their jobs"
ON public.question_scores
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.round_results rr
    JOIN public.applications a ON a.id = rr.application_id
    JOIN public.jobs j ON j.id = a.job_id
    WHERE rr.id = question_scores.round_result_id
    AND j.interviewer_id = auth.uid()
  )
);

CREATE POLICY "Candidates can view their own question scores"
ON public.question_scores
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.round_results rr
    JOIN public.applications a ON a.id = rr.application_id
    WHERE rr.id = question_scores.round_result_id
    AND a.candidate_id = auth.uid()
  )
);

CREATE POLICY "System can insert question scores"
ON public.question_scores
FOR INSERT
WITH CHECK (true);

-- RLS Policies for round_scores
CREATE POLICY "Interviewers can view round scores for their jobs"
ON public.round_scores
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.applications a
    JOIN public.jobs j ON j.id = a.job_id
    WHERE a.id = round_scores.application_id
    AND j.interviewer_id = auth.uid()
  )
);

CREATE POLICY "Candidates can view their own round scores"
ON public.round_scores
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.applications a
    WHERE a.id = round_scores.application_id
    AND a.candidate_id = auth.uid()
  )
);

CREATE POLICY "System can insert round scores"
ON public.round_scores
FOR INSERT
WITH CHECK (true);

CREATE POLICY "System can update round scores"
ON public.round_scores
FOR UPDATE
USING (true);

-- RLS Policies for candidate_scores
CREATE POLICY "Interviewers can view candidate scores for their jobs"
ON public.candidate_scores
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.jobs j
    WHERE j.id = candidate_scores.job_id
    AND j.interviewer_id = auth.uid()
  )
);

CREATE POLICY "Candidates can view their own scores"
ON public.candidate_scores
FOR SELECT
USING (candidate_id = auth.uid());

CREATE POLICY "System can insert candidate scores"
ON public.candidate_scores
FOR INSERT
WITH CHECK (true);

CREATE POLICY "System can update candidate scores"
ON public.candidate_scores
FOR UPDATE
USING (true);

-- RLS Policies for audit_logs
CREATE POLICY "Interviewers can view audit logs for their jobs"
ON public.scoring_audit_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.jobs j
    WHERE j.id = scoring_audit_logs.job_id
    AND j.interviewer_id = auth.uid()
  )
);

CREATE POLICY "System can insert audit logs"
ON public.scoring_audit_logs
FOR INSERT
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_question_scores_round_result ON public.question_scores(round_result_id);
CREATE INDEX idx_round_scores_application ON public.round_scores(application_id);
CREATE INDEX idx_candidate_scores_job ON public.candidate_scores(job_id);
CREATE INDEX idx_candidate_scores_candidate ON public.candidate_scores(candidate_id);
CREATE INDEX idx_audit_logs_application ON public.scoring_audit_logs(application_id);
CREATE INDEX idx_audit_logs_created ON public.scoring_audit_logs(created_at DESC);

-- Add trigger for updated_at
CREATE TRIGGER update_round_scores_updated_at
BEFORE UPDATE ON public.round_scores
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_candidate_scores_updated_at
BEFORE UPDATE ON public.candidate_scores
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();