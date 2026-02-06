-- Enum for demographic categories
CREATE TYPE demographic_category AS ENUM ('gender', 'region', 'institution', 'experience', 'age_group');

-- Enum for alert status
CREATE TYPE alert_status AS ENUM ('active', 'acknowledged', 'resolved', 'dismissed');

-- Candidate demographics table (optional, privacy-respecting)
CREATE TABLE public.candidate_demographics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID NOT NULL,
  gender TEXT, -- Optional: male, female, non-binary, prefer_not_to_say
  geographic_region TEXT, -- e.g., "North India", "South India", "International"
  educational_institution TEXT,
  years_of_experience INTEGER,
  age_group TEXT, -- e.g., "18-25", "26-35", "36-45", "46+"
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(candidate_id)
);

-- Fairness metrics table for storing analysis results
CREATE TABLE public.fairness_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL,
  category demographic_category NOT NULL,
  group_name TEXT NOT NULL, -- e.g., "male", "female", "North India"
  total_candidates INTEGER NOT NULL DEFAULT 0,
  passed_candidates INTEGER NOT NULL DEFAULT 0,
  pass_rate NUMERIC(5,4), -- 0.0000 to 1.0000
  average_score NUMERIC(5,2),
  score_std_deviation NUMERIC(5,2),
  disparate_impact_ratio NUMERIC(5,4), -- Compared to reference group
  chi_squared_value NUMERIC(10,4),
  p_value NUMERIC(10,8),
  is_statistically_significant BOOLEAN DEFAULT false,
  analysis_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Fairness alerts table
CREATE TABLE public.fairness_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL,
  category demographic_category NOT NULL,
  group_name TEXT NOT NULL,
  alert_type TEXT NOT NULL, -- 'pass_rate_deviation', 'disparate_impact', 'statistical_significance'
  deviation_percentage NUMERIC(5,2), -- How much it deviates from average
  threshold_percentage NUMERIC(5,2) DEFAULT 15.00, -- The threshold that was exceeded
  severity TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  status alert_status NOT NULL DEFAULT 'active',
  description TEXT NOT NULL,
  suggested_actions JSONB DEFAULT '[]'::jsonb,
  acknowledged_by UUID,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Fairness audit reports table
CREATE TABLE public.fairness_audit_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID, -- NULL for company-wide reports
  interviewer_id UUID NOT NULL,
  report_type TEXT NOT NULL, -- 'monthly', 'quarterly', 'annual', 'ad_hoc'
  report_period_start DATE NOT NULL,
  report_period_end DATE NOT NULL,
  total_candidates_analyzed INTEGER NOT NULL DEFAULT 0,
  overall_fairness_score NUMERIC(5,2), -- 0-100
  compliance_status TEXT NOT NULL DEFAULT 'pending', -- 'compliant', 'needs_attention', 'non_compliant', 'pending'
  findings JSONB DEFAULT '[]'::jsonb,
  recommendations JSONB DEFAULT '[]'::jsonb,
  metrics_snapshot JSONB DEFAULT '{}'::jsonb,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Fairness settings table for configuration
CREATE TABLE public.fairness_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  interviewer_id UUID NOT NULL,
  job_id UUID, -- NULL for company-wide settings
  pass_rate_deviation_threshold NUMERIC(5,2) NOT NULL DEFAULT 15.00,
  disparate_impact_threshold NUMERIC(5,4) NOT NULL DEFAULT 0.8000, -- 80% rule
  enable_blind_evaluation BOOLEAN NOT NULL DEFAULT false,
  enable_score_reweighting BOOLEAN NOT NULL DEFAULT false,
  reweighting_factors JSONB DEFAULT '{}'::jsonb,
  alert_email_enabled BOOLEAN NOT NULL DEFAULT true,
  alert_dashboard_enabled BOOLEAN NOT NULL DEFAULT true,
  auto_monthly_audit BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(interviewer_id, job_id)
);

-- Enable RLS on all tables
ALTER TABLE public.candidate_demographics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fairness_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fairness_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fairness_audit_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fairness_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for candidate_demographics
CREATE POLICY "Candidates can manage their own demographics"
  ON public.candidate_demographics FOR ALL
  USING (auth.uid() = candidate_id);

CREATE POLICY "Interviewers can view demographics for fairness analysis"
  ON public.candidate_demographics FOR SELECT
  USING (has_role(auth.uid(), 'interviewer'::app_role));

-- RLS policies for fairness_metrics
CREATE POLICY "Interviewers can view fairness metrics for their jobs"
  ON public.fairness_metrics FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM jobs j
    WHERE j.id = fairness_metrics.job_id
    AND j.interviewer_id = auth.uid()
  ));

CREATE POLICY "System can manage fairness metrics"
  ON public.fairness_metrics FOR ALL
  USING (true)
  WITH CHECK (true);

-- RLS policies for fairness_alerts
CREATE POLICY "Interviewers can view and manage alerts for their jobs"
  ON public.fairness_alerts FOR ALL
  USING (EXISTS (
    SELECT 1 FROM jobs j
    WHERE j.id = fairness_alerts.job_id
    AND j.interviewer_id = auth.uid()
  ));

-- RLS policies for fairness_audit_reports
CREATE POLICY "Interviewers can view their audit reports"
  ON public.fairness_audit_reports FOR SELECT
  USING (auth.uid() = interviewer_id);

CREATE POLICY "System can create audit reports"
  ON public.fairness_audit_reports FOR INSERT
  WITH CHECK (true);

-- RLS policies for fairness_settings
CREATE POLICY "Interviewers can manage their fairness settings"
  ON public.fairness_settings FOR ALL
  USING (auth.uid() = interviewer_id);

-- Triggers for updated_at
CREATE TRIGGER update_candidate_demographics_updated_at
  BEFORE UPDATE ON public.candidate_demographics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fairness_metrics_updated_at
  BEFORE UPDATE ON public.fairness_metrics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fairness_alerts_updated_at
  BEFORE UPDATE ON public.fairness_alerts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fairness_settings_updated_at
  BEFORE UPDATE ON public.fairness_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Index for faster queries
CREATE INDEX idx_fairness_metrics_job_category ON public.fairness_metrics(job_id, category);
CREATE INDEX idx_fairness_alerts_job_status ON public.fairness_alerts(job_id, status);
CREATE INDEX idx_fairness_audit_reports_interviewer ON public.fairness_audit_reports(interviewer_id);