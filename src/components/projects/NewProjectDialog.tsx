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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useCreateProject } from "@/hooks/useData";
import type { ProjectStatus } from "@/types/database";

export const NewProjectDialog = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [clientName, setClientName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("pending");
  const [description, setDescription] = useState("");
  const createProject = useCreateProject();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !clientName.trim()) {
      toast.error("يرجى إدخال اسم المشروع واسم العميل");
      return;
    }
    try {
      await createProject.mutateAsync({
        name: name.trim(),
        client_name: clientName.trim(),
        client_phone: phone.trim() || null,
        client_email: email.trim() || null,
        status,
        description: description.trim() || null,
      });
      toast.success("تم إنشاء المشروع بنجاح");
      setOpen(false);
      setName(""); setClientName(""); setPhone(""); setEmail(""); setDescription(""); setStatus("pending");
    } catch (err) {
      toast.error("تعذر إنشاء المشروع");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Plus className="h-4 w-4 ml-2" />
          مشروع جديد
        </Button>
      </DialogTrigger>
      <DialogContent dir="rtl" className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>إضافة مشروع جديد</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="p-name">اسم المشروع</Label>
            <Input id="p-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="فيلا سكنية - حي النرجس" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="p-client">اسم العميل</Label>
              <Input id="p-client" value={clientName} onChange={(e) => setClientName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-phone">رقم الجوال</Label>
              <Input id="p-phone" value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="p-email">البريد الإلكتروني</Label>
              <Input id="p-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label>حالة المشروع</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as ProjectStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">قيد الانتظار</SelectItem>
                  <SelectItem value="in_progress">جاري العمل</SelectItem>
                  <SelectItem value="completed">مكتمل</SelectItem>
                  <SelectItem value="cancelled">ملغي</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-desc">وصف المشروع</Label>
            <Textarea id="p-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={createProject.isPending}>
              {createProject.isPending ? "جارٍ الحفظ..." : "حفظ المشروع"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
