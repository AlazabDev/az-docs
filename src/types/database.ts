export type FileSource = 'whatsapp' | 'daftra' | 'magicplan' | 'manual';

export type ProjectStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface Project {
  id: string;
  name: string;
  client_name: string;
  client_phone: string | null;
  client_email: string | null;
  status: ProjectStatus;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectFile {
  id: string;
  project_id: string;
  name: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  source: FileSource;
  source_reference: string | null;
  metadata: Record<string, unknown>;
  uploaded_at: string;
}

export interface ActivityLog {
  id: string;
  project_id: string | null;
  file_id: string | null;
  action: string;
  source: FileSource | null;
  details: Record<string, unknown>;
  created_at: string;
}

export interface ProjectWithFiles extends Project {
  files: ProjectFile[];
}
