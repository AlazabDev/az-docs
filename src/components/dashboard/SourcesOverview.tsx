import { MessageSquare, Calculator, Map, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface SourceStats {
  whatsapp: number;
  daftra: number;
  magicplan: number;
  manual: number;
}

interface SourcesOverviewProps {
  stats: SourceStats;
}

const sources = [
  { 
    id: "whatsapp", 
    label: "واتساب", 
    icon: MessageSquare, 
    color: "bg-whatsapp",
    description: "ملفات من محادثات العملاء"
  },
  { 
    id: "daftra", 
    label: "دفترة", 
    icon: Calculator, 
    color: "bg-daftra",
    description: "فواتير وعروض أسعار"
  },
  { 
    id: "magicplan", 
    label: "ماجيك بلان", 
    icon: Map, 
    color: "bg-magicplan",
    description: "مخططات ورسومات معمارية"
  },
  { 
    id: "manual", 
    label: "رفع يدوي", 
    icon: Upload, 
    color: "bg-manual",
    description: "ملفات تم رفعها يدوياً"
  },
];

export const SourcesOverview = ({ stats }: SourcesOverviewProps) => {
  const total = Object.values(stats).reduce((a, b) => a + b, 0);

  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="font-semibold text-foreground mb-6">مصادر الملفات</h3>
      
      {/* Progress bar */}
      <div className="h-3 rounded-full bg-muted overflow-hidden flex mb-6">
        {sources.map(source => {
          const count = stats[source.id as keyof SourceStats];
          const percentage = total > 0 ? (count / total) * 100 : 0;
          if (percentage === 0) return null;
          return (
            <div
              key={source.id}
              className={cn("h-full transition-all duration-500", source.color)}
              style={{ width: `${percentage}%` }}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="space-y-3">
        {sources.map(source => {
          const count = stats[source.id as keyof SourceStats];
          const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
          const Icon = source.icon;
          
          return (
            <div key={source.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center text-white", source.color)}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{source.label}</p>
                  <p className="text-xs text-muted-foreground">{source.description}</p>
                </div>
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-foreground">{count}</p>
                <p className="text-xs text-muted-foreground">{percentage}%</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
