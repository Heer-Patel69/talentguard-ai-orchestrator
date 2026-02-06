-- =============================================
-- HIREMINDS AI: 6-AGENT HIRING PLATFORM SCHEMA
-- =============================================

-- Drop existing tables if they conflict (for clean rebuild)
DROP TABLE IF EXISTS fraud_logs CASCADE;
DROP TABLE IF EXISTS final_reports CASCADE;
DROP TABLE IF EXISTS interview_recordings CASCADE;
DROP TABLE IF EXISTS agent_results CASCADE;

-- =============================================
-- AGENT RESULTS TABLE - Stores output from each agent
-- =============================================
CREATE TABLE public.agent_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  agent_number INTEGER NOT NULL CHECK (agent_number >= 1 AND agent_number <= 6),
  agent_name TEXT NOT NULL,
  score NUMERIC(5,2) CHECK (score >= 0 AND score <= 100),
  detailed_scores JSONB DEFAULT '{}',
  decision TEXT NOT NULL CHECK (decision IN ('pass', 'reject', 'borderline', 'strong_pass', 'pending')),
  reasoning TEXT,
  raw_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- INTERVIEW RECORDINGS TABLE
-- =============================================
CREATE TABLE public.interview_recordings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  audio_url TEXT,
  video_url TEXT,
  transcript JSONB DEFAULT '[]',
  code_submissions JSONB DEFAULT '[]',
  duration_minutes INTEGER,
  fraud_flags JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- FINAL REPORTS TABLE - Agent 6 output
-- =============================================
CREATE TABLE public.final_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL CHECK (report_type IN ('summary', 'candidate', 'rejected', 'comparison')),
  report_data JSONB NOT NULL DEFAULT '{}',
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- FRAUD LOGS TABLE
-- =============================================
CREATE TABLE public.fraud_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  agent_number INTEGER,
  flag_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  evidence JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- MCQ QUESTIONS TABLE - For Agent 2
-- =============================================
CREATE TABLE public.mcq_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('single', 'multiple', 'true_false', 'fill_blank')),
  options JSONB NOT NULL DEFAULT '[]',
  correct_answers JSONB NOT NULL DEFAULT '[]',
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')),
  topic TEXT,
  points INTEGER DEFAULT 1,
  time_limit_seconds INTEGER DEFAULT 60,
  explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- MCQ RESPONSES TABLE - Candidate answers
-- =============================================
CREATE TABLE public.mcq_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  question_id UUID NOT NULL,
  selected_answers JSONB NOT NULL DEFAULT '[]',
  is_correct BOOLEAN,
  time_taken_seconds INTEGER,
  answered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- CODING PROBLEMS TABLE - For Agent 3
-- =============================================
CREATE TABLE public.coding_problems (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  input_format TEXT,
  output_format TEXT,
  constraints TEXT,
  examples JSONB DEFAULT '[]',
  test_cases JSONB NOT NULL DEFAULT '[]',
  hidden_test_cases JSONB NOT NULL DEFAULT '[]',
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')),
  expected_time_complexity TEXT,
  expected_space_complexity TEXT,
  hints JSONB DEFAULT '[]',
  time_limit_minutes INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- CODE SUBMISSIONS TABLE
-- =============================================
CREATE TABLE public.code_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  problem_id UUID NOT NULL,
  code TEXT NOT NULL,
  language TEXT NOT NULL,
  tests_passed INTEGER DEFAULT 0,
  tests_total INTEGER DEFAULT 0,
  execution_time_ms INTEGER,
  memory_used_kb INTEGER,
  time_complexity TEXT,
  space_complexity TEXT,
  code_quality_score NUMERIC(5,2),
  ai_review JSONB DEFAULT '{}',
  paste_events INTEGER DEFAULT 0,
  keystroke_data JSONB DEFAULT '{}',
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- BEHAVIORAL RESPONSES TABLE - For Agent 4
-- =============================================
CREATE TABLE public.behavioral_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  response_text TEXT,
  response_audio_url TEXT,
  ai_evaluation JSONB DEFAULT '{}',
  scores JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- INTERVIEW TRANSCRIPTS TABLE - For Agent 5
-- =============================================
CREATE TABLE public.interview_transcripts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('ai', 'candidate', 'system')),
  content TEXT NOT NULL,
  audio_url TEXT,
  timestamp_ms INTEGER,
  phase TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- CANDIDATE RANKINGS TABLE - For Agent 6
-- =============================================
CREATE TABLE public.candidate_rankings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  final_score NUMERIC(5,2) NOT NULL,
  rank INTEGER,
  strengths JSONB DEFAULT '[]',
  weaknesses JSONB DEFAULT '[]',
  ai_recommendation TEXT,
  hire_status TEXT CHECK (hire_status IN ('pending', 'shortlisted', 'hired', 'rejected', 'waitlisted')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(job_id, application_id)
);

