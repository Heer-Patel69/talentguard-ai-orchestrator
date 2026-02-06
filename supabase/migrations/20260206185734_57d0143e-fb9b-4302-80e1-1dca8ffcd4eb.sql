-- Create app_role enum for roles
CREATE TYPE public.app_role AS ENUM ('interviewer', 'candidate');

-- Create verification_status enum
CREATE TYPE public.verification_status AS ENUM ('pending', 'verified', 'rejected', 'manual_review');

-- Create company_age enum
CREATE TYPE public.company_age AS ENUM ('less_than_1', '1_to_5', '5_to_10', 'more_than_10');

-- Create industry enum
CREATE TYPE public.industry AS ENUM ('it', 'finance', 'healthcare', 'education', 'manufacturing', 'retail', 'real_estate', 'consulting', 'legal', 'other');

-- User roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Base profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Interviewer (Company) profiles
CREATE TABLE public.interviewer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  company_gst TEXT,
  company_city TEXT NOT NULL,
  company_state TEXT NOT NULL,
  company_country TEXT NOT NULL,
  company_age company_age NOT NULL,
  industry industry NOT NULL,
  hiring_reason TEXT,
  per_candidate_budget DECIMAL(10, 2),
  budget_currency TEXT DEFAULT 'INR',
  company_logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Candidate profiles
CREATE TABLE public.candidate_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  phone_number TEXT NOT NULL,
  github_url TEXT,
  linkedin_url TEXT,
  resume_url TEXT,
  aadhaar_number TEXT,
  aadhaar_front_url TEXT,
  aadhaar_back_url TEXT,
  live_photo_url TEXT,
  verification_status verification_status DEFAULT 'pending',
  verification_confidence DECIMAL(5, 2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviewer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_profiles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own role on signup"
  ON public.user_roles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for interviewer_profiles
CREATE POLICY "Interviewers can view their own profile"
  ON public.interviewer_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Interviewers can insert their own profile"
  ON public.interviewer_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Interviewers can update their own profile"
  ON public.interviewer_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for candidate_profiles
CREATE POLICY "Candidates can view their own profile"
  ON public.candidate_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Candidates can insert their own profile"
  ON public.candidate_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Candidates can update their own profile"
  ON public.candidate_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Interviewers can view candidate profiles (for hiring purposes)
CREATE POLICY "Interviewers can view candidate profiles"
  ON public.candidate_profiles
  FOR SELECT
  USING (public.has_role(auth.uid(), 'interviewer'));

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_interviewer_profiles_updated_at
  BEFORE UPDATE ON public.interviewer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_candidate_profiles_updated_at
  BEFORE UPDATE ON public.candidate_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();