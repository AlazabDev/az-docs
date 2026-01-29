import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FolderOpen, 
  FileText, 
  MoreVertical, 
  Calendar,
  User
} from "lucide-react";
import type { Project, ProjectFile } from "@/types/database";
import { SourceBadge } from "./SourceBadge";

interface ProjectCardProps {
  project: Project;
  files?: ProjectFile[];
  onClick?: () => void;
}

const statusLabels: Record<string, string> = {
  pending: "قيد الانتظار",
  in_progress: "جاري العمل",
  completed: "مكتمل",
  cancelled: "ملغي",
};

export const ProjectCard = ({ project, files = [], onClick }: ProjectCardProps) => {
  const fileSources = [...new Set(files.map(f => f.source))];
  
  return (
    <div 
      className="glass-card rounded-xl p-5 cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-scale-in"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <FolderOpen className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{project.name}</h3>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              {project.client_name}
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>

      {/* Description */}
      {project.description && (
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {project.description}
        </p>
      )}

      {/* Status & Files */}
      <div className="flex items-center justify-between mb-4">
        <Badge className={cn("status-" + project.status)}>
          {statusLabels[project.status]}
        </Badge>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          <span>{files.length} ملف</span>
        </div>
      </div>

      {/* Sources */}
      {fileSources.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {fileSources.map(source => (
            <SourceBadge key={source} source={source} size="sm" />
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-1 text-xs text-muted-foreground pt-4 border-t border-border">
        <Calendar className="h-3 w-3" />
        <span>آخر تحديث: {new Date(project.updated_at).toLocaleDateString('ar-SA')}</span>
      </div>
    </div>
  );
};