-- =============================================
-- Add new columns to existing tables
-- =============================================

-- Add agent tracking to applications
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS current_agent INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS agent_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS fraud_risk_score NUMERIC(5,2) DEFAULT 0;

-- Add round configuration to jobs
ALTER TABLE public.jobs
ADD COLUMN IF NOT EXISTS round_config JSONB DEFAULT '{
  "mcq": {"enabled": true, "num_questions": 25, "passing_score": 60, "time_limit_minutes": 45},
  "coding": {"enabled": true, "num_problems": 3, "passing_score": 55, "time_limit_minutes": 90},
  "behavioral": {"enabled": true, "num_questions": 10, "passing_score": 50},
  "interview": {"enabled": true, "duration_minutes": 45, "passing_score": 60}
}',
ADD COLUMN IF NOT EXISTS score_weights JSONB DEFAULT '{
  "resume": 0.05,
  "mcq": 0.15,
  "coding": 0.30,
  "behavioral": 0.15,
  "interview": 0.30,
  "fraud_adjustment": 0.05
}',
ADD COLUMN IF NOT EXISTS custom_questions JSONB DEFAULT '[]';

-- Add more fields to candidate_profiles
ALTER TABLE public.candidate_profiles
ADD COLUMN IF NOT EXISTS experience_years NUMERIC(3,1) DEFAULT 0,
ADD COLUMN IF NOT EXISTS education JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS certifications JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS projects JSONB DEFAULT '[]';

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Agent Results RLS
ALTER TABLE public.agent_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Candidates can view own agent results"
ON public.agent_results FOR SELECT
USING (
  application_id IN (
    SELECT id FROM public.applications WHERE candidate_id = auth.uid()
  )
);

CREATE POLICY "Interviewers can view agent results for their jobs"
ON public.agent_results FOR SELECT
USING (
  application_id IN (
    SELECT a.id FROM public.applications a
    JOIN public.jobs j ON a.job_id = j.id
    WHERE j.interviewer_id = auth.uid()
  )
);

CREATE POLICY "System can manage agent results"
ON public.agent_results FOR ALL
USING (true)
WITH CHECK (true);

-- Interview Recordings RLS
ALTER TABLE public.interview_recordings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Candidates can view own recordings"
ON public.interview_recordings FOR SELECT
USING (
  application_id IN (
    SELECT id FROM public.applications WHERE candidate_id = auth.uid()
  )
);

CREATE POLICY "Interviewers can view recordings for their jobs"
ON public.interview_recordings FOR SELECT
USING (
  application_id IN (
    SELECT a.id FROM public.applications a
    JOIN public.jobs j ON a.job_id = j.id
    WHERE j.interviewer_id = auth.uid()
  )
);

CREATE POLICY "System can manage recordings"
ON public.interview_recordings FOR ALL
USING (true)
WITH CHECK (true);

-- Final Reports RLS
ALTER TABLE public.final_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Interviewers can view reports for their jobs"
ON public.final_reports FOR SELECT
USING (
  job_id IN (
    SELECT id FROM public.jobs WHERE interviewer_id = auth.uid()
  )
);

CREATE POLICY "System can manage reports"
ON public.final_reports FOR ALL
USING (true)
WITH CHECK (true);

-- Fraud Logs RLS
ALTER TABLE public.fraud_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Interviewers can view fraud logs for their jobs"
ON public.fraud_logs FOR SELECT
USING (
  application_id IN (
    SELECT a.id FROM public.applications a
    JOIN public.jobs j ON a.job_id = j.id
    WHERE j.interviewer_id = auth.uid()
  )
);

CREATE POLICY "System can manage fraud logs"
ON public.fraud_logs FOR ALL
USING (true)
WITH CHECK (true);

-- MCQ Questions RLS
ALTER TABLE public.mcq_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System can manage MCQ questions"
ON public.mcq_questions FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Candidates can view MCQ questions for their applications"
ON public.mcq_questions FOR SELECT
USING (
  job_id IN (
    SELECT a.job_id FROM public.applications a
    WHERE a.candidate_id = auth.uid()
  )
);

-- MCQ Responses RLS
ALTER TABLE public.mcq_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Candidates can manage own MCQ responses"
ON public.mcq_responses FOR ALL
USING (
  application_id IN (
    SELECT id FROM public.applications WHERE candidate_id = auth.uid()
  )
)
WITH CHECK (
  application_id IN (
    SELECT id FROM public.applications WHERE candidate_id = auth.uid()
  )
);

CREATE POLICY "Interviewers can view MCQ responses"
ON public.mcq_responses FOR SELECT
USING (
  application_id IN (
    SELECT a.id FROM public.applications a
    JOIN public.jobs j ON a.job_id = j.id
    WHERE j.interviewer_id = auth.uid()
  )
);

