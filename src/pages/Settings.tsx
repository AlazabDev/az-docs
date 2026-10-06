import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Calculator, Map, Copy } from "lucide-react";
import { toast } from "sonner";

const webhookUrl = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/whatsapp-webhook`;

const Settings = () => (
  <AppLayout title="الإعدادات" subtitle="ربط مصادر الملفات الخارجية">
    <div className="grid gap-6 max-w-3xl">
      <div className="glass-card rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-5 w-5 text-whatsapp" />
          <h2 className="font-semibold text-foreground">واتساب للأعمال</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          ضع هذا الرابط في إعدادات Webhook داخل حساب Meta للمطورين، واشترك في حدث <b>messages</b>.
          أي ملف أو صورة تصل على واتساب ستُحفظ تلقائياً، وتُربط بالمشروع إذا طابق رقم المرسل رقم العميل، وإلا تظهر في "غير مصنّف".
        </p>
        <div className="flex gap-2">
          <Input readOnly value={webhookUrl} dir="ltr" />
          <Button variant="outline" size="icon" onClick={() => { navigator.clipboard.writeText(webhookUrl); toast.success("تم النسخ"); }}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {[{ icon: Calculator, name: "دفترة", c: "text-daftra" }, { icon: Map, name: "ماجيك بلان", c: "text-magicplan" }].map((s) => (
        <div key={s.name} className="glass-card rounded-xl p-6 flex items-center gap-3">
          <s.icon className={`h-5 w-5 ${s.c}`} />
          <h2 className="font-semibold text-foreground flex-1">{s.name}</h2>
          <span className="text-sm text-muted-foreground">قريباً</span>
        </div>
      ))}
    </div>
  </AppLayout>
);

export default Settings;
