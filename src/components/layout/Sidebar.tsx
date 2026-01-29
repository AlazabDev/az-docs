import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  FolderOpen, 
  FileText, 
  Settings, 
  MessageSquare,
  Calculator,
  Map,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: "dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
  { id: "projects", label: "المشاريع", icon: FolderOpen },
  { id: "files", label: "الملفات", icon: FileText },
  { id: "activity", label: "سجل النشاط", icon: Activity },
];

const sourceItems = [
  { id: "whatsapp", label: "واتساب", icon: MessageSquare, color: "text-whatsapp" },
  { id: "daftra", label: "دفترة", icon: Calculator, color: "text-daftra" },
  { id: "magicplan", label: "ماجيك بلان", icon: Map, color: "text-magicplan" },
];

export const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  return (
    <aside className="hidden lg:flex w-64 flex-col bg-sidebar text-sidebar-foreground border-l border-sidebar-border" dir="rtl">
      <div className="flex-1 py-6 px-4 space-y-8">
        {/* Main Navigation */}
        <nav className="space-y-1">
          <p className="text-xs font-medium text-sidebar-foreground/50 mb-3 px-3">القائمة الرئيسية</p>
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                activeTab === item.id && "bg-sidebar-accent text-sidebar-primary font-medium"
              )}
              onClick={() => onTabChange(item.id)}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Button>
          ))}
        </nav>

        {/* Sources */}
        <nav className="space-y-1">
          <p className="text-xs font-medium text-sidebar-foreground/50 mb-3 px-3">مصادر الملفات</p>
          {sourceItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                activeTab === item.id && "bg-sidebar-accent font-medium"
              )}
              onClick={() => onTabChange(item.id)}
            >
              <item.icon className={cn("h-4 w-4", item.color)} />
              {item.label}
            </Button>
          ))}
        </nav>
      </div>

      {/* Settings */}
      <div className="p-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={() => onTabChange("settings")}
        >
          <Settings className="h-4 w-4" />
          الإعدادات
        </Button>
      </div>
    </aside>
  );
};
