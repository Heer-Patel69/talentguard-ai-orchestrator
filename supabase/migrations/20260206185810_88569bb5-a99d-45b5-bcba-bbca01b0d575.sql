-- Create storage buckets for file uploads

-- Company logos bucket (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('company-logos', 'company-logos', true, 5242880);

-- Resumes bucket (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('resumes', 'resumes', false, 5242880);

-- Aadhaar documents bucket (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('aadhaar-documents', 'aadhaar-documents', false, 5242880);

-- Live photos bucket (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('live-photos', 'live-photos', false, 5242880);

-- Storage policies for company-logos (public read, authenticated write)
CREATE POLICY "Anyone can view company logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'company-logos');

CREATE POLICY "Authenticated users can upload company logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'company-logos' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own company logos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'company-logos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own company logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'company-logos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage policies for resumes
CREATE POLICY "Users can view their own resumes"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'resumes' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Interviewers can view candidate resumes"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'resumes' 
  AND public.has_role(auth.uid(), 'interviewer')
);

CREATE POLICY "Authenticated users can upload resumes"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'resumes' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own resumes"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'resumes' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own resumes"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'resumes' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage policies for aadhaar-documents
CREATE POLICY "Users can view their own aadhaar documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'aadhaar-documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Authenticated users can upload aadhaar documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'aadhaar-documents' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own aadhaar documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'aadhaar-documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own aadhaar documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'aadhaar-documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage policies for live-photos
CREATE POLICY "Users can view their own live photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'live-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Authenticated users can upload live photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'live-photos' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own live photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'live-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own live photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'live-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);