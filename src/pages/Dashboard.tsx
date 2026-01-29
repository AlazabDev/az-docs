import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { FileCard } from "@/components/dashboard/FileCard";
import { ActivityTimeline } from "@/components/dashboard/ActivityTimeline";
import { SourcesOverview } from "@/components/dashboard/SourcesOverview";
import { Button } from "@/components/ui/button";
import { 
  FolderOpen, 
  FileText, 
  Users, 
  TrendingUp,
  Plus,
  RefreshCw
} from "lucide-react";
import type { Project, ProjectFile, ActivityLog } from "@/types/database";

// Demo data for initial display
const demoProjects: Project[] = [
  {
    id: "1",
    name: "فيلا الرياض - حي النرجس",
    client_name: "محمد أحمد العتيبي",
    client_phone: "+966501234567",
    client_email: "mohammed@email.com",
    status: "in_progress",
    description: "تصميم وتنفيذ فيلا سكنية على مساحة 600 متر مربع",
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    name: "مجمع تجاري - طريق الملك فهد",
    client_name: "شركة الأمل للتطوير",
    client_phone: "+966509876543",
    client_email: "info@alamal.sa",
    status: "pending",
    description: "تصميم مجمع تجاري من 3 طوابق مع مواقف سيارات",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    name: "ترميم قصر العائلة",
    client_name: "عبدالله السالم",
    client_phone: "+966551112222",
    client_email: null,
    status: "completed",
    description: "ترميم وتجديد قصر قديم مع الحفاظ على الطابع التراثي",
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "4",
    name: "شقق سكنية - حي الملقا",
    client_name: "مؤسسة البناء الحديث",
    client_phone: "+966543332211",
    client_email: "info@modern-build.sa",
    status: "in_progress",
    description: "تصميم عمارة سكنية من 5 طوابق تحتوي على 20 شقة",
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const demoFiles: ProjectFile[] = [
  {
    id: "f1",
    project_id: "1",
    name: "عقد_المقاولة_فيلا_النرجس.pdf",
    file_url: "#",
    file_type: "application/pdf",
    file_size: 2450000,
    source: "daftra",
    source_reference: "INV-2024-0892",
    metadata: {},
    uploaded_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "f2",
    project_id: "1",
    name: "مخطط_الدور_الأرضي.jpg",
    file_url: "#",
    file_type: "image/jpeg",
    file_size: 5200000,
    source: "magicplan",
    source_reference: "MP-FLOOR-001",
    metadata: {},
    uploaded_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "f3",
    project_id: "1",
    name: "صور_الموقع_قبل_البناء.zip",
    file_url: "#",
    file_type: "application/zip",
    file_size: 45000000,
    source: "whatsapp",
    source_reference: "WA-MSG-123456",
    metadata: {},
    uploaded_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "f4",
    project_id: "2",
    name: "عرض_سعر_مجمع_تجاري.pdf",
    file_url: "#",
    file_type: "application/pdf",
    file_size: 1200000,
    source: "daftra",
    source_reference: "QUO-2024-0156",
    metadata: {},
    uploaded_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "f5",
    project_id: "3",
    name: "تقرير_المعاينة_النهائي.pdf",
    file_url: "#",
    file_type: "application/pdf",
    file_size: 8900000,
    source: "manual",
    source_reference: null,
    metadata: {},
    uploaded_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const demoActivities: ActivityLog[] = [
  {
    id: "a1",
    project_id: "1",
    file_id: "f2",
    action: "file_uploaded",
    source: "magicplan",
    details: { fileName: "مخطط_الدور_الأرضي.jpg" },
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "a2",
    project_id: "1",
    file_id: "f1",
    action: "file_uploaded",
    source: "daftra",
    details: { fileName: "عقد_المقاولة_فيلا_النرجس.pdf" },
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "a3",
    project_id: "2",
    file_id: null,
    action: "project_created",
    source: null,
    details: { projectName: "مجمع تجاري - طريق الملك فهد" },
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "a4",
    project_id: "1",
    file_id: "f3",
    action: "file_uploaded",
    source: "whatsapp",
    details: { fileName: "صور_الموقع_قبل_البناء.zip" },
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [projects] = useState<Project[]>(demoProjects);
  const [files] = useState<ProjectFile[]>(demoFiles);
  const [activities] = useState<ActivityLog[]>(demoActivities);

  const sourceStats = {
    whatsapp: files.filter(f => f.source === "whatsapp").length,
    daftra: files.filter(f => f.source === "daftra").length,
    magicplan: files.filter(f => f.source === "magicplan").length,
    manual: files.filter(f => f.source === "manual").length,
  };

  const getFilesForProject = (projectId: string) => 
    files.filter(f => f.project_id === projectId);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Header />
      
      <div className="flex">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        <main className="flex-1 p-6 lg:p-8">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                مرحباً بك في نظام إدارة الملفات
              </h1>
              <p className="text-muted-foreground mt-1">
                تتبع جميع ملفات مشاريعك من مكان واحد
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 ml-2" />
                تحديث
              </Button>
              <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Plus className="h-4 w-4 ml-2" />
                مشروع جديد
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <StatsCard
              title="إجمالي المشاريع"
              value={projects.length}
              subtitle="مشروع نشط"
              icon={FolderOpen}
              trend={{ value: 12, isPositive: true }}
              variant="accent"
            />
            <StatsCard
              title="إجمالي الملفات"
              value={files.length}
              subtitle="ملف مرفوع"
              icon={FileText}
              trend={{ value: 8, isPositive: true }}
            />
            <StatsCard
              title="العملاء"
              value={new Set(projects.map(p => p.client_name)).size}
              subtitle="عميل فعال"
              icon={Users}
            />
            <StatsCard
              title="المشاريع المكتملة"
              value={projects.filter(p => p.status === "completed").length}
              subtitle="هذا الشهر"
              icon={TrendingUp}
              trend={{ value: 25, isPositive: true }}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Projects & Files - 2 columns */}
            <div className="lg:col-span-2 space-y-8">
              {/* Projects Section */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-foreground">المشاريع الأخيرة</h2>
                  <Button variant="ghost" size="sm">
                    عرض الكل
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projects.slice(0, 4).map((project, index) => (
                    <div key={project.id} style={{ animationDelay: `${index * 100}ms` }}>
                      <ProjectCard 
                        project={project} 
                        files={getFilesForProject(project.id)}
                      />
                    </div>
                  ))}
                </div>
              </section>

              {/* Recent Files Section */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-foreground">آخر الملفات المرفوعة</h2>
                  <Button variant="ghost" size="sm">
                    عرض الكل
                  </Button>
                </div>
                <div className="space-y-3">
                  {files.slice(0, 4).map((file) => (
                    <FileCard key={file.id} file={file} />
                  ))}
                </div>
              </section>
            </div>

            {/* Sidebar Content - 1 column */}
            <div className="space-y-6">
              {/* Sources Overview */}
              <SourcesOverview stats={sourceStats} />

              {/* Activity Timeline */}
              <div className="glass-card rounded-xl p-6">
                <h3 className="font-semibold text-foreground mb-6">آخر النشاطات</h3>
                <ActivityTimeline activities={activities} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