-- Coding Problems RLS
ALTER TABLE public.coding_problems ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System can manage coding problems"
ON public.coding_problems FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Candidates can view coding problems for their applications"
ON public.coding_problems FOR SELECT
USING (
  job_id IN (
    SELECT a.job_id FROM public.applications a
    WHERE a.candidate_id = auth.uid()
  )
);

-- Code Submissions RLS
ALTER TABLE public.code_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Candidates can manage own code submissions"
ON public.code_submissions FOR ALL
USING (
  application_id IN (
    SELECT id FROM public.applications WHERE candidate_id = auth.uid()
  )
)
WITH CHECK (
  application_id IN (
    SELECT id FROM public.applications WHERE candidate_id = auth.uid()
  )
);

CREATE POLICY "Interviewers can view code submissions"
ON public.code_submissions FOR SELECT
USING (
  application_id IN (
    SELECT a.id FROM public.applications a
    JOIN public.jobs j ON a.job_id = j.id
    WHERE j.interviewer_id = auth.uid()
  )
);

-- Behavioral Responses RLS
ALTER TABLE public.behavioral_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Candidates can manage own behavioral responses"
ON public.behavioral_responses FOR ALL
USING (
  application_id IN (
    SELECT id FROM public.applications WHERE candidate_id = auth.uid()
  )
)
WITH CHECK (
  application_id IN (
    SELECT id FROM public.applications WHERE candidate_id = auth.uid()
  )
);

CREATE POLICY "Interviewers can view behavioral responses"
ON public.behavioral_responses FOR SELECT
USING (
  application_id IN (
    SELECT a.id FROM public.applications a
    JOIN public.jobs j ON a.job_id = j.id
    WHERE j.interviewer_id = auth.uid()
  )
);

-- Interview Transcripts RLS
ALTER TABLE public.interview_transcripts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Candidates can view own transcripts"
ON public.interview_transcripts FOR SELECT
USING (
  application_id IN (
    SELECT id FROM public.applications WHERE candidate_id = auth.uid()
  )
);

CREATE POLICY "Interviewers can view transcripts for their jobs"
ON public.interview_transcripts FOR SELECT
USING (
  application_id IN (
    SELECT a.id FROM public.applications a
    JOIN public.jobs j ON a.job_id = j.id
    WHERE j.interviewer_id = auth.uid()
  )
);

CREATE POLICY "System can manage transcripts"
ON public.interview_transcripts FOR ALL
USING (true)
WITH CHECK (true);

-- Candidate Rankings RLS
ALTER TABLE public.candidate_rankings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Candidates can view own ranking"
ON public.candidate_rankings FOR SELECT
USING (
  application_id IN (
    SELECT id FROM public.applications WHERE candidate_id = auth.uid()
  )
);

CREATE POLICY "Interviewers can manage rankings for their jobs"
ON public.candidate_rankings FOR ALL
USING (
  job_id IN (
    SELECT id FROM public.jobs WHERE interviewer_id = auth.uid()
  )
)
WITH CHECK (
  job_id IN (
    SELECT id FROM public.jobs WHERE interviewer_id = auth.uid()
  )
);

CREATE POLICY "System can manage rankings"
ON public.candidate_rankings FOR ALL
USING (true)
WITH CHECK (true);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_agent_results_application ON public.agent_results(application_id);
CREATE INDEX IF NOT EXISTS idx_agent_results_agent ON public.agent_results(agent_number);
CREATE INDEX IF NOT EXISTS idx_interview_recordings_application ON public.interview_recordings(application_id);
CREATE INDEX IF NOT EXISTS idx_final_reports_job ON public.final_reports(job_id);
CREATE INDEX IF NOT EXISTS idx_fraud_logs_application ON public.fraud_logs(application_id);
CREATE INDEX IF NOT EXISTS idx_mcq_questions_job ON public.mcq_questions(job_id);
CREATE INDEX IF NOT EXISTS idx_mcq_responses_application ON public.mcq_responses(application_id);
CREATE INDEX IF NOT EXISTS idx_coding_problems_job ON public.coding_problems(job_id);
CREATE INDEX IF NOT EXISTS idx_code_submissions_application ON public.code_submissions(application_id);
CREATE INDEX IF NOT EXISTS idx_behavioral_responses_application ON public.behavioral_responses(application_id);
CREATE INDEX IF NOT EXISTS idx_interview_transcripts_application ON public.interview_transcripts(application_id);
CREATE INDEX IF NOT EXISTS idx_candidate_rankings_job ON public.candidate_rankings(job_id);
CREATE INDEX IF NOT EXISTS idx_candidate_rankings_score ON public.candidate_rankings(final_score DESC);

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================

CREATE TRIGGER update_agent_results_updated_at
  BEFORE UPDATE ON public.agent_results
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_candidate_rankings_updated_at
  BEFORE UPDATE ON public.candidate_rankings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_results;
ALTER PUBLICATION supabase_realtime ADD TABLE public.interview_transcripts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.candidate_rankings;