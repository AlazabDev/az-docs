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
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const mainNavItems = [
  { to: "/", label: "لوحة التحكم", icon: LayoutDashboard, end: true },
  { to: "/projects", label: "المشاريع", icon: FolderOpen },
  { to: "/files", label: "الملفات", icon: FileText },
  { to: "/activity", label: "سجل النشاط", icon: Activity },
  { to: "/clients", label: "العملاء", icon: Users },
];

const sourceItems = [
  { to: "/files?source=whatsapp", key: "whatsapp", label: "واتساب", icon: MessageSquare, color: "text-whatsapp" },
  { to: "/files?source=daftra", key: "daftra", label: "دفترة", icon: Calculator, color: "text-daftra" },
  { to: "/files?source=magicplan", key: "magicplan", label: "ماجيك بلان", icon: Map, color: "text-magicplan" },
  { to: "/files?source=manual", key: "manual", label: "رفع يدوي", icon: Upload, color: "text-muted-foreground" },
];

const settingsItems = [
  { to: "/settings", label: "الإعدادات", icon: Settings },
  { to: "/notifications", label: "الإشعارات", icon: Bell },
  { to: "/help", label: "المساعدة", icon: HelpCircle },
];

export const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(true);
  const location = useLocation();
  const currentSource = new URLSearchParams(location.search).get("source");

  const itemClass = (active: boolean) =>
    cn(
      "flex items-center gap-3 w-full rounded-md h-10 text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors",
      isCollapsed ? "justify-center px-2" : "justify-start px-3",
      active && "bg-sidebar-accent text-sidebar-primary font-medium"
    );

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col bg-sidebar text-sidebar-foreground border-l border-sidebar-border transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
      dir="rtl"
    >
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
        <nav className="space-y-1">
          {!isCollapsed && (
            <p className="text-xs font-medium text-sidebar-foreground/50 mb-3 px-3">القائمة الرئيسية</p>
          )}
          {mainNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              title={isCollapsed ? item.label : undefined}
              className={({ isActive }) => itemClass(isActive && !currentSource)}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <Collapsible open={sourcesOpen && !isCollapsed} onOpenChange={setSourcesOpen}>
          <div className="space-y-1">
            {!isCollapsed ? (
              <CollapsibleTrigger asChild>
                <button className="flex items-center justify-between w-full text-xs font-medium text-sidebar-foreground/50 mb-3 px-3 hover:text-sidebar-foreground/70 transition-colors">
                  <span>مصادر الملفات</span>
                  <ChevronRight className={cn("h-3 w-3 transition-transform", sourcesOpen && "rotate-90")} />
                </button>
              </CollapsibleTrigger>
            ) : (
              <div className="h-px bg-sidebar-border mx-2 my-2" />
            )}

            <CollapsibleContent className="space-y-1">
              {sourceItems.map((item) => (
                <NavLink key={item.key} to={item.to} className={itemClass(currentSource === item.key)}>
                  <item.icon className={cn("h-4 w-4 shrink-0", item.color)} />
                  {!isCollapsed && <span>{item.label}</span>}
                </NavLink>
              ))}
            </CollapsibleContent>

            {isCollapsed &&
              sourceItems.map((item) => (
                <NavLink
                  key={item.key}
                  to={item.to}
                  title={item.label}
                  className={itemClass(currentSource === item.key)}
                >
                  <item.icon className={cn("h-4 w-4 shrink-0", item.color)} />
                </NavLink>
              ))}
          </div>
        </Collapsible>
      </div>

      <div className="p-2 border-t border-sidebar-border space-y-1">
        {settingsItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            title={isCollapsed ? item.label : undefined}
            className={({ isActive }) => itemClass(isActive)}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!isCollapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </div>
    </aside>
  );
};
