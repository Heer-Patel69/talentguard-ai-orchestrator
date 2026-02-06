-- Create experience level enum
CREATE TYPE public.experience_level AS ENUM ('fresher', 'junior', 'mid', 'senior', 'architect');

-- Create job status enum
CREATE TYPE public.job_status AS ENUM ('draft', 'active', 'closed', 'paused');

-- Create round type enum
CREATE TYPE public.round_type AS ENUM ('mcq', 'coding', 'system_design', 'behavioral', 'live_ai_interview');

-- Create toughness level enum
CREATE TYPE public.toughness_level AS ENUM ('easy', 'medium', 'hard', 'expert');

-- Create location type enum
CREATE TYPE public.location_type AS ENUM ('remote', 'hybrid', 'onsite');

-- Create application status enum
CREATE TYPE public.application_status AS ENUM ('applied', 'screening', 'interviewing', 'shortlisted', 'rejected', 'hired', 'withdrawn');

-- Jobs table
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interviewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  field TEXT NOT NULL,
  experience_level experience_level NOT NULL,
  required_skills TEXT[] DEFAULT '{}',
  toughness_level toughness_level DEFAULT 'medium',
  num_rounds INTEGER DEFAULT 1 CHECK (num_rounds >= 1 AND num_rounds <= 5),
  salary_min DECIMAL(12, 2),
  salary_max DECIMAL(12, 2),
  salary_currency TEXT DEFAULT 'INR',
  location_type location_type DEFAULT 'remote',
  location_city TEXT,
  application_deadline TIMESTAMP WITH TIME ZONE,
  auto_shortlist_enabled BOOLEAN DEFAULT false,
  auto_shortlist_count INTEGER DEFAULT 10,
  status job_status DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Job rounds configuration
CREATE TABLE public.job_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
  round_number INTEGER NOT NULL CHECK (round_number >= 1 AND round_number <= 5),
  round_type round_type NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  custom_questions JSONB DEFAULT '[]',
  ai_generate_questions BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(job_id, round_number)
);

-- Job applications
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
  candidate_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status application_status DEFAULT 'applied',
  current_round INTEGER DEFAULT 0,
  overall_score DECIMAL(5, 2),
  ai_confidence DECIMAL(5, 2),
  fraud_flags JSONB DEFAULT '[]',
  notes TEXT,
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(job_id, candidate_id)
);

-- Round results for each candidate
CREATE TABLE public.round_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE NOT NULL,
  round_id UUID REFERENCES public.job_rounds(id) ON DELETE CASCADE NOT NULL,
  score DECIMAL(5, 2),
  ai_feedback TEXT,
  ai_explanation TEXT,
  code_submissions JSONB DEFAULT '[]',
  recording_url TEXT,
  fraud_detected BOOLEAN DEFAULT false,
  fraud_details JSONB,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(application_id, round_id)
);

-- Interviewer decision overrides
CREATE TABLE public.decision_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE NOT NULL,
  interviewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  original_status application_status NOT NULL,
  new_status application_status NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.round_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decision_overrides ENABLE ROW LEVEL SECURITY;

-- Jobs policies
CREATE POLICY "Interviewers can manage their own jobs"
  ON public.jobs FOR ALL
  USING (auth.uid() = interviewer_id);

CREATE POLICY "Candidates can view active jobs"
  ON public.jobs FOR SELECT
  USING (status = 'active');

-- Job rounds policies
CREATE POLICY "Interviewers can manage rounds for their jobs"
  ON public.job_rounds FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.jobs WHERE jobs.id = job_rounds.job_id AND jobs.interviewer_id = auth.uid()
  ));

CREATE POLICY "Candidates can view rounds for active jobs"
  ON public.job_rounds FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.jobs WHERE jobs.id = job_rounds.job_id AND jobs.status = 'active'
  ));

-- Applications policies
CREATE POLICY "Interviewers can view applications for their jobs"
  ON public.applications FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.jobs WHERE jobs.id = applications.job_id AND jobs.interviewer_id = auth.uid()
  ));

CREATE POLICY "Interviewers can update applications for their jobs"
  ON public.applications FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.jobs WHERE jobs.id = applications.job_id AND jobs.interviewer_id = auth.uid()
  ));

CREATE POLICY "Candidates can apply to jobs"
  ON public.applications FOR INSERT
  WITH CHECK (auth.uid() = candidate_id);

CREATE POLICY "Candidates can view their own applications"
  ON public.applications FOR SELECT
  USING (auth.uid() = candidate_id);

-- Round results policies
CREATE POLICY "Interviewers can manage round results for their jobs"
  ON public.round_results FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.applications a
    JOIN public.jobs j ON j.id = a.job_id
    WHERE a.id = round_results.application_id AND j.interviewer_id = auth.uid()
  ));

CREATE POLICY "Candidates can view their own round results"
  ON public.round_results FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.applications WHERE applications.id = round_results.application_id AND applications.candidate_id = auth.uid()
  ));

-- Decision overrides policies
CREATE POLICY "Interviewers can manage their overrides"
  ON public.decision_overrides FOR ALL
  USING (auth.uid() = interviewer_id);

-- Triggers for updated_at
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();