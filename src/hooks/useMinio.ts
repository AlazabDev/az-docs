import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/** The bucket where all company project files are stored in Al-Azab storage */
export const PROJECT_FILES_BUCKET = "project-files";

export interface MinioBucket {
  name: string;
  creationDate?: string | null;
}

export interface MinioObject {
  key: string;
  size: number;
  lastModified: string | null;
}

export const minioRequest = async <T = Record<string, unknown>>(body: Record<string, unknown>): Promise<T> => {
  const { data, error } = await supabase.functions.invoke("minio-storage", { body });
  if (error) {
    let msg = "تعذر الاتصال بمخزن العزب";
    try { msg = (await (error as any).context?.json())?.error ?? msg; } catch { /* ignore */ }
    throw new Error(msg);
  }
  return data as T;
};

export const useMinioBuckets = () =>
  useQuery({
    queryKey: ["minio", "buckets"],
    queryFn: async () => (await minioRequest<{ buckets: MinioBucket[] }>({ action: "list-buckets" })).buckets,
  });

export const useMinioListing = (bucket?: string, prefix = "") =>
  useQuery({
    queryKey: ["minio", "list", bucket ?? null, prefix],
    enabled: !!bucket,
    queryFn: async () =>
      minioRequest<{ prefix: string; folders: string[]; objects: MinioObject[]; truncated?: boolean }>({
        action: "list",
        bucket: bucket!,
        prefix,
      }),
  });

export const getMinioUrl = (bucket: string, key: string, download = false) =>
  minioRequest<{ url: string }>({ action: "url", bucket, key, download }).then((r) => r.url);

export const uploadToMinio = async (bucket: string, key: string, file: File | Blob, contentType?: string) => {
  const type = contentType ?? ((file as File).type || "application/octet-stream");
  const { url } = await minioRequest<{ url: string }>({ action: "upload-url", bucket, key, contentType: type });
  const res = await fetch(url, { method: "PUT", body: file, headers: { "Content-Type": type } });
  if (!res.ok) throw new Error("تعذر رفع الملف إلى مخزن العزب");
};

export const useMinioUpload = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ bucket, key, file, contentType }: { bucket: string; key: string; file: File | Blob; contentType?: string }) =>
      uploadToMinio(bucket, key, file, contentType),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["minio"] }),
  });
};

export const useMinioDelete = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ bucket, key }: { bucket: string; key: string }) =>
      minioRequest({ action: "delete", bucket, key }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["minio"] }),
  });
};
