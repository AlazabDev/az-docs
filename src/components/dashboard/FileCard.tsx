import { cn } from "@/lib/utils";
import { 
  FileText, 
  Image, 
  FileSpreadsheet, 
  File,
  Download,
  Eye,
  MoreVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProjectFile } from "@/types/database";
import { SourceBadge } from "./SourceBadge";

interface FileCardProps {
  file: ProjectFile;
  onView?: () => void;
  onDownload?: () => void;
}

const getFileIcon = (fileType: string | null) => {
  if (!fileType) return File;
  if (fileType.includes("image")) return Image;
  if (fileType.includes("spreadsheet") || fileType.includes("excel")) return FileSpreadsheet;
  if (fileType.includes("pdf") || fileType.includes("document")) return FileText;
  return File;
};

const formatFileSize = (bytes: number | null) => {
  if (!bytes) return "غير معروف";
  const sizes = ["بايت", "ك.ب", "م.ب", "ج.ب"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

export const FileCard = ({ file, onView, onDownload }: FileCardProps) => {
  const FileIcon = getFileIcon(file.file_type);

  return (
    <div className="glass-card rounded-lg p-4 hover:shadow-md transition-all duration-200 animate-fade-in">
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
          <FileIcon className="h-6 w-6 text-muted-foreground" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-foreground truncate">{file.name}</h4>
          <div className="flex items-center gap-2 mt-1">
            <SourceBadge source={file.source} size="sm" />
            <span className="text-xs text-muted-foreground">
              {formatFileSize(file.file_size)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {new Date(file.uploaded_at).toLocaleDateString('ar-SA', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onView}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDownload}>
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
