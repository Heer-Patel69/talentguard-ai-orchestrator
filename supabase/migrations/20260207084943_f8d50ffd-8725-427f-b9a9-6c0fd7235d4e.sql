-- Create proctoring_logs table for camera activity monitoring
CREATE TABLE IF NOT EXISTS public.proctoring_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
  recording_id UUID REFERENCES public.interview_recordings(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'face_detected', 'face_not_visible', 'multiple_faces', 
    'looking_away', 'tab_switch', 'copy_paste', 
    'audio_anomaly', 'suspicious_movement', 'recording_started', 
    'recording_stopped', 'camera_blocked', 'screen_share_detected'
  )),
  severity TEXT NOT NULL DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT,
  timestamp_in_video INTEGER,
  metadata JSONB DEFAULT '{}',
  trust_score_impact INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add new columns to interview_recordings for viewing/archiving
ALTER TABLE public.interview_recordings 
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ready',
  ADD COLUMN IF NOT EXISTS viewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS viewed_by UUID,
  ADD COLUMN IF NOT EXISTS downloaded_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS downloaded_by UUID,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS interviewer_id UUID;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_proctoring_application ON public.proctoring_logs(application_id);
CREATE INDEX IF NOT EXISTS idx_proctoring_recording ON public.proctoring_logs(recording_id);
CREATE INDEX IF NOT EXISTS idx_proctoring_severity ON public.proctoring_logs(severity);
CREATE INDEX IF NOT EXISTS idx_recordings_status ON public.interview_recordings(status);

-- Enable RLS on proctoring_logs
ALTER TABLE public.proctoring_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for proctoring_logs
CREATE POLICY "Candidates can view their own proctoring logs"
  ON public.proctoring_logs FOR SELECT
  USING (candidate_id = auth.uid());

CREATE POLICY "Interviewers can view proctoring logs for their jobs"
  ON public.proctoring_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.interview_recordings r
      JOIN public.applications a ON a.id = r.application_id
      JOIN public.jobs j ON j.id = a.job_id
      WHERE r.id = proctoring_logs.recording_id
      AND j.interviewer_id = auth.uid()
    )
  );

CREATE POLICY "System can insert proctoring logs"
  ON public.proctoring_logs FOR INSERT
  WITH CHECK (true);

-- Enable realtime for proctoring logs
ALTER PUBLICATION supabase_realtime ADD TABLE public.proctoring_logs;

-- Create storage bucket for interview recordings if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'interview-recordings',
  'interview-recordings',
  false,
  524288000,
  ARRAY['video/webm', 'video/mp4', 'video/quicktime']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Candidates can upload recordings"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'interview-recordings' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Candidates can view own recordings"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'interview-recordings' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Interviewers can view candidate recordings"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'interview-recordings' 
    AND EXISTS (
      SELECT 1 FROM public.interview_recordings r
      JOIN public.applications a ON a.id = r.application_id
      JOIN public.jobs j ON j.id = a.job_id
      WHERE (r.video_url LIKE '%' || name || '%' OR r.audio_url LIKE '%' || name || '%')
      AND j.interviewer_id = auth.uid()
    )
  );