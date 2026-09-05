import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { FileCard } from "@/components/dashboard/FileCard";
import { ActivityTimeline } from "@/components/dashboard/ActivityTimeline";
import { SourcesOverview } from "@/components/dashboard/SourcesOverview";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FolderOpen, FileText, Users, TrendingUp } from "lucide-react";
import { NewProjectDialog } from "@/components/projects/NewProjectDialog";
import { UploadFileDialog } from "@/components/files/UploadFileDialog";
import { useActivities, useFiles, useProjects, getFileLink } from "@/hooks/useData";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const { data: projects = [], isLoading: loadingProjects } = useProjects();
  const { data: files = [], isLoading: loadingFiles } = useFiles();
  const { data: activities = [] } = useActivities(8);

  const sourceStats = {
    whatsapp: files.filter((f) => f.source === "whatsapp").length,
    daftra: files.filter((f) => f.source === "daftra").length,
    magicplan: files.filter((f) => f.source === "magicplan").length,
    manual: files.filter((f) => f.source === "manual").length,
  };

  const openFile = async (path: string) => {
    try {
      window.open(await getFileLink(path), "_blank");
    } catch {
      toast.error("تعذر فتح الملف");
    }
  };

  return (
    <AppLayout
      title="مرحباً بك في نظام إدارة الملفات"
      subtitle="تتبع جميع ملفات مشاريعك من مكان واحد"
      actions={
        <>
          <UploadFileDialog />
          <NewProjectDialog />
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <StatsCard title="إجمالي المشاريع" value={projects.length} subtitle="مشروع مسجل" icon={FolderOpen} variant="accent" />
        <StatsCard title="إجمالي الملفات" value={files.length} subtitle="ملف مرفوع" icon={FileText} />
        <StatsCard title="العملاء" value={new Set(projects.map((p) => p.client_name)).size} subtitle="عميل فعال" icon={Users} />
        <StatsCard title="المشاريع المكتملة" value={projects.filter((p) => p.status === "completed").length} subtitle="حتى الآن" icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">المشاريع الأخيرة</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate("/projects")}>عرض الكل</Button>
            </div>
            {loadingProjects ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
              </div>
            ) : projects.length === 0 ? (
              <div className="glass-card rounded-xl p-8 text-center text-muted-foreground">
                لا توجد مشاريع بعد — ابدأ بإضافة مشروع جديد.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.slice(0, 4).map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    files={files.filter((f) => f.project_id === project.id)}
                    onClick={() => navigate(`/projects/${project.id}`)}
                  />
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">آخر الملفات المرفوعة</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate("/files")}>عرض الكل</Button>
            </div>
            {loadingFiles ? (
              <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
            ) : files.length === 0 ? (
              <div className="glass-card rounded-xl p-8 text-center text-muted-foreground">لا توجد ملفات بعد.</div>
            ) : (
              <div className="space-y-3">
                {files.slice(0, 5).map((file) => (
                  <FileCard
                    key={file.id}
                    file={file}
                    onView={() => openFile(file.file_url)}
                    onDownload={() => openFile(file.file_url)}
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="space-y-8">
          <SourcesOverview stats={sourceStats} />
          <ActivityTimeline activities={activities} />
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
