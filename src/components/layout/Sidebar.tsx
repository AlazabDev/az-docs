import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  FolderOpen, 
  FileText, 
  Settings, 
  MessageSquare,
  Calculator,
  Map,
  Activity,
  ChevronRight,
  ChevronLeft,
  Users,
  Bell,
  HelpCircle,
  Upload
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const mainNavItems = [
  { id: "dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
  { id: "projects", label: "المشاريع", icon: FolderOpen },
  { id: "files", label: "الملفات", icon: FileText },
  { id: "activity", label: "سجل النشاط", icon: Activity },
  { id: "clients", label: "العملاء", icon: Users },
];

const sourceItems = [
  { id: "whatsapp", label: "واتساب", icon: MessageSquare, color: "text-whatsapp" },
  { id: "daftra", label: "دفترة", icon: Calculator, color: "text-daftra" },
  { id: "magicplan", label: "ماجيك بلان", icon: Map, color: "text-magicplan" },
  { id: "upload", label: "رفع يدوي", icon: Upload, color: "text-muted-foreground" },
];

const settingsItems = [
  { id: "settings", label: "الإعدادات", icon: Settings },
  { id: "notifications", label: "الإشعارات", icon: Bell },
  { id: "help", label: "المساعدة", icon: HelpCircle },
];

export const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(true);

  return (
    <aside 
      className={cn(
        "hidden lg:flex flex-col bg-sidebar text-sidebar-foreground border-l border-sidebar-border transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )} 
      dir="rtl"
    >
      {/* Collapse Toggle */}
      <div className="flex items-center justify-end p-2 border-b border-sidebar-border">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>

      <div className="flex-1 py-4 px-2 space-y-6 overflow-y-auto">
        {/* Main Navigation */}
        <nav className="space-y-1">
          {!isCollapsed && (
            <p className="text-xs font-medium text-sidebar-foreground/50 mb-3 px-3">القائمة الرئيسية</p>
          )}
          {mainNavItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              className={cn(
                "w-full gap-3 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors",
                isCollapsed ? "justify-center px-2" : "justify-start px-3",
                activeTab === item.id && "bg-sidebar-accent text-sidebar-primary font-medium"
              )}
              onClick={() => onTabChange(item.id)}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </Button>
          ))}
        </nav>

        {/* Sources - Collapsible */}
        <Collapsible open={sourcesOpen && !isCollapsed} onOpenChange={setSourcesOpen}>
          <div className="space-y-1">
            {!isCollapsed ? (
              <CollapsibleTrigger asChild>
                <button className="flex items-center justify-between w-full text-xs font-medium text-sidebar-foreground/50 mb-3 px-3 hover:text-sidebar-foreground/70 transition-colors">
                  <span>مصادر الملفات</span>
                  <ChevronRight className={cn(
                    "h-3 w-3 transition-transform",
                    sourcesOpen && "rotate-90"
                  )} />
                </button>
              </CollapsibleTrigger>
            ) : (
              <div className="h-px bg-sidebar-border mx-2 my-2" />
            )}
            
            <CollapsibleContent className="space-y-1">
              {sourceItems.map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  className={cn(
                    "w-full gap-3 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors",
                    isCollapsed ? "justify-center px-2" : "justify-start px-3",
                    activeTab === item.id && "bg-sidebar-accent font-medium"
                  )}
                  onClick={() => onTabChange(item.id)}
                  title={isCollapsed ? item.label : undefined}
                >
                  <item.icon className={cn("h-4 w-4 shrink-0", item.color)} />
                  {!isCollapsed && <span>{item.label}</span>}
                </Button>
              ))}
            </CollapsibleContent>

            {/* Show icons only when collapsed */}
            {isCollapsed && sourceItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                className={cn(
                  "w-full justify-center px-2 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors",
                  activeTab === item.id && "bg-sidebar-accent font-medium"
                )}
                onClick={() => onTabChange(item.id)}
                title={item.label}
              >
                <item.icon className={cn("h-4 w-4 shrink-0", item.color)} />
              </Button>
            ))}
          </div>
        </Collapsible>
      </div>

      {/* Bottom Settings */}
      <div className="p-2 border-t border-sidebar-border space-y-1">
        {settingsItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            className={cn(
              "w-full gap-3 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors",
              isCollapsed ? "justify-center px-2" : "justify-start px-3",
              activeTab === item.id && "bg-sidebar-accent text-sidebar-primary font-medium"
            )}
            onClick={() => onTabChange(item.id)}
            title={isCollapsed ? item.label : undefined}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!isCollapsed && <span>{item.label}</span>}
          </Button>
        ))}
      </div>
    </aside>
  );
};
