-- Enable realtime for jobs table
ALTER PUBLICATION supabase_realtime ADD TABLE public.jobs;

-- Enable realtime for applications table  
ALTER PUBLICATION supabase_realtime ADD TABLE public.applications;