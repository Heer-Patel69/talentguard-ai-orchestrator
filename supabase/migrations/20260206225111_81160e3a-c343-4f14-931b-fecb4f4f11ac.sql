-- Add suggested_job_preferences column to candidate_profiles
ALTER TABLE public.candidate_profiles 
ADD COLUMN IF NOT EXISTS suggested_job_preferences JSONB DEFAULT NULL;