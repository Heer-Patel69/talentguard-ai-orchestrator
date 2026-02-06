-- Add profile analysis scores and skills to candidate_profiles
ALTER TABLE public.candidate_profiles
ADD COLUMN IF NOT EXISTS skills text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS github_score integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS linkedin_score integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS profile_score integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS github_analysis jsonb,
ADD COLUMN IF NOT EXISTS linkedin_analysis jsonb,
ADD COLUMN IF NOT EXISTS profile_analyzed_at timestamp with time zone;

-- Create job_priorities table for candidate job preferences
CREATE TABLE IF NOT EXISTS public.job_priorities (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  priority_level integer DEFAULT 1 CHECK (priority_level >= 1 AND priority_level <= 5),
  match_score integer DEFAULT 0,
  matching_skills text[] DEFAULT '{}',
  is_favorited boolean DEFAULT false,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(candidate_id, job_id)
);

-- Enable RLS on job_priorities
ALTER TABLE public.job_priorities ENABLE ROW LEVEL SECURITY;

-- Candidates can manage their own job priorities
CREATE POLICY "Candidates can view their own job priorities"
ON public.job_priorities FOR SELECT
USING (candidate_id = auth.uid());

CREATE POLICY "Candidates can create their own job priorities"
ON public.job_priorities FOR INSERT
WITH CHECK (candidate_id = auth.uid());

CREATE POLICY "Candidates can update their own job priorities"
ON public.job_priorities FOR UPDATE
USING (candidate_id = auth.uid());

CREATE POLICY "Candidates can delete their own job priorities"
ON public.job_priorities FOR DELETE
USING (candidate_id = auth.uid());

-- Create trigger for updated_at
CREATE TRIGGER update_job_priorities_updated_at
BEFORE UPDATE ON public.job_priorities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();