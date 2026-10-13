DROP POLICY IF EXISTS "Anyone can delete projects" ON public.projects;
DROP POLICY IF EXISTS "Anyone can insert projects" ON public.projects;
DROP POLICY IF EXISTS "Anyone can update projects" ON public.projects;
DROP POLICY IF EXISTS "Projects are viewable by everyone" ON public.projects;
DROP POLICY IF EXISTS "Anyone can delete files" ON public.files;
DROP POLICY IF EXISTS "Anyone can insert files" ON public.files;
DROP POLICY IF EXISTS "Anyone can update files" ON public.files;
DROP POLICY IF EXISTS "Files are viewable by everyone" ON public.files;
DROP POLICY IF EXISTS "Activity logs are viewable by everyone" ON public.activity_logs;
DROP POLICY IF EXISTS "Anyone can insert activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Project files are readable" ON storage.objects;
DROP POLICY IF EXISTS "Project files can be uploaded" ON storage.objects;
DROP POLICY IF EXISTS "Project files can be updated" ON storage.objects;
DROP POLICY IF EXISTS "Project files can be deleted" ON storage.objects;

REVOKE ALL ON public.projects, public.files, public.activity_logs FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects, public.files TO authenticated;
GRANT SELECT, INSERT ON public.activity_logs TO authenticated;
GRANT ALL ON public.projects, public.files, public.activity_logs TO service_role;

CREATE POLICY "Staff read projects" ON public.projects FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Staff add projects" ON public.projects FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Staff edit projects" ON public.projects FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Staff delete projects" ON public.projects FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Staff read files" ON public.files FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Staff add files" ON public.files FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Staff edit files" ON public.files FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Staff delete files" ON public.files FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Staff read activity" ON public.activity_logs FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Staff add activity" ON public.activity_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Staff read project files" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'project-files' AND auth.uid() IS NOT NULL);
CREATE POLICY "Staff upload project files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'project-files' AND auth.uid() IS NOT NULL);
CREATE POLICY "Staff update project files" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'project-files' AND auth.uid() IS NOT NULL) WITH CHECK (bucket_id = 'project-files' AND auth.uid() IS NOT NULL);
CREATE POLICY "Staff delete project files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'project-files' AND auth.uid() IS NOT NULL);