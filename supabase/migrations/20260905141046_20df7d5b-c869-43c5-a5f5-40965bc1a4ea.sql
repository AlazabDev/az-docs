CREATE POLICY "Anyone can update projects" ON public.projects FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete projects" ON public.projects FOR DELETE USING (true);
CREATE POLICY "Anyone can update files" ON public.files FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete files" ON public.files FOR DELETE USING (true);

CREATE POLICY "Project files are readable" ON storage.objects FOR SELECT USING (bucket_id = 'project-files');
CREATE POLICY "Project files can be uploaded" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'project-files');
CREATE POLICY "Project files can be updated" ON storage.objects FOR UPDATE USING (bucket_id = 'project-files') WITH CHECK (bucket_id = 'project-files');
CREATE POLICY "Project files can be deleted" ON storage.objects FOR DELETE USING (bucket_id = 'project-files');