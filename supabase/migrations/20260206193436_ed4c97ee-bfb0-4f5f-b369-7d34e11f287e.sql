-- Create enum for feedback types
CREATE TYPE public.feedback_accuracy AS ENUM ('correct', 'incorrect', 'partially_correct');
CREATE TYPE public.performance_rating AS ENUM ('1', '2', '3', '4', '5');

-- Recruiter Feedback Table
CREATE TABLE public.recruiter_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL,
  interviewer_id UUID NOT NULL,
  candidate_id UUID NOT NULL,
  job_id UUID NOT NULL,
  ai_recommendation TEXT NOT NULL,
  actual_decision TEXT NOT NULL,
  recommendation_accuracy feedback_accuracy NOT NULL,
  performance_rating performance_rating,
  performance_notes TEXT,
  feedback_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  probation_completed BOOLEAN DEFAULT false,
  probation_end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Historical Learning Outcomes (anonymized)
CREATE TABLE public.learning_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_field TEXT NOT NULL,
  experience_level TEXT NOT NULL,
  toughness_level TEXT NOT NULL,
  ai_score NUMERIC(5,2),
  actual_performance performance_rating,
  hire_success BOOLEAN,
  skills_matched JSONB DEFAULT '[]',
  skills_gap JSONB DEFAULT '[]',
  interview_duration_minutes INTEGER,
  questions_asked INTEGER,
  follow_up_effectiveness NUMERIC(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Cross-Role Patterns
CREATE TABLE public.role_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_role TEXT NOT NULL,
  target_role TEXT NOT NULL,
  transferable_skills JSONB DEFAULT '[]',
  success_rate NUMERIC(5,2),
  sample_size INTEGER DEFAULT 0,
  confidence_level NUMERIC(5,2),
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AI Learning Metrics (for reinforcement learning tracking)
CREATE TABLE public.ai_learning_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC(10,4),
  job_field TEXT,
  time_period TEXT NOT NULL,
  sample_count INTEGER DEFAULT 0,
  improvement_rate NUMERIC(5,2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Question Effectiveness Tracking
CREATE TABLE public.question_effectiveness (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL,
  job_field TEXT NOT NULL,
  differentiation_score NUMERIC(5,2),
  prediction_accuracy NUMERIC(5,2),
  avg_time_spent_seconds INTEGER,
  follow_up_count INTEGER DEFAULT 0,
  times_asked INTEGER DEFAULT 0,
  positive_outcomes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Candidate Alternative Role Suggestions
CREATE TABLE public.alternative_role_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL,
  original_job_id UUID NOT NULL,
  suggested_job_id UUID,
  suggested_role_type TEXT NOT NULL,
  match_score NUMERIC(5,2),
  matching_skills JSONB DEFAULT '[]',
  reason TEXT,
  was_pursued BOOLEAN DEFAULT false,
  outcome TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.recruiter_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_learning_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_effectiveness ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alternative_role_suggestions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for recruiter_feedback
CREATE POLICY "Interviewers can view their own feedback"
ON public.recruiter_feedback FOR SELECT
USING (auth.uid() = interviewer_id);

CREATE POLICY "Interviewers can insert feedback"
ON public.recruiter_feedback FOR INSERT
WITH CHECK (auth.uid() = interviewer_id);

CREATE POLICY "Interviewers can update their own feedback"
ON public.recruiter_feedback FOR UPDATE
USING (auth.uid() = interviewer_id);

-- RLS Policies for learning_outcomes (read-only for interviewers)
CREATE POLICY "Interviewers can view learning outcomes"
ON public.learning_outcomes FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'interviewer'));

-- RLS Policies for role_patterns (read-only)
CREATE POLICY "Interviewers can view role patterns"
ON public.role_patterns FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'interviewer'));

-- RLS Policies for ai_learning_metrics (read-only)
CREATE POLICY "Interviewers can view AI metrics"
ON public.ai_learning_metrics FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'interviewer'));

-- RLS Policies for question_effectiveness (read-only)
CREATE POLICY "Interviewers can view question effectiveness"
ON public.question_effectiveness FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'interviewer'));

-- RLS Policies for alternative_role_suggestions
CREATE POLICY "Interviewers can view suggestions"
ON public.alternative_role_suggestions FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'interviewer'));

CREATE POLICY "Interviewers can insert suggestions"
ON public.alternative_role_suggestions FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'interviewer'));

-- Triggers for updated_at
CREATE TRIGGER update_recruiter_feedback_updated_at
BEFORE UPDATE ON public.recruiter_feedback
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_question_effectiveness_updated_at
BEFORE UPDATE ON public.question_effectiveness
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();