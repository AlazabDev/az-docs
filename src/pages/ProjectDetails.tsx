import { useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { FileCard } from "@/components/dashboard/FileCard";
import { UploadFileDialog } from "@/components/files/UploadFileDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFiles, useProject, useUpdateProjectStatus, getFileLink } from "@/hooks/useData";
import type { ProjectStatus } from "@/types/database";
import { toast } from "sonner";

const statuses: { value: ProjectStatus; label: string }[] = [
  { value: "pending", label: "قيد الانتظار" },
  { value: "in_progress", label: "جاري العمل" },
  { value: "completed", label: "مكتمل" },
  { value: "cancelled", label: "ملغي" },
];

const ProjectDetails = () => {
  const { id } = useParams();
  const { data: project, isLoading, error } = useProject(id);
  const { data: files = [] } = useFiles(id);
  const updateStatus = useUpdateProjectStatus();

  const open = async (path: string) => {
    try { window.open(await getFileLink(path), "_blank"); } catch { toast.error("تعذر فتح الملف"); }
  };

  if (isLoading) return <AppLayout title="..."><Skeleton className="h-40 rounded-xl" /></AppLayout>;
  if (error || !project) return <AppLayout title="المشروع غير موجود"><p className="text-muted-foreground">تأكد من الرابط.</p></AppLayout>;

  return (
    <AppLayout title={project.name} subtitle={`العميل: ${project.client_name}`} actions={<UploadFileDialog />}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card rounded-xl p-6 space-y-4 h-fit">
          <h2 className="font-semibold text-foreground">بيانات المشروع</h2>
          <div className="text-sm space-y-2 text-muted-foreground">
            <p>الهاتف: <span className="text-foreground" dir="ltr">{project.client_phone ?? "—"}</span></p>
            <p>البريد: <span className="text-foreground">{project.client_email ?? "—"}</span></p>
            {project.description && <p>{project.description}</p>}
          </div>
          <Select value={project.status} onValueChange={(v) => updateStatus.mutate({ id: project.id, status: v as ProjectStatus })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{statuses.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">ملفات واتساب المرسلة من رقم العميل تُضاف هنا تلقائياً.</p>
        </div>
        <div className="lg:col-span-2 space-y-3">
          <h2 className="font-semibold text-foreground">الملفات ({files.length})</h2>
          {files.length === 0 ? (
            <div className="glass-card rounded-xl p-8 text-center text-muted-foreground">لا توجد ملفات لهذا المشروع.</div>
          ) : files.map((f) => <FileCard key={f.id} file={f} onView={() => open(f.file_url)} onDownload={() => open(f.file_url)} />)}
        </div>
      </div>
    </AppLayout>
  );
};

export default ProjectDetails;
