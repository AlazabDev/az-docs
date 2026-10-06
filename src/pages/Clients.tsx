import { useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useFiles, useProjects } from "@/hooks/useData";

const Clients = () => {
  const { data: projects = [] } = useProjects();
  const { data: files = [] } = useFiles();

  const clients = useMemo(() => {
    const map = new Map<string, { name: string; phone: string | null; email: string | null; projects: number; files: number }>();
    projects.forEach((p) => {
      const c = map.get(p.client_name) ?? { name: p.client_name, phone: p.client_phone, email: p.client_email, projects: 0, files: 0 };
      c.projects++;
      c.files += files.filter((f) => f.project_id === p.id).length;
      map.set(p.client_name, c);
    });
    return [...map.values()];
  }, [projects, files]);

  return (
    <AppLayout title="العملاء" subtitle="عملاء الشركة ومشاريعهم">
      <div className="glass-card rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">العميل</TableHead>
              <TableHead className="text-right">الهاتف</TableHead>
              <TableHead className="text-right">البريد</TableHead>
              <TableHead className="text-right">المشاريع</TableHead>
              <TableHead className="text-right">الملفات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">لا يوجد عملاء بعد.</TableCell></TableRow>
            ) : clients.map((c) => (
              <TableRow key={c.name}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell dir="ltr" className="text-right">{c.phone ?? "—"}</TableCell>
                <TableCell>{c.email ?? "—"}</TableCell>
                <TableCell>{c.projects}</TableCell>
                <TableCell>{c.files}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AppLayout>
  );
};

export default Clients;
