ALTER TABLE public.files ALTER COLUMN project_id DROP NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_files_source_ref ON public.files(source, source_reference) WHERE source_reference IS NOT NULL;