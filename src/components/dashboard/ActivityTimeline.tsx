import { cn } from "@/lib/utils";
import { 
  MessageSquare, 
  Calculator, 
  Map, 
  Upload,
  FileText,
  FolderPlus
} from "lucide-react";
import type { ActivityLog, FileSource } from "@/types/database";

interface ActivityTimelineProps {
  activities: ActivityLog[];
}

const getActivityIcon = (action: string, source: FileSource | null) => {
  if (action === "project_created") return FolderPlus;
  if (action === "file_uploaded") {
    switch (source) {
      case "whatsapp": return MessageSquare;
      case "daftra": return Calculator;
      case "magicplan": return Map;
      default: return Upload;
    }
  }
  return FileText;
};

const getActivityColor = (source: FileSource | null) => {
  switch (source) {
    case "whatsapp": return "bg-whatsapp";
    case "daftra": return "bg-daftra";
    case "magicplan": return "bg-magicplan";
    default: return "bg-primary";
  }
};

const getActionLabel = (action: string, source: FileSource | null) => {
  if (action === "project_created") return "تم إنشاء مشروع جديد";
  if (action === "file_uploaded") {
    const sourceLabels: Record<string, string> = {
      whatsapp: "واتساب",
      daftra: "دفترة",
      magicplan: "ماجيك بلان",
      manual: "يدوياً",
    };
    return `تم رفع ملف من ${sourceLabels[source || 'manual']}`;
  }
  return action;
};

export const ActivityTimeline = ({ activities }: ActivityTimelineProps) => {
  return (
    <div className="space-y-4">
      {activities.map((activity, index) => {
        const Icon = getActivityIcon(activity.action, activity.source);
        
        return (
          <div 
            key={activity.id} 
            className="flex gap-4 animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Timeline line */}
            <div className="flex flex-col items-center">
              <div className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center text-white",
                getActivityColor(activity.source)
              )}>
                <Icon className="h-5 w-5" />
              </div>
              {index < activities.length - 1 && (
                <div className="w-0.5 flex-1 bg-border mt-2" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-4">
              <p className="font-medium text-foreground">
                {getActionLabel(activity.action, activity.source)}
              </p>
              {activity.details && Object.keys(activity.details).length > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  {(activity.details as { fileName?: string }).fileName || 
                   (activity.details as { projectName?: string }).projectName}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(activity.created_at).toLocaleDateString('ar-SA', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
