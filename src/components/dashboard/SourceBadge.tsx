import { cn } from "@/lib/utils";
import { MessageSquare, Calculator, Map, Upload } from "lucide-react";
import type { FileSource } from "@/types/database";

interface SourceBadgeProps {
  source: FileSource;
  size?: "sm" | "md";
  showLabel?: boolean;
}

const sourceConfig: Record<FileSource, { label: string; icon: typeof MessageSquare; className: string }> = {
  whatsapp: {
    label: "واتساب",
    icon: MessageSquare,
    className: "source-badge-whatsapp",
  },
  daftra: {
    label: "دفترة",
    icon: Calculator,
    className: "source-badge-daftra",
  },
  magicplan: {
    label: "ماجيك بلان",
    icon: Map,
    className: "source-badge-magicplan",
  },
  manual: {
    label: "يدوي",
    icon: Upload,
    className: "source-badge-manual",
  },
};

export const SourceBadge = ({ source, size = "md", showLabel = true }: SourceBadgeProps) => {
  const config = sourceConfig[source];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        config.className,
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
      )}
    >
      <Icon className={cn(size === "sm" ? "h-3 w-3" : "h-4 w-4")} />
      {showLabel && config.label}
    </span>
  );
};
