import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { NewProjectDialog } from "@/components/projects/NewProjectDialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFiles, useProjects } from "@/hooks/useData";

const statusTabs = [
  { value: "all", label: "الكل" },
  { value: "pending", label: "قيد الانتظار" },
  { value: "in_progress", label: "جاري العمل" },
  { value: "completed", label: "مكتمل" },
  { value: "cancelled", label: "ملغي" },
];

const Projects = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const { data: projects = [], isLoading } = useProjects();
  const { data: files = [] } = useFiles();

  const filtered = useMemo(
    () =>
      projects.filter(
        (p) =>
          (status === "all" || p.status === status) &&
          (p.name.includes(search) || p.client_name.includes(search))
      ),
    [projects, search, status]
  );

  return (
    <AppLayout title="المشاريع" subtitle="كل مشاريع الشركة وعملائها" actions={<NewProjectDialog />}>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Input
          placeholder="ابحث باسم المشروع أو العميل..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="md:max-w-sm"
        />
        <Tabs value={status} onValueChange={setStatus}>
          <TabsList>
            {statusTabs.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card rounded-xl p-10 text-center text-muted-foreground">لا توجد مشاريع مطابقة.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              files={files.filter((f) => f.project_id === project.id)}
              onClick={() => navigate(`/projects/${project.id}`)}
            />
          ))}
        </div>
      )}
    </AppLayout>
  );
};

export default Projects;
