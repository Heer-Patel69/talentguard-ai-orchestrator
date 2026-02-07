-- Create interview-recordings storage bucket if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'interview-recordings',
  'interview-recordings',
  true,
  104857600, -- 100MB limit
  ARRAY['video/webm', 'video/mp4', 'video/ogg', 'audio/webm', 'audio/mp4']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 104857600,
  allowed_mime_types = ARRAY['video/webm', 'video/mp4', 'video/ogg', 'audio/webm', 'audio/mp4'];

-- RLS policies for interview recordings bucket
CREATE POLICY "Candidates can upload their own recordings"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'interview-recordings' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Candidates can view their own recordings"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'interview-recordings' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Interviewers can view recordings for their jobs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'interview-recordings'
  AND EXISTS (
    SELECT 1 FROM applications a
    JOIN jobs j ON a.job_id = j.id
    WHERE j.interviewer_id = auth.uid()
    AND a.id::text = split_part((storage.foldername(name))[2], '_', 1)
  )
);

CREATE POLICY "Interviewers can delete recordings for their jobs"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'interview-recordings'
  AND EXISTS (
    SELECT 1 FROM applications a
    JOIN jobs j ON a.job_id = j.id
    WHERE j.interviewer_id = auth.uid()
    AND a.id::text = split_part((storage.foldername(name))[2], '_', 1)
  )
);