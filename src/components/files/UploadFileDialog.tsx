import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { useProjects, useUploadFile } from "@/hooks/useData";
import type { FileSource } from "@/types/database";

interface UploadFileDialogProps {
  projectId?: string;
}

export const UploadFileDialog = ({ projectId }: UploadFileDialogProps) => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [source, setSource] = useState<FileSource>("manual");
  const [selectedProject, setSelectedProject] = useState<string>(projectId ?? "");
  const { data: projects = [] } = useProjects();
  const upload = useUploadFile();

  const target = projectId ?? selectedProject;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!target) return toast.error("اختر المشروع أولاً");
    if (!file) return toast.error("اختر ملفاً للرفع");
    try {
      await upload.mutateAsync({ projectId: target, file, source });
      toast.success("تم رفع الملف بنجاح");
      setOpen(false);
      setFile(null);
    } catch {
      toast.error("تعذر رفع الملف");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Upload className="h-4 w-4 ml-2" />
          رفع ملف
        </Button>
      </DialogTrigger>
      <DialogContent dir="rtl" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>رفع ملف جديد</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          {!projectId && (
            <div className="space-y-2">
              <Label>المشروع</Label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger><SelectValue placeholder="اختر المشروع" /></SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label>مصدر الملف</Label>
            <Select value={source} onValueChange={(v) => setSource(v as FileSource)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">رفع يدوي</SelectItem>
                <SelectItem value="whatsapp">واتساب</SelectItem>
                <SelectItem value="daftra">دفترة</SelectItem>
                <SelectItem value="magicplan">ماجيك بلان</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="file">الملف</Label>
            <Input id="file" type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={upload.isPending}>
              {upload.isPending ? "جارٍ الرفع..." : "رفع الملف"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
