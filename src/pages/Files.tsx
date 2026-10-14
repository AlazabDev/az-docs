import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { FileCard } from "@/components/dashboard/FileCard";
import { UploadFileDialog } from "@/components/files/UploadFileDialog";
import { AnalyzeFileButton } from "@/components/files/AnalyzeFileButton";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFiles, useProjects, getFileLink, useAssignFile } from "@/hooks/useData";
import { toast } from "sonner";

const tabs = [
  { value: "all", label: "الكل" },
  { value: "whatsapp", label: "واتساب" },
  { value: "daftra", label: "دفترة" },
  { value: "magicplan", label: "ماجيك بلان" },
  { value: "manual", label: "يدوي" },
  { value: "inbox", label: "غير مصنّف" },
];

const Files = () => {
  const [params, setParams] = useSearchParams();
  const source = params.get("source") ?? "all";
  const [search, setSearch] = useState("");
  const { data: files = [], isLoading } = useFiles();
  const { data: projects = [] } = useProjects();
  const assign = useAssignFile();

  const filtered = useMemo(
    () =>
      files.filter(
        (f) =>
          (source === "all" || (source === "inbox" ? !f.project_id : f.source === source)) &&
          f.name.toLowerCase().includes(search.toLowerCase())
      ),
    [files, source, search]
  );

  const open = async (path: string) => {
    try { window.open(await getFileLink(path), "_blank"); } catch { toast.error("تعذر فتح الملف"); }
  };

  return (
    <AppLayout title="الملفات" subtitle="كل ملفات المشاريع من جميع المصادر" actions={<UploadFileDialog />}>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Input placeholder="ابحث باسم الملف..." value={search} onChange={(e) => setSearch(e.target.value)} className="md:max-w-sm" />
        <Tabs value={source} onValueChange={(v) => setParams(v === "all" ? {} : { source: v })}>
          <TabsList className="flex-wrap h-auto">
            {tabs.map((t) => <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>)}
          </TabsList>
        </Tabs>
      </div>
      {isLoading ? (
        <div className="space-y-3">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="glass-card rounded-xl p-10 text-center text-muted-foreground">لا توجد ملفات.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((f) => (
            <div key={f.id} className="space-y-2">
              <FileCard file={f} onView={() => open(f.file_url)} onDownload={() => open(f.file_url)} />
              {(f.source === "whatsapp" || !f.project_id) && <AnalyzeFileButton file={f} projects={projects} />}
              {!f.project_id && (
                <div className="flex items-center gap-2 pr-4 text-sm text-muted-foreground">
                  <span>ربط بمشروع:</span>
                  <Select onValueChange={(pid) => assign.mutate({ id: f.id, projectId: pid }, { onSuccess: () => toast.success("تم ربط الملف") })}>
                    <SelectTrigger className="w-60 h-8"><SelectValue placeholder="اختر مشروعاً" /></SelectTrigger>
                    <SelectContent>
                      {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
};

export default Files;
