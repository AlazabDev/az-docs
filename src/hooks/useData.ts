import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ActivityLog, Project, ProjectFile, ProjectStatus, FileSource } from "@/types/database";

export const useProjects = () => useQuery({
  queryKey: ["projects"],
  queryFn: async (): Promise<Project[]> => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as Project[];
  },
});

export const useProject = (id?: string) => useQuery({
  queryKey: ["projects", id],
  enabled: !!id,
  queryFn: async (): Promise<Project> => {
    const { data, error } = await supabase.from("projects").select("*").eq("id", id!).maybeSingle();
    if (error) throw error;
    if (!data) throw new Error("المشروع غير موجود");
    return data as Project;
  },
});

export const useFiles = (projectId?: string) => useQuery({
  queryKey: ["files", projectId ?? "all"],
  queryFn: async (): Promise<ProjectFile[]> => {
    let query = supabase.from("files").select("*").order("uploaded_at", { ascending: false });
    if (projectId) query = query.eq("project_id", projectId);
    const { data, error } = await query;
    if (error) throw error;
    return data as ProjectFile[];
  },
});

export const useActivities = (limit = 20) => useQuery({
  queryKey: ["activity_logs", limit],
  queryFn: async (): Promise<ActivityLog[]> => {
    const { data, error } = await supabase
      .from("activity_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data as ActivityLog[];
  },
});

export interface NewProjectInput {
  name: string;
  client_name: string;
  client_phone?: string | null;
  client_email?: string | null;
  status: ProjectStatus;
  description?: string | null;
}

export const useCreateProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: NewProjectInput) => {
      const { data, error } = await supabase.from("projects").insert(input).select().single();
      if (error) throw error;
      await supabase.from("activity_logs").insert({
        project_id: data.id,
        action: "project_created",
        details: { projectName: data.name },
      });
      return data as Project;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["activity_logs"] });
    },
  });
};

export const useUpdateProjectStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ProjectStatus }) => {
      const { error } = await supabase.from("projects").update({ status }).eq("id", id);
      if (error) throw error;
      await supabase.from("activity_logs").insert({
        project_id: id,
        action: "project_status_changed",
        details: { status },
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["activity_logs"] });
    },
  });
};

export const useUploadFile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, file, source }: { projectId: string; file: File; source: FileSource }) => {
      const path = `${projectId}/${Date.now()}-${file.name.replace(/[^\w.\-\u0600-\u06FF]/g, "_")}`;
      const { error: upErr } = await supabase.storage.from("project-files").upload(path, file);
      if (upErr) throw upErr;
      const { data, error } = await supabase
        .from("files")
        .insert({
          project_id: projectId,
          name: file.name,
          file_url: path,
          file_type: file.type,
          file_size: file.size,
          source,
        })
        .select()
        .single();
      if (error) throw error;
      await supabase.from("activity_logs").insert({
        project_id: projectId,
        file_id: data.id,
        action: "file_uploaded",
        source,
        details: { fileName: file.name },
      });
      return data as ProjectFile;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["files"] });
      qc.invalidateQueries({ queryKey: ["activity_logs"] });
    },
  });
};

export const getFileLink = async (path: string) => {
  const { data, error } = await supabase.storage.from("project-files").createSignedUrl(path, 60 * 10);
  if (error) throw error;
  return data.signedUrl;
};

export const useAssignFile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, projectId }: { id: string; projectId: string }) => {
      const { error } = await supabase.from("files").update({ project_id: projectId }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["files"] }),
  });
};

export const useDeleteFile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: ProjectFile) => {
      await supabase.storage.from("project-files").remove([file.file_url]);
      const { error } = await supabase.from("files").delete().eq("id", file.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["files"] }),
  });
};
