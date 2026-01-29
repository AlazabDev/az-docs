import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "accent";
}

export const StatsCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
  variant = "default" 
}: StatsCardProps) => {
  return (
    <div className={cn(
      "glass-card rounded-xl p-6 animate-slide-up",
      variant === "accent" && "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground"
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className={cn(
            "text-sm font-medium",
            variant === "default" ? "text-muted-foreground" : "text-primary-foreground/80"
          )}>
            {title}
          </p>
          <p className="text-3xl font-bold">{value}</p>
          {subtitle && (
            <p className={cn(
              "text-xs",
              variant === "default" ? "text-muted-foreground" : "text-primary-foreground/70"
            )}>
              {subtitle}
            </p>
          )}
          {trend && (
            <p className={cn(
              "text-xs font-medium",
              trend.isPositive ? "text-whatsapp" : "text-destructive"
            )}>
              {trend.isPositive ? "+" : ""}{trend.value}% من الشهر الماضي
            </p>
          )}
        </div>
        <div className={cn(
          "h-12 w-12 rounded-lg flex items-center justify-center",
          variant === "default" ? "bg-primary/10" : "bg-white/20"
        )}>
          <Icon className={cn(
            "h-6 w-6",
            variant === "default" ? "text-primary" : "text-primary-foreground"
          )} />
        </div>
      </div>
    </div>
  );
};
